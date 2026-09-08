import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiZap, FiShield, FiTrendingUp, FiUsers, FiArrowRight, FiCheck } from "react-icons/fi";
import TickerTape from "../components/TickerTape";
import TradingViewWidget from "../components/TradingViewWidget";
import TrustPopup from "../components/TrustPopup";

const features = [
  { icon: FiZap, title: "Real Profit Share", text: "You get a transparent, published share of the platform's actual daily trading result — up or down, never a fabricated number." },
  { icon: FiShield, title: "Verified Deposits", text: "Every deposit is manually reviewed against your transaction screenshot before your package activates." },
  { icon: FiTrendingUp, title: "Live Markets", text: "Track BTC, ETH, Gold and top forex pairs with a real, live TradingView chart." },
  { icon: FiUsers, title: "Referral Rewards", text: "Invite others and earn a share of real profit on the days their investment earns — nothing fabricated, nothing guaranteed." }
];

const steps = [
  { n: "01", title: "Create your account", text: "Register with email or phone (OTP verified) and get your personal referral code." },
  { n: "02", title: "Choose a plan", text: "Pick a package size — your share rate of real daily P&L depends on it." },
  { n: "03", title: "Deposit crypto", text: "Send funds to the address we provide and upload your screenshot." },
  { n: "04", title: "Get verified & earn", text: "Once confirmed, your package starts earning from the next platform day — a real share of that day's trading result." }
];

export default function Landing() {
  const [trustOpen, setTrustOpen] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("trust_popup_seen");
    if (!seen) {
      const t = setTimeout(() => {
        setTrustOpen(true);
        sessionStorage.setItem("trust_popup_seen", "1");
      }, 1200);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <div className="bg-ink min-h-screen overflow-x-hidden">
      <TrustPopup open={trustOpen} onClose={() => setTrustOpen(false)} />

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-ink/65 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 lg:px-8 py-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center neon-glow-violet">
              <FiZap className="text-ink" size={18} />
            </div>
            <span className="font-display text-lg font-semibold text-white">CryptoGrow</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-slate-300 hover:text-white px-4 py-2">Log in</Link>
            <Link to="/register" className="btn-primary text-sm font-semibold text-white px-5 py-2.5 rounded-xl">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <TickerTape />

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-5 lg:px-8 pt-20 pb-24 grid lg:grid-cols-2 gap-12 items-center overflow-hidden">
        {/* Static decorative trading-chart background (self-contained SVG, no external image) */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.16] pointer-events-none [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]"
          viewBox="0 0 1200 500" preserveAspectRatio="none" aria-hidden="true"
        >
          <defs>
            <linearGradient id="heroChartLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22e8ff" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
            <linearGradient id="heroChartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22e8ff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#22e8ff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,380 L60,360 L120,390 L180,320 L240,340 L300,270 L360,300 L420,230 L480,260 L540,190 L600,220 L660,160 L720,190 L780,120 L840,150 L900,100 L960,130 L1020,80 L1080,110 L1140,60 L1200,90 L1200,500 L0,500 Z" fill="url(#heroChartFill)" />
          <path d="M0,380 L60,360 L120,390 L180,320 L240,340 L300,270 L360,300 L420,230 L480,260 L540,190 L600,220 L660,160 L720,190 L780,120 L840,150 L900,100 L960,130 L1020,80 L1080,110 L1140,60 L1200,90" fill="none" stroke="url(#heroChartLine)" strokeWidth="3" />
          {[70, 190, 310, 430, 550, 670, 790, 910, 1030, 1150].map((x, i) => (
            <rect key={x} x={x - 4} y={80 + (i % 4) * 40} width="8" height={30 + (i % 3) * 20} fill={i % 2 ? "#22e8ff" : "#a78bfa"} opacity="0.5" />
          ))}
        </svg>
        <div className="absolute inset-0 bg-grid-move opacity-40 pointer-events-none [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10"
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-300 bg-cyan-400/10 border border-cyan-400/30 px-3 py-1.5 rounded-full mb-5">
            Real trading results, shared transparently
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-white leading-[1.1] mb-5">
            Grow your crypto,<br /> <span className="neon-text-cyan">with a real share of the profit.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-lg mb-8">
            Every day's payout is calculated from that day's actual trading result — published in your
            dashboard, up or down. Deposit once, track live BTC, ETH, Gold and forex charts, and see
            exactly how your earnings are calculated.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/register" className="btn-primary flex items-center gap-2 text-white font-semibold px-6 py-3.5 rounded-xl">
              Start Earning Today <FiArrowRight />
            </Link>
            <Link to="/login" className="neon-border neon-border-violet flex items-center gap-2 text-white font-medium px-6 py-3.5 rounded-xl bg-white/[0.02]">
              I have an account
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative z-10 neon-border neon-border-cyan rounded-2xl p-1"
        >
          <div className="rounded-xl overflow-hidden bg-surface p-3">
            <TradingViewWidget symbol="BINANCE:BTCUSDT" height={360} />
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-semibold text-white mb-3">Built for real, transparent growth</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Everything you need to deposit, track and withdraw your earnings — with full visibility into how they're calculated.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="neon-border neon-border-violet rounded-2xl p-6 bg-white/[0.02]"
            >
              <div className="w-11 h-11 rounded-xl bg-violet-400/10 flex items-center justify-center mb-4">
                <f.icon className="text-violet-300" size={20} />
              </div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-semibold text-white mb-3">How it works</h2>
          <p className="text-slate-400">From sign-up to your first real profit-share payout.</p>
        </div>
        <div className="grid md:grid-cols-4 gap-5">
          {steps.map((s) => (
            <div key={s.n} className="relative neon-border neon-border-cyan rounded-2xl p-6 bg-white/[0.02]">
              <span className="font-mono text-cyan-300/60 text-sm">{s.n}</span>
              <h3 className="text-white font-semibold mt-2 mb-2">{s.title}</h3>
              <p className="text-sm text-slate-400">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Transparency section (replaces fabricated trust stats) */}
      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
        <div className="neon-border neon-border-gold rounded-3xl p-10 bg-gradient-to-br from-amber-400/[0.04] to-transparent text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white mb-4">
            No fixed promises — just a transparent daily result
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-6">
            We don't advertise a guaranteed daily percentage, because real trading doesn't work that way.
            Each day's actual result is logged and shared with every investor and referrer in their
            dashboard, and your earnings are calculated directly from it — profit or loss.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-300">
            {["Manual deposit verification", "Real, published daily results", "Live market data", "Full earnings history in your dashboard"].map((t) => (
              <span key={t} className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                <FiCheck className="text-emerald-400" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-line/70 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} CryptoGrow. All rights reserved. This platform involves financial risk — earnings are not guaranteed and depend entirely on real trading performance.
      </footer>
    </div>
  );
}
