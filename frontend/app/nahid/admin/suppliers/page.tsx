"use client";

import { useEffect, useState } from "react";
import { NahidShell } from "@/components/nahid-shell";
import { nahidApi } from "@/lib/nahid-api";
import { Factory, Loader2, RefreshCw, Star } from "lucide-react";

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const data = await nahidApi.getSuppliers();
      setSuppliers(data);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  return (
    <NahidShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Suppliers</h1>
            <p className="text-sm text-slate-400">{suppliers.length} registered suppliers</p>
          </div>
          <button onClick={loadData} disabled={loading} className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-3 flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            </div>
          ) : suppliers.length === 0 ? (
            <div className="col-span-3 py-12 text-center">
              <Factory className="mx-auto mb-2 h-8 w-8 text-slate-600" />
              <p className="text-slate-500">No suppliers registered</p>
            </div>
          ) : (
            suppliers.map((s) => (
              <div key={s.id} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20">
                    <Factory className="h-5 w-5 text-orange-400" />
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${s.is_approved ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
                    {s.is_approved ? "Approved" : "Pending"}
                  </span>
                </div>
                <h3 className="font-semibold text-white">{s.company_name}</h3>
                {s.city && <p className="text-sm text-slate-400 mt-1">{s.city}, {s.state}</p>}
                {s.email && <p className="text-xs text-slate-500 mt-1">{s.email}</p>}
                <div className="mt-3 flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-medium text-white">{s.rating?.toFixed(1)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </NahidShell>
  );
}
