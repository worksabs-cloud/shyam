"use client";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { History } from "lucide-react";

const ACTION_TONE: Record<string, string> = {
  LOGIN: "bg-slate-100 text-slate-600",
  INVENTORY_UPLOAD: "bg-brand-50 text-brand-700",
  SUPPLIER_UPLOAD: "bg-brand-50 text-brand-700",
  ANALYSIS_RUN: "bg-violet-100 text-violet-700",
  PO_GENERATED: "bg-green-100 text-green-700",
  PO_PDF_DOWNLOAD: "bg-green-50 text-green-700",
  DEMO_DATA_LOADED: "bg-yellow-100 text-yellow-700",
};

export default function AuditPage() {
  const { data: logs } = useQuery({ queryKey: ["audit"], queryFn: api.auditLog });

  return (
    <AppShell title="Audit Trail" subtitle="Every action, fully traceable">
      <Card>
        <CardContent className="p-0">
          <Table>
            <THead>
              <TH>Timestamp</TH>
              <TH>Action</TH>
              <TH>User</TH>
              <TH>Result</TH>
            </THead>
            <tbody>
              {(logs || []).map((l: any) => (
                <TR key={l.id}>
                  <TD className="whitespace-nowrap text-ink-500">{new Date(l.timestamp).toLocaleString()}</TD>
                  <TD>
                    <span className={`badge ${ACTION_TONE[l.action] || "bg-slate-100 text-slate-600"}`}>
                      {l.action.replaceAll("_", " ")}
                    </span>
                  </TD>
                  <TD className="font-medium">{l.user}</TD>
                  <TD className="text-ink-500">{l.result}</TD>
                </TR>
              ))}
              {!logs?.length && (
                <TR>
                  <TD className="py-16 text-center text-ink-500" {...{ colSpan: 4 }}>
                    <History className="mx-auto mb-2 h-7 w-7 text-slate-300" />
                    No activity recorded yet.
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
