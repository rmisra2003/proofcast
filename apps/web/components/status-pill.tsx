import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatusPill({
  status,
  label
}: {
  status: "ok" | "warn" | "loading";
  label: string;
}) {
  const Icon = status === "ok" ? CheckCircle2 : status === "warn" ? AlertTriangle : Loader2;

  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center gap-2 rounded-full border px-3 text-xs font-semibold",
        status === "ok" && "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
        status === "warn" && "border-amber-300/25 bg-amber-300/10 text-amber-100",
        status === "loading" && "border-white/10 bg-white/10 text-white/70"
      )}
    >
      <Icon size={14} className={status === "loading" ? "animate-spin" : ""} />
      {label}
    </span>
  );
}
