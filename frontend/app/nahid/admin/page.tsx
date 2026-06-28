"use client";

import { useEffect, useState } from "react";
import { NahidShell } from "@/components/nahid-shell";
import { nahidApi } from "@/lib/nahid-api";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  Clock,
  Building2,
  Users,
  Pill,
  Loader2,
  RefreshCw,
  TrendingDown,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface DashboardStats {
  total_revenue: number;
  today_sales: number;
  monthly_sales: number;
  b2b_revenue: number;
  b2c_revenue: number;
  low_stock_count: number;
  expiring_medicines: number;
  pending_deliveries: number;
  active_customers: number;
  active_pharmacies: number;
  total_orders: number;
  total_medicines: number;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
  warning,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  sub?: string;
  warning?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-5 ${warning ? "border-amber-500/30 bg-amber-500/5" : "border-slate-800 bg-slate-900"}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className={`mt-1.5 text-2xl font-bold ${warning ? "text-amber-400" : "text-white"}`}>{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
        </div>
        <div className={`rounded-xl p-2.5 ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [topMeds, setTopMeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [dashData, trendData, topData] = await Promise.all([
        nahidApi.getDashboard(),
        nahidApi.getSalesTrend(14),
        nahidApi.getTopMedicines(8),
      ]);
      setStats(dashData);
      setSalesTrend(trendData);
      setTopMeds(topData);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const formatCurrency = (v: number) => `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const revenueDistData = stats
    ? [
        { name: "B2B (Pharmacy)", value: stats.b2b_revenue },
        { name: "B2C (Retail)", value: stats.b2c_revenue },
      ]
    : [];

  return (
    <NahidShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-slate-400 mt-0.5">Welcome to Nahid Pharmacy Distribution Platform</p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading && !stats ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <>
            {/* Revenue Stats */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total Revenue"
                value={formatCurrency(stats?.total_revenue || 0)}
                icon={DollarSign}
                color="bg-emerald-600"
                sub="All time"
              />
              <StatCard
                label="Today's Sales"
                value={formatCurrency(stats?.today_sales || 0)}
                icon={TrendingUp}
                color="bg-blue-600"
                sub="Today"
              />
              <StatCard
                label="Monthly Sales"
                value={formatCurrency(stats?.monthly_sales || 0)}
                icon={Activity}
                color="bg-indigo-600"
                sub="This month"
              />
              <StatCard
                label="Total Orders"
                value={stats?.total_orders || 0}
                icon={ShoppingCart}
                color="bg-violet-600"
                sub="All time"
              />
            </div>

            {/* Operational Stats */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Low Stock Items"
                value={stats?.low_stock_count || 0}
                icon={AlertTriangle}
                color="bg-amber-600"
                warning={(stats?.low_stock_count || 0) > 0}
                sub="Needs reorder"
              />
              <StatCard
                label="Expiring Soon"
                value={stats?.expiring_medicines || 0}
                icon={Clock}
                color="bg-red-600"
                warning={(stats?.expiring_medicines || 0) > 0}
                sub="Within 30 days"
              />
              <StatCard
                label="Active Pharmacies"
                value={stats?.active_pharmacies || 0}
                icon={Building2}
                color="bg-cyan-600"
                sub="B2B clients"
              />
              <StatCard
                label="Total Medicines"
                value={stats?.total_medicines || 0}
                icon={Pill}
                color="bg-teal-600"
                sub="Active SKUs"
              />
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Sales Trend */}
              <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900 p-5">
                <h3 className="mb-4 font-semibold text-white">Sales Trend (14 days)</h3>
                {salesTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={salesTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(v) => v?.slice(5)}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                      />
                      <YAxis tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }}
                        formatter={(v: any) => [`$${Number(v).toFixed(2)}`, "Revenue"]}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-56 items-center justify-center text-slate-500">
                    No sales data yet. Create orders to see trends.
                  </div>
                )}
              </div>

              {/* Revenue Distribution */}
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <h3 className="mb-4 font-semibold text-white">Revenue Split</h3>
                {revenueDistData.some(d => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={revenueDistData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        dataKey="value"
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {revenueDistData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend
                        formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }}
                        formatter={(v: any) => [`$${Number(v).toFixed(2)}`]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-56 items-center justify-center text-center text-slate-500">
                    <div>
                      <DollarSign className="mx-auto mb-2 h-8 w-8 opacity-30" />
                      <p className="text-sm">No revenue data yet</p>
                    </div>
                  </div>
                )}
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">B2B Revenue</span>
                    <span className="font-medium text-emerald-400">{formatCurrency(stats?.b2b_revenue || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">B2C Revenue</span>
                    <span className="font-medium text-blue-400">{formatCurrency(stats?.b2c_revenue || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Medicines */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <h3 className="mb-4 font-semibold text-white">Top Selling Medicines</h3>
              {topMeds.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={topMeds} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" width={140} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }}
                      formatter={(v: any, name) => [name === "revenue" ? `$${Number(v).toFixed(2)}` : v, name === "revenue" ? "Revenue" : "Units Sold"]}
                    />
                    <Bar dataKey="total_sold" fill="#10b981" radius={[0, 4, 4, 0]} name="Units Sold" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-52 items-center justify-center text-center text-slate-500">
                  <div>
                    <Package className="mx-auto mb-2 h-8 w-8 opacity-30" />
                    <p className="text-sm">No order data yet</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Add Medicine", href: "/nahid/admin/medicines", color: "border-emerald-500/30 text-emerald-400", icon: Pill },
                { label: "View Orders", href: "/nahid/admin/orders", color: "border-blue-500/30 text-blue-400", icon: ShoppingCart },
                { label: "Inventory Check", href: "/nahid/admin/inventory", color: "border-amber-500/30 text-amber-400", icon: Package },
                { label: "AI Insights", href: "/nahid/admin/ai", color: "border-purple-500/30 text-purple-400", icon: Activity },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => (window.location.href = action.href)}
                  className={`flex items-center gap-3 rounded-xl border bg-slate-900 p-4 text-sm font-medium hover:bg-slate-800 transition-colors ${action.color}`}
                >
                  <action.icon className="h-5 w-5" />
                  {action.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </NahidShell>
  );
}
