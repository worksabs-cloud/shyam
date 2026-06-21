import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function currency(n: number | null | undefined): string {
  if (n == null) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function numberFmt(n: number | null | undefined): string {
  if (n == null) return "0";
  return new Intl.NumberFormat("en-US").format(n);
}

export const RISK_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
  none: "#94a3b8",
};

export const EXPIRY_COLORS: Record<string, string> = {
  expired: "#7f1d1d",
  critical: "#ef4444",
  warning: "#eab308",
  safe: "#22c55e",
  unknown: "#94a3b8",
};

export function riskBadgeClass(level: string): string {
  switch (level) {
    case "critical":
      return "bg-red-100 text-red-700";
    case "high":
      return "bg-orange-100 text-orange-700";
    case "medium":
      return "bg-yellow-100 text-yellow-700";
    case "low":
      return "bg-green-100 text-green-700";
    case "warning":
      return "bg-yellow-100 text-yellow-700";
    case "safe":
      return "bg-green-100 text-green-700";
    case "expired":
      return "bg-red-200 text-red-900";
    default:
      return "bg-slate-100 text-slate-600";
  }
}
