"use client";

import { useState } from "react";
import { cn, formatMoney } from "@/lib/utils";

export interface ProductOption {
  id: string;
  name: string;
  cadence: string;
  dosage?: string;
  priceCents: number;
  originalCents?: number;
  tag?: "Most popular" | "Best value" | "Save 15%" | "We recommend";
  bullets?: string[];
}

interface ProductPillsProps {
  options: ProductOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

/**
 * Product boxes (the "pills") from the May 5 brainstorm. Stakeholders
 * specifically asked for these to come back. Image area is left visual-only
 * for the prototype; product photography wires in once design approves.
 */
export function ProductPills({ options, selectedId, onSelect }: ProductPillsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {options.map((o) => {
        const selected = o.id === selectedId;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onSelect(o.id)}
            className={cn(
              "relative text-left bg-white border rounded-xl p-4 transition-all",
              "hover:border-brand hover:shadow-sm",
              selected
                ? "border-brand ring-2 ring-brand/30 shadow-sm"
                : "border-slate-200",
            )}
          >
            {o.tag && (
              <span className="absolute -top-2 left-3 text-[10px] uppercase tracking-wide bg-brand text-brand-fg px-2 py-0.5 rounded-full font-semibold">
                {o.tag}
              </span>
            )}
            <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg mb-3 flex items-center justify-center text-slate-400 text-xs">
              product image
            </div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="text-sm font-semibold text-slate-900">{o.name}</h3>
              <span
                className={cn(
                  "h-4 w-4 rounded-full border-2 flex items-center justify-center",
                  selected ? "border-brand bg-brand" : "border-slate-300",
                )}
              >
                {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-2">{o.cadence}</p>
            {o.dosage && (
              <p className="text-[11px] text-slate-400 mb-2">{o.dosage}</p>
            )}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-base font-semibold text-slate-900">
                {formatMoney(o.priceCents, "USD")}
              </span>
              {o.originalCents && o.originalCents > o.priceCents && (
                <span className="text-xs text-slate-400 line-through">
                  {formatMoney(o.originalCents, "USD")}
                </span>
              )}
            </div>
            {o.bullets && (
              <ul className="text-[11px] text-slate-500 space-y-0.5">
                {o.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Sample cadence options for the prototype. In production these come from
 * the product catalog. Kept here so designers can tweak copy in isolation.
 */
export const SAMPLE_PRODUCT_OPTIONS: ProductOption[] = [
  {
    id: "sema-1mo",
    name: "Monthly",
    cadence: "Ships every month",
    dosage: "0.25 mg starter dose",
    priceCents: 29500,
  },
  {
    id: "sema-3mo",
    name: "3 month bundle",
    cadence: "Ships every 3 months",
    dosage: "Titrating to 1 mg",
    priceCents: 76500,
    originalCents: 90000,
    tag: "Most popular",
  },
  {
    id: "sema-6mo",
    name: "6 month bundle",
    cadence: "Ships every 6 months",
    dosage: "Full titration plan",
    priceCents: 144000,
    originalCents: 180000,
    tag: "Best value",
  },
];

/**
 * Lightweight version of ProductPills that hooks into a useState
 * outside the component. Convenience wrapper for the two checkout pages.
 */
export function useProductSelection(initialId: string) {
  const [selected, setSelected] = useState(initialId);
  return { selected, setSelected };
}
