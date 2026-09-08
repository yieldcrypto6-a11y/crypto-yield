import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiMapPin } from "react-icons/fi";
import api from "../../api/client";
import { Loader, StatusPill } from "../../components/ui";
import Modal from "../../components/Modal";

const empty = { coin: "USDT", network: "", address: "" };

export default function AdminDepositAddresses() {
  const [list, setList] = useState(null);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => api.get("/admin/deposit-addresses").then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (form._id) await api.patch(`/admin/deposit-addresses/${form._id}`, form);
      else await api.post("/admin/deposit-addresses", form);
      toast.success(form._id ? "Address updated" : "Address added");
      setForm(null); load();
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
    finally { setBusy(false); }
  };

  const toggleActive = async (a) => {
    await api.patch(`/admin/deposit-addresses/${a._id}`, { isActive: !a.isActive });
    load();
  };

  const remove = async (a) => {
    if (!confirm(`Delete ${a.coin} (${a.network}) address?`)) return;
    await api.delete(`/admin/deposit-addresses/${a._id}`);
    toast.success("Deleted");
    load();
  };

  if (!list) return <Loader label="Loading addresses" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">Deposit Addresses</h1>
          <p className="text-slate-400 text-sm mt-1">The address users are shown when they choose a coin to pay with.</p>
        </div>
        <button onClick={() => setForm({ ...empty })} className="btn-primary flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-xl text-sm">
          <FiPlus /> Add Address
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {!list.length && (
          <div className="col-span-full neon-border neon-border-violet rounded-2xl p-10 text-center bg-white/[0.02]">
            <FiMapPin className="mx-auto text-slate-500 mb-3" size={26} />
            <p className="text-slate-400">No deposit addresses configured yet. Users won't be able to complete a purchase until you add one.</p>
          </div>
        )}
        {list.map((a) => (
          <div key={a._id} className="neon-border neon-border-cyan rounded-2xl p-5 bg-white/[0.02]">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-semibold">{a.coin}</h3>
                <p className="text-xs text-slate-500">{a.network}</p>
              </div>
              <StatusPill status={a.isActive ? "active" : "expired"} />
            </div>
            <p className="font-mono text-xs text-cyan-200 break-all bg-white/5 rounded-lg p-3 mb-4">{a.address}</p>
            <div className="flex gap-2">
              <button onClick={() => setForm(a)} className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg border border-line text-slate-300 hover:bg-white/5">
                <FiEdit2 size={12} /> Edit
              </button>
              <button onClick={() => toggleActive(a)} className="flex-1 text-xs py-2 rounded-lg border border-line text-slate-300 hover:bg-white/5">
                {a.isActive ? "Deactivate" : "Activate"}
              </button>
              <button onClick={() => remove(a)} className="text-xs py-2 px-3 rounded-lg border border-rose-400/30 text-rose-300 hover:bg-rose-400/10">
                <FiTrash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!form} onClose={() => setForm(null)}>
        {form && (
          <form onSubmit={save} className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-white mb-2">{form._id ? "Edit Address" : "New Deposit Address"}</h2>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Coin</label>
              <select
                value={form.coin} onChange={(e) => setForm({ ...form, coin: e.target.value })}
                className="w-full bg-surface-2 border border-line rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 text-sm"
              >
                <option>USDT</option><option>BTC</option><option>ETH</option>
              </select>
            </div>
            <Input label="Network (e.g. TRC20, Bitcoin, ERC20)" value={form.network} onChange={(v) => setForm({ ...form, network: v })} required />
            <Input label="Wallet Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} required mono />
            <button disabled={busy} className="btn-primary w-full py-3 rounded-xl font-semibold text-white disabled:opacity-60">
              {busy ? "Saving..." : form._id ? "Save Changes" : "Add Address"}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}

function Input({ label, value, onChange, mono, ...rest }) {
  return (
    <div>
      <label className="text-xs text-slate-400 mb-1.5 block">{label}</label>
      <input
        value={value} onChange={(e) => onChange(e.target.value)} {...rest}
        className={`w-full bg-surface-2 border border-line rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 text-sm ${mono ? "font-mono" : ""}`}
      />
    </div>
  );
}
