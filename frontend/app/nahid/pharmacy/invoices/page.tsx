"use client";

import { NahidShell } from "@/components/nahid-shell";
import { FileText } from "lucide-react";

export default function PharmacyInvoicesPage() {
  return (
    <NahidShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <p className="text-sm text-slate-400">Your billing and invoice history</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 py-16 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-slate-600" />
          <p className="text-white font-medium">No invoices yet</p>
          <p className="text-sm text-slate-400 mt-1">Invoices will appear here after orders are fulfilled</p>
        </div>
      </div>
    </NahidShell>
  );
}
