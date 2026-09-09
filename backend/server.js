import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import "express-async-errors";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import platformRoutes from "./routes/platform.js";
import adminRoutes from "./routes/admin.js";
import { geoRestrict } from "./middleware/geoRestrict.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json());

app.set("trust proxy", true);

app.use(geoRestrict);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

let mongoConnected = false;

async function connectMongoDB() {
  if (mongoConnected || mongoose.connection.readyState === 1) {
    mongoConnected = true;
    return;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  await mongoose.connect(process.env.MONGO_URI);

  mongoConnected = true;
  console.log("MongoDB connected");
}

// Make sure MongoDB is connected BEFORE API routes run.
app.use(async (req, res, next) => {
  try {
    await connectMongoDB();
    next();
  } catch (err) {
    console.error("MongoDB connection error:", err);
    next(err);
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "CryptoGrow API running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api", platformRoutes);
app.use("/api/admin", adminRoutes);

// General error handler — must remain LAST.
app.use((err, req, res, next) => {
  if (err) {
    console.error(err);

    return res.status(err.status || 500).json({
      message: err.message || "Something went wrong"
    });
  }

  next();
});

// Local development only.
// Vercel uses the exported Express app.
if (process.env.VERCEL !== "1") {
  app.listen(process.env.PORT || 5000, () => {
    console.log("API running");
  });
}

export default app;