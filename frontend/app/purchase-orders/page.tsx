"use client";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { api, downloadPdf } from "@/lib/api";
import { currency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText, ChevronDown, ChevronRight } from "lucide-react";
import { Fragment, useState } from "react";

export default function PurchaseOrdersPage() {
  const { data: pos } = useQuery({ queryKey: ["purchase-orders"], queryFn: api.purchaseOrders });
  const [open, setOpen] = useState<number | null>(null);

  return (
    <AppShell title="Purchase Orders" subtitle="AI-generated, supplier-optimized orders">
      <Card>
        <CardContent className="p-0">
          <Table>
            <THead>
              <TH></TH>
              <TH>PO Number</TH>
              <TH>Supplier</TH>
              <TH>Status</TH>
              <TH className="text-right">Items</TH>
              <TH className="text-right">Total</TH>
              <TH>Expected Delivery</TH>
              <TH className="text-right">PDF</TH>
            </THead>
            <tbody>
              {(pos || []).map((po: any) => (
                <Fragment key={po.id}>
                  <TR className="cursor-pointer" onClick={() => setOpen(open === po.id ? null : po.id)}>
                    <TD>{open === po.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</TD>
                    <TD className="font-semibold text-ink-900">{po.po_number}</TD>
                    <TD>{po.supplier_name}</TD>
                    <TD>
                      <Badge className="bg-brand-50 text-brand-700">{po.status}</Badge>
                    </TD>
                    <TD className="text-right">{po.items.length}</TD>
                    <TD className="text-right font-bold">{currency(po.total_cost)}</TD>
                    <TD className="text-ink-500">{po.expected_delivery || "—"}</TD>
                    <TD className="text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadPdf(po.id, po.po_number);
                        }}
                        className="btn-ghost px-3 py-1.5"
                      >
                        <Download className="h-4 w-4" /> PDF
                      </button>
                    </TD>
                  </TR>
                  {open === po.id && (
                    <tr>
                      <td colSpan={8} className="bg-slate-50/60 px-8 py-4">
                        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                          <Table>
                            <THead>
                              <TH>Medicine</TH>
                              <TH className="text-right">Quantity</TH>
                              <TH className="text-right">Unit Price</TH>
                              <TH className="text-right">Line Total</TH>
                            </THead>
                            <tbody>
                              {po.items.map((it: any, i: number) => (
                                <TR key={i}>
                                  <TD className="font-medium">{it.medicine_name}</TD>
                                  <TD className="text-right">{it.quantity}</TD>
                                  <TD className="text-right">{currency(it.unit_price)}</TD>
                                  <TD className="text-right font-semibold">{currency(it.line_total)}</TD>
                                </TR>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {!pos?.length && (
                <TR>
                  <TD className="py-16 text-center text-ink-500" {...{ colSpan: 8 }}>
                    <FileText className="mx-auto mb-2 h-7 w-7 text-slate-300" />
                    No purchase orders yet. Run an AI analysis and generate one in a click.
                  </TD>
                </TR>
              )}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
