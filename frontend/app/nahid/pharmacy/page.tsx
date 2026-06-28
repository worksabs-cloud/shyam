"use client";

import { useEffect, useState } from "react";
import { NahidShell } from "@/components/nahid-shell";
import { nahidApi, getUser } from "@/lib/nahid-api";
import { Building2, ShoppingCart, FileText, Pill, ArrowRight, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PharmacyDashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const user = getUser();

  useEffect(() => {
    Promise.all([
      nahidApi.getOrders(),
      nahidApi.getMyPharmacyProfile().catch(() => null),
    ]).then(([ordersData, profileData]) => {
      setOrders(ordersData);
      setProfile(profileData);
    }).finally(() => setLoading(false));
  }, []);

  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const pendingOrders = orders.filter(o => !["delivered", "cancelled"].includes(o.status)).length;

  return (
    <NahidShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Pharmacy Dashboard</h1>
          {profile && <p className="text-sm text-slate-400">{profile.business_name}</p>}
        </div>

        {profile && !profile.is_approved && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
            Your pharmacy account is pending approval. Contact admin to get approved.
          </div>
        )}

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <ShoppingCart className="h-5 w-5 text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white">{orders.length}</p>
            <p className="text-sm text-slate-400">Total Orders</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <DollarSign className="h-5 w-5 text-emerald-400 mb-2" />
            <p className="text-2xl font-bold text-white">${totalSpent.toFixed(0)}</p>
            <p className="text-sm text-slate-400">Total Spent</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <Building2 className="h-5 w-5 text-amber-400 mb-2" />
            <p className="text-2xl font-bold text-white">{pendingOrders}</p>
            <p className="text-sm text-slate-400">Pending Orders</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => router.push("/nahid/pharmacy/catalog")}
            className="group flex items-center justify-between rounded-xl border border-blue-500/30 bg-blue-500/10 p-5 hover:bg-blue-500/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500">
                <Pill className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">Wholesale Catalog</p>
                <p className="text-sm text-slate-400">Browse & order at wholesale prices</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => router.push("/nahid/pharmacy/orders")}
            className="group flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 hover:bg-emerald-500/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">My Orders</p>
                <p className="text-sm text-slate-400">Track your B2B orders</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {profile && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h3 className="font-semibold text-white mb-3">Profile Summary</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-400">Business Name</p>
                <p className="text-sm text-white">{profile.business_name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">License</p>
                <p className="text-sm text-white">{profile.license_number || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Credit Limit</p>
                <p className="text-sm text-emerald-400">${Number(profile.credit_limit || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Status</p>
                <span className={`text-xs rounded-full px-2 py-0.5 ${profile.is_approved ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
                  {profile.is_approved ? "Approved" : "Pending"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </NahidShell>
  );
}
