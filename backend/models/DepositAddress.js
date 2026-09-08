import mongoose from "mongoose";
const schema = new mongoose.Schema({
  coin: { type: String, enum: ["USDT", "BTC", "ETH"], required: true },
  network: { type: String, required: true }, // e.g. TRC20, ERC20, BEP20, Bitcoin
  address: { type: String, required: true },
  qrCodeUrl: { type: String, default: "" },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
schema.index({ coin: 1, network: 1 }, { unique: true });
export default mongoose.model("DepositAddress", schema);
