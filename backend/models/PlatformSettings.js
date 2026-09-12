import mongoose from "mongoose";

// Singleton document holding platform-wide, admin-adjustable business rules.
// investorShareRate: % of the day's real trading P&L (positive OR negative) that is
//   passed through to each investor, proportional to their invested principal.
// referralShareRate: % of the day's real trading P&L passed to an upline referrer,
//   proportional to the DOWNLINE's invested principal — but ONLY on profitable days
//   (referral bonus is 0 on loss days, per platform rule).
// timezoneOffsetHours: the platform's "day boundary" clock. Default +1 (GMT+1) —
//   used to decide what "today" and "tomorrow" mean for income start dates and
//   which calendar day a given daily P&L entry applies to.
const schema = new mongoose.Schema({
  key: { type: String, default: "singleton", unique: true },
  investorShareRate: { type: Number, default: 75 }, // % of P&L
  referralShareRate: { type: Number, default: 20 }, // % of P&L (profit days only)
  timezoneOffsetHours: { type: Number, default: 1 }
}, { timestamps: true });

schema.statics.getSettings = async function () {
  let s = await this.findOne({ key: "singleton" });
  if (!s) s = await this.create({ key: "singleton" });
  return s;
};

export default mongoose.model("PlatformSettings", schema);
