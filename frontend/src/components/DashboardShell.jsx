import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX, FiLogOut, FiZap } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { money } from "../utils/format";

export default function DashboardShell({ nav, eyebrow, children, balance }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const doLogout = () => {
    logout();
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-5 py-6">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center neon-glow-violet">
          <FiZap className="text-ink" size={18} />
        </div>
        <span className="font-display text-lg font-semibold text-white">CryptoGrow</span>
      </div>

      <div className="mx-4 mb-4 neon-border neon-border-violet rounded-xl p-3 bg-white/[0.02]">
        <p className="text-white font-medium text-sm truncate">{user?.name}</p>
        <p className="text-[11px] text-slate-400 capitalize">{user?.role} account</p>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-violet-500/20 to-cyan-400/10 text-white border border-violet-400/30 neon-glow-violet"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <item.icon size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={doLogout}
        className="mx-3 mb-5 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-300 hover:bg-rose-500/10 transition-colors"
      >
        <FiLogOut size={17} /> Logout
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-ink">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-line/70 bg-surface/60 backdrop-blur-xl sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/70 z-40 lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 w-72 z-50 bg-surface border-r border-line lg:hidden"
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between px-5 lg:px-8 py-4 border-b border-line/70 bg-ink/55 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-slate-300" onClick={() => setOpen(true)}>
              <FiMenu size={22} />
            </button>
            <div>
              <p className="text-[11px] font-semibold text-violet-300 tracking-wide">{eyebrow}</p>
            </div>
          </div>
          {balance !== undefined && (
            <div className="neon-border neon-border-green rounded-xl px-4 py-2 bg-white/[0.02] text-right">
              <p className="text-[10px] text-slate-400">Available Balance</p>
              <p className="font-mono font-semibold text-emerald-300">{money(balance)}</p>
            </div>
          )}
        </header>
        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
