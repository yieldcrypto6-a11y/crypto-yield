import mongoose from "mongoose";
const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  // Packages no longer carry a fixed/guaranteed daily rate. Instead, every active
  // package earns a share of the platform's REAL daily trading result (entered by
  // an admin each day), proportional to its price. investorShareOverride lets a
  // higher tier pass through a bigger slice of that real P&L than the platform
  // default (see PlatformSettings.investorShareRate) — null means "use the default".
  investorShareOverride: { type: Number, default: null, min: 0, max: 100 },
  durationDays: { type: Number, default: 30 },
  description: { type: String, default: "" },
  features: [{ type: String }],
  badge: { type: String, default: "" }, // e.g. "Most Popular", "Best Value"
  color: { type: String, default: "purple" },
  status: { type: String, enum: ["active", "inactive"], default: "active" }
}, { timestamps: true });

export default mongoose.model("Package", packageSchema);
