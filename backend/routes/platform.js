import express from "express";
import { protect } from "../middleware/auth.js";
import { uploadScreenshot } from "../middleware/upload.js";
import Package from "../models/Package.js";
import UserPackage from "../models/UserPackage.js";
import Payment from "../models/Payment.js";
import Earning from "../models/Earning.js";
import Withdrawal from "../models/Withdrawal.js";
import User from "../models/User.js";
import DepositAddress from "../models/DepositAddress.js";
import PlatformSettings from "../models/PlatformSettings.js";

const router = express.Router();

router.get("/packages", protect, async (req, res) => {
  const [packages, settings] = await Promise.all([
    Package.find({ status: "active" }).sort({ price: 1 }),
    PlatformSettings.getSettings()
  ]);
  // Attach the effective investor share rate so the UI can show it transparently
  // without hardcoding any guaranteed percentage.
  const withRates = packages.map((p) => ({
    ...p.toObject(),
    investorShareRate: p.investorShareOverride ?? settings.investorShareRate
  }));
  res.json(withRates);
});

// Public-ish (protected) transparency endpoint: current profit-share rates and
// recent real daily results, so users can see how payouts are actually calculated.
router.get("/platform-info", protect, async (req, res) => {
  const settings = await PlatformSettings.getSettings();
  res.json({
    investorShareRate: settings.investorShareRate,
    referralShareRate: settings.referralShareRate,
    timezoneOffsetHours: settings.timezoneOffsetHours
  });
});

// Public-ish (still protected) list of admin-configured deposit addresses
router.get("/deposit-addresses", protect, async (req, res) =>
  res.json(await DepositAddress.find({ isActive: true }).sort({ coin: 1 }))
);

router.get("/dashboard", protect, async (req, res) => {
  const activePackages = await UserPackage.find({ user: req.user._id, status: "active" }).populate("package");
  const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(8);
  const earnings = await Earning.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(8);
  res.json({
    user: req.user,
    activePackages,
    payments,
    earnings,
    stats: {
      totalInvestment: req.user.totalInvested,
      totalEarnings: req.user.totalEarnings,
      availableBalance: req.user.availableBalance,
      totalWithdrawn: req.user.totalWithdrawn,
      referralEarnings: req.user.referralEarnings,
      referralCount: req.user.referralCount
    }
  });
});

router.get("/my-packages", protect, async (req, res) => {
  res.json(await UserPackage.find({ user: req.user._id }).populate("package").sort({ createdAt: -1 }));
});

// Step 1: user picks a package + coin -> we return the deposit address to show them.
router.get("/buy/:packageId/address", protect, async (req, res) => {
  const { coin = "USDT" } = req.query;
  const pkg = await Package.findById(req.params.packageId);
  if (!pkg) return res.status(404).json({ message: "Package not found" });
  const deposit = await DepositAddress.findOne({ coin, isActive: true });
  if (!deposit) return res.status(404).json({ message: `No deposit address configured for ${coin} yet. Please choose another coin or contact support.` });
  res.json({ package: pkg, deposit });
});

// Step 2: user submits proof of payment (screenshot) for admin review.
router.post("/buy", protect, uploadScreenshot.single("screenshot"), async (req, res) => {
  const { packageId, coin = "USDT", transactionHash = "", userNote = "" } = req.body;
  const pkg = await Package.findById(packageId);
  if (!pkg) return res.status(404).json({ message: "Package not found" });
  if (!req.file) return res.status(400).json({ message: "Please attach a screenshot of your transaction" });

  const deposit = await DepositAddress.findOne({ coin, isActive: true });

  const payment = await Payment.create({
    user: req.user._id,
    package: pkg._id,
    amount: pkg.price,
    coin,
    network: deposit?.network || "",
    depositAddress: deposit?.address || "",
    screenshotUrl: `/uploads/payments/${req.file.filename}`,
    transactionHash,
    userNote
  });

  res.status(201).json({ payment, message: "Payment proof submitted. Awaiting admin verification." });
});

router.get("/transactions", protect, async (req, res) => {
  const [payments, withdrawals, earnings] = await Promise.all([
    Payment.find({ user: req.user._id }).populate("package").sort({ createdAt: -1 }),
    Withdrawal.find({ user: req.user._id }).sort({ createdAt: -1 }),
    Earning.find({ user: req.user._id }).sort({ createdAt: -1 })
  ]);
  res.json({ payments, withdrawals, earnings });
});

router.get("/referrals", protect, async (req, res) => {
  const referred = await User.find({ referredBy: req.user._id }).select("name email phone createdAt totalInvested");
  const bonuses = await Earning.find({ user: req.user._id, type: "Referral Bonus" }).sort({ createdAt: -1 });
  res.json({
    referralCode: req.user.referralCode,
    referralCount: req.user.referralCount,
    referralEarnings: req.user.referralEarnings,
    referred,
    bonuses
  });
});

router.post("/withdrawals", protect, async (req, res) => {
  const { amount, coin, walletAddress } = req.body;
  const amt = Number(amount);
  if (!amt || amt <= 0) return res.status(400).json({ message: "Enter a valid amount" });
  if (!walletAddress) return res.status(400).json({ message: "Wallet address is required" });
  if (amt > req.user.availableBalance) return res.status(400).json({ message: "Insufficient balance" });

  // Funds are deducted immediately upon request. If the admin later rejects
  // or fails this payout, the amount is intentionally NOT returned.
  const withdrawal = await Withdrawal.create({ user: req.user._id, amount: amt, coin, walletAddress });
  await User.findByIdAndUpdate(req.user._id, { $inc: { availableBalance: -amt } });
  res.status(201).json(withdrawal);
});

export default router;
