import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiShield, FiUnlock } from "react-icons/fi";
import api from "../../api/client";
import { Loader, StatusPill } from "../../components/ui";
import { money, dateShort, BAN_STAGE_LABELS } from "../../utils/format";
import Modal from "../../components/Modal";

const NEXT_STAGE = { none: "24h", "24h": "7d", "7d": "30d", "30d": "permanent" };
const STAGE_KEY = ["none", "24h", "7d", "30d", "permanent"];

export default function AdminUsers() {
  const [users, setUsers] = useState(null);
  const [target, setTarget] = useState(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => api.get("/admin/users").then((r) => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const ban = async () => {
    setBusy(true);
    try {
      await api.post(`/admin/users/${target._id}/ban`, { reason });
      toast.success("User banned");
      setTarget(null); setReason("");
      load();
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
    finally { setBusy(false); }
  };

  const unban = async (u) => {
    try {
      await api.post(`/admin/users/${u._id}/unban`);
      toast.success("User unbanned");
      load();
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
  };

  if (!users) return <Loader label="Loading users" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Users</h1>
        <p className="text-slate-400 text-sm mt-1">Manage accounts and apply progressive bans: 24h → 7d → 30d → permanent.</p>
      </div>

      <div className="neon-border neon-border-violet rounded-2xl overflow-hidden bg-white/[0.02]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line/70">
                {["Name", "Email", "Role", "Status", "Ban Stage", "Invested", "Balance", "Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left text-[11px] uppercase tracking-wide text-slate-500 px-5 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-line/40 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5 text-white whitespace-nowrap">{u.name}</td>
                  <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">{u.email}</td>
                  <td className="px-5 py-3.5 text-slate-400 capitalize">{u.role}</td>
                  <td className="px-5 py-3.5"><StatusPill status={u.status} /></td>
                  <td className="px-5 py-3.5 text-slate-400">{BAN_STAGE_LABELS[STAGE_KEY[u.banStage]] || "None"}</td>
                  <td className="px-5 py-3.5 font-mono text-slate-300">{money(u.totalInvested)}</td>
                  <td className="px-5 py-3.5 font-mono text-slate-300">{money(u.availableBalance)}</td>
                  <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">{dateShort(u.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    {u.role !== "admin" && (
                      <div className="flex gap-2">
                        {u.status === "blocked" ? (
                          <button onClick={() => unban(u)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-400/10 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-400/20">
                            <FiUnlock size={12} /> Unban
                          </button>
                        ) : (
                          <button onClick={() => setTarget(u)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-rose-400/10 text-rose-300 border border-rose-400/30 hover:bg-rose-400/20">
                            <FiShield size={12} /> Ban ({NEXT_STAGE[STAGE_KEY[u.banStage]] || "permanent"})
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!target} onClose={() => setTarget(null)}>
        {target && (
          <div>
            <h2 className="font-display text-xl font-semibold text-white mb-1">Ban {target.name}</h2>
            <p className="text-slate-400 text-sm mb-4">
              This will escalate the account to the <b className="text-rose-300">{NEXT_STAGE[STAGE_KEY[target.banStage]] || "permanent"}</b> stage.
            </p>
            <textarea
              value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Reason / remarks shown to the user"
              className="w-full bg-surface-2 border border-line rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-400 mb-4 text-sm"
            />
            <button onClick={ban} disabled={busy} className="w-full py-3 rounded-xl font-semibold text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-60">
              {busy ? "Applying..." : "Confirm Ban"}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
