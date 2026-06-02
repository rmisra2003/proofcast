import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center gap-1.5 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2.5 text-xs font-semibold text-cyan-100",
        className
      )}
      {...props}
    />
  );
}
