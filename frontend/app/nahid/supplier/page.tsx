"use client";

import { useEffect, useState } from "react";
import { NahidShell } from "@/components/nahid-shell";
import { nahidApi, getUser } from "@/lib/nahid-api";
import { Factory, Package, Star, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SupplierDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const user = getUser();

  useEffect(() => {
    nahidApi.getMySupplierProfile().then(setProfile).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <NahidShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Supplier Dashboard</h1>
          {profile && <p className="text-sm text-slate-400">{profile.company_name}</p>}
        </div>

        {profile && !profile.is_approved && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
            Your supplier account is pending approval. Contact admin to get approved and start listing medicines.
          </div>
        )}

        {profile && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h3 className="font-semibold text-white mb-4">Company Profile</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-400">Company Name</p>
                <p className="text-white">{profile.company_name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Status</p>
                <span className={`text-xs rounded-full px-2 py-0.5 ${profile.is_approved ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
                  {profile.is_approved ? "Approved" : "Pending Approval"}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-400">Rating</p>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span className="text-white">{profile.rating?.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4">
          <button
            onClick={() => router.push("/nahid/supplier/inventory")}
            className="group flex items-center justify-between rounded-xl border border-orange-500/30 bg-orange-500/10 p-5 hover:bg-orange-500/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">My Products</p>
                <p className="text-sm text-slate-400">Manage your medicine catalog</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-orange-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </NahidShell>
  );
}
