"use client";

import { api, setSession, getToken } from "@/lib/api";
import { Hexagon, Loader2, ShieldCheck, Zap, TrendingDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getToken()) router.replace("/dashboard");
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.login(username, password);
      setSession(res.access_token, { full_name: res.full_name, role: res.role });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink-900 p-12 text-white lg:flex">
        {/* Animated gradient mesh */}
        <div
          className="absolute inset-0 animate-gradient-pan opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(600px 400px at 80% 10%, #0ea5a4 0%, transparent 60%), radial-gradient(500px 400px at 10% 90%, #0891b2 0%, transparent 55%), radial-gradient(700px 500px at 50% 50%, #22d3ee 0%, transparent 60%)",
            backgroundSize: "200% 200%",
          }}
        />
        {/* Floating accent orb */}
        <div className="pointer-events-none absolute -right-20 top-1/3 h-72 w-72 animate-float rounded-full bg-brand-500/20 blur-3xl" />

        <div className="relative flex animate-fade-in-up items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 shadow-glow transition-transform hover:scale-110">
            <Hexagon className="h-6 w-6" fill="currentColor" />
          </div>
          <div className="text-lg font-extrabold">
            MedSupply <span className="text-brand-400">AI</span>
          </div>
        </div>

        <div className="relative">
          {/* Live status pill */}
          <div className="mb-5 inline-flex animate-fade-in-up items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-brand-300 backdrop-blur delay-100">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-brand-400" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" />
            </span>
            AI engine online
          </div>

          <h1 className="animate-fade-in-up text-4xl font-extrabold leading-tight delay-200">
            Pharmacy procurement,
            <br />
            <span className="bg-gradient-to-r from-brand-400 via-brand-300 to-cyan-200 bg-clip-text text-transparent">
              hours → minutes.
            </span>
          </h1>
          <p className="mt-4 max-w-md animate-fade-in-up text-ink-300 delay-300">
            AI-driven inventory intelligence that predicts stockouts, flags dead
            stock and expiry risk, optimizes suppliers, and auto-generates
            purchase orders.
          </p>
          <div className="mt-8 space-y-3 text-sm">
            <Feature icon={Zap} text="Full analysis in under 5 minutes" delay="delay-400" />
            <Feature
              icon={TrendingDown}
              text="Cut stockouts, overstock & expiry losses"
              delay="delay-500"
            />
            <Feature
              icon={ShieldCheck}
              text="Enterprise-grade audit trail"
              delay="delay-700"
            />
          </div>
        </div>

        <div className="relative animate-fade-in text-xs text-ink-500 delay-700">
          © 2026 MedSupply AI · Healthcare Supply Chain Intelligence
        </div>
      </div>

      {/* Login form */}
      <div className="flex items-center justify-center p-8">
        <form onSubmit={handleLogin} className="w-full max-w-sm animate-fade-in-up">
          <div className="mb-8 lg:hidden">
            <div className="text-2xl font-extrabold text-ink-900">
              MedSupply <span className="text-brand-600">AI</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-ink-900">Welcome back</h2>
          <p className="mt-1 text-sm text-ink-500">Sign in to your procurement console</p>

          {error && (
            <div className="mt-4 animate-fade-in-up rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-ink-700">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary group relative mt-6 w-full overflow-hidden py-2.5 transition-transform hover:-translate-y-0.5 hover:shadow-glow active:translate-y-0"
          >
            {/* Shimmer sweep */}
            <span className="pointer-events-none absolute inset-0 -translate-x-full">
              <span className="absolute inset-y-0 left-0 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </span>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </button>

          <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-center text-xs text-ink-500">
            Demo credentials prefilled · <b>admin / admin123</b>
          </div>
        </form>
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  text,
  delay = "",
}: {
  icon: any;
  text: string;
  delay?: string;
}) {
  return (
    <div className={`group flex animate-fade-in-up items-center gap-3 ${delay}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 transition-colors group-hover:bg-brand-500/30">
        <Icon className="h-4 w-4 text-brand-400 transition-transform group-hover:scale-110" />
      </div>
      <span className="text-ink-300 transition-colors group-hover:text-white">{text}</span>
    </div>
  );
}
