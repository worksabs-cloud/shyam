"use client";

import { useEffect, useState } from "react";
import { NahidShell } from "@/components/nahid-shell";
import { nahidApi, getUser } from "@/lib/nahid-api";
import { ShoppingCart, Pill, Package, TrendingUp, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CustomerDashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const user = getUser();

  useEffect(() => {
    nahidApi.getOrders().then(setOrders).catch(console.error).finally(() => setLoading(false));
  }, []);

  const statusCounts = orders.reduce((acc: any, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <NahidShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {user?.first_name}!</h1>
          <p className="text-sm text-slate-400">Your personal pharmacy dashboard</p>
        </div>

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <Package className="h-5 w-5 text-emerald-400 mb-2" />
            <p className="text-2xl font-bold text-white">{orders.length}</p>
            <p className="text-sm text-slate-400">Total Orders</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <TrendingUp className="h-5 w-5 text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white">{statusCounts.delivered || 0}</p>
            <p className="text-sm text-slate-400">Delivered</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <ShoppingCart className="h-5 w-5 text-amber-400 mb-2" />
            <p className="text-2xl font-bold text-white">{(statusCounts.pending || 0) + (statusCounts.processing || 0)}</p>
            <p className="text-sm text-slate-400">Active Orders</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => router.push("/nahid/customer/medicines")}
            className="group flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 hover:bg-emerald-500/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500">
                <Pill className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">Browse Medicines</p>
                <p className="text-sm text-slate-400">Shop our full catalog</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => router.push("/nahid/customer/orders")}
            className="group flex items-center justify-between rounded-xl border border-blue-500/30 bg-blue-500/10 p-5 hover:bg-blue-500/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">My Orders</p>
                <p className="text-sm text-slate-400">Track your orders</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Recent Orders */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h3 className="mb-4 font-semibold text-white">Recent Orders</h3>
          {orders.length === 0 ? (
            <div className="py-8 text-center">
              <ShoppingCart className="mx-auto mb-2 h-8 w-8 text-slate-600" />
              <p className="text-slate-500">No orders yet</p>
              <button onClick={() => router.push("/nahid/customer/medicines")} className="mt-3 text-sm text-emerald-400 hover:text-emerald-300">
                Start shopping
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-800/50 px-4 py-3">
                  <div>
                    <p className="font-mono text-sm font-medium text-emerald-400">{order.order_number}</p>
                    <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">${Number(order.total_amount).toFixed(2)}</p>
                    <span className={`text-xs ${order.status === "delivered" ? "text-emerald-400" : order.status === "cancelled" ? "text-red-400" : "text-amber-400"}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </NahidShell>
  );
}
