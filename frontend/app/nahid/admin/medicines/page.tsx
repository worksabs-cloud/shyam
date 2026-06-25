"use client";

import { useEffect, useState } from "react";
import { NahidShell } from "@/components/nahid-shell";
import { nahidApi } from "@/lib/nahid-api";
import {
  Search,
  Plus,
  Pill,
  Filter,
  CheckCircle,
  XCircle,
  Edit,
  Loader2,
  AlertTriangle,
} from "lucide-react";

interface Medicine {
  id: number;
  product_name: string;
  generic_name?: string;
  sku: string;
  category?: string;
  retail_price?: number;
  wholesale_price?: number;
  purchase_price?: number;
  is_active: boolean;
  is_approved: boolean;
  manufacturer?: string;
  prescription_required: boolean;
}

const CATEGORIES = ["tablet", "capsule", "syrup", "injection", "cream", "drops", "inhaler", "powder", "other"];

export default function AdminMedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editMedicine, setEditMedicine] = useState<Medicine | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const [form, setForm] = useState({
    product_name: "",
    generic_name: "",
    brand_name: "",
    sku: "",
    manufacturer: "",
    category: "tablet",
    dosage: "",
    pack_size: "",
    purchase_price: "",
    wholesale_price: "",
    retail_price: "",
    gst_percentage: "5",
    prescription_required: false,
    description: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  async function loadMedicines() {
    setLoading(true);
    try {
      const data = await nahidApi.getAllMedicinesAdmin({ search: search || undefined });
      setMedicines(data);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(loadMedicines, 300);
    return () => clearTimeout(t);
  }, [search]);

  async function handleToggleApproval(med: Medicine) {
    setUpdating(med.id);
    try {
      await nahidApi.updateMedicine(med.id, { is_approved: !med.is_approved });
      setMedicines((prev) =>
        prev.map((m) => (m.id === med.id ? { ...m, is_approved: !m.is_approved } : m))
      );
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(null);
    }
  }

  async function handleToggleActive(med: Medicine) {
    setUpdating(med.id);
    try {
      await nahidApi.updateMedicine(med.id, { is_active: !med.is_active });
      setMedicines((prev) =>
        prev.map((m) => (m.id === med.id ? { ...m, is_active: !m.is_active } : m))
      );
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(null);
    }
  }

  async function handleAddMedicine(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      await nahidApi.createMedicine({
        ...form,
        purchase_price: parseFloat(form.purchase_price) || null,
        wholesale_price: parseFloat(form.wholesale_price) || null,
        retail_price: parseFloat(form.retail_price) || null,
        gst_percentage: parseFloat(form.gst_percentage) || 0,
      });
      setShowAddForm(false);
      setForm({
        product_name: "", generic_name: "", brand_name: "", sku: "",
        manufacturer: "", category: "tablet", dosage: "", pack_size: "",
        purchase_price: "", wholesale_price: "", retail_price: "",
        gst_percentage: "5", prescription_required: false, description: "",
      });
      loadMedicines();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  }

  const getCategoryBadge = (cat?: string) => {
    const colors: Record<string, string> = {
      tablet: "bg-blue-500/20 text-blue-300",
      capsule: "bg-indigo-500/20 text-indigo-300",
      syrup: "bg-cyan-500/20 text-cyan-300",
      injection: "bg-red-500/20 text-red-300",
      inhaler: "bg-purple-500/20 text-purple-300",
      cream: "bg-pink-500/20 text-pink-300",
      drops: "bg-teal-500/20 text-teal-300",
      powder: "bg-amber-500/20 text-amber-300",
    };
    return colors[cat?.replace("MedicineCategory.", "") || ""] || "bg-slate-500/20 text-slate-300";
  };

  return (
    <NahidShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Medicines</h1>
            <p className="text-sm text-slate-400">{medicines.length} total medicines</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Medicine
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search medicines by name, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800/50 pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Add Medicine Form */}
        {showAddForm && (
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
            <h3 className="mb-4 font-semibold text-white">Add New Medicine</h3>
            <form onSubmit={handleAddMedicine} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-slate-400">Product Name *</label>
                <input
                  required
                  value={form.product_name}
                  onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                  className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Generic Name</label>
                <input
                  value={form.generic_name}
                  onChange={(e) => setForm({ ...form, generic_name: e.target.value })}
                  className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">SKU *</label>
                <input
                  required
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Manufacturer</label>
                <input
                  value={form.manufacturer}
                  onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                  className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Dosage</label>
                <input
                  value={form.dosage}
                  onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                  placeholder="e.g., 500mg"
                  className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Purchase Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.purchase_price}
                  onChange={(e) => setForm({ ...form, purchase_price: e.target.value })}
                  className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Wholesale Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.wholesale_price}
                  onChange={(e) => setForm({ ...form, wholesale_price: e.target.value })}
                  className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Retail Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.retail_price}
                  onChange={(e) => setForm({ ...form, retail_price: e.target.value })}
                  className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-3">
                <input
                  type="checkbox"
                  id="rx"
                  checked={form.prescription_required}
                  onChange={(e) => setForm({ ...form, prescription_required: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="rx" className="text-sm text-slate-300">Prescription Required</label>
              </div>

              {formError && (
                <div className="sm:col-span-2 lg:col-span-3 rounded bg-red-500/20 border border-red-500/30 px-3 py-2 text-sm text-red-300">
                  {formError}
                </div>
              )}

              <div className="flex gap-3 sm:col-span-2 lg:col-span-3">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400 disabled:opacity-60"
                >
                  {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add Medicine
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Medicine</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">Purchase</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">Wholesale</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">Retail</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-500" />
                    </td>
                  </tr>
                ) : medicines.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <Pill className="mx-auto mb-2 h-8 w-8 text-slate-600" />
                      <p className="text-slate-500">No medicines found</p>
                    </td>
                  </tr>
                ) : (
                  medicines.map((med) => (
                    <tr key={med.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-white text-sm">{med.product_name}</p>
                          {med.generic_name && <p className="text-xs text-slate-400">{med.generic_name}</p>}
                          {med.prescription_required && (
                            <span className="mt-0.5 inline-block text-xs text-amber-400">Rx required</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-slate-400">{med.sku}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getCategoryBadge(med.category)}`}>
                          {med.category?.replace("MedicineCategory.", "") || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-300">
                        {med.purchase_price ? `$${med.purchase_price.toFixed(2)}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-300">
                        {med.wholesale_price ? `$${med.wholesale_price.toFixed(2)}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-emerald-400">
                        {med.retail_price ? `$${med.retail_price.toFixed(2)}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`rounded-full px-2 py-0.5 text-xs ${med.is_approved ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
                            {med.is_approved ? "Approved" : "Pending"}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-xs ${med.is_active ? "bg-blue-500/20 text-blue-300" : "bg-slate-500/20 text-slate-400"}`}>
                            {med.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleToggleApproval(med)}
                            disabled={updating === med.id}
                            title={med.is_approved ? "Unapprove" : "Approve"}
                            className={`rounded p-1.5 transition-colors ${med.is_approved ? "text-amber-400 hover:bg-amber-500/20" : "text-emerald-400 hover:bg-emerald-500/20"} disabled:opacity-40`}
                          >
                            {updating === med.id ? <Loader2 className="h-4 w-4 animate-spin" /> : med.is_approved ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleToggleActive(med)}
                            disabled={updating === med.id}
                            title={med.is_active ? "Deactivate" : "Activate"}
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-40"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
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
