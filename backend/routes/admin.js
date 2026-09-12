import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import User from "../models/User.js";
import Package from "../models/Package.js";
import Payment from "../models/Payment.js";
import Withdrawal from "../models/Withdrawal.js";
import UserPackage from "../models/UserPackage.js";
import Earning from "../models/Earning.js";
import DepositAddress from "../models/DepositAddress.js";
import PlatformSettings from "../models/PlatformSettings.js";
import DailyPnl from "../models/DailyPnl.js";
import { nextBanStage, BAN_STAGES } from "../utils/ban.js";
import { platformDateStr, nextPlatformMidnightUTC } from "../utils/time.js";
import { processDailyPnl } from "../jobs/dailyPnl.js";

const router = express.Router();
router.use(protect, adminOnly);

/* ---------------- Stats ---------------- */
router.get("/stats", async (req, res) => {
  const [users, activePackages, payments, withdrawals, pendingPayments] = await Promise.all([
    User.countDocuments({ role: "user" }),
    UserPackage.countDocuments({ status: "active" }),
    Payment.aggregate([{ $match: { status: "confirmed" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Withdrawal.aggregate([{ $match: { status: "pending" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Payment.countDocuments({ status: "pending" })
  ]);
  res.json({
    users,
    activePackages,
    totalInvestments: payments[0]?.total || 0,
    pendingWithdrawals: withdrawals[0]?.total || 0,
    pendingPayments
  });
});

/* ---------------- Users & Ban management ---------------- */
router.get("/users", async (req, res) => res.json(await User.find().select("-password").sort({ createdAt: -1 })));

// Escalates the user to the next ban stage: none -> 24h -> 7d -> 30d -> permanent
router.post("/users/:id/ban", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.role === "admin") return res.status(400).json({ message: "Cannot ban an admin" });

  const { reason = "" } = req.body;
  const update = nextBanStage(user.banStage);
  user.banStage = update.banStage;
  user.bannedUntil = update.bannedUntil;
  user.banReason = reason;
  user.status = "blocked";
  user.banHistory.push({ stage: BAN_STAGES[update.banStage], reason, bannedBy: req.user._id });
  await user.save();
  res.json(user);
});

// Fully lifts the ban and resets escalation back to stage 0.
router.post("/users/:id/unban", async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: "active", banStage: 0, bannedUntil: null, banReason: "" },
    { new: true }
  ).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// Legacy simple toggle kept for compatibility (sets active directly)
router.patch("/users/:id/status", async (req, res) => {
  const payload = { status: req.body.status };
  if (req.body.status === "active") { payload.banStage = 0; payload.bannedUntil = null; payload.banReason = ""; }
  res.json(await User.findByIdAndUpdate(req.params.id, payload, { new: true }).select("-password"));
});

router.get("/users/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  const [packages, payments, withdrawals] = await Promise.all([
    UserPackage.find({ user: user._id }).populate("package"),
    Payment.find({ user: user._id }).sort({ createdAt: -1 }),
    Withdrawal.find({ user: user._id }).sort({ createdAt: -1 })
  ]);
  res.json({ user, packages, payments, withdrawals });
});

/* ---------------- Packages ---------------- */
router.get("/packages", async (req, res) => res.json(await Package.find().sort({ price: 1 })));
router.post("/packages", async (req, res) => res.status(201).json(await Package.create(req.body)));
router.patch("/packages/:id", async (req, res) => res.json(await Package.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete("/packages/:id", async (req, res) => {
  // Hard-deleting a package that's already been bought orphans any Payment or
  // UserPackage that references it, which crashes payment confirmation later
  // (payment.package populates to null). Block deletion in that case and
  // point to Deactivate instead, which keeps history intact.
  const [hasPayments, hasUserPackages] = await Promise.all([
    Payment.exists({ package: req.params.id }),
    UserPackage.exists({ package: req.params.id })
  ]);
  if (hasPayments || hasUserPackages) {
    return res.status(400).json({
      message: "This package has existing payments or purchases and can't be deleted. Use \"Deactivate\" instead to hide it from new buyers."
    });
  }
  await Package.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

/* ---------------- Deposit Addresses ---------------- */
router.get("/deposit-addresses", async (req, res) => res.json(await DepositAddress.find().sort({ coin: 1 })));
router.post("/deposit-addresses", async (req, res) => {
  try {
    res.status(201).json(await DepositAddress.create(req.body));
  } catch (e) {
    res.status(400).json({ message: e.code === 11000 ? "That coin/network combination already exists" : e.message });
  }
});
router.patch("/deposit-addresses/:id", async (req, res) => res.json(await DepositAddress.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete("/deposit-addresses/:id", async (req, res) => { await DepositAddress.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); });

/* ---------------- Payments (deposit proof review) ---------------- */
router.get("/payments", async (req, res) =>
  res.json(await Payment.find().populate("user", "name email").populate("package", "name price durationDays investorShareOverride").sort({ createdAt: -1 }))
);

router.patch("/payments/:id", async (req, res) => {
  const { status, adminRemarks = "" } = req.body; // "confirmed" | "rejected"
  const payment = await Payment.findById(req.params.id).populate("package");
  if (!payment) return res.status(404).json({ message: "Payment not found" });
  if (payment.status !== "pending") return res.status(400).json({ message: "This payment was already reviewed" });

  // Check this BEFORE saving the payment as "confirmed" — otherwise a missing
  // package would leave the payment permanently stuck in a broken confirmed
  // state with no way to retry (since a non-pending payment can't be reviewed again).
  if (status === "confirmed" && !payment.package) {
    return res.status(400).json({
      message: "This payment's package no longer exists (it may have been deleted). Please reject this payment and ask the user to resubmit against a current package."
    });
  }

  payment.status = status;
  payment.adminRemarks = adminRemarks;
  payment.reviewedBy = req.user._id;
  payment.reviewedAt = new Date();
  await payment.save();

  if (status === "confirmed") {
    const pkg = payment.package;
    const settings = await PlatformSettings.getSettings();

    // Income never starts the day it's activated — it starts the platform's
    // next calendar day (GMT+1 by default). This also means a referrer's bonus
    // naturally starts the same day, since it's computed off credited principal.
    const start = nextPlatformMidnightUTC(new Date(), settings.timezoneOffsetHours);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + pkg.durationDays);

    const up = await UserPackage.create({
      user: payment.user,
      package: pkg._id,
      packageName: pkg.name,
      pricePaid: payment.amount,
      // Locked in at activation time from the package's override (if any) or the
      // platform default — later changes to either won't retroactively change
      // what this investor was promised.
      investorShareRate: pkg.investorShareOverride ?? settings.investorShareRate,
      startDate: start,
      endDate: end
    });

    // Multiple simultaneously-active packages simply stack: each is credited
    // independently every day based on its own principal, so a user's total
    // daily result is naturally the sum across all of them.
    await User.findByIdAndUpdate(payment.user, { $inc: { totalInvested: payment.amount } });

    return res.json({
      payment, userPackage: up,
      message: `Payment confirmed. This package starts earning from ${platformDateStr(start, settings.timezoneOffsetHours)} (platform time, GMT+${settings.timezoneOffsetHours}).`
    });
  }

  res.json({ payment, message: "Payment rejected" });
});

/* ---------------- Daily P&L (the real income engine) ---------------- */
// The admin enters the ACTUAL result of that day's trading. This single number
// is what every investor's and referrer's payout for the day is calculated
// from — there is no fixed/guaranteed rate stored anywhere else in the system.
router.get("/daily-pnl", async (req, res) =>
  res.json(await DailyPnl.find().sort({ date: -1 }).limit(90))
);

router.get("/daily-pnl/today", async (req, res) => {
  const settings = await PlatformSettings.getSettings();
  const today = platformDateStr(new Date(), settings.timezoneOffsetHours);
  const entry = await DailyPnl.findOne({ date: today });
  res.json({ date: today, timezoneOffsetHours: settings.timezoneOffsetHours, entry: entry || null });
});

router.post("/daily-pnl", async (req, res) => {
  const settings = await PlatformSettings.getSettings();
  const { date, pnlPercent, note = "" } = req.body;
  const targetDate = date || platformDateStr(new Date(), settings.timezoneOffsetHours);
  const pct = Number(pnlPercent);

  if (Number.isNaN(pct)) return res.status(400).json({ message: "pnlPercent must be a number (e.g. 10 for +10%, -4 for a 4% loss)" });

  const existing = await DailyPnl.findOne({ date: targetDate });
  if (existing?.processed) return res.status(400).json({ message: `${targetDate} has already been processed and cannot be re-entered.` });

  try {
    const result = await processDailyPnl(targetDate, pct, req.user._id);
    if (note) await DailyPnl.findOneAndUpdate({ date: targetDate }, { note });
    res.json({ date: targetDate, pnlPercent: pct, ...result, message: `Distributed ${targetDate}'s ${pct >= 0 ? "profit" : "loss"} to all active investors.` });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

/* ---------------- Platform Settings ---------------- */
router.get("/settings", async (req, res) => res.json(await PlatformSettings.getSettings()));
router.patch("/settings", async (req, res) => {
  const { investorShareRate, referralShareRate, timezoneOffsetHours } = req.body;
  const settings = await PlatformSettings.getSettings();
  if (investorShareRate !== undefined) settings.investorShareRate = Number(investorShareRate);
  if (referralShareRate !== undefined) settings.referralShareRate = Number(referralShareRate);
  if (timezoneOffsetHours !== undefined) settings.timezoneOffsetHours = Number(timezoneOffsetHours);
  await settings.save();
  res.json(settings);
});

/* ---------------- Withdrawals (payout review) ---------------- */
router.get("/withdrawals", async (req, res) => res.json(await Withdrawal.find().populate("user", "name email").sort({ createdAt: -1 })));

router.patch("/withdrawals/:id", async (req, res) => {
  // status: "approved" | "completed" | "rejected" | "failed"
  const { status, adminRemarks = "", transactionHash = "" } = req.body;
  const w = await Withdrawal.findById(req.params.id);
  if (!w) return res.status(404).json({ message: "Not found" });
  if (w.status !== "pending" && w.status !== "approved") return res.status(400).json({ message: "Already finalized" });

  w.status = status;
  w.adminRemarks = adminRemarks;
  w.transactionHash = transactionHash || w.transactionHash;
  w.reviewedBy = req.user._id;
  w.reviewedAt = new Date();
  await w.save();

  // IMPORTANT: rejected/failed payouts are NEVER credited back to the user's wallet.
  if (status === "completed") {
    await User.findByIdAndUpdate(w.user, { $inc: { totalWithdrawn: w.amount } });
  }

  res.json(w);
});

export default router;
