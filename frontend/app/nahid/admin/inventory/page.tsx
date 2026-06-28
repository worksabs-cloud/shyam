"use client";

import { useEffect, useState } from "react";
import { NahidShell } from "@/components/nahid-shell";
import { nahidApi } from "@/lib/nahid-api";
import { Warehouse, AlertTriangle, Clock, Loader2, Plus, RefreshCw } from "lucide-react";

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [expiring, setExpiring] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [batchForm, setBatchForm] = useState({
    medicine_id: "",
    batch_number: "",
    expiry_date: "",
    quantity_received: "",
    purchase_price: "",
    location: "",
  });
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [invData, lowData, expData] = await Promise.all([
        nahidApi.getInventory(),
        nahidApi.getLowStock(),
        nahidApi.getExpiring(60),
      ]);
      setInventory(invData);
      setLowStock(lowData);
      setExpiring(expData);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleAddBatch(e: React.FormEvent) {
    e.preventDefault();
    setBatchLoading(true);
    setBatchError("");
    try {
      await nahidApi.addBatch({
        medicine_id: parseInt(batchForm.medicine_id),
        batch_number: batchForm.batch_number,
        expiry_date: batchForm.expiry_date,
        quantity_received: parseInt(batchForm.quantity_received),
        purchase_price: parseFloat(batchForm.purchase_price) || null,
        location: batchForm.location || null,
      });
      setShowBatchForm(false);
      setBatchForm({ medicine_id: "", batch_number: "", expiry_date: "", quantity_received: "", purchase_price: "", location: "" });
      loadData();
    } catch (err: any) {
      setBatchError(err.message);
    } finally {
      setBatchLoading(false);
    }
  }

  return (
    <NahidShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Inventory Management</h1>
            <p className="text-sm text-slate-400">{inventory.length} medicines tracked</p>
          </div>
          <div className="flex gap-3">
            <button onClick={loadData} disabled={loading} className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={() => setShowBatchForm(!showBatchForm)} className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400">
              <Plus className="h-4 w-4" /> Add Batch
            </button>
          </div>
        </div>

        {/* Alert Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <h3 className="font-semibold text-amber-300">Low Stock Alert ({lowStock.length})</h3>
            </div>
            {lowStock.length === 0 ? (
              <p className="text-sm text-slate-400">All stock levels are healthy</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {lowStock.map((item) => (
                  <div key={item.medicine_id} className="flex items-center justify-between rounded-lg bg-amber-500/10 px-3 py-2">
                    <span className="text-sm text-amber-200">{item.name}</span>
                    <span className="text-xs font-mono text-amber-400">{item.current_stock}/{item.reorder_level}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="h-5 w-5 text-red-400" />
              <h3 className="font-semibold text-red-300">Expiring Soon ({expiring.length})</h3>
            </div>
            {expiring.length === 0 ? (
              <p className="text-sm text-slate-400">No medicines expiring within 60 days</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {expiring.map((batch) => (
                  <div key={batch.batch_id} className="flex items-center justify-between rounded-lg bg-red-500/10 px-3 py-2">
                    <span className="text-sm text-red-200">Batch {batch.batch_number}</span>
                    <span className="text-xs text-red-400">Exp: {batch.expiry_date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Batch Form */}
        {showBatchForm && (
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
            <h3 className="mb-4 font-semibold text-white">Add Inventory Batch</h3>
            <form onSubmit={handleAddBatch} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-slate-400">Medicine ID *</label>
                <input
                  required
                  type="number"
                  value={batchForm.medicine_id}
                  onChange={(e) => setBatchForm({ ...batchForm, medicine_id: e.target.value })}
                  className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g., 1"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Batch Number *</label>
                <input
                  required
                  value={batchForm.batch_number}
                  onChange={(e) => setBatchForm({ ...batchForm, batch_number: e.target.value })}
                  className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g., BATCH-001"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Expiry Date *</label>
                <input
                  required
                  type="date"
                  value={batchForm.expiry_date}
                  onChange={(e) => setBatchForm({ ...batchForm, expiry_date: e.target.value })}
                  className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Quantity Received *</label>
                <input
                  required
                  type="number"
                  value={batchForm.quantity_received}
                  onChange={(e) => setBatchForm({ ...batchForm, quantity_received: e.target.value })}
                  className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Purchase Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={batchForm.purchase_price}
                  onChange={(e) => setBatchForm({ ...batchForm, purchase_price: e.target.value })}
                  className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Storage Location</label>
                <input
                  value={batchForm.location}
                  onChange={(e) => setBatchForm({ ...batchForm, location: e.target.value })}
                  className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g., Rack A-12"
                />
              </div>
              {batchError && (
                <div className="sm:col-span-2 lg:col-span-3 rounded bg-red-500/20 border border-red-500/30 px-3 py-2 text-sm text-red-300">
                  {batchError}
                </div>
              )}
              <div className="flex gap-3 sm:col-span-2 lg:col-span-3">
                <button type="submit" disabled={batchLoading} className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400 disabled:opacity-60">
                  {batchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add Batch
                </button>
                <button type="button" onClick={() => setShowBatchForm(false)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Inventory Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800">
            <h3 className="font-semibold text-white">Current Inventory</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/30">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Medicine ID</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">Total Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">Reorder Level</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr><td colSpan={4} className="py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-500" /></td></tr>
                ) : inventory.length === 0 ? (
                  <tr><td colSpan={4} className="py-12 text-center text-slate-500">No inventory data</td></tr>
                ) : (
                  inventory.map((inv) => (
                    <tr key={inv.medicine_id} className="hover:bg-slate-800/50">
                      <td className="px-4 py-3 text-sm text-white">Medicine #{inv.medicine_id}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-mono font-medium ${inv.total_quantity <= inv.reorder_level ? "text-amber-400" : "text-white"}`}>
                          {inv.total_quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-400">{inv.reorder_level}</td>
                      <td className="px-4 py-3 text-center">
                        {inv.total_quantity === 0 ? (
                          <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">Out of Stock</span>
                        ) : inv.total_quantity <= inv.reorder_level ? (
                          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">Low Stock</span>
                        ) : (
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">In Stock</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </NahidShell>
  );
}
