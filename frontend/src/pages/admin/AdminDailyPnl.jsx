import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiTrendingUp, FiTrendingDown, FiAlertCircle, FiClock } from "react-icons/fi";
import api from "../../api/client";
import { Loader } from "../../components/ui";
import { money } from "../../utils/format";

export default function AdminDailyPnl() {
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState(null);
  const [settings, setSettings] = useState(null);
  const [pnl, setPnl] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [t, h, s] = await Promise.all([
      api.get("/admin/daily-pnl/today"),
      api.get("/admin/daily-pnl"),
      api.get("/admin/settings")
    ]);
    setToday(t.data);
    setHistory(h.data);
    setSettings(s.data);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (pnl === "" || Number.isNaN(Number(pnl))) return toast.error("Enter today's real result as a percentage, e.g. 10 or -4");
    if (!confirm(`Post ${pnl}% as today's real result? This will pay out every active investor and referrer based on it, and cannot be edited afterward.`)) return;
    setBusy(true);
    try {
      const { data } = await api.post("/admin/daily-pnl", { pnlPercent: Number(pnl), note });
      toast.success(data.message);
      setPnl(""); setNote("");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not post today's result");
    } finally {
      setBusy(false);
    }
  };

  const saveSettings = async (patch) => {
    const { data } = await api.patch("/admin/settings", patch);
    setSettings(data);
    toast.success("Settings updated");
  };

  if (!today || !history || !settings) return <Loader label="Loading" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Daily P&L</h1>
        <p className="text-slate-400 text-sm mt-1">
          Enter the platform's actual trading result for the day. Every active investor and referrer
          is paid a transparent share of exactly this number — nothing is fixed or guaranteed.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 neon-border neon-border-cyan rounded-2xl p-6 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-white">Today — {today.date} (GMT+{today.timezoneOffsetHours})</h3>
            {today.entry ? (
              <span className="text-xs text-emerald-300 bg-emerald-400/10 border border-emerald-400/30 px-3 py-1 rounded-full">Already processed</span>
            ) : (
              <span className="text-xs text-amber-300 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full flex items-center gap-1"><FiClock size={12} /> Not yet entered</span>
            )}
          </div>

          {today.entry ? (
            <div className="space-y-2 text-sm">
              <Row label="Result" value={`${today.entry.pnlPercent >= 0 ? "+" : ""}${today.entry.pnlPercent}%`} accent={today.entry.pnlPercent >= 0 ? "text-emerald-300" : "text-rose-300"} />
              <Row label="Investors paid" value={today.entry.investorsCredited} />
              <Row label="Referrers paid" value={today.entry.referralsCredited} />
              <Row label="Total to investors" value={money(today.entry.totalInvestorPayout)} />
              <Row label="Total to referrers" value={money(today.entry.totalReferralPayout)} />
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="flex items-start gap-3 bg-amber-400/5 border border-amber-400/20 rounded-xl p-3 text-xs text-amber-200/90">
                <FiAlertCircle className="shrink-0 mt-0.5" size={14} />
                Once posted, this cannot be edited — every active package and eligible referral gets
                credited immediately based on this number.
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Today's real result (%)</label>
                <div className="relative">
                  {Number(pnl) < 0 ? (
                    <FiTrendingDown className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400" size={16} />
                  ) : (
                    <FiTrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={16} />
                  )}
                  <input
                    value={pnl} onChange={(e) => setPnl(e.target.value)} type="number" step="0.01"
                    placeholder="e.g. 10 for +10%, -4 for a 4% loss"
                    className="w-full bg-surface-2 border border-line rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Note (optional, shown to admins only)</label>
                <input
                  value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. BTC/USD swing trade"
                  className="w-full bg-surface-2 border border-line rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                />
              </div>
              <button disabled={busy} className="btn-primary w-full py-3 rounded-xl font-semibold text-white disabled:opacity-60">
                {busy ? "Posting..." : "Post Today's Result & Pay Out"}
              </button>
            </form>
          )}
        </div>

        <div className="neon-border neon-border-violet rounded-2xl p-6 bg-white/[0.02] space-y-4">
          <h3 className="font-display font-semibold text-white">Platform Settings</h3>
          <SettingField
            label="Investor share of daily P&L (%)" value={settings.investorShareRate}
            onSave={(v) => saveSettings({ investorShareRate: v })}
          />
          <SettingField
            label="Referral share of daily P&L (%)" value={settings.referralShareRate}
            onSave={(v) => saveSettings({ referralShareRate: v })}
          />
          <p className="text-[11px] text-slate-500">
            These are the platform defaults. Individual packages can override the investor share rate
            (see Packages). Referral bonuses only ever apply on profit days.
          </p>
        </div>
      </div>

      <div className="neon-border neon-border-cyan rounded-2xl bg-white/[0.02] overflow-hidden">
        <h3 className="font-display font-semibold text-white p-5 pb-0">History</h3>
        {!history.length ? (
          <p className="text-slate-500 text-sm text-center py-10">No results posted yet.</p>
        ) : (
          <table className="w-full text-sm mt-3">
            <thead>
              <tr className="border-b border-line/70">
                {["Date", "Result", "Investors", "Referrers", "Investor Payout", "Referral Payout"].map((h) => (
                  <th key={h} className="text-left text-[11px] uppercase tracking-wide text-slate-500 px-5 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((d) => (
                <tr key={d._id} className="border-b border-line/40 last:border-0">
                  <td className="px-5 py-3.5 text-white font-mono">{d.date}</td>
                  <td className={`px-5 py-3.5 font-mono ${d.pnlPercent >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{d.pnlPercent >= 0 ? "+" : ""}{d.pnlPercent}%</td>
                  <td className="px-5 py-3.5 text-slate-400">{d.investorsCredited}</td>
                  <td className="px-5 py-3.5 text-slate-400">{d.referralsCredited}</td>
                  <td className="px-5 py-3.5 font-mono text-slate-300">{money(d.totalInvestorPayout)}</td>
                  <td className="px-5 py-3.5 font-mono text-slate-300">{money(d.totalReferralPayout)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{label}</span>
      <span className={`font-mono font-semibold ${accent || "text-white"}`}>{value}</span>
    </div>
  );
}

function SettingField({ label, value, onSave }) {
  const [v, setV] = useState(value);
  return (
    <div>
      <label className="text-xs text-slate-400 mb-1.5 block">{label}</label>
      <div className="flex gap-2">
        <input
          type="number" step="0.1" value={v} onChange={(e) => setV(e.target.value)}
          className="flex-1 bg-surface-2 border border-line rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-400 font-mono"
        />
        <button onClick={() => onSave(v)} className="px-4 py-2.5 rounded-xl border border-violet-400/30 text-violet-300 text-sm hover:bg-violet-400/10">
          Save
        </button>
      </div>
    </div>
  );
}
