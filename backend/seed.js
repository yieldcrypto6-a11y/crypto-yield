// Production setup script: creates the initial admin account and the default
// package tiers. Run once when first deploying: `npm run seed`
//
// IMPORTANT: this does NOT create any test/demo user, and does NOT create any
// crypto deposit addresses. You must add your own real wallet addresses via
// the admin panel (Admin → Deposit Addresses) before accepting any deposits —
// there are no default addresses seeded, on purpose, so nothing can ever be
// accidentally deployed pointing at an address you don't control.

import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Package from "./models/Package.js";
import { generateReferralCode } from "./utils/ban.js";

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    "Refusing to seed: set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file first " +
    "(these become your real, live admin login — choose a strong password)."
  );
  process.exit(1);
}
if (ADMIN_PASSWORD.length < 10) {
  console.error("ADMIN_PASSWORD must be at least 10 characters for a production account.");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);

const existingAdmin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
if (existingAdmin) {
  console.log(`Admin account ${ADMIN_EMAIL} already exists — skipping user creation.`);
} else {
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await User.create({
    name: "Admin",
    email: ADMIN_EMAIL.toLowerCase(),
    password: hash,
    role: "admin",
    referralCode: generateReferralCode("Admin")
  });
  console.log(`Admin account created: ${ADMIN_EMAIL}`);
}

const existingPackages = await Package.countDocuments();
if (existingPackages > 0) {
  console.log(`${existingPackages} package(s) already exist — skipping package creation.`);
} else {
  // Packages carry no fixed/guaranteed rate — every active package earns a share
  // of the platform's REAL daily trading result (see PlatformSettings + DailyPnl).
  // investorShareOverride left null on every tier so they all follow the
  // platform default (Admin → Daily P&L → Settings) uniformly. Edit each
  // plan's price, name, features, badge and override anytime in Admin → Packages.
  await Package.insertMany([
    { name: "Starter", price: 50, durationDays: 30, description: "Perfect entry point into real profit-sharing.", features: ["Share of real daily trading P&L", "30-day cycle", "24/7 support"], color: "cyan" },
    { name: "Basic", price: 250, durationDays: 30, description: "Our most popular plan for steady growth.", features: ["Share of real daily trading P&L", "30-day cycle", "Priority support"], badge: "Most Popular", color: "purple" },
    { name: "Growth", price: 500, durationDays: 30, description: "A step up for investors ready to scale their capital.", features: ["Share of real daily trading P&L", "30-day cycle", "Priority support"], color: "indigo" },
    { name: "Premium", price: 1000, durationDays: 30, description: "For serious investors who want a larger position.", features: ["Share of real daily trading P&L", "30-day cycle", "Dedicated account manager"], badge: "Best Value", color: "gold" },
    { name: "VIP", price: 5000, durationDays: 30, description: "Our top-tier plan for maximum capital deployment.", features: ["Share of real daily trading P&L", "30-day cycle", "VIP dedicated line", "Early access to new plans"], badge: "VIP", color: "emerald" }
  ]);
  console.log("5 default package tiers created (edit prices/rates/badges anytime in Admin → Packages).");
}

console.log("\nSetup complete.");
console.log("NEXT STEP (required before going live): add your real crypto deposit");
console.log("addresses in Admin → Deposit Addresses. None are seeded by default.");
console.log("Also confirm your profit-share rates in Admin → Daily P&L → Settings —");
console.log("set Investor Share and Referral Share to whatever split you've decided");
console.log("(e.g. 75% investor / 20% referral). The code default is 50%/20% until changed there.");
await mongoose.disconnect();
