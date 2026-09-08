import mongoose from "mongoose";
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  package: { type: mongoose.Schema.Types.ObjectId, ref: "Package", required: true },
  amount: Number,
  coin: { type: String, enum: ["USDT", "BTC", "ETH"], default: "USDT" },
  network: String, // e.g. TRC20, ERC20, BEP20
  depositAddress: String, // address the admin gave the user for this deposit
  screenshotUrl: String, // uploaded proof of payment
  userNote: { type: String, default: "" },
  status: { type: String, enum: ["pending", "confirmed", "rejected"], default: "pending" },
  adminRemarks: { type: String, default: "" },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  reviewedAt: { type: Date, default: null },
  transactionHash: String
}, { timestamps: true });
export default mongoose.model("Payment", schema);
