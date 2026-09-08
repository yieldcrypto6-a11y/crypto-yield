import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiCheck, FiCopy, FiUpload, FiArrowRight, FiArrowLeft, FiClock } from "react-icons/fi";
import api from "../../api/client";
import Modal from "../../components/Modal";
import { Loader } from "../../components/ui";
import { money } from "../../utils/format";

const COINS = ["USDT", "BTC", "ETH"];

const BADGE_STYLE = {
  "Most Popular": "from-violet-400 to-violet-500 text-white",
  "Best Value": "from-amber-400 to-amber-500 text-ink",
  VIP: "from-cyan-400 to-cyan-500 text-ink"
};

export default function BuyPackage() {
  const [packages, setPackages] = useState(null);
  const [active, setActive] = useState(null); // package selected for purchase
  const [step, setStep] = useState(1);
  const [coin, setCoin] = useState("USDT");
  const [deposit, setDeposit] = useState(null);
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [txHash, setTxHash] = useState("");
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => { api.get("/packages").then((r) => setPackages(r.data)); }, []);

  const openBuy = (pkg) => {
    setActive(pkg); setStep(1); setCoin("USDT"); setDeposit(null);
    setFile(null); setPreview(null); setTxHash(""); setNote(""); setDone(false);
  };

  const fetchAddress = async (c) => {
    setCoin(c);
    setBusy(true);
    try {
      const { data } = await api.get(`/buy/${active._id}/address`, { params: { coin: c } });
      setDeposit(data.deposit);
      setStep(2);
    } catch (e) {
      toast.error(e.response?.data?.message || "No deposit address available for that coin");
    } finally { setBusy(false); }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(deposit.address);
    toast.success("Address copied");
  };

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!file) return toast.error("Please attach your payment screenshot");
    setBusy(true);
    try {
      const form = new FormData();
      form.append("packageId", active._id);
      form.append("coin", coin);
      form.append("transactionHash", txHash);
      form.append("userNote", note);
      form.append("screenshot", file);
      await api.post("/buy", form, { headers: { "Content-Type": "multipart/form-data" } });
      setDone(true);
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not submit payment proof");
    } finally { setBusy(false); }
  };

  if (!packages) return <Loader label="Loading packages" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Choose a Package</h1>
        <p className="text-slate-400 text-sm mt-1">
          Every plan runs for {packages[0]?.durationDays || 30} days. Your daily earnings are a real share
          of the platform's actual trading result each day — not a fixed rate.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
        {packages.map((p, i) => (
          <motion.div
            key={p._id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="relative neon-border neon-border-cyan rounded-2xl bg-white/[0.02] flex flex-col"
          >
            {/* Fixed-height badge slot on every card so badges line up regardless
                of whether a given package has one — this is what fixes the
                previous misalignment between Most Popular / Best Value / VIP. */}
            <div className="h-8 flex items-start justify-center -mb-1">
              {p.badge && (
                <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full bg-gradient-to-r shadow-lg -translate-y-1/2 ${BADGE_STYLE[p.badge] || "from-cyan-400 to-cyan-500 text-ink"}`}>
                  {p.badge}
                </span>
              )}
            </div>

            <div className="p-6 pt-2 flex flex-col flex-1">
              <p className="text-slate-400 text-sm">{p.name}</p>
              <p className="font-display text-3xl font-semibold text-white mt-1">{money(p.price)}</p>
              <p className="text-xs text-slate-500 mt-1">{p.durationDays}-day cycle</p>

              <div className="my-4 py-3 border-y border-line/60">
                <p className="font-mono text-emerald-300 font-semibold">{p.investorShareRate}% <span className="text-slate-500 font-sans text-xs">of daily P&L</span></p>
                <p className="text-xs text-slate-500 mt-1">Your share of each real trading day's result</p>
              </div>

              <ul className="space-y-2 mb-5 flex-1">
                {(p.features?.length ? p.features : ["Real daily profit share", `${p.durationDays}-day cycle`]).map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-400">
                    <FiCheck className="text-emerald-400 shrink-0" size={13} /> {f}
                  </li>
                ))}
              </ul>

              <button onClick={() => openBuy(p)} className="btn-primary w-full py-3 rounded-xl font-semibold text-white text-sm">
                Buy This Plan
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal open={!!active} onClose={() => setActive(null)}>
        {active && !done && (
          <>
            <div className="flex items-center gap-2 mb-5 text-xs text-slate-500">
              <StepDot active={step >= 1} /> Coin
              <div className="flex-1 h-px bg-line" />
              <StepDot active={step >= 2} /> Deposit
              <div className="flex-1 h-px bg-line" />
              <StepDot active={step >= 3} /> Proof
            </div>

            {step === 1 && (
              <div>
                <h2 className="font-display text-xl font-semibold text-white mb-1">Select payment method</h2>
                <p className="text-slate-400 text-sm mb-5">
                  You're purchasing <b className="text-white">{active.name}</b> for <b className="text-white">{money(active.price)}</b>.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {COINS.map((c) => (
                    <button
                      key={c} onClick={() => fetchAddress(c)} disabled={busy}
                      className="neon-border neon-border-violet rounded-xl py-5 text-white font-semibold hover:bg-white/5 transition-colors disabled:opacity-50"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && deposit && (
              <div>
                <h2 className="font-display text-xl font-semibold text-white mb-1">Send {coin} to this address</h2>
                <p className="text-slate-400 text-sm mb-4">Network: <span className="text-white">{deposit.network}</span></p>

                <div className="neon-border neon-border-cyan rounded-xl p-4 bg-white/[0.02] mb-4">
                  <p className="text-[11px] text-slate-500 mb-1">Deposit Address</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm text-cyan-200 break-all flex-1 font-mono">{deposit.address}</code>
                    <button onClick={copyAddress} className="shrink-0 text-slate-400 hover:text-white p-2"><FiCopy /></button>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-5">
                  <span className="text-sm text-slate-400">Amount to send</span>
                  <span className="font-mono text-white font-semibold">{money(active.price)}</span>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-line text-slate-300 hover:bg-white/5">
                    <FiArrowLeft /> Back
                  </button>
                  <button onClick={() => setStep(3)} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white">
                    I've paid <FiArrowRight />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="font-display text-xl font-semibold text-white mb-1">Attach proof of payment</h2>
                <p className="text-slate-400 text-sm mb-4">Upload a screenshot of your transaction. Our team will verify it shortly.</p>

                <label className="block neon-border neon-border-green rounded-xl p-5 mb-4 cursor-pointer text-center bg-white/[0.02] hover:bg-white/5 transition-colors">
                  <input type="file" accept="image/*" className="hidden" onChange={onFile} />
                  {preview ? (
                    <img src={preview} alt="Screenshot preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                  ) : (
                    <div className="text-slate-400 flex flex-col items-center gap-2 py-4">
                      <FiUpload size={22} /> <span className="text-sm">Click to upload screenshot (JPG/PNG, max 5MB)</span>
                    </div>
                  )}
                </label>

                <input
                  value={txHash} onChange={(e) => setTxHash(e.target.value)} placeholder="Transaction hash (optional)"
                  className="w-full bg-surface-2 border border-line rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 mb-3 font-mono text-sm"
                />
                <textarea
                  value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note to admin (optional)" rows={2}
                  className="w-full bg-surface-2 border border-line rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 mb-5 text-sm"
                />

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-line text-slate-300 hover:bg-white/5">
                    <FiArrowLeft /> Back
                  </button>
                  <button onClick={submit} disabled={busy} className="btn-primary flex-1 py-3 rounded-xl font-semibold text-white disabled:opacity-60">
                    {busy ? "Submitting..." : "Submit for Review"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {done && (
          <div className="text-center py-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/40 flex items-center justify-center mb-4">
              <FiClock className="text-amber-300" size={28} />
            </div>
            <h2 className="font-display text-xl font-semibold text-white mb-2">Awaiting Verification</h2>
            <p className="text-slate-400 text-sm mb-6">
              Your payment proof has been submitted. Our team will verify the transaction and activate
              your <b className="text-white">{active.name}</b> package shortly. Once confirmed, it starts
              earning a share of the platform's real daily result from the next day onward — you'll see
              the status update under Transactions.
            </p>
            <button onClick={() => setActive(null)} className="btn-primary w-full py-3 rounded-xl font-semibold text-white">
              Done
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function StepDot({ active }) {
  return <span className={`w-2 h-2 rounded-full ${active ? "bg-violet-400" : "bg-line"}`} />;
}
