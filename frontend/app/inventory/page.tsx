"use client";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBadge } from "@/components/ui/badge";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { UploadZone } from "@/components/upload-zone";
import { api } from "@/lib/api";
import { numberFmt } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, AlertCircle } from "lucide-react";

function daysLeft(stock: number, sales: number): number | null {
  if (!sales) return null;
  return Math.round((stock / sales) * 10) / 10;
}
function risk(d: number | null): string {
  if (d == null) return "none";
  if (d <= 3) return "critical";
  if (d <= 7) return "high";
  if (d <= 14) return "medium";
  return "low";
}

export default function InventoryPage() {
  const qc = useQueryClient();
  const { data: items } = useQuery({ queryKey: ["inventory"], queryFn: api.inventory });
  const upload = useMutation({
    mutationFn: api.uploadInventory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });

  return (
    <AppShell title="Inventory" subtitle="Upload and manage your medicine stock">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Upload Inventory Excel</CardTitle>
            </CardHeader>
            <CardContent>
              <UploadZone onUpload={(f) => upload.mutate(f)} uploading={upload.isPending} />
              <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-ink-500">
                <div className="font-semibold text-ink-700">Expected columns</div>
                Medicine Name · Current Stock · Average Daily Sales · Category · Expiry Date
              </div>
              {upload.isSuccess && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Imported {upload.data.rows_imported} items
                  {upload.data.rows_skipped ? ` · ${upload.data.rows_skipped} skipped` : ""}
                </div>
              )}
              {upload.isError && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  {(upload.error as Error).message}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Current Inventory ({items?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <THead>
                  <TH>Medicine</TH>
                  <TH>Category</TH>
                  <TH className="text-right">Stock</TH>
                  <TH className="text-right">Daily Sales</TH>
                  <TH className="text-right">Days Left</TH>
                  <TH>Risk</TH>
                  <TH>Expiry</TH>
                </THead>
                <tbody>
                  {(items || []).map((it: any) => {
                    const d = daysLeft(it.current_stock, it.avg_daily_sales);
                    return (
                      <TR key={it.id}>
                        <TD className="font-semibold text-ink-900">{it.medicine_name}</TD>
                        <TD>{it.category}</TD>
                        <TD className="text-right">{numberFmt(it.current_stock)}</TD>
                        <TD className="text-right">{it.avg_daily_sales}</TD>
                        <TD className="text-right">{d == null ? "—" : d}</TD>
                        <TD>
                          <RiskBadge level={risk(d)} />
                        </TD>
                        <TD className="text-ink-500">{it.expiry_date || "—"}</TD>
                      </TR>
                    );
                  })}
                  {!items?.length && (
                    <TR>
                      <TD className="py-10 text-center text-ink-500" {...{ colSpan: 7 }}>
                        No inventory yet. Upload a file or load demo data.
                      </TD>
                    </TR>
                  )}
                </tbody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
