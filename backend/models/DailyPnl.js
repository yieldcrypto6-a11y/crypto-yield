import mongoose from "mongoose";

// One document per platform calendar day (GMT+1). pnlPercent is the admin-entered
// real trading result for that day, e.g. 10 means the pooled capital grew 10% that
// day, -4 means it lost 4%. This is the single source of truth every investor's
// and referrer's payout for that day is calculated from — there is no fixed/
// guaranteed rate anywhere in the system.
const schema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // "YYYY-MM-DD" in platform tz (GMT+1)
  pnlPercent: { type: Number, required: true },
  note: { type: String, default: "" },
  processed: { type: Boolean, default: false },
  investorsCredited: { type: Number, default: 0 },
  referralsCredited: { type: Number, default: 0 },
  totalInvestorPayout: { type: Number, default: 0 },
  totalReferralPayout: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("DailyPnl", schema);
