"use client";

import { useRouter } from "next/navigation";
import {
  Pill,
  ShieldCheck,
  TrendingUp,
  Truck,
  Users,
  Building2,
  Package,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
} from "lucide-react";

export default function NahidLandingPage() {
  const router = useRouter();

  const portals = [
    {
      title: "Admin Portal",
      desc: "Full platform control: medicines, inventory, orders, analytics",
      icon: ShieldCheck,
      color: "from-emerald-500 to-teal-600",
      href: "/nahid/admin",
      badge: "Admin",
    },
    {
      title: "Pharmacy Portal",
      desc: "B2B ordering, bulk catalog browsing, invoice management",
      icon: Building2,
      color: "from-blue-500 to-indigo-600",
      href: "/nahid/pharmacy",
      badge: "B2B",
    },
    {
      title: "Customer Portal",
      desc: "Browse medicines, add to cart, track your orders",
      icon: Users,
      color: "from-purple-500 to-pink-600",
      href: "/nahid/customer",
      badge: "B2C",
    },
    {
      title: "Supplier Portal",
      desc: "Manage medicine catalog, track inventory levels",
      icon: Package,
      color: "from-orange-500 to-amber-600",
      href: "/nahid/supplier",
      badge: "Supplier",
    },
    {
      title: "Delivery Portal",
      desc: "Manage deliveries, update status, proof of delivery",
      icon: Truck,
      color: "from-red-500 to-rose-600",
      href: "/nahid/delivery",
      badge: "Delivery",
    },
  ];

  const features = [
    { icon: BarChart3, title: "Real-time Analytics", desc: "Live dashboards with sales trends, revenue tracking and KPI monitoring" },
    { icon: Zap, title: "AI-Powered Insights", desc: "Demand forecasting, expiry risk alerts, and smart reorder recommendations" },
    { icon: Package, title: "Inventory Management", desc: "Batch tracking, expiry management, and automated low-stock alerts" },
    { icon: Truck, title: "Delivery Tracking", desc: "Real-time delivery status updates with proof of delivery capture" },
    { icon: ShieldCheck, title: "Multi-Role Security", desc: "Role-based access control for admin, pharmacy, customer, supplier and delivery" },
    { icon: TrendingUp, title: "B2B & B2C Orders", desc: "Separate workflows for wholesale pharmacy orders and retail customer orders" },
  ];

  const stats = [
    { value: "15+", label: "Medicine Categories" },
    { value: "6", label: "User Roles" },
    { value: "100%", label: "Role-based Access" },
    { value: "24/7", label: "Platform Availability" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">NAHID PHARMACY</span>
              <p className="text-xs text-emerald-400">Distribution Platform</p>
            </div>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-white/70 hover:text-white transition-colors">Features</a>
            <a href="#portals" className="text-sm text-white/70 hover:text-white transition-colors">Portals</a>
            <a href="#stats" className="text-sm text-white/70 hover:text-white transition-colors">Stats</a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/nahid/login")}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-emerald-400 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push("/nahid/register")}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 text-center">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-emerald-500 blur-3xl" />
          <div className="absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-teal-400 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-1.5 text-sm text-emerald-300 border border-emerald-500/30">
            <Star className="h-4 w-4" />
            Complete Pharmaceutical Distribution Ecosystem
          </div>
          <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight lg:text-6xl">
            NAHID PHARMACY
            <span className="block bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Distribution Platform
            </span>
          </h1>
          <p className="mb-10 text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            A production-ready B2B & B2C pharmaceutical distribution platform with AI-powered inventory management,
            multi-role portals, and real-time analytics.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={() => router.push("/nahid/login")}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-lg font-semibold text-white hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25"
            >
              Access Platform <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => router.push("/nahid/register")}
              className="flex items-center gap-2 rounded-xl border border-white/20 px-8 py-4 text-lg text-white/80 hover:border-emerald-400 hover:text-white transition-all"
            >
              Create Account
            </button>
          </div>
          <p className="mt-6 text-sm text-white/40">
            Demo: admin: nahid@admin.com / admin123 &nbsp;|&nbsp; Customer: customer@nahid.com / customer123
          </p>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="border-y border-white/10 bg-white/5 px-6 py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-extrabold text-emerald-400">{stat.value}</div>
              <div className="mt-1 text-sm text-white/60">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Portals */}
      <section id="portals" className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white">Access Your Portal</h2>
            <p className="mt-3 text-white/60">Choose your role to access the dedicated portal</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {portals.map((portal) => (
              <button
                key={portal.title}
                onClick={() => router.push(portal.href)}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 text-left hover:border-emerald-500/50 hover:bg-white/10 transition-all duration-300"
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${portal.color}`}>
                  <portal.icon className="h-6 w-6 text-white" />
                </div>
                <span className="mb-1 inline-block rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
                  {portal.badge}
                </span>
                <h3 className="mt-2 text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {portal.title}
                </h3>
                <p className="mt-1 text-sm text-white/60 leading-relaxed">{portal.desc}</p>
                <ArrowRight className="mt-4 h-5 w-5 text-white/30 group-hover:text-emerald-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-black/20 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white">Platform Features</h2>
            <p className="mt-3 text-white/60">Everything you need for pharmaceutical distribution</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                  <feature.icon className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="mb-2 font-bold text-white">{feature.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold text-white">Ready to Get Started?</h2>
          <p className="mt-4 text-white/60">
            Join Nahid Pharmacy Distribution Platform — the complete pharmaceutical ecosystem
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={() => router.push("/nahid/login")}
              className="rounded-xl bg-emerald-500 px-8 py-4 font-semibold text-white hover:bg-emerald-400 transition-colors"
            >
              Sign In Now
            </button>
            <button
              onClick={() => router.push("/nahid/register")}
              className="rounded-xl border border-white/20 px-8 py-4 text-white/80 hover:border-white/40 hover:text-white transition-colors"
            >
              Register
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Pill className="h-5 w-5 text-emerald-400" />
          <span className="font-bold text-white">NAHID PHARMACY DISTRIBUTION PLATFORM</span>
        </div>
        <p className="text-sm text-white/40">Production-ready B2B & B2C Pharmaceutical Distribution Platform</p>
        <p className="mt-2 text-xs text-white/30">Built with FastAPI + Next.js + PostgreSQL</p>
      </footer>
    </div>
  );
}
