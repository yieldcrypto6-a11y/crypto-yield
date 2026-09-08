import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiCheck, FiX, FiAlertTriangle } from "react-icons/fi";
import api from "../../api/client";
import { Loader, StatusPill } from "../../components/ui";
import { money, dateFmt } from "../../utils/format";
import Modal from "../../components/Modal";

const ACTIONS = [
  { key: "completed", label: "Mark Completed", cls: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30 hover:bg-emerald-400/20", icon: FiCheck },
  { key: "failed", label: "Mark Failed", cls: "bg-amber-400/10 text-amber-300 border-amber-400/30 hover:bg-amber-400/20", icon: FiAlertTriangle },
  { key: "rejected", label: "Reject", cls: "bg-rose-400/10 text-rose-300 border-rose-400/30 hover:bg-rose-400/20", icon: FiX }
];

export default function AdminWithdrawals() {
  const [list, setList] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [reviewing, setReviewing] = useState(null); // { withdrawal, action }
  const [remarks, setRemarks] = useState("");
  const [txHash, setTxHash] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => api.get("/admin/withdrawals").then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const openReview = (withdrawal, action) => { setReviewing({ withdrawal, action }); setRemarks(""); setTxHash(""); };

  const submitReview = async () => {
    setBusy(true);
    try {
      await api.patch(`/admin/withdrawals/${reviewing.withdrawal._id}`, {
        status: reviewing.action, adminRemarks: remarks, transactionHash: txHash
      });
      toast.success(`Withdrawal ${reviewing.action}`);
      setReviewing(null); load();
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
    finally { setBusy(false); }
  };

  if (!list) return <Loader label="Loading withdrawals" />;
  const filtered = filter === "all" ? list : list.filter((w) => w.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Payout Requests</h1>
        <p className="text-slate-400 text-sm mt-1">
          Amounts are deducted from the user's wallet at request time. Rejected or failed payouts are never refunded.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["pending", "completed", "failed", "rejected", "all"].map((f) => (
          <button
            key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${filter === f ? "btn-primary text-white" : "border border-line text-slate-400 hover:text-white"}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="neon-border neon-border-gold rounded-2xl overflow-hidden bg-white/[0.02]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line/70">
                {["User", "Amount", "Coin", "Wallet Address", "Status", "Remarks", "Requested", "Actions"].map((h) => (
                  <th key={h} className="text-left text-[11px] uppercase tracking-wide text-slate-500 px-5 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!filtered.length && (
                <tr><td colSpan={8} className="text-center text-slate-500 py-10">No withdrawal requests in this view.</td></tr>
              )}
              {filtered.map((w) => (
                <tr key={w._id} className="border-b border-line/40 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="text-white">{w.user?.name}</p>
                    <p className="text-[11px] text-slate-500">{w.user?.email}</p>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-200">{money(w.amount)}</td>
                  <td className="px-5 py-3.5 text-slate-400">{w.coin}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-400 max-w-[160px] truncate">{w.walletAddress}</td>
                  <td className="px-5 py-3.5"><StatusPill status={w.status} /></td>
                  <td className="px-5 py-3.5 text-xs text-slate-400 max-w-[160px]">{w.adminRemarks || "—"}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">{dateFmt(w.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    {w.status === "pending" && (
                      <div className="flex gap-1.5 flex-wrap">
                        {ACTIONS.map((a) => (
                          <button key={a.key} onClick={() => openReview(w, a.key)} className={`flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg border ${a.cls}`}>
                            <a.icon size={11} /> {a.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!reviewing} onClose={() => setReviewing(null)}>
        {reviewing && (
          <div>
            <h2 className="font-display text-xl font-semibold text-white mb-1 capitalize">{reviewing.action} Payout</h2>
            <p className="text-slate-400 text-sm mb-4">
              {money(reviewing.withdrawal.amount)} to {reviewing.withdrawal.user?.name}.{" "}
              {reviewing.action !== "completed" && (
                <span className="text-rose-300">This amount will NOT be returned to the user's wallet.</span>
              )}
            </p>
            {reviewing.action === "completed" && (
              <input
                value={txHash} onChange={(e) => setTxHash(e.target.value)} placeholder="Transaction hash (optional)"
                className="w-full bg-surface-2 border border-line rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 mb-3 font-mono text-sm"
              />
            )}
            <textarea
              value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3}
              placeholder="Remarks shown to the user"
              className="w-full bg-surface-2 border border-line rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-400 mb-4 text-sm"
            />
            <button onClick={submitReview} disabled={busy} className="btn-primary w-full py-3 rounded-xl font-semibold text-white disabled:opacity-60">
              {busy ? "Submitting..." : `Confirm ${reviewing.action}`}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
