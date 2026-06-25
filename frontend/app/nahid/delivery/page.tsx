"use client";

import { useEffect, useState } from "react";
import { NahidShell } from "@/components/nahid-shell";
import { nahidApi, getUser } from "@/lib/nahid-api";
import { Truck, Package, CheckCircle, MapPin, Loader2 } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-300",
  shipped: "bg-cyan-500/20 text-cyan-300",
  delivered: "bg-emerald-500/20 text-emerald-300",
  cancelled: "bg-red-500/20 text-red-300",
};

export default function DeliveryDashboardPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const user = getUser();

  async function loadDeliveries() {
    setLoading(true);
    try {
      const data = await nahidApi.getMyDeliveries();
      setDeliveries(data);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDeliveries(); }, []);

  async function markDelivered(orderId: number) {
    setUpdating(orderId);
    try {
      await nahidApi.updateOrderStatus(orderId, "delivered");
      setDeliveries((prev) => prev.map((d) => d.id === orderId ? { ...d, status: "delivered" } : d));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(null);
    }
  }

  const pending = deliveries.filter((d) => !["delivered", "cancelled"].includes(d.status));
  const delivered = deliveries.filter((d) => d.status === "delivered");

  return (
    <NahidShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Delivery Dashboard</h1>
          <p className="text-sm text-slate-400">Welcome, {user?.first_name}</p>
        </div>

        <div className="grid gap-4 grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
            <Truck className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{deliveries.length}</p>
            <p className="text-sm text-slate-400">Total</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
            <Package className="h-5 w-5 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{pending.length}</p>
            <p className="text-sm text-slate-400">Pending</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
            <CheckCircle className="h-5 w-5 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{delivered.length}</p>
            <p className="text-sm text-slate-400">Delivered</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-white mb-3">Active Deliveries</h3>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-emerald-500" /></div>
          ) : pending.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900 py-10 text-center">
              <Truck className="mx-auto mb-2 h-8 w-8 text-slate-600" />
              <p className="text-slate-500">No active deliveries</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map((delivery) => (
                <div key={delivery.id} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <span className="font-mono font-medium text-emerald-400">{delivery.order_number}</span>
                      <span className={`ml-3 rounded-full px-2 py-0.5 text-xs ${STATUS_COLORS[delivery.status] || "bg-slate-500/20 text-slate-300"}`}>
                        {delivery.status}
                      </span>
                    </div>
                    <span className="font-bold text-white">${Number(delivery.total_amount).toFixed(2)}</span>
                  </div>
                  {delivery.delivery_address && (
                    <div className="mt-3 flex items-start gap-2 text-sm text-slate-400">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{delivery.delivery_address}</span>
                    </div>
                  )}
                  {delivery.status !== "delivered" && (
                    <button
                      onClick={() => markDelivered(delivery.id)}
                      disabled={updating === delivery.id}
                      className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 text-sm text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-60"
                    >
                      {updating === delivery.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      Mark as Delivered
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </NahidShell>
  );
}
