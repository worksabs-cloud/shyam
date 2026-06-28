"use client";

import { useEffect, useState } from "react";
import { NahidShell } from "@/components/nahid-shell";
import { nahidApi } from "@/lib/nahid-api";
import { Brain, AlertTriangle, Clock, ShoppingCart, Search, Loader2, RefreshCw } from "lucide-react";

export default function AdminAIPage() {
  const [expiryRisk, setExpiryRisk] = useState<any[]>([]);
  const [reorderRecs, setReorderRecs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [expiry, reorder] = await Promise.all([
        nahidApi.getExpiryRisk(),
        nahidApi.getReorderRecommendations(),
      ]);
      setExpiryRisk(expiry);
      setReorderRecs(reorder);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const result = await nahidApi.aiSearch(searchQuery);
      setSearchResults(result);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setSearchLoading(false);
    }
  }

  const riskColor: Record<string, string> = {
    critical: "text-red-400 bg-red-500/20 border-red-500/30",
    high: "text-amber-400 bg-amber-500/20 border-amber-500/30",
    medium: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
  };

  return (
    <NahidShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">AI Insights</h1>
            <p className="text-sm text-slate-400">AI-powered inventory and demand intelligence</p>
          </div>
          <button onClick={loadData} disabled={loading} className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* AI Search */}
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-purple-400" />
            <h3 className="font-semibold text-white">AI Medicine Search</h3>
          </div>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search with natural language, e.g., 'blood pressure medicine'"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={searchLoading}
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-500 disabled:opacity-60"
            >
              {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
              Search
            </button>
          </form>
          {searchResults && (
            <div className="mt-3 rounded-lg bg-slate-800 p-3">
              <p className="text-sm text-slate-400">
                AI found <span className="text-purple-400 font-medium">{searchResults.ids?.length || 0}</span> matching medicines
                for query: "<span className="text-white">{searchResults.query}</span>"
              </p>
              {searchResults.ids?.length > 0 && (
                <p className="text-xs text-slate-500 mt-1">Medicine IDs: {searchResults.ids.join(", ")}</p>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Expiry Risk */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-red-400" />
                <h3 className="font-semibold text-white">Expiry Risk Report</h3>
                <span className="ml-auto rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">{expiryRisk.length} items</span>
              </div>
              {expiryRisk.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">No items at expiry risk within 90 days</p>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {expiryRisk.map((item) => (
                    <div key={item.batch_id} className={`rounded-lg border p-3 ${riskColor[item.risk_level] || "text-slate-400 bg-slate-800 border-slate-700"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">Batch: {item.batch_number}</p>
                          <p className="text-xs mt-0.5 opacity-80">Expires: {item.expiry_date} ({item.days_to_expiry} days)</p>
                          <p className="text-xs mt-1 opacity-70">{item.recommendation}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-lg font-bold">{item.quantity_available}</span>
                          <p className="text-xs opacity-70">units</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reorder Recommendations */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="h-5 w-5 text-amber-400" />
                <h3 className="font-semibold text-white">Reorder Recommendations</h3>
                <span className="ml-auto rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">{reorderRecs.length} items</span>
              </div>
              {reorderRecs.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">All stock levels are above reorder points</p>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {reorderRecs.map((item) => (
                    <div key={item.medicine_id} className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">{item.medicine_name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">Current: {item.current_stock} / Reorder: {item.reorder_level}</p>
                        </div>
                        <div className="text-right">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${item.urgency === "critical" ? "bg-red-500/20 text-red-300" : "bg-amber-500/20 text-amber-300"}`}>
                            {item.urgency}
                          </span>
                          <p className="text-xs text-slate-400 mt-1">Order: {item.recommended_quantity} units</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </NahidShell>
  );
}
