"use client";

import { useEffect, useState } from "react";
import { NahidShell } from "@/components/nahid-shell";
import { nahidApi } from "@/lib/nahid-api";
import { Building2, Loader2, CheckCircle, RefreshCw } from "lucide-react";

export default function AdminPharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<number | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const data = await nahidApi.getPharmacies();
      setPharmacies(data);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleApprove(id: number) {
    setApproving(id);
    try {
      await nahidApi.approvePharmacy(id);
      setPharmacies((prev) => prev.map((p) => (p.id === id ? { ...p, is_approved: true } : p)));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setApproving(null);
    }
  }

  return (
    <NahidShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Pharmacies</h1>
            <p className="text-sm text-slate-400">{pharmacies.length} registered pharmacies</p>
          </div>
          <button onClick={loadData} disabled={loading} className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Business Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Location</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">Credit Limit</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">Outstanding</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr><td colSpan={6} className="py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-500" /></td></tr>
                ) : pharmacies.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center">
                    <Building2 className="mx-auto mb-2 h-8 w-8 text-slate-600" />
                    <p className="text-slate-500">No pharmacies registered</p>
                  </td></tr>
                ) : (
                  pharmacies.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{p.business_name}</p>
                        {p.email && <p className="text-xs text-slate-400">{p.email}</p>}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">{p.city || "—"}</td>
                      <td className="px-4 py-3 text-right text-sm text-white">${p.credit_limit?.toFixed(2) || "0.00"}</td>
                      <td className="px-4 py-3 text-right text-sm text-amber-400">${p.outstanding_amount?.toFixed(2) || "0.00"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${p.is_approved ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
                          {p.is_approved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {!p.is_approved && (
                          <button
                            onClick={() => handleApprove(p.id)}
                            disabled={approving === p.id}
                            className="flex items-center gap-1.5 mx-auto rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                          >
                            {approving === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                            Approve
                          </button>
                        )}
                        {p.is_approved && <span className="text-xs text-slate-500">Approved</span>}
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
