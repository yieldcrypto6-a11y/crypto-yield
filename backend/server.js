import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import "express-async-errors"; // makes Express 4 catch errors thrown/rejected inside
// async route handlers and pass them to the error middleware below, instead of
// crashing the whole server via an unhandled promise rejection (which is what
// happened before this was added — one bad request could take the site down
// for every user until it was manually restarted).
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
// If deployed behind a reverse proxy / CDN (Cloudflare, Nginx, a PaaS load
// balancer), this is required for geoRestrict (and rate limiting, if you add
// it later) to see the real visitor IP instead of the proxy's IP.
app.set("trust proxy", true);
app.use(geoRestrict); // only active when GEO_RESTRICT=true in .env — see middleware/geoRestrict.js
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => res.json({ ok: true, message: "CryptoGrow API running" }));
app.use("/api/auth", authRoutes);
app.use("/api", platformRoutes);
app.use("/api/admin", adminRoutes);

// General error handler — with express-async-errors above, this now catches
// errors from async route handlers too, not just Multer/sync errors, so a
// single bad request returns a clean 400/500 instead of crashing the server.
app.use((err, req, res, next) => {
  if (err) {
    console.error(err);
    return res.status(err.status || 400).json({ message: err.message || "Something went wrong" });
  }
  next();
});

let mongoConnected = false;

async function connectMongoDB() {
  if (mongoConnected || mongoose.connection.readyState === 1) {
    mongoConnected = true;
    return;
  }

  await mongoose.connect(process.env.MONGO_URI);
  mongoConnected = true;
  console.log("MongoDB connected");
}

// Make sure MongoDB is connected before handling API requests.
app.use(async (req, res, next) => {
  try {
    await connectMongoDB();
    next();
  } catch (err) {
    console.error("MongoDB connection error:", err);
    next(err);
  }
});

// Vercel uses the exported Express app.
// For local development, start the normal Express server.
if (process.env.VERCEL !== "1") {
  app.listen(process.env.PORT || 5000, () => {
    console.log("API running");
  });
}

export default app;
