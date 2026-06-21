import { cn } from "@/lib/utils";
import * as React from "react";

export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full text-sm", className)} {...props} />
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-slate-200 bg-slate-50/60">
      <tr className="text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
        {children}
      </tr>
    </thead>
  );
}

export function TH({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("px-4 py-3", className)} {...props} />;
}

export function TR({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("border-b border-slate-100 hover:bg-slate-50/60", className)}
      {...props}
    />
  );
}

export function TD({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-3 text-ink-700", className)} {...props} />;
}
