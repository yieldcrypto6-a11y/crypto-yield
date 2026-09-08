import React, { useEffect, useState } from "react";
import { FiEye } from "react-icons/fi";
import api from "../../api/client";
import { Loader, StatusPill } from "../../components/ui";
import { money, dateFmt } from "../../utils/format";
import Modal from "../../components/Modal";

const TABS = ["Payments", "Earnings", "Withdrawals"];

export default function Transactions() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("Payments");
  const [preview, setPreview] = useState(null);

  useEffect(() => { api.get("/transactions").then((r) => setData(r.data)); }, []);
  if (!data) return <Loader label="Loading transactions" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Transaction History</h1>
        <p className="text-slate-400 text-sm mt-1">Every deposit, daily income credit and payout in one place.</p>
      </div>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t ? "btn-primary text-white" : "border border-line text-slate-400 hover:text-white"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="neon-border neon-border-violet rounded-2xl overflow-hidden bg-white/[0.02]">
        {tab === "Payments" && (
          <TableWrap
            head={["Package", "Amount", "Coin", "Status", "Remarks", "Date", ""]}
            rows={data.payments.map((p) => [
              p.package?.name || "—",
              money(p.amount),
              p.coin,
              <StatusPill status={p.status} />,
              p.adminRemarks || "—",
              dateFmt(p.createdAt),
              p.screenshotUrl && (
                <button onClick={() => setPreview(p.screenshotUrl)} className="text-cyan-300 hover:text-cyan-200">
                  <FiEye />
                </button>
              )
            ])}
            empty="No deposits yet."
          />
        )}
        {tab === "Earnings" && (
          <TableWrap
            head={["Type", "Amount", "Note", "Date"]}
            rows={data.earnings.map((e) => [e.type, <span className="text-emerald-300">+{money(e.amount)}</span>, e.note || "—", dateFmt(e.createdAt)])}
            empty="No earnings credited yet."
          />
        )}
        {tab === "Withdrawals" && (
          <TableWrap
            head={["Amount", "Coin", "Wallet Address", "Status", "Remarks", "Date"]}
            rows={data.withdrawals.map((w) => [
              money(w.amount), w.coin,
              <span className="font-mono text-xs">{w.walletAddress?.slice(0, 14)}...</span>,
              <StatusPill status={w.status} />, w.adminRemarks || "—", dateFmt(w.createdAt)
            ])}
            empty="No withdrawal requests yet."
          />
        )}
      </div>

      <Modal open={!!preview} onClose={() => setPreview(null)} className="max-w-2xl">
        {preview && <img src={preview} alt="Payment proof" className="w-full rounded-xl" />}
      </Modal>
    </div>
  );
}

function TableWrap({ head, rows, empty }) {
  if (!rows.length) return <p className="text-slate-500 text-sm text-center py-10">{empty}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line/70">
            {head.map((h) => <th key={h} className="text-left text-[11px] uppercase tracking-wide text-slate-500 px-5 py-3 font-medium">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line/40 last:border-0 hover:bg-white/[0.02]">
              {r.map((c, j) => <td key={j} className="px-5 py-3.5 text-slate-300">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
