import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiDollarSign, FiTrendingUp, FiCreditCard, FiArrowUpRight, FiPackage, FiArrowRight } from "react-icons/fi";
import api from "../../api/client";
import { StatCard, StatusPill, Loader } from "../../components/ui";
import { money, dateFmt, dateShort } from "../../utils/format";

export default function Overview() {
  const [data, setData] = useState(null);

  const load = () => api.get("/dashboard").then((r) => setData(r.data));
  useEffect(() => { load(); }, []);

  if (!data) return <Loader label="Loading dashboard" />;
  const { stats, activePackages, earnings } = data;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-semibold text-white">Welcome back, {data.user.name.split(" ")[0]} 👋</h1>
        <p className="text-slate-400 text-sm mt-1">Here's how your portfolio is performing.</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FiCreditCard} label="Total Investment" value={money(stats.totalInvestment)} accent="cyan" />
        <StatCard icon={FiTrendingUp} label="Total Earnings" value={money(stats.totalEarnings)} accent="green" />
        <StatCard icon={FiDollarSign} label="Available Balance" value={money(stats.availableBalance)} accent="violet" />
        <StatCard icon={FiArrowUpRight} label="Total Withdrawn" value={money(stats.totalWithdrawn)} accent="gold" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="neon-border neon-border-violet rounded-2xl p-6 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-white">Active Packages</h3>
            <Link to="/dashboard/packages" className="text-xs text-violet-300 flex items-center gap-1 hover:text-violet-200">
              Buy new <FiArrowRight size={12} />
            </Link>
          </div>
          {activePackages.length ? (
            <div className="space-y-3">
              {activePackages.map((p) => (
                <div key={p._id} className="flex items-center justify-between border-b border-line/60 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-violet-400/10 flex items-center justify-center">
                      <FiPackage className="text-violet-300" size={16} />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{p.package?.name || p.packageName}</p>
                      <p className="text-[11px] text-slate-500">
                        {dateShort(p.startDate)} → {dateShort(p.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm text-cyan-300">{p.investorShareRate}% <span className="text-slate-500 font-sans text-[10px]">of daily P&L</span></p>
                    <StatusPill status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="No active package yet." cta="Browse packages" to="/dashboard/packages" />
          )}
        </div>

        <div className="neon-border neon-border-green rounded-2xl p-6 bg-white/[0.02]">
          <h3 className="font-display font-semibold text-white mb-4">Recent Earnings</h3>
          {earnings.length ? (
            <div className="space-y-3">
              {earnings.map((e) => (
                <div key={e._id} className="flex items-center justify-between border-b border-line/60 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-white text-sm font-medium">{e.type}</p>
                    <p className="text-[11px] text-slate-500">{dateFmt(e.createdAt)}</p>
                  </div>
                  <p className={`font-mono text-sm ${e.amount < 0 ? "text-rose-300" : "text-emerald-300"}`}>{e.amount >= 0 ? "+" : ""}{money(e.amount)}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="No earnings credited yet." />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text, cta, to }) {
  return (
    <div className="text-center py-8">
      <p className="text-slate-500 text-sm mb-3">{text}</p>
      {cta && (
        <Link to={to} className="text-violet-300 text-sm font-medium hover:text-violet-200">
          {cta} →
        </Link>
      )}
    </div>
  );
}
