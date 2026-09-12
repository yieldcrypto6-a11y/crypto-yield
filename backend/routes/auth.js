import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { evaluateBan, generateReferralCode } from "../utils/ban.js";

const router = express.Router();
const tokenFor = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  referralCode: u.referralCode,
  availableBalance: u.availableBalance,
  totalEarnings: u.totalEarnings
});

function fullPhone(countryCode, phone) {
  if (!countryCode || !phone) return null;
  const cc = countryCode.startsWith("+") ? countryCode : `+${countryCode}`;
  const digits = String(phone).replace(/\D/g, "").replace(/^0+/, "");
  return `${cc}${digits}`;
}

/* ---------------- Registration: email OR phone (no OTP) ---------------- */
// Phone numbers are NOT verified at signup — intentionally, to avoid
// per-message SMS/WhatsApp costs.

router.post("/register", async (req, res) => {
  const { name, email, password, referralCode, countryCode, phone } = req.body;
  if (!name || !password) return res.status(400).json({ message: "Name and password are required" });
  if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

  const hasEmail = !!email;
  const full = fullPhone(countryCode, phone);
  const hasPhone = !!full;

  if (!hasEmail && !hasPhone) {
    return res.status(400).json({ message: "Provide either an email or a phone number" });
  }

  if (hasEmail && await User.findOne({ email: email.toLowerCase() })) {
    return res.status(400).json({ message: "Email already exists" });
  }

  if (hasPhone && await User.findOne({ phone: full })) {
    return res.status(400).json({ message: "Phone number already registered" });
  }

  let referredBy = null;
  if (referralCode) {
    const referrer = await User.findOne({ referralCode: referralCode.trim().toUpperCase() });
    if (!referrer) return res.status(400).json({ message: "Invalid referral code" });
    referredBy = referrer._id;
  }

  const hash = await bcrypt.hash(password, 10);

  let myCode;
  do {
    myCode = generateReferralCode(name);
  } while (await User.findOne({ referralCode: myCode }));

  const user = await User.create({
    name,
    email: hasEmail ? email.toLowerCase() : undefined,
    countryCode: hasPhone ? countryCode : "",
    phone: hasPhone ? full : undefined,
    phoneVerified: false,
    password: hash,
    referredBy,
    referralCode: myCode
  });

  if (referredBy) {
    await User.findByIdAndUpdate(referredBy, { $inc: { referralCount: 1 } });
  }

  res.json({ token: tokenFor(user), user: publicUser(user) });
});

router.post("/login", async (req, res) => {
  const { email, phone, countryCode, password } = req.body;
  const query = email ? { email: email.toLowerCase() } : { phone: fullPhone(countryCode, phone) };
  const user = await User.findOne(query);
  if (!user || !(await bcrypt.compare(password || "", user.password)))
    return res.status(401).json({ message: "Invalid credentials" });

  const ban = evaluateBan(user);
  if (ban.expired && user.status === "blocked") {
    user.status = "active";
    await user.save();
  } else if (ban.isBanned) {
    return res.status(403).json({
      message: "Your account has been banned",
      ban: { stage: ban.stageLabel, bannedUntil: ban.bannedUntil, reason: ban.reason }
    });
  }

  user.lastLoginAt = new Date();
  await user.save();

  res.json({ token: tokenFor(user), user: publicUser(user) });
});

router.get("/me", protect, async (req, res) => res.json(req.user));

export default router;
