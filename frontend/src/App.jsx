import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { RequireAuth, RequireAdmin, RedirectIfAuthed } from "./components/Guards";

import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import UserLayout from "./pages/user/UserLayout";
import Overview from "./pages/user/Overview";
import BuyPackage from "./pages/user/BuyPackage";
import MyPackages from "./pages/user/MyPackages";
import Transactions from "./pages/user/Transactions";
import Withdraw from "./pages/user/Withdraw";
import Referrals from "./pages/user/Referrals";
import Markets from "./pages/user/Markets";
import Tutorial from "./pages/user/Tutorial";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPackages from "./pages/admin/AdminPackages";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminWithdrawals from "./pages/admin/AdminWithdrawals";
import AdminDepositAddresses from "./pages/admin/AdminDepositAddresses";
import AdminDailyPnl from "./pages/admin/AdminDailyPnl";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: "#10182b", color: "#eef2ff", border: "1px solid #1e2a47" }
          }}
        />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<RedirectIfAuthed><Login /></RedirectIfAuthed>} />
          <Route path="/register" element={<RedirectIfAuthed><Register /></RedirectIfAuthed>} />

          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<UserLayout />}>
              <Route index element={<Overview />} />
              <Route path="packages" element={<BuyPackage />} />
              <Route path="my-packages" element={<MyPackages />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="withdraw" element={<Withdraw />} />
              <Route path="referrals" element={<Referrals />} />
              <Route path="markets" element={<Markets />} />
              <Route path="tutorial" element={<Tutorial />} />
            </Route>
          </Route>

          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="packages" element={<AdminPackages />} />
              <Route path="daily-pnl" element={<AdminDailyPnl />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="withdrawals" element={<AdminWithdrawals />} />
              <Route path="deposit-addresses" element={<AdminDepositAddresses />} />
            </Route>
          </Route>

          <Route path="*" element={<Landing />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
