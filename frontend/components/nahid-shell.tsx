"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Pill,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Building2,
  Truck,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronRight,
  Warehouse,
  Brain,
  Factory,
} from "lucide-react";
import { getToken, getUser, clearSession } from "@/lib/nahid-api";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NahidShellProps {
  children: React.ReactNode;
  role?: string;
}

const NAV_CONFIG: Record<string, NavItem[]> = {
  admin: [
    { href: "/nahid/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/nahid/admin/medicines", label: "Medicines", icon: Pill },
    { href: "/nahid/admin/inventory", label: "Inventory", icon: Warehouse },
    { href: "/nahid/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/nahid/admin/pharmacies", label: "Pharmacies", icon: Building2 },
    { href: "/nahid/admin/suppliers", label: "Suppliers", icon: Factory },
    { href: "/nahid/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/nahid/admin/ai", label: "AI Insights", icon: Brain },
  ],
  super_admin: [
    { href: "/nahid/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/nahid/admin/medicines", label: "Medicines", icon: Pill },
    { href: "/nahid/admin/inventory", label: "Inventory", icon: Warehouse },
    { href: "/nahid/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/nahid/admin/pharmacies", label: "Pharmacies", icon: Building2 },
    { href: "/nahid/admin/suppliers", label: "Suppliers", icon: Factory },
    { href: "/nahid/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/nahid/admin/ai", label: "AI Insights", icon: Brain },
  ],
  pharmacy: [
    { href: "/nahid/pharmacy", label: "Dashboard", icon: LayoutDashboard },
    { href: "/nahid/pharmacy/catalog", label: "Medicine Catalog", icon: Pill },
    { href: "/nahid/pharmacy/orders", label: "My Orders", icon: ShoppingCart },
    { href: "/nahid/pharmacy/invoices", label: "Invoices", icon: FileText },
  ],
  customer: [
    { href: "/nahid/customer", label: "Dashboard", icon: LayoutDashboard },
    { href: "/nahid/customer/medicines", label: "Shop Medicines", icon: Pill },
    { href: "/nahid/customer/orders", label: "My Orders", icon: ShoppingCart },
  ],
  supplier: [
    { href: "/nahid/supplier", label: "Dashboard", icon: LayoutDashboard },
    { href: "/nahid/supplier/inventory", label: "My Products", icon: Package },
  ],
  delivery_agent: [
    { href: "/nahid/delivery", label: "Dashboard", icon: LayoutDashboard },
    { href: "/nahid/delivery/deliveries", label: "My Deliveries", icon: Truck },
  ],
};

export function NahidShell({ children }: NahidShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = getUser();

  useEffect(() => {
    if (!getToken()) {
      router.replace("/nahid/login");
    }
  }, []);

  function handleLogout() {
    clearSession();
    router.push("/nahid/login");
  }

  const role = user?.role || "admin";
  const navItems = NAV_CONFIG[role] || NAV_CONFIG.admin;

  const roleLabel: Record<string, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    pharmacy: "Pharmacy",
    customer: "Customer",
    supplier: "Supplier",
    delivery_agent: "Delivery Agent",
  };

  const roleColor: Record<string, string> = {
    super_admin: "bg-slate-600",
    admin: "bg-emerald-600",
    pharmacy: "bg-blue-600",
    customer: "bg-purple-600",
    supplier: "bg-orange-600",
    delivery_agent: "bg-red-600",
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-slate-900 border-r border-slate-800 transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500">
            <Pill className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">NAHID PHARMACY</p>
            <p className="text-xs text-slate-500">Distribution Platform</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto text-slate-500 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User info */}
        <div className="border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-sm font-bold text-white">
              {(user?.first_name?.[0] || "U").toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {user?.first_name} {user?.last_name}
              </p>
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs text-white ${roleColor[role] || "bg-slate-600"}`}>
                {roleLabel[role] || role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => { router.push(item.href); setSidebarOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-300 font-medium"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-emerald-400" : ""}`} />
                {item.label}
                {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-800 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-400 hover:text-white lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-white">
              {navItems.find((n) => n.href === pathname)?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-400" />
            </button>
            <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white">
              {(user?.first_name?.[0] || "U").toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
