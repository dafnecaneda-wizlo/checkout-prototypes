"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface AccordionSectionProps {
  title: string;
  step: number;
  state: "open" | "summary" | "locked";
  summary?: ReactNode;
  onEdit?: () => void;
  children: ReactNode;
}

export function AccordionSection({
  title,
  step,
  state,
  summary,
  onEdit,
  children,
}: AccordionSectionProps) {
  return (
    <section
      className={cn(
        "glass rounded-2xl transition-all shadow-card",
        state === "open" && "ring-2 ring-brand/30 shadow-glow",
        state === "locked" && "opacity-60",
      )}
    >
      <header className="flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold",
              state === "open" &&
                "bg-gradient-to-br from-brand to-savings text-white shadow-card",
              state === "summary" && "bg-savings-muted text-savings-ink",
              state === "locked" && "bg-white/40 text-slate-500",
            )}
          >
            {state === "summary" ? "✓" : step}
          </span>
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">{title}</h2>
        </div>
        {state === "summary" && (
          <button
            type="button"
            onClick={onEdit}
            className="text-xs font-medium text-brand-ink hover:underline"
          >
            Edit
          </button>
        )}
      </header>
      {state === "open" && (
        <div className="px-5 pb-5 space-y-4">{children}</div>
      )}
      {state === "summary" && summary && (
        <div className="px-5 pb-4 text-sm text-slate-700">
          {summary}
        </div>
      )}
    </section>
  );
}
