"use client";

import { Sidebar } from "@/components/sidebar";
import { getToken } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) return null;

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="ml-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/80 px-8 py-4 backdrop-blur">
          <div>
            <h1 className="text-xl font-bold text-ink-900">{title}</h1>
            {subtitle && <p className="text-sm text-ink-500">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">{actions}</div>
        </header>
        <div className="px-8 py-6">{children}</div>
      </main>
    </div>
  );
}
