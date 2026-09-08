import mongoose from "mongoose";
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  package: { type: mongoose.Schema.Types.ObjectId, ref: "Package", required: true },
  packageName: String,
  pricePaid: Number, // principal — this is what daily P&L % is applied to
  // Locked in at purchase time so later admin changes to a package's share rate
  // don't retroactively change what an already-active investor was promised.
  investorShareRate: Number,
  totalCredited: { type: Number, default: 0 }, // can go negative net if there are loss days
  daysCredited: { type: Number, default: 0 },
  // Every platform-calendar-date (YYYY-MM-DD, GMT+1) already processed for this
  // package, so the daily job never double-credits or skips a day.
  creditedDates: [{ type: String }],
  // Income starts the platform-day AFTER activation — never the day it's bought.
  startDate: Date,
  endDate: Date,
  status: { type: String, enum: ["active", "expired"], default: "active" }
}, { timestamps: true });
export default mongoose.model("UserPackage", schema);
