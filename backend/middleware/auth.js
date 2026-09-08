import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { evaluateBan } from "../utils/ban.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Not authorised" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "User not found" });

    const ban = evaluateBan(req.user);
    if (ban.expired && req.user.status === "blocked") {
      // Timed ban has passed — automatically lift it.
      req.user.status = "active";
      await req.user.save();
    } else if (ban.isBanned) {
      return res.status(403).json({
        message: "Account is banned",
        ban: { stage: ban.stageLabel, bannedUntil: ban.bannedUntil, reason: ban.reason }
      });
    }
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
  next();
};
