"use client";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { UploadZone } from "@/components/upload-zone";
import { api } from "@/lib/api";
import { currency, numberFmt } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function SuppliersPage() {
  const qc = useQueryClient();
  const { data: rows } = useQuery({ queryKey: ["suppliers"], queryFn: api.suppliers });
  const upload = useMutation({
    mutationFn: api.uploadSuppliers,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });

  // Best price per medicine for highlight
  const best: Record<string, number> = {};
  (rows || []).forEach((r: any) => {
    if (best[r.medicine_name] == null || r.unit_price < best[r.medicine_name]) {
      best[r.medicine_name] = r.unit_price;
    }
  });

  return (
    <AppShell title="Supplier Catalog" subtitle="Distributor prices, lead times & availability">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Upload Supplier Catalog</CardTitle>
            </CardHeader>
            <CardContent>
              <UploadZone onUpload={(f) => upload.mutate(f)} uploading={upload.isPending} />
              <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-ink-500">
                <div className="font-semibold text-ink-700">Expected columns</div>
                Medicine Name · Supplier Name · Unit Price · Lead Time · Available Quantity
              </div>
              {upload.isSuccess && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Imported {upload.data.rows_imported} catalog rows
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
              <CardTitle>Catalog ({rows?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <THead>
                  <TH>Medicine</TH>
                  <TH>Supplier</TH>
                  <TH className="text-right">Unit Price</TH>
                  <TH className="text-right">Lead Time</TH>
                  <TH className="text-right">Available</TH>
                </THead>
                <tbody>
                  {(rows || []).map((r: any) => {
                    const isBest = best[r.medicine_name] === r.unit_price;
                    return (
                      <TR key={r.id}>
                        <TD className="font-semibold text-ink-900">{r.medicine_name}</TD>
                        <TD>{r.supplier_name}</TD>
                        <TD className="text-right">
                          <span className={isBest ? "font-bold text-green-600" : ""}>
                            {currency(r.unit_price)}
                            {isBest && " ✓"}
                          </span>
                        </TD>
                        <TD className="text-right">{r.lead_time_days}d</TD>
                        <TD className="text-right">{numberFmt(r.available_quantity)}</TD>
                      </TR>
                    );
                  })}
                  {!rows?.length && (
                    <TR>
                      <TD className="py-10 text-center text-ink-500" {...{ colSpan: 5 }}>
                        No supplier catalog yet. Upload a file or load demo data.
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
