import React, { useEffect, useState } from "react";
import { FiPackage } from "react-icons/fi";
import api from "../../api/client";
import { Loader, StatusPill } from "../../components/ui";
import { money, dateShort } from "../../utils/format";

export default function MyPackages() {
  const [list, setList] = useState(null);
  useEffect(() => { api.get("/my-packages").then((r) => setList(r.data)); }, []);
  if (!list) return <Loader label="Loading packages" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">My Packages</h1>
        <p className="text-slate-400 text-sm mt-1">Track the progress of every package you've activated.</p>
      </div>

      {!list.length && (
        <div className="neon-border neon-border-violet rounded-2xl p-10 text-center bg-white/[0.02]">
          <FiPackage className="mx-auto text-slate-500 mb-3" size={28} />
          <p className="text-slate-400">You haven't purchased any package yet.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        {list.map((p) => {
          const total = p.package?.durationDays || 30;
          const progressPct = Math.min(100, Math.round((p.daysCredited / total) * 100));
          return (
            <div key={p._id} className="neon-border neon-border-cyan rounded-2xl p-6 bg-white/[0.02]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">{p.package?.name || p.packageName}</h3>
                <StatusPill status={p.status} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <Info label="Invested" value={money(p.pricePaid)} />
                <Info label="Your P&L Share Rate" value={`${p.investorShareRate}%`} />
                <Info label="Start Date" value={dateShort(p.startDate)} />
                <Info label="End Date" value={dateShort(p.endDate)} />
                <Info label="Total Credited" value={money(p.totalCredited)} accent={p.totalCredited < 0 ? "text-rose-300" : "text-emerald-300"} />
                <Info label="Days Credited" value={`${p.daysCredited} / ${total}`} />
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-violet-500" style={{ width: `${progressPct}%` }} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">{progressPct}% of cycle complete</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Info({ label, value, accent }) {
  return (
    <div>
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className={`font-mono text-sm ${accent || "text-white"}`}>{value}</p>
    </div>
  );
}
