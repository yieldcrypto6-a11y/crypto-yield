import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import api from "../../api/client";
import { Loader, StatusPill } from "../../components/ui";
import { money } from "../../utils/format";
import Modal from "../../components/Modal";

const empty = { name: "", price: "", investorShareOverride: "", durationDays: 30, description: "", badge: "", features: "" };

export default function AdminPackages() {
  const [list, setList] = useState(null);
  const [form, setForm] = useState(null); // null = closed, {} = create, {...pkg} = edit
  const [busy, setBusy] = useState(false);

  const load = () => api.get("/admin/packages").then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const openCreate = () => setForm({ ...empty });
  const openEdit = (p) => setForm({ ...p, features: (p.features || []).join(", ") });

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    const payload = {
      name: form.name, price: Number(form.price),
      investorShareOverride: form.investorShareOverride === "" ? null : Number(form.investorShareOverride),
      durationDays: Number(form.durationDays), description: form.description, badge: form.badge,
      features: form.features.split(",").map((f) => f.trim()).filter(Boolean)
    };
    try {
      if (form._id) await api.patch(`/admin/packages/${form._id}`, payload);
      else await api.post("/admin/packages", payload);
      toast.success(form._id ? "Package updated" : "Package created");
      setForm(null); load();
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
    finally { setBusy(false); }
  };

  const toggleStatus = async (p) => {
    await api.patch(`/admin/packages/${p._id}`, { status: p.status === "active" ? "inactive" : "active" });
    load();
  };

  const remove = async (p) => {
    if (!confirm(`Delete package "${p.name}"?`)) return;
    await api.delete(`/admin/packages/${p._id}`);
    toast.success("Package deleted");
    load();
  };

  if (!list) return <Loader label="Loading packages" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">Packages</h1>
          <p className="text-slate-400 text-sm mt-1">Create and manage investment plans users can purchase.</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-xl text-sm">
          <FiPlus /> New Package
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {list.map((p) => (
          <div key={p._id} className="neon-border neon-border-cyan rounded-2xl p-6 bg-white/[0.02]">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-white font-semibold">{p.name}</h3>
              <StatusPill status={p.status} />
            </div>
            <p className="font-display text-2xl font-semibold text-white">{money(p.price)}</p>
            <p className="text-xs text-slate-500 mb-3">{p.durationDays} days · {p.investorShareOverride != null ? `${p.investorShareOverride}% override` : "platform default rate"} of daily P&L</p>
            <p className="text-sm text-slate-400 mb-4">{p.description}</p>
            <div className="flex gap-2">
              <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg border border-line text-slate-300 hover:bg-white/5">
                <FiEdit2 size={12} /> Edit
              </button>
              <button onClick={() => toggleStatus(p)} className="flex-1 text-xs py-2 rounded-lg border border-line text-slate-300 hover:bg-white/5">
                {p.status === "active" ? "Deactivate" : "Activate"}
              </button>
              <button onClick={() => remove(p)} className="text-xs py-2 px-3 rounded-lg border border-rose-400/30 text-rose-300 hover:bg-rose-400/10">
                <FiTrash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!form} onClose={() => setForm(null)}>
        {form && (
          <form onSubmit={save} className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-white mb-2">{form._id ? "Edit Package" : "New Package"}</h2>
            <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Price (USD)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} required />
              <Input label="Investor Share Override % (blank = platform default)" type="number" step="0.01" value={form.investorShareOverride} onChange={(v) => setForm({ ...form, investorShareOverride: v })} placeholder="e.g. 55" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Duration (days)" type="number" value={form.durationDays} onChange={(v) => setForm({ ...form, durationDays: v })} required />
              <Input label="Badge (optional)" value={form.badge} onChange={(v) => setForm({ ...form, badge: v })} placeholder="Most Popular" />
            </div>
            <Input label="Features (comma separated)" value={form.features} onChange={(v) => setForm({ ...form, features: v })} placeholder="Real daily profit share, Priority support" />
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Description</label>
              <textarea
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                className="w-full bg-surface-2 border border-line rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 text-sm"
              />
            </div>
            <button disabled={busy} className="btn-primary w-full py-3 rounded-xl font-semibold text-white disabled:opacity-60">
              {busy ? "Saving..." : form._id ? "Save Changes" : "Create Package"}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}

function Input({ label, value, onChange, ...rest }) {
  return (
    <div>
      <label className="text-xs text-slate-400 mb-1.5 block">{label}</label>
      <input
        value={value} onChange={(e) => onChange(e.target.value)} {...rest}
        className="w-full bg-surface-2 border border-line rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 text-sm"
      />
    </div>
  );
}
