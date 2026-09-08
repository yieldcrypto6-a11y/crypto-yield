import React from "react";
import { motion } from "framer-motion";

const ACCENT_ICON_BG = {
  cyan: "bg-cyan-400/10",
  violet: "bg-violet-400/10",
  green: "bg-emerald-400/10",
  gold: "bg-amber-400/10",
  rose: "bg-rose-400/10"
};
const ACCENT_ICON_TEXT = {
  cyan: "text-cyan-300",
  violet: "text-violet-300",
  green: "text-emerald-300",
  gold: "text-amber-300",
  rose: "text-rose-300"
};
const ACCENT_BORDER = {
  cyan: "neon-border-cyan",
  violet: "neon-border-violet",
  green: "neon-border-green",
  gold: "neon-border-gold",
  rose: "neon-border-rose"
};

export function StatCard({ icon: Icon, label, value, accent = "cyan", sub }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={`neon-border ${ACCENT_BORDER[accent]} rounded-2xl p-5 bg-white/[0.02] relative overflow-hidden`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 mb-2">{label}</p>
          <p className="font-display text-2xl font-semibold text-white font-mono">{value}</p>
          {sub && <p className="text-[11px] text-slate-500 mt-1">{sub}</p>}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ACCENT_ICON_BG[accent]}`}>
            <Icon className={ACCENT_ICON_TEXT[accent]} size={18} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function StatusPill({ status }) {
  const map = {
    active: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
    confirmed: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
    completed: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
    approved: "bg-cyan-400/10 text-cyan-300 border-cyan-400/30",
    pending: "bg-amber-400/10 text-amber-300 border-amber-400/30",
    expired: "bg-slate-400/10 text-slate-300 border-slate-400/30",
    rejected: "bg-rose-400/10 text-rose-300 border-rose-400/30",
    failed: "bg-rose-400/10 text-rose-300 border-rose-400/30",
    blocked: "bg-rose-400/10 text-rose-300 border-rose-400/30"
  };
  return (
    <span className={`text-[11px] px-2.5 py-1 rounded-full border font-medium capitalize ${map[status] || "bg-slate-400/10 text-slate-300 border-slate-400/30"}`}>
      {status}
    </span>
  );
}

export function Loader({ label = "Loading platform" }) {
  return (
    <div className="min-h-screen grid place-items-center bg-ink">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-violet-500/30 border-t-violet-400 animate-spin" />
        <p className="text-slate-400 text-sm font-mono">{label}...</p>
      </div>
    </div>
  );
}
