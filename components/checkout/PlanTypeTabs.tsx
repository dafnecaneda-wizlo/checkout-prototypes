"use client";

import { cn } from "@/lib/utils";

export type PlanType = "subscription" | "one-time" | "bundle";

export const PLAN_TYPES: { id: PlanType; label: string }[] = [
  { id: "subscription", label: "Subscription" },
  { id: "one-time", label: "One-Time" },
  { id: "bundle", label: "Bundle" },
];

interface PlanTypeTabsProps {
  selected: PlanType;
  onChange: (plan: PlanType) => void;
}

export function PlanTypeTabs({ selected, onChange }: PlanTypeTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Plan type"
      className="glass inline-flex rounded-full p-1 shadow-card"
    >
      {PLAN_TYPES.map((t) => {
        const active = t.id === selected;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(t.id)}
            className={cn(
              "px-5 sm:px-6 h-10 rounded-full text-sm font-medium transition-all",
              active
                ? "bg-gradient-to-br from-brand to-savings text-white shadow-glow"
                : "text-slate-700 hover:text-brand-ink",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
