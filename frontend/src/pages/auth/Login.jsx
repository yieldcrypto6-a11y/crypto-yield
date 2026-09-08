import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiZap, FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import BanPopup from "../../components/BanPopup";

export default function Login() {
  const { login, banInfo, setBanInfo } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await login(form.email, form.password);
    setBusy(false);
    if (res.ok) navigate(params.get("as") === "admin" ? "/admin" : "/dashboard");
    else setError(res.message);
  };

  return (
    <div className="min-h-screen bg-ink grid place-items-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-move opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <BanPopup ban={banInfo} onClose={() => setBanInfo(null)} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md neon-border neon-border-violet glass rounded-2xl p-8"
      >
        <Link to="/" className="flex items-center gap-2 mb-8 w-fit">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
            <FiZap className="text-ink" size={18} />
          </div>
          <span className="font-display text-lg font-semibold text-white">CryptoGrow</span>
        </Link>

        <h1 className="font-display text-2xl font-semibold text-white mb-1">Welcome back</h1>
        <p className="text-slate-400 text-sm mb-6">Log in to track your daily earnings.</p>

        {error && (
          <div className="mb-4 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="email" required placeholder="Email address" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-surface-2 border border-line rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-400 transition-colors"
            />
          </div>
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="password" required placeholder="Password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-surface-2 border border-line rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-400 transition-colors"
            />
          </div>
          <button disabled={busy} className="btn-primary w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60">
            {busy ? "Signing in..." : <>Log In <FiArrowRight /></>}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-violet-300 font-medium hover:text-violet-200">Register</Link>
        </p>
      </motion.div>
    </div>
  );
}
