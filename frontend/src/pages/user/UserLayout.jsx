import React from "react";
import { Outlet } from "react-router-dom";
import { FiGrid, FiPackage, FiList, FiRepeat, FiDownload, FiUsers, FiBarChart2, FiPlayCircle } from "react-icons/fi";
import DashboardShell from "../../components/DashboardShell";
import { useAuth } from "../../context/AuthContext";

const nav = [
  { to: "/dashboard", label: "Overview", icon: FiGrid, end: true },
  { to: "/dashboard/packages", label: "Buy Package", icon: FiPackage },
  { to: "/dashboard/my-packages", label: "My Packages", icon: FiList },
  { to: "/dashboard/transactions", label: "Transactions", icon: FiRepeat },
  { to: "/dashboard/withdraw", label: "Withdraw", icon: FiDownload },
  { to: "/dashboard/referrals", label: "Referrals", icon: FiUsers },
  { to: "/dashboard/markets", label: "Markets", icon: FiBarChart2 },
  { to: "/dashboard/tutorial", label: "Tutorial", icon: FiPlayCircle }
];

export default function UserLayout() {
  const { user } = useAuth();
  return (
    <DashboardShell nav={nav} eyebrow="USER PORTAL" balance={user?.availableBalance}>
      <Outlet />
    </DashboardShell>
  );
}
