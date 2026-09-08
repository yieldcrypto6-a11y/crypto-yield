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
  // investorShareOverride: null = use the platform default share rate; a tier can
  // optionally get a bigger share of real P&L via a non-null override.
  await Package.insertMany([
    { name: "Starter", price: 50, durationDays: 30, description: "Perfect entry point into real profit-sharing.", features: ["Share of real daily trading P&L", "30-day cycle", "24/7 support"], color: "cyan" },
    { name: "Basic", price: 250, durationDays: 30, description: "Our most popular plan for steady growth.", features: ["Share of real daily trading P&L", "30-day cycle", "Priority support"], badge: "Most Popular", color: "purple" },
    { name: "Premium", price: 1000, durationDays: 30, investorShareOverride: 55, description: "A larger share of real daily results for serious investors.", features: ["Higher profit share", "30-day cycle", "Dedicated account manager"], badge: "Best Value", color: "gold" },
    { name: "VIP", price: 5000, durationDays: 30, investorShareOverride: 60, description: "Our top-tier plan with the largest share of real daily results.", features: ["Highest profit share", "30-day cycle", "VIP dedicated line", "Early access to new plans"], badge: "VIP", color: "emerald" }
  ]);
  console.log("Default package tiers created (edit prices/rates anytime in Admin → Packages).");
}

console.log("\nSetup complete.");
console.log("NEXT STEP (required before going live): add your real crypto deposit");
console.log("addresses in Admin → Deposit Addresses. None are seeded by default.");
await mongoose.disconnect();
