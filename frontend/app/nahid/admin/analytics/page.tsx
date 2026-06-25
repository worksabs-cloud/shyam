"use client";

import { useEffect, useState } from "react";
import { NahidShell } from "@/components/nahid-shell";
import { nahidApi } from "@/lib/nahid-api";
import { Loader2, RefreshCw, TrendingUp, DollarSign, Package, BarChart3 } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#84cc16"];

export default function AdminAnalyticsPage() {
  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [topMeds, setTopMeds] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const [trend, top, cats] = await Promise.all([
        nahidApi.getSalesTrend(days),
        nahidApi.getTopMedicines(10),
        nahidApi.getCategoryBreakdown(),
      ]);
      setSalesTrend(trend);
      setTopMeds(top);
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [days]);

  const totalRevenue = salesTrend.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const totalOrders = salesTrend.reduce((sum, d) => sum + (d.orders || 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <NahidShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
            <p className="text-sm text-slate-400">Sales performance and medicine insights</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <button onClick={loadData} disabled={loading} className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <DollarSign className="h-5 w-5 text-emerald-400 mb-2" />
            <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
            <p className="text-sm text-slate-400">Period Revenue</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <Package className="h-5 w-5 text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white">{totalOrders}</p>
            <p className="text-sm text-slate-400">Total Orders</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <TrendingUp className="h-5 w-5 text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white">${avgOrderValue.toFixed(2)}</p>
            <p className="text-sm text-slate-400">Avg Order Value</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <>
            {/* Revenue Area Chart */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <h3 className="mb-4 font-semibold text-white">Revenue Trend</h3>
              {salesTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={salesTrend}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" tickFormatter={(v) => v?.slice(5)} tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }}
                      formatter={(v: any) => [`$${Number(v).toFixed(2)}`]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revenueGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-56 items-center justify-center text-slate-500">No data for this period</div>
              )}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Top Medicines */}
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <h3 className="mb-4 font-semibold text-white">Top 10 Medicines by Sales</h3>
                {topMeds.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={topMeds} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                      <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" width={130} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }}
                      />
                      <Bar dataKey="total_sold" fill="#10b981" radius={[0, 4, 4, 0]} name="Units Sold" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-64 items-center justify-center text-slate-500">No sales data</div>
                )}
              </div>

              {/* Category Distribution */}
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <h3 className="mb-4 font-semibold text-white">Category Distribution</h3>
                {categories.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={categories} cx="50%" cy="45%" outerRadius={90} dataKey="count" nameKey="category" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {categories.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>} />
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-64 items-center justify-center text-slate-500">No data</div>
                )}
              </div>
            </div>

            {/* Orders per Day */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <h3 className="mb-4 font-semibold text-white">Orders Per Day</h3>
              {salesTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" tickFormatter={(v) => v?.slice(5)} tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }} />
                    <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-44 items-center justify-center text-slate-500">No data for this period</div>
              )}
            </div>
          </>
        )}
      </div>
    </NahidShell>
  );
}
