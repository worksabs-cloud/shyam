"use client";

import { cn } from "@/lib/utils";
import { getUser, logout } from "@/lib/api";
import {
  LayoutDashboard,
  Package,
  Truck,
  Brain,
  FileText,
  History,
  LogOut,
  Hexagon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/suppliers", label: "Supplier Catalog", icon: Truck },
  { href: "/analysis", label: "AI Analysis", icon: Brain },
  { href: "/purchase-orders", label: "Purchase Orders", icon: FileText },
  { href: "/audit", label: "Audit Trail", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ full_name: string; role: string } | null>(null);

  useEffect(() => setUser(getUser()), []);

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white">
          <Hexagon className="h-5 w-5" fill="currentColor" />
        </div>
        <div>
          <div className="text-sm font-extrabold leading-tight text-ink-900">
            MedSupply <span className="text-brand-600">AI</span>
          </div>
          <div className="text-[10px] uppercase tracking-wide text-ink-500">
            Procurement Platform
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {nav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-ink-500 hover:bg-slate-50 hover:text-ink-800"
              )}
            >
              <Icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 text-xs font-bold text-white">
            {(user?.full_name || "A").charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-xs font-semibold text-ink-800">
              {user?.full_name || "Administrator"}
            </div>
            <div className="text-[10px] uppercase text-ink-500">{user?.role || "admin"}</div>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut style={{ width: 18, height: 18 }} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
