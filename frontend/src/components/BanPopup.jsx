import React from "react";
import Modal from "./Modal";
import { FiShield, FiClock } from "react-icons/fi";
import { BAN_STAGE_LABELS, timeUntil } from "../utils/format";

export default function BanPopup({ ban, onClose }) {
  if (!ban) return null;
  const isPermanent = ban.stage === "permanent";
  return (
    <Modal open={!!ban} onClose={onClose} className="text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/40 flex items-center justify-center mb-4 neon-glow-cyan">
        <FiShield className="text-rose-400" size={30} />
      </div>
      <h2 className="font-display text-2xl font-semibold text-white mb-2">Account Suspended</h2>
      <p className="text-slate-300 text-sm mb-4">
        Your account has been placed under a{" "}
        <span className="text-rose-400 font-semibold">{BAN_STAGE_LABELS[ban.stage] || ban.stage}</span> suspension
        {isPermanent ? "." : " by our compliance team."}
      </p>

      {ban.reason && (
        <div className="text-left bg-white/5 border border-white/10 rounded-xl p-3 mb-4 text-sm text-slate-300">
          <span className="text-slate-400 block text-xs mb-1">Admin remarks</span>
          {ban.reason}
        </div>
      )}

      {!isPermanent && ban.bannedUntil && (
        <div className="flex items-center justify-center gap-2 text-sm text-amber-300 bg-amber-400/10 border border-amber-400/30 rounded-xl py-2 px-3 mb-4">
          <FiClock /> Access restored in <b>{timeUntil(ban.bannedUntil)}</b>
        </div>
      )}

      <p className="text-xs text-slate-500 mb-5">
        If you believe this is a mistake, please contact our support team for assistance.
      </p>
      <button onClick={onClose} className="btn-primary w-full py-3 rounded-xl font-semibold text-white">
        I understand
      </button>
    </Modal>
  );
}
