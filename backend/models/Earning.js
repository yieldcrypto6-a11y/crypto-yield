import mongoose from "mongoose";
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userPackage: { type: mongoose.Schema.Types.ObjectId, ref: "UserPackage", default: null },
  amount: Number, // can be negative on a loss day
  // "Daily P&L" replaces the old fixed "Daily Income" — it's the user's real share
  // (positive or negative) of that day's actual trading result.
  type: { type: String, enum: ["Daily P&L", "Referral Bonus"], default: "Daily P&L" },
  pnlDate: { type: String, default: "" }, // platform calendar date this entry is for
  note: { type: String, default: "" }
}, { timestamps: true });
export default mongoose.model("Earning", schema);
