import { cn, riskBadgeClass } from "@/lib/utils";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn("badge", className)}>{children}</span>;
}

export function RiskBadge({ level }: { level: string }) {
  return (
    <span className={cn("badge capitalize", riskBadgeClass(level))}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {level}
    </span>
  );
}
