import mongoose from "mongoose";

const BAN_STAGES = ["none", "24h", "7d", "30d", "permanent"];

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // Either email OR phone is required (enforced in the route), so both are
  // optional+sparse-unique here to allow phone-only or email-only accounts.
  email: { type: String, unique: true, sparse: true, lowercase: true },
  countryCode: { type: String, default: "" }, // e.g. "+92"
  phone: { type: String, unique: true, sparse: true }, // full number incl. country code, e.g. "+923001234567"
  phoneVerified: { type: Boolean, default: false },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  status: { type: String, enum: ["active", "blocked"], default: "active" },
  walletAddress: { type: String, default: "" },
  availableBalance: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  totalWithdrawn: { type: Number, default: 0 },
  totalInvested: { type: Number, default: 0 },

  // Referral program
  referralCode: { type: String, unique: true, sparse: true, uppercase: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  referralEarnings: { type: Number, default: 0 },
  referralCount: { type: Number, default: 0 },

  // Progressive ban system: none -> 24h -> 7d -> 30d -> permanent
  banStage: { type: Number, default: 0, min: 0, max: 4 }, // index into BAN_STAGES
  bannedUntil: { type: Date, default: null }, // null = not banned / permanent handled by banStage===4
  banReason: { type: String, default: "" },
  banHistory: [{
    stage: String,
    reason: String,
    bannedAt: { type: Date, default: Date.now },
    bannedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  }],

  lastLoginAt: { type: Date, default: null }
}, { timestamps: true });

userSchema.statics.BAN_STAGES = BAN_STAGES;

export default mongoose.model("User", userSchema);
