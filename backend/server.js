import express from "express";
import "express-async-errors"; // makes Express 4 catch errors thrown/rejected inside
// async route handlers and pass them to the error middleware below, instead of
// crashing the whole server via an unhandled promise rejection (one bad
// request could otherwise take the whole site down until manually restarted).
import mongoose from "mongoose";
import dotenv from "dotenv";
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
// balancer), this is required for geoRestrict to see the real visitor IP
// instead of the proxy's IP.
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

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("MongoDB connected");
  app.listen(process.env.PORT || 5000, () => console.log("API running"));
  // No cron job here anymore: daily payouts are triggered explicitly by an admin
  // entering the real day's P&L via POST /api/admin/daily-pnl, see jobs/dailyPnl.js
}).catch(err => { console.error(err); process.exit(1); });
