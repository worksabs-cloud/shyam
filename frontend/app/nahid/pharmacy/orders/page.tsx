"use client";

import { useEffect, useState } from "react";
import { NahidShell } from "@/components/nahid-shell";
import { nahidApi } from "@/lib/nahid-api";
import { ShoppingCart, Loader2 } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-300",
  confirmed: "bg-blue-500/20 text-blue-300",
  processing: "bg-purple-500/20 text-purple-300",
  shipped: "bg-cyan-500/20 text-cyan-300",
  delivered: "bg-emerald-500/20 text-emerald-300",
  cancelled: "bg-red-500/20 text-red-300",
};

export default function PharmacyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    nahidApi.getOrders().then(setOrders).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <NahidShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Orders</h1>
          <p className="text-sm text-slate-400">{orders.length} total B2B orders</p>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-500" /></div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center">
            <ShoppingCart className="mx-auto mb-2 h-8 w-8 text-slate-600" />
            <p className="text-slate-500">No orders yet</p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Order #</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">Amount</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono text-sm text-emerald-400">{o.order_number}</td>
                    <td className="px-4 py-3 text-right font-medium text-white">${Number(o.total_amount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_COLORS[o.status] || "bg-slate-500/20 text-slate-300"}`}>{o.status}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs ${o.payment_status === "paid" ? "text-emerald-400" : "text-amber-400"}`}>{o.payment_status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </NahidShell>
  );
}
