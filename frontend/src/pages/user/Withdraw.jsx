import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiAlertTriangle, FiDownload } from "react-icons/fi";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { Loader, StatusPill } from "../../components/ui";
import { money, dateFmt } from "../../utils/format";

export default function Withdraw() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ amount: "", coin: "USDT", walletAddress: "" });
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState(null);

  const loadHistory = () => api.get("/transactions").then((r) => setHistory(r.data.withdrawals));
  useEffect(() => { loadHistory(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/withdrawals", { ...form, amount: Number(form.amount) });
      toast.success("Withdrawal request submitted");
      setForm({ amount: "", coin: "USDT", walletAddress: "" });
      refreshUser();
      loadHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit request");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Request a Payout</h1>
        <p className="text-slate-400 text-sm mt-1">Available balance: <span className="text-emerald-300 font-mono">{money(user?.availableBalance)}</span></p>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        <form onSubmit={submit} className="lg:col-span-2 neon-border neon-border-gold rounded-2xl p-6 bg-white/[0.02] space-y-4 h-fit">
          <div className="flex items-start gap-2 text-xs text-amber-300 bg-amber-400/10 border border-amber-400/30 rounded-xl p-3">
            <FiAlertTriangle className="shrink-0 mt-0.5" />
            The requested amount is deducted from your wallet immediately. If your payout later fails
            or is rejected, it will not be refunded to your wallet.
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Amount (USD)</label>
            <input
              type="number" min="1" step="0.01" required value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full bg-surface-2 border border-line rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400 font-mono"
              placeholder="e.g. 100.00"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Coin</label>
            <select
              value={form.coin} onChange={(e) => setForm({ ...form, coin: e.target.value })}
              className="w-full bg-surface-2 border border-line rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400"
            >
              <option>USDT</option><option>BTC</option><option>ETH</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Wallet Address</label>
            <input
              required value={form.walletAddress}
              onChange={(e) => setForm({ ...form, walletAddress: e.target.value })}
              className="w-full bg-surface-2 border border-line rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400 font-mono text-sm"
              placeholder="Your receiving wallet address"
            />
          </div>
          <button disabled={busy} className="btn-primary w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60">
            <FiDownload /> {busy ? "Submitting..." : "Request Withdrawal"}
          </button>
        </form>

        <div className="lg:col-span-3 neon-border neon-border-violet rounded-2xl bg-white/[0.02] overflow-hidden">
          <h3 className="font-display font-semibold text-white p-5 pb-0">Payout History</h3>
          {!history ? <Loader label="Loading" /> : !history.length ? (
            <p className="text-slate-500 text-sm text-center py-10">No withdrawal requests yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm mt-3">
                <thead>
                  <tr className="border-b border-line/70">
                    {["Amount", "Coin", "Status", "Remarks", "Date"].map((h) => (
                      <th key={h} className="text-left text-[11px] uppercase tracking-wide text-slate-500 px-5 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((w) => (
                    <tr key={w._id} className="border-b border-line/40 last:border-0">
                      <td className="px-5 py-3.5 font-mono text-slate-300">{money(w.amount)}</td>
                      <td className="px-5 py-3.5 text-slate-300">{w.coin}</td>
                      <td className="px-5 py-3.5"><StatusPill status={w.status} /></td>
                      <td className="px-5 py-3.5 text-slate-400 text-xs">{w.adminRemarks || "—"}</td>
                      <td className="px-5 py-3.5 text-slate-400 text-xs">{dateFmt(w.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
