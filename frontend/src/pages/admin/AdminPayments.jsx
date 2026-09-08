import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiCheck, FiX, FiImage } from "react-icons/fi";
import api from "../../api/client";
import { Loader, StatusPill } from "../../components/ui";
import { money, dateFmt } from "../../utils/format";
import Modal from "../../components/Modal";

export default function AdminPayments() {
  const [list, setList] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [reviewing, setReviewing] = useState(null); // { payment, action }
  const [remarks, setRemarks] = useState("");
  const [zoom, setZoom] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => api.get("/admin/payments").then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const openReview = (payment, action) => { setReviewing({ payment, action }); setRemarks(""); };

  const submitReview = async () => {
    setBusy(true);
    try {
      await api.patch(`/admin/payments/${reviewing.payment._id}`, {
        status: reviewing.action, adminRemarks: remarks
      });
      toast.success(reviewing.action === "confirmed" ? "Payment confirmed — package activated" : "Payment rejected");
      setReviewing(null); load();
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
    finally { setBusy(false); }
  };

  if (!list) return <Loader label="Loading payments" />;
  const filtered = filter === "all" ? list : list.filter((p) => p.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Deposit Verification</h1>
        <p className="text-slate-400 text-sm mt-1">Review each user's transaction screenshot before activating their package.</p>
      </div>

      <div className="flex gap-2">
        {["pending", "confirmed", "rejected", "all"].map((f) => (
          <button
            key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${filter === f ? "btn-primary text-white" : "border border-line text-slate-400 hover:text-white"}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {!filtered.length && <p className="text-slate-500 text-sm col-span-full text-center py-10">No payments in this view.</p>}
        {filtered.map((p) => (
          <div key={p._id} className="neon-border neon-border-violet rounded-2xl p-5 bg-white/[0.02]">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-white font-semibold text-sm">{p.user?.name}</p>
                <p className="text-xs text-slate-500">{p.user?.email}</p>
              </div>
              <StatusPill status={p.status} />
            </div>

            <button onClick={() => setZoom(p.screenshotUrl)} className="w-full h-40 rounded-xl overflow-hidden bg-surface-2 border border-line mb-3 grid place-items-center group relative">
              {p.screenshotUrl ? (
                <img src={p.screenshotUrl} alt="proof" className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
              ) : (
                <FiImage className="text-slate-600" size={26} />
              )}
            </button>

            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <Info label="Package" value={p.package?.name} />
              <Info label="Amount" value={money(p.amount)} />
              <Info label="Coin" value={p.coin} />
              <Info label="Submitted" value={dateFmt(p.createdAt)} />
            </div>
            {p.transactionHash && <p className="text-[11px] font-mono text-slate-500 mb-2 truncate">Tx: {p.transactionHash}</p>}
            {p.userNote && <p className="text-xs text-slate-400 mb-3 italic">"{p.userNote}"</p>}
            {p.adminRemarks && (
              <p className="text-xs text-slate-400 mb-3 bg-white/5 rounded-lg p-2">
                <span className="text-slate-500">Admin remarks:</span> {p.adminRemarks}
              </p>
            )}

            {p.status === "pending" && (
              <div className="flex gap-2">
                <button onClick={() => openReview(p, "confirmed")} className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2.5 rounded-lg bg-emerald-400/10 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-400/20">
                  <FiCheck /> Confirm
                </button>
                <button onClick={() => openReview(p, "rejected")} className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2.5 rounded-lg bg-rose-400/10 text-rose-300 border border-rose-400/30 hover:bg-rose-400/20">
                  <FiX /> Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal open={!!reviewing} onClose={() => setReviewing(null)}>
        {reviewing && (
          <div>
            <h2 className="font-display text-xl font-semibold text-white mb-1">
              {reviewing.action === "confirmed" ? "Confirm Payment" : "Reject Payment"}
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              {reviewing.action === "confirmed"
                ? `This activates the ${reviewing.payment.package?.name} package for ${reviewing.payment.user?.name}.`
                : `This will notify ${reviewing.payment.user?.name} that their deposit was rejected.`}
            </p>
            <textarea
              value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3}
              placeholder={reviewing.action === "confirmed" ? "Optional remarks..." : "Reason for rejection (shown to the user)"}
              className="w-full bg-surface-2 border border-line rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-400 mb-4 text-sm"
            />
            <button
              onClick={submitReview} disabled={busy}
              className={`w-full py-3 rounded-xl font-semibold text-white disabled:opacity-60 ${reviewing.action === "confirmed" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600"}`}
            >
              {busy ? "Submitting..." : reviewing.action === "confirmed" ? "Confirm & Activate" : "Reject Payment"}
            </button>
          </div>
        )}
      </Modal>

      <Modal open={!!zoom} onClose={() => setZoom(null)} className="max-w-2xl">
        {zoom && <img src={zoom} alt="Payment proof" className="w-full rounded-xl" />}
      </Modal>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-slate-500">{label}</p>
      <p className="text-slate-200 font-medium">{value}</p>
    </div>
  );
}
