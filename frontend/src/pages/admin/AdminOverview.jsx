import React, { useEffect, useState } from "react";
import { FiUsers, FiPackage, FiTrendingUp, FiClock } from "react-icons/fi";
import api from "../../api/client";
import { StatCard, Loader } from "../../components/ui";
import { money } from "../../utils/format";

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get("/admin/stats").then((r) => setStats(r.data)); }, []);
  if (!stats) return <Loader label="Loading admin stats" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Admin Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Platform-wide performance at a glance.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FiUsers} label="Total Users" value={stats.users} accent="cyan" />
        <StatCard icon={FiPackage} label="Active Packages" value={stats.activePackages} accent="violet" />
        <StatCard icon={FiTrendingUp} label="Confirmed Investments" value={money(stats.totalInvestments)} accent="green" />
        <StatCard icon={FiClock} label="Pending Withdrawals" value={money(stats.pendingWithdrawals)} accent="gold" sub={`${stats.pendingPayments} payment(s) awaiting review`} />
      </div>
    </div>
  );
}
