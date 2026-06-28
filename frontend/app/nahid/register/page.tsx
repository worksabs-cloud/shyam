"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pill, ArrowLeft, Loader2 } from "lucide-react";
import { nahidApi, setSession } from "@/lib/nahid-api";

const ROLES = [
  { value: "customer", label: "Customer (B2C)", desc: "Buy medicines for personal use" },
  { value: "pharmacy", label: "Pharmacy (B2B)", desc: "Order medicines wholesale" },
  { value: "supplier", label: "Supplier", desc: "Supply medicines to the platform" },
  { value: "delivery_agent", label: "Delivery Agent", desc: "Deliver orders to customers" },
];

export default function NahidRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "customer",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function redirectByRole(role: string) {
    switch (role) {
      case "customer": router.replace("/nahid/customer"); break;
      case "pharmacy": router.replace("/nahid/pharmacy"); break;
      case "supplier": router.replace("/nahid/supplier"); break;
      case "delivery_agent": router.replace("/nahid/delivery"); break;
      default: router.replace("/nahid/admin");
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await nahidApi.register(form);
      const user = await nahidApi.me();
      setSession(res.access_token, res.refresh_token, user);
      redirectByRole(user.role);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <button
          onClick={() => router.push("/nahid")}
          className="mb-6 flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </button>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500">
              <Pill className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Create Account</h1>
            <p className="text-white/60 mt-1">Join Nahid Pharmacy Platform</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm text-white/70">First Name</label>
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:border-emerald-400 focus:outline-none transition-colors"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-white/70">Last Name</label>
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:border-emerald-400 focus:outline-none transition-colors"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-white/70">Email Address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:border-emerald-400 focus:outline-none transition-colors"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-white/70">Phone (Optional)</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:border-emerald-400 focus:outline-none transition-colors"
                placeholder="+880..."
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-white/70">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:border-emerald-400 focus:outline-none transition-colors"
                placeholder="Min 8 characters"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/70">I am a...</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: role.value })}
                    className={`rounded-lg border p-3 text-left transition-all ${
                      form.role === role.value
                        ? "border-emerald-400 bg-emerald-500/20 text-white"
                        : "border-white/20 bg-white/5 text-white/60 hover:border-white/40"
                    }`}
                  >
                    <div className="font-medium text-sm">{role.label}</div>
                    <div className="text-xs mt-0.5 opacity-70">{role.desc}</div>
                  </button>
                ))}
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
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 py-3 font-semibold text-white hover:bg-emerald-400 disabled:opacity-60 transition-colors"
            >
              {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Creating account...</> : "Create Account"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-white/50">
            Already have an account?{" "}
            <button onClick={() => router.push("/nahid/login")} className="text-emerald-400 hover:text-emerald-300 font-medium">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
