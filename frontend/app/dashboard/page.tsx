"use client";

import { AppShell } from "@/components/app-shell";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { currency, numberFmt, RISK_COLORS, EXPIRY_COLORS } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Package,
  AlertTriangle,
  TrendingDown,
  Clock,
  CalendarX,
  DollarSign,
  Database,
  Loader2,
  Activity,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

export default function DashboardPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: api.dashboard });

  const demo = useMutation({
    mutationFn: api.loadDemo,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard"] }),
  });

  const cards = data?.cards;
  const charts = data?.charts;

  const riskData = charts
    ? Object.entries(charts.risk_distribution || {})
        .filter(([k]) => k !== "none")
        .map(([k, v]) => ({ name: k, value: v as number, color: RISK_COLORS[k] }))
    : [];
  const expiryData = charts
    ? Object.entries(charts.expiry_distribution || {})
        .filter(([k]) => k !== "unknown")
        .map(([k, v]) => ({ name: k, value: v as number, color: EXPIRY_COLORS[k] }))
    : [];
  const supplierData = charts?.supplier_spend?.map((s: any) => ({
    name: s.supplier_name,
    spend: s.estimated_spend,
  })) || [];
  const reorderData = charts?.top_reorders?.map((r: any) => ({
    name: r.medicine_name.split(" ")[0],
    cost: r.cost,
  })) || [];
  const deadData = charts?.dead_stock_units?.map((d: any) => ({
    name: d.medicine_name.split(" ")[0],
    units: d.units,
  })) || [];

  const health = cards?.health_score ?? 0;
  const healthData = [{ name: "Health", value: health, fill: health > 70 ? "#22c55e" : health > 45 ? "#eab308" : "#ef4444" }];

  return (
    <AppShell
      title="Procurement Command Center"
      subtitle="Real-time inventory intelligence & risk overview"
      actions={
        <button onClick={() => demo.mutate()} disabled={demo.isPending} className="btn-ghost">
          {demo.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
          Load Demo Data
        </button>
      }
    >
      {isLoading ? (
        <Loading />
      ) : (
        <div className="space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            <KpiCard label="Total Medicines" value={numberFmt(cards?.total_medicines)} icon={Package} tone="brand" />
            <KpiCard label="Low Stock" value={numberFmt(cards?.low_stock_items)} icon={TrendingDown} tone="warning" />
            <KpiCard label="Stockout Risk" value={numberFmt(cards?.stockout_risk_items)} icon={AlertTriangle} tone="danger" />
            <KpiCard label="Dead Stock" value={numberFmt(cards?.dead_stock_items)} icon={Clock} tone="default" />
            <KpiCard label="Expiry Risk" value={numberFmt(cards?.expiry_risk_items)} icon={CalendarX} tone="warning" />
            <KpiCard label="Reorder Cost" value={currency(cards?.estimated_reorder_cost)} icon={DollarSign} tone="success" />
          </div>

          {/* Charts row 1 */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Health Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart innerRadius="70%" outerRadius="100%" data={healthData} startAngle={90} endAngle={-270}>
                      <RadialBar background dataKey="value" cornerRadius={20} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-4xl font-extrabold text-ink-900">{health}</div>
                    <div className="text-xs text-ink-500">out of 100</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stockout Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={riskData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                        {riskData.map((d, i) => (
                          <Cell key={i} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <Legend items={riskData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expiry Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={expiryData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                        {expiryData.map((d, i) => (
                          <Cell key={i} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <Legend items={expiryData} />
              </CardContent>
            </Card>
          </div>

          {/* Charts row 2 */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Supplier Cost Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartBars data={supplierData} dataKey="spend" color="#0ea5a4" money />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Procurement Spend Forecast (Top Reorders)</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartBars data={reorderData} dataKey="cost" color="#0891b2" money />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Dead Stock Analysis (Units)</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartBars data={deadData} dataKey="units" color="#f97316" />
              </CardContent>
            </Card>
          </div>

          {/* Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-brand-600" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.activity?.length ? (
                <ol className="relative space-y-4 border-l border-slate-200 pl-5">
                  {data.activity.map((a: any, i: number) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[23px] top-1 h-2.5 w-2.5 rounded-full bg-brand-500 ring-4 ring-brand-50" />
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-ink-800">{a.action.replaceAll("_", " ")}</span>
                        <span className="text-xs text-ink-500">{new Date(a.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-ink-500">
                        {a.result} · <span className="font-medium">{a.user}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <Empty />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}

function ChartBars({ data, dataKey, color, money }: { data: any[]; dataKey: string; color: string; money?: boolean }) {
  if (!data.length) return <Empty />;
  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -10 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} interval={0} angle={-15} textAnchor="end" height={50} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
          <Tooltip formatter={(v: any) => (money ? currency(v) : numberFmt(v))} />
          <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Legend({ items }: { items: { name: string; value: number; color: string }[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
      {items.map((it) => (
        <div key={it.name} className="flex items-center gap-1.5 text-xs capitalize text-ink-500">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: it.color }} />
          {it.name} ({it.value})
        </div>
      ))}
    </div>
  );
}

function Empty() {
  return (
    <div className="flex h-40 flex-col items-center justify-center text-center text-sm text-ink-500">
      <Database className="mb-2 h-6 w-6 text-slate-300" />
      No data yet. Click <b className="mx-1">Load Demo Data</b> to populate.
    </div>
  );
}

function Loading() {
  return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
    </div>
  );
}
