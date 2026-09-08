import mongoose from "mongoose";
// NOTE: The requested amount is deducted from the user's wallet the moment the
// withdrawal (payout) request is created. If the admin later marks it "failed"
// or "rejected", the funds are intentionally NOT credited back to the wallet.
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: Number,
  coin: { type: String, enum: ["USDT", "BTC", "ETH"], default: "USDT" },
  walletAddress: String,
  status: { type: String, enum: ["pending", "approved", "completed", "rejected", "failed"], default: "pending" },
  adminRemarks: { type: String, default: "" },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  reviewedAt: { type: Date, default: null },
  transactionHash: String
}, { timestamps: true });
export default mongoose.model("Withdrawal", schema);
