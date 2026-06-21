import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  hint,
}: {
  label: string;
  value: string | number;
  icon: any;
  tone?: "default" | "danger" | "warning" | "success" | "brand";
  hint?: string;
}) {
  const tones: Record<string, string> = {
    default: "bg-slate-100 text-ink-700",
    danger: "bg-red-100 text-red-600",
    warning: "bg-orange-100 text-orange-600",
    success: "bg-green-100 text-green-600",
    brand: "bg-brand-50 text-brand-600",
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-ink-500">
            {label}
          </div>
          <div className="mt-2 text-3xl font-extrabold text-ink-900">{value}</div>
          {hint && <div className="mt-1 text-xs text-ink-500">{hint}</div>}
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", tones[tone])}>
          <Icon style={{ width: 20, height: 20 }} />
        </div>
      </div>
    </div>
  );
}
