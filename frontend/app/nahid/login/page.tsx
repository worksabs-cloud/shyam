"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pill, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { nahidApi, setSession, getToken } from "@/lib/nahid-api";

const DEMO_CREDENTIALS = [
  { role: "Admin", email: "nahid@admin.com", password: "admin123", color: "from-emerald-500 to-teal-600" },
  { role: "Super Admin", email: "superadmin@nahid.com", password: "super123", color: "from-slate-600 to-slate-700" },
  { role: "Customer", email: "customer@nahid.com", password: "customer123", color: "from-purple-500 to-pink-600" },
  { role: "Pharmacy", email: "pharmacy@nahid.com", password: "pharmacy123", color: "from-blue-500 to-indigo-600" },
  { role: "Supplier", email: "supplier@nahid.com", password: "supplier123", color: "from-orange-500 to-amber-600" },
  { role: "Delivery", email: "delivery@nahid.com", password: "delivery123", color: "from-red-500 to-rose-600" },
];

export default function NahidLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("nahid@admin.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (getToken()) {
      const user = JSON.parse(localStorage.getItem("nahid_user") || "{}");
      redirectByRole(user.role);
    }
  }, []);

  function redirectByRole(role: string) {
    switch (role) {
      case "super_admin":
      case "admin":
        router.replace("/nahid/admin");
        break;
      case "customer":
        router.replace("/nahid/customer");
        break;
      case "pharmacy":
        router.replace("/nahid/pharmacy");
        break;
      case "supplier":
        router.replace("/nahid/supplier");
        break;
      case "delivery_agent":
        router.replace("/nahid/delivery");
        break;
      default:
        router.replace("/nahid/admin");
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await nahidApi.login(email, password);
      // Store token first so the /me request includes Authorization header
      setSession(res.access_token, res.refresh_token, {});
      const user = await nahidApi.me();
      setSession(res.access_token, res.refresh_token, user);
      redirectByRole(user.role);
    } catch (err: any) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(cred: typeof DEMO_CREDENTIALS[0]) {
    setEmail(cred.email);
    setPassword(cred.password);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => router.push("/nahid")}
          className="mb-6 flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </button>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500">
              <Pill className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Sign in to</h1>
            <p className="text-emerald-400 font-medium">Nahid Pharmacy Platform</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 transition-colors"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 pr-12 text-white placeholder-white/40 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 py-3 font-semibold text-white hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Signing in...</> : "Sign In"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-white/50">
            Don&apos;t have an account?{" "}
            <button
              onClick={() => router.push("/nahid/register")}
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Register here
            </button>
          </div>
        </div>

        {/* Demo credentials */}
        <div className="mt-6">
          <p className="mb-3 text-center text-xs text-white/40 uppercase tracking-widest">Quick Demo Access</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {DEMO_CREDENTIALS.map((cred) => (
              <button
                key={cred.role}
                onClick={() => fillDemo(cred)}
                className={`rounded-lg bg-gradient-to-br ${cred.color} px-3 py-2 text-xs font-medium text-white opacity-80 hover:opacity-100 transition-opacity`}
              >
                {cred.role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
