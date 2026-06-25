"use client";

import { useEffect, useState } from "react";
import { NahidShell } from "@/components/nahid-shell";
import { nahidApi } from "@/lib/nahid-api";
import { Package, Loader2 } from "lucide-react";

export default function SupplierInventoryPage() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    nahidApi.getMedicines({ limit: 100 }).then(setMedicines).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <NahidShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Products</h1>
          <p className="text-sm text-slate-400">{medicines.length} products listed</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-500" /></div>
        ) : medicines.length === 0 ? (
          <div className="py-12 text-center">
            <Package className="mx-auto mb-2 h-8 w-8 text-slate-600" />
            <p className="text-slate-500">No products yet</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {medicines.map((med) => (
              <div key={med.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <p className="font-semibold text-white">{med.product_name}</p>
                <p className="text-xs text-slate-400">{med.sku}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-emerald-400">${Number(med.retail_price || 0).toFixed(2)}</span>
                  <span className={`text-xs rounded-full px-2 py-0.5 ${med.is_approved ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
                    {med.is_approved ? "Live" : "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </NahidShell>
  );
}
