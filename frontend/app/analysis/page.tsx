"use client";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBadge } from "@/components/ui/badge";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { api } from "@/lib/api";
import { currency, numberFmt } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Brain,
  Sparkles,
  Loader2,
  AlertTriangle,
  Clock,
  CalendarX,
  Truck,
  Repeat,
  ListChecks,
  ShieldAlert,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AnalysisPage() {
  const qc = useQueryClient();
  const router = useRouter();
  const { data: result, refetch } = useQuery({
    queryKey: ["analysis-results"],
    queryFn: api.analysisResults,
    retry: false,
  });

  const run = useMutation({
    mutationFn: api.runAnalysis,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["analysis-results"] });
      refetch();
    },
  });

  const r = run.data?.result || result?.result;
  const aiEnhanced = run.data?.ai_enhanced ?? result?.ai_enhanced;

  return (
    <AppShell
      title="AI Procurement Engine"
      subtitle="Demand forecasting · risk detection · supplier optimization"
      actions={
        <button onClick={() => run.mutate()} disabled={run.isPending} className="btn-primary">
          {run.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {run.isPending ? "Analyzing…" : "Analyze Inventory"}
        </button>
      }
    >
      {!r ? (
        <EmptyState onRun={() => run.mutate()} loading={run.isPending} error={run.error as Error} />
      ) : (
        <div className="space-y-6">
          {/* Executive summary */}
          <Card className="overflow-hidden border-brand-200">
            <div className="flex items-center gap-2 border-b border-brand-100 bg-brand-50 px-5 py-3">
              <Brain className="h-4 w-4 text-brand-600" />
              <span className="text-sm font-bold text-brand-700">AI Executive Summary</span>
              <span className={`badge ml-auto ${aiEnhanced ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-600"}`}>
                {aiEnhanced ? "GPT-4.1 Enhanced" : "Rule Engine"}
              </span>
            </div>
            <CardContent className="pt-4">
              <p className="text-sm leading-relaxed text-ink-800">{r.executive_summary}</p>

              {r.priority_actions?.length > 0 && (
                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  {r.priority_actions.map((a: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-ink-700">
                      <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                      {a}
                    </div>
                  ))}
                </div>
              )}

              {r.risk_callouts?.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {r.risk_callouts.map((c: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                      {c}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommended orders -> PO generation */}
          <RecommendedOrders orders={r.recommended_orders} router={router} />

          <div className="grid gap-6 lg:grid-cols-2">
            <StockoutPanel items={r.stockout_risk} />
            <ExpiryPanel items={r.expiry_risk} />
          </div>

          <DeadStockPanel items={r.dead_stock} />

          <div className="grid gap-6 lg:grid-cols-2">
            <SupplierPanel items={r.supplier_recommendations} />
            <AlternativesPanel items={r.alternatives} />
          </div>
        </div>
      )}
    </AppShell>
  );
}

function EmptyState({ onRun, loading, error }: { onRun: () => void; loading: boolean; error?: Error }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Brain className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-ink-900">Run your first AI analysis</h3>
        <p className="mt-1 max-w-md text-sm text-ink-500">
          The engine analyzes stockout risk, forecasts demand, optimizes suppliers, and detects
          dead stock & expiry risk — then drafts purchase orders for you.
        </p>
        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error.message}</p>
        )}
        <button onClick={onRun} disabled={loading} className="btn-primary mt-5">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Analyze Inventory
        </button>
      </CardContent>
    </Card>
  );
}

function RecommendedOrders({ orders, router }: { orders: any[]; router: any }) {
  const qc = useQueryClient();
  const [done, setDone] = useState<string | null>(null);

  // Group recommended orders by best supplier
  const bySupplier: Record<string, any[]> = {};
  (orders || []).forEach((o) => {
    (bySupplier[o.best_supplier] ||= []).push(o);
  });

  const gen = useMutation({
    mutationFn: (supplier: string) =>
      api.generatePO({
        supplier_name: supplier,
        notes: "Auto-generated from AI procurement analysis.",
        items: bySupplier[supplier].map((o) => ({
          medicine_name: o.medicine_name,
          quantity: o.recommended_quantity,
          unit_price: o.unit_price,
        })),
      }),
    onSuccess: (po) => {
      setDone(po.po_number);
      qc.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });

  if (!orders?.length)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommended Orders</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-ink-500">No reorders required — stock levels are healthy.</CardContent>
      </Card>
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-brand-600" /> AI Recommended Orders — One-Click PO
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <THead>
            <TH>Medicine</TH>
            <TH className="text-right">Reorder Qty</TH>
            <TH>Best Supplier</TH>
            <TH className="text-right">Unit Price</TH>
            <TH className="text-right">Est. Cost</TH>
            <TH>Risk</TH>
            <TH>Rationale</TH>
          </THead>
          <tbody>
            {orders.map((o, i) => (
              <TR key={i}>
                <TD className="font-semibold text-ink-900">{o.medicine_name}</TD>
                <TD className="text-right font-bold">{numberFmt(o.recommended_quantity)}</TD>
                <TD>{o.best_supplier}</TD>
                <TD className="text-right">{currency(o.unit_price)}</TD>
                <TD className="text-right font-semibold">{currency(o.estimated_cost)}</TD>
                <TD>
                  <RiskBadge level={o.risk_level} />
                </TD>
                <TD className="max-w-xs text-xs text-ink-500">{o.rationale}</TD>
              </TR>
            ))}
          </tbody>
        </Table>
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 p-4">
          <span className="text-sm font-medium text-ink-700">Generate PO by supplier:</span>
          {Object.entries(bySupplier).map(([sup, its]) => {
            const total = its.reduce((s, o) => s + o.estimated_cost, 0);
            return (
              <button key={sup} onClick={() => gen.mutate(sup)} disabled={gen.isPending} className="btn-ghost">
                {gen.isPending && gen.variables === sup ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                {sup} · {its.length} items · {currency(total)}
              </button>
            );
          })}
          <button onClick={() => router.push("/purchase-orders")} className="btn-primary ml-auto">
            View Purchase Orders
          </button>
        </div>
        {done && (
          <div className="flex items-center gap-2 border-t border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            Purchase order <b>{done}</b> created. Open the Purchase Orders page to download the PDF.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StockoutPanel({ items }: { items: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-risk-critical" /> Stockout Prediction ({items?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {(items || []).slice(0, 8).map((s, i) => (
          <div key={i} className="rounded-lg border border-slate-100 p-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ink-900">{s.medicine_name}</span>
              <RiskBadge level={s.risk_level} />
            </div>
            <div className="mt-1 text-xs text-ink-500">{s.explanation}</div>
            <div className="mt-2 flex gap-3 text-[11px] text-ink-500">
              <span>7d: <b>{s.forecast.demand_7d}</b></span>
              <span>14d: <b>{s.forecast.demand_14d}</b></span>
              <span>30d: <b>{s.forecast.demand_30d}</b></span>
              <span className="ml-auto font-semibold text-ink-700">{s.days_left}d left</span>
            </div>
          </div>
        ))}
        {!items?.length && <Empty text="No stockout risks detected." />}
      </CardContent>
    </Card>
  );
}

function ExpiryPanel({ items }: { items: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarX className="h-4 w-4 text-orange-500" /> Expiry Risk ({items?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {(items || []).slice(0, 8).map((e, i) => (
          <div key={i} className="rounded-lg border border-slate-100 p-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ink-900">{e.medicine_name}</span>
              <RiskBadge level={e.level} />
            </div>
            <div className="mt-1 text-xs text-ink-500">
              Expires {e.expiry_date} · {e.days_until_expiry < 0 ? "EXPIRED" : `${e.days_until_expiry}d left`} ·{" "}
              {numberFmt(e.current_stock)} units
            </div>
            <div className="mt-1 text-xs font-medium text-orange-700">{e.recommendation}</div>
          </div>
        ))}
        {!items?.length && <Empty text="No expiry risks detected." />}
      </CardContent>
    </Card>
  );
}

function DeadStockPanel({ items }: { items: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-ink-700" /> Dead Stock Detection ({items?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items?.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {items.map((d, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink-900">{d.medicine_name}</span>
                  <RiskBadge level={d.risk} />
                </div>
                <div className="mt-2 text-2xl font-extrabold text-ink-900">{numberFmt(d.current_stock)}</div>
                <div className="text-[11px] uppercase tracking-wide text-ink-500">units on hand</div>
                <div className="mt-2 text-xs text-ink-500">{d.reason}</div>
                <div className="mt-2 rounded-lg bg-white px-2.5 py-2 text-xs font-medium text-brand-700">
                  💡 {d.recommendation}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty text="No dead stock detected." />
        )}
      </CardContent>
    </Card>
  );
}

function SupplierPanel({ items }: { items: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-brand-600" /> Supplier Optimization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {(items || []).slice(0, 8).map((s, i) => (
          <div key={i} className="rounded-lg border border-slate-100 p-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ink-900">{s.medicine_name}</span>
              {s.savings_per_unit > 0 && (
                <span className="badge bg-green-100 text-green-700">Save {currency(s.savings_per_unit)}/unit</span>
              )}
            </div>
            <div className="mt-1 text-xs text-ink-500">
              Best: <b className="text-ink-700">{s.best_supplier}</b> @ {currency(s.best_price)} · score {s.best_score}
            </div>
          </div>
        ))}
        {!items?.length && <Empty text="Upload a supplier catalog for optimization." />}
      </CardContent>
    </Card>
  );
}

function AlternativesPanel({ items }: { items: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Repeat className="h-4 w-4 text-brand-600" /> Substitute Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {(items || []).slice(0, 8).map((a, i) => (
          <div key={i} className="rounded-lg border border-slate-100 p-3">
            <div className="text-sm font-semibold text-ink-900">{a.medicine_name}</div>
            <div className="text-xs text-ink-500">{a.reason}</div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {a.substitutes.map((s: any, j: number) => (
                <span key={j} className="badge bg-brand-50 text-brand-700">
                  {s.medicine_name} ({numberFmt(s.current_stock)})
                </span>
              ))}
            </div>
          </div>
        ))}
        {!items?.length && <Empty text="No substitutions needed." />}
      </CardContent>
    </Card>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="py-6 text-center text-sm text-ink-500">{text}</div>;
}
