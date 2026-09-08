import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiZap, FiMail, FiLock, FiUser, FiGift, FiArrowRight, FiPhone } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import countryCodes from "../../utils/countryCodes";

const inputClass =
  "w-full bg-surface-2 border border-line rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [method, setMethod] = useState("email"); // "email" | "phone"
  const [form, setForm] = useState({ name: "", email: "", password: "", referralCode: "" });
  const [countryCode, setCountryCode] = useState("+92");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const ref = params.get("ref");
    if (ref) setForm((f) => ({ ...f, referralCode: ref.toUpperCase() }));
  }, [params]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (method === "phone" && phone.replace(/\D/g, "").length < 6) {
      setError("Enter a valid phone number");
      return;
    }

    setBusy(true);
    const payload =
      method === "email"
        ? { name: form.name, email: form.email, password: form.password, referralCode: form.referralCode }
        : { name: form.name, countryCode, phone, password: form.password, referralCode: form.referralCode };

    const res = await register(payload);
    setBusy(false);
    if (res.ok) navigate("/dashboard");
    else setError(res.message);
  };

  return (
    <div className="min-h-screen bg-ink grid place-items-center px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-move opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md neon-border neon-border-cyan glass rounded-2xl p-8"
      >
        <Link to="/" className="flex items-center gap-2 mb-8 w-fit">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
            <FiZap className="text-ink" size={18} />
          </div>
          <span className="font-display text-lg font-semibold text-white">CryptoGrow</span>
        </Link>

        <h1 className="font-display text-2xl font-semibold text-white mb-1">Create your account</h1>
        <p className="text-slate-400 text-sm mb-6">Join a platform that pays a real, verified share of daily trading results.</p>

        <div className="grid grid-cols-2 gap-2 mb-6 p-1 rounded-xl bg-surface-2 border border-line">
          <button
            type="button" onClick={() => setMethod("email")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${method === "email" ? "bg-cyan-400/15 text-cyan-300 border border-cyan-400/30" : "text-slate-400 hover:text-white"}`}
          >
            <FiMail size={14} /> Email
          </button>
          <button
            type="button" onClick={() => setMethod("phone")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${method === "phone" ? "bg-cyan-400/15 text-cyan-300 border border-cyan-400/30" : "text-slate-400 hover:text-white"}`}
          >
            <FiPhone size={14} /> Phone
          </button>
        </div>

        {error && (
          <div className="mb-4 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              required placeholder="Full name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
          </div>

          {method === "email" ? (
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="email" required placeholder="Email address" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
              />
            </div>
          ) : (
            <div className="flex gap-2">
              <select
                value={countryCode} onChange={(e) => setCountryCode(e.target.value)}
                className="bg-surface-2 border border-line rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-cyan-400 max-w-[128px]"
              >
                {countryCodes.map((c) => (
                  <option key={`${c.iso}-${c.code}`} value={c.code}>{c.iso} {c.code}</option>
                ))}
              </select>
              <div className="relative flex-1">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="tel" required placeholder="Phone number" value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="password" required minLength={6} placeholder="Password (min. 6 characters)" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="relative">
            <FiGift className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              placeholder="Referral code (optional)" value={form.referralCode}
              onChange={(e) => setForm({ ...form, referralCode: e.target.value.toUpperCase() })}
              className={`${inputClass} font-mono`}
            />
          </div>
          <button
            disabled={busy}
            className="btn-primary w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy ? "Creating account..." : <>Create Account <FiArrowRight /></>}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-cyan-300 font-medium hover:text-cyan-200">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}
