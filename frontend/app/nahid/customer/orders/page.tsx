"use client";

import { useEffect, useState } from "react";
import { NahidShell } from "@/components/nahid-shell";
import { nahidApi } from "@/lib/nahid-api";
import { ShoppingCart, Loader2, Package } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-300",
  confirmed: "bg-blue-500/20 text-blue-300",
  processing: "bg-purple-500/20 text-purple-300",
  shipped: "bg-cyan-500/20 text-cyan-300",
  delivered: "bg-emerald-500/20 text-emerald-300",
  cancelled: "bg-red-500/20 text-red-300",
};

export default function CustomerOrdersPage() {
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
          <p className="text-sm text-slate-400">{orders.length} total orders</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-500" /></div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 py-12 text-center">
            <ShoppingCart className="mx-auto mb-2 h-8 w-8 text-slate-600" />
            <p className="text-slate-500">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <span className="font-mono font-medium text-emerald-400">{order.order_number}</span>
                    <p className="text-xs text-slate-400 mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">${Number(order.total_amount).toFixed(2)}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status] || "bg-slate-500/20 text-slate-300"}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm text-slate-400">
                  <span>Payment: <span className={order.payment_status === "paid" ? "text-emerald-400" : "text-amber-400"}>{order.payment_status}</span></span>
                  <span>Type: <span className="text-white">{order.order_type?.toUpperCase()}</span></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </NahidShell>
  );
}
