import React from "react";
import { Outlet } from "react-router-dom";
import { FiGrid, FiUsers, FiPackage, FiCreditCard, FiDownload, FiMapPin, FiBarChart2 } from "react-icons/fi";
import DashboardShell from "../../components/DashboardShell";

const nav = [
  { to: "/admin", label: "Overview", icon: FiGrid, end: true },
  { to: "/admin/users", label: "Users", icon: FiUsers },
  { to: "/admin/packages", label: "Packages", icon: FiPackage },
  { to: "/admin/daily-pnl", label: "Daily P&L", icon: FiBarChart2 },
  { to: "/admin/payments", label: "Payments", icon: FiCreditCard },
  { to: "/admin/withdrawals", label: "Withdrawals", icon: FiDownload },
  { to: "/admin/deposit-addresses", label: "Deposit Addresses", icon: FiMapPin }
];

export default function AdminLayout() {
  return (
    <DashboardShell nav={nav} eyebrow="ADMIN PANEL">
      <Outlet />
    </DashboardShell>
  );
}
