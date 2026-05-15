"use client";

import { useState } from "react";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import type { Cart } from "@/lib/schema/cart";
import type { SelectedOffer } from "@/components/checkout/PlanPicker";
import { formatMoney } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface StickyMobileSummaryProps {
  cart: Cart;
  offer?: SelectedOffer;
}

/**
 * Mockup per Dafne May 15: a compact, condensed mobile-only summary bar
 * that "follows" the user as they scroll. Collapsed state is a thin pill
 * fixed to the top of the viewport showing item count and total. Tap to
 * expand into the full OrderSummary breakdown.
 *
 * Hidden on md+ — desktop already has the sticky sidebar.
 */
export function StickyMobileSummary({ cart, offer }: StickyMobileSummaryProps) {
  const [expanded, setExpanded] = useState(false);

  const itemCount = offer?.itemCount ?? cart.lines.length;
  const totalLabel = formatMoney(cart.totalCents, cart.currency);

  return (
    <div className="md:hidden fixed inset-x-0 top-0 z-40 pointer-events-none">
      <div className="px-3 pt-3 pointer-events-auto">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls="sticky-mobile-summary-panel"
          className={cn(
            "w-full glass-strong rounded-full shadow-card",
            "flex items-center justify-between gap-3 px-4 py-2.5",
            "text-sm font-medium text-slate-900",
            "active:scale-[0.99] transition-transform",
          )}
        >
          <span className="flex items-center gap-2 min-w-0">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand to-savings text-white text-[11px] font-semibold shadow-card shrink-0">
              {itemCount}
            </span>
            <span className="truncate text-slate-700">
              {itemCount} item{itemCount === 1 ? "" : "s"}
              <span className="text-slate-400"> • </span>
              Total
            </span>
          </span>
          <span className="flex items-center gap-2 shrink-0">
            <span className="font-display text-base font-semibold text-slate-900">
              {totalLabel}
            </span>
            <span
              className={cn(
                "text-brand-ink transition-transform",
                expanded && "rotate-180",
              )}
              aria-hidden="true"
            >
              ▾
            </span>
          </span>
        </button>

        {expanded && (
          <div
            id="sticky-mobile-summary-panel"
            className="mt-2 max-h-[75vh] overflow-y-auto rounded-2xl"
          >
            <OrderSummary
              cart={cart}
              offer={offer}
              sticky={false}
              mobileDefaultOpen={true}
            />
          </div>
        )}
      </div>

      {expanded && (
        <button
          type="button"
          aria-label="Close order summary"
          onClick={() => setExpanded(false)}
          className="pointer-events-auto fixed inset-0 -z-10 bg-slate-900/20 backdrop-blur-[2px]"
        />
      )}
    </div>
  );
}
