import React from "react";
import Modal from "./Modal";
import { FiShield, FiEye, FiTrendingUp, FiFileText } from "react-icons/fi";

const points = [
  { icon: FiEye, label: "No guaranteed rate", text: "We never promise a fixed daily %. Payouts are calculated from that day's real trading result." },
  { icon: FiFileText, label: "Published daily", text: "Every day's result is logged and visible to every investor in their dashboard." },
  { icon: FiShield, label: "Manual verification", text: "Every deposit is checked against your transaction screenshot before activation." },
  { icon: FiTrendingUp, label: "Real market data", text: "Live BTC, ETH, Gold and forex charts, sourced directly from TradingView." }
];

export default function TrustPopup({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="text-center mb-5">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20 border border-cyan-400/40 flex items-center justify-center mb-4">
          <FiShield className="text-cyan-300" size={26} />
        </div>
        <span className="text-xs tracking-wide font-semibold text-cyan-300/90">TRANSPARENCY, NOT PROMISES</span>
        <h2 className="font-display text-2xl font-semibold text-white mt-1">
          How payouts actually work here
        </h2>
        <p className="text-slate-400 text-sm mt-2">
          We don't advertise a fixed daily return — real trading doesn't work that way. Here's what
          you can count on instead.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {points.map((s, i) => (
          <div key={i} className="neon-border neon-border-cyan rounded-xl p-3 bg-white/[0.02] text-left">
            <s.icon className="text-cyan-300 mb-1.5" size={16} />
            <div className="text-xs font-semibold text-white">{s.label}</div>
            <div className="text-[11px] text-slate-400 mt-1">{s.text}</div>
          </div>
        ))}
      </div>

      <button onClick={onClose} className="btn-primary w-full py-3 rounded-xl font-semibold text-white">
        Explore the platform
      </button>
    </Modal>
  );
}
