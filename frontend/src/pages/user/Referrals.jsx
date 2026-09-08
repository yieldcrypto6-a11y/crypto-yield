import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiCopy, FiUsers, FiGift, FiShare2 } from "react-icons/fi";
import api from "../../api/client";
import { Loader } from "../../components/ui";
import { money, dateShort } from "../../utils/format";

export default function Referrals() {
  const [data, setData] = useState(null);
  const [info, setInfo] = useState(null);
  useEffect(() => {
    api.get("/referrals").then((r) => setData(r.data));
    api.get("/platform-info").then((r) => setInfo(r.data));
  }, []);
  if (!data) return <Loader label="Loading referrals" />;

  const link = `${window.location.origin}/register?ref=${data.referralCode}`;
  const copy = (text, label) => { navigator.clipboard.writeText(text); toast.success(`${label} copied`); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Referral Program</h1>
        <p className="text-slate-400 text-sm mt-1">
          Earn a share of real profit on days your referrals' investments earn — starting the same day
          their own income starts. Nothing accrues on loss days.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <MiniStat icon={FiUsers} label="Referred Users" value={data.referralCount} accent="cyan" />
        <MiniStat icon={FiGift} label="Referral Earnings" value={money(data.referralEarnings)} accent="green" />
        <MiniStat icon={FiShare2} label="Your Share of Daily P&L" value={info ? `${info.referralShareRate}%` : "…"} accent="violet" />
      </div>

      <div className="text-xs text-slate-500 bg-white/[0.02] border border-line rounded-xl px-4 py-3">
        Example: if a friend you referred has $100 active and the platform's real result that day is
        +10%, you'd earn {info ? `${info.referralShareRate}%` : "20%"} of that 10% on their $100 — same day their own
        earnings post. On a loss day, referral bonuses are $0 for everyone, never negative.
      </div>

      <div className="neon-border neon-border-cyan rounded-2xl p-6 bg-white/[0.02]">
        <h3 className="font-display font-semibold text-white mb-4">Your referral tools</h3>
        <div className="space-y-3">
          <Field label="Referral Code" value={data.referralCode} onCopy={() => copy(data.referralCode, "Referral code")} mono />
          <Field label="Referral Link" value={link} onCopy={() => copy(link, "Referral link")} mono />
        </div>
      </div>

      <div className="neon-border neon-border-violet rounded-2xl bg-white/[0.02] overflow-hidden">
        <h3 className="font-display font-semibold text-white p-5 pb-0">Referred Users</h3>
        {!data.referred.length ? (
          <p className="text-slate-500 text-sm text-center py-10">No referrals yet — share your link to start earning.</p>
        ) : (
          <table className="w-full text-sm mt-3">
            <thead>
              <tr className="border-b border-line/70">
                {["Name", "Contact", "Joined", "Total Invested"].map((h) => (
                  <th key={h} className="text-left text-[11px] uppercase tracking-wide text-slate-500 px-5 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.referred.map((u) => (
                <tr key={u._id} className="border-b border-line/40 last:border-0">
                  <td className="px-5 py-3.5 text-white">{u.name}</td>
                  <td className="px-5 py-3.5 text-slate-400">{u.email || u.phone || "—"}</td>
                  <td className="px-5 py-3.5 text-slate-400">{dateShort(u.createdAt)}</td>
                  <td className="px-5 py-3.5 font-mono text-slate-300">{money(u.totalInvested)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, accent }) {
  const border = { cyan: "neon-border-cyan", green: "neon-border-green", violet: "neon-border-violet" }[accent];
  const bg = { cyan: "bg-cyan-400/10 text-cyan-300", green: "bg-emerald-400/10 text-emerald-300", violet: "bg-violet-400/10 text-violet-300" }[accent];
  return (
    <div className={`neon-border ${border} rounded-2xl p-5 bg-white/[0.02] flex items-center gap-4`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg}`}><Icon size={19} /></div>
      <div>
        <p className="text-[11px] text-slate-500">{label}</p>
        <p className="font-mono text-lg font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

function Field({ label, value, onCopy, mono }) {
  return (
    <div>
      <p className="text-[11px] text-slate-500 mb-1">{label}</p>
      <div className="flex items-center gap-2 bg-surface-2 border border-line rounded-xl px-4 py-3">
        <span className={`flex-1 truncate text-sm text-white ${mono ? "font-mono" : ""}`}>{value}</span>
        <button onClick={onCopy} className="text-slate-400 hover:text-white shrink-0"><FiCopy size={16} /></button>
      </div>
    </div>
  );
}
