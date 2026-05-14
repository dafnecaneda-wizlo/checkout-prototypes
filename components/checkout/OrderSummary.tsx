"use client";

import { useState } from "react";
import type { Cart } from "@/lib/schema/cart";
import { formatMoney } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { SelectedOffer } from "@/components/checkout/PlanPicker";
import { AffirmMessaging } from "@/components/checkout/AffirmMessaging";

interface OrderSummaryProps {
  cart: Cart;
  offer?: SelectedOffer;
  sticky?: boolean;
  /**
   * Mobile open state. Per Johnny May 12: the order summary must be
   * displayed expanded at the top on mobile. Defaults to true.
   */
  mobileDefaultOpen?: boolean;
  disabledReason?: string | null;
}

export function OrderSummary({
  cart,
  offer,
  sticky = true,
  mobileDefaultOpen = true,
  disabledReason,
}: OrderSummaryProps) {
  const [openMobile, setOpenMobile] = useState(mobileDefaultOpen);
  const [code, setCode] = useState("");

  const savingsCents =
    offer?.savingsCents ??
    cart.lines.reduce(
      (sum, l) => sum + Math.max(0, (l.originalCents ?? 0) - l.unitCents),
      0,
    );

  const dueLabel = offer?.type === "subscription" ? "Due Today" : "Due Today";

  return (
    <aside
      className={cn(
        "glass-strong rounded-2xl shadow-card",
        sticky && "lg:sticky lg:top-20",
      )}
    >
      <button
        type="button"
        className="lg:hidden w-full flex items-center justify-between px-4 py-3 text-sm font-medium border-b border-white/40"
        onClick={() => setOpenMobile((v) => !v)}
        aria-expanded={openMobile}
      >
        <span>Order Summary</span>
        <span className="flex items-center gap-2">
          <span className="font-semibold">
            {formatMoney(cart.totalCents, cart.currency)}
          </span>
          <span
            className={cn("transition-transform", openMobile && "rotate-180")}
          >
            ▾
          </span>
        </span>
      </button>

      <div className={cn("p-5", !openMobile && "hidden lg:block")}>
        <h3 className="hidden lg:block text-base font-semibold text-slate-900 mb-4">
          Order Summary
        </h3>

        {offer && (
          <div className="flex items-start gap-3 mb-4">
            <div className="h-14 w-14 rounded-lg bg-white border border-white/60 shrink-0 overflow-hidden">
              {offer.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={offer.image}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-slate-400 text-[10px]">
                  vial
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 leading-tight">
                {offer.name}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                {offer.description}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <span className="text-[11px] bg-savings-muted text-savings-ink px-2 py-0.5 rounded-full">
                  {offer.itemCount} item{offer.itemCount > 1 ? "s" : ""} included
                </span>
                <span
                  className={cn(
                    "text-[11px] px-2 py-0.5 rounded-full capitalize",
                    offer.type === "subscription" &&
                      "bg-violet-100 text-violet-700",
                    offer.type === "one-time" && "bg-slate-100 text-slate-700",
                    offer.type === "bundle" && "bg-amber-100 text-amber-800",
                  )}
                >
                  {offer.type === "one-time" ? "One-time" : offer.type}
                </span>
              </div>
            </div>
          </div>
        )}

        <dl className="space-y-2 text-sm border-t border-white/40 pt-3">
          {offer ? (
            <>
              <div className="flex justify-between text-slate-700">
                <dt>{offer.name}</dt>
                <dd>{formatMoney(offer.priceCents, cart.currency)}</dd>
              </div>
              <div className="flex justify-between text-slate-600">
                <dt>Items included</dt>
                <dd>{offer.itemCount}</dd>
              </div>
            </>
          ) : (
            cart.lines.map((l) => (
              <div key={l.id} className="flex justify-between text-slate-700">
                <dt>{l.name}</dt>
                <dd>
                  {l.unitCents === 0
                    ? "Included"
                    : formatMoney(l.unitCents, cart.currency)}
                </dd>
              </div>
            ))
          )}
          {savingsCents > 0 && (
            <div className="flex justify-between text-savings-ink font-medium">
              <dt>You save</dt>
              <dd>- {formatMoney(savingsCents, cart.currency)}</dd>
            </div>
          )}
        </dl>

        <div className="flex justify-between items-baseline border-t border-white/40 pt-3 mt-3">
          <span className="text-base font-semibold text-slate-900">
            {dueLabel}
          </span>
          <span className="text-3xl font-display font-semibold tracking-tight text-slate-900">
            {formatMoney(cart.totalCents, cart.currency)}
          </span>
        </div>

        {offer?.recurringNote && (
          <p className="text-[11px] text-slate-500 mt-1.5">
            {offer.recurringNote}
          </p>
        )}

        <AffirmMessaging totalCents={cart.totalCents} placement="summary" />

        <form
          className="flex gap-2 mt-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Apply Code"
            className="flex-1 min-w-0 h-10 px-3 rounded-lg glass-input border border-white/50 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
          <button
            type="submit"
            className="h-10 px-3 rounded-lg glass border border-white/60 text-sm font-medium text-slate-700 hover:text-brand-ink"
          >
            Apply
          </button>
        </form>

        <div className="mt-4 rounded-xl glass-dim p-3 border border-white/40">
          <p className="text-xs font-semibold text-slate-800">
            Only charged if prescribed by a licensed physician
          </p>
          <p className="text-[11px] text-slate-600 mt-1 leading-snug">
            We&apos;ll securely hold your payment method. You&apos;ll only be
            charged after a doctor reviews your information and prescribes your
            medication.
          </p>
        </div>

        {disabledReason && (
          <button
            type="button"
            disabled
            className="w-full mt-4 h-11 rounded-lg bg-savings/30 text-savings-ink text-sm font-medium cursor-not-allowed"
          >
            {disabledReason}
          </button>
        )}
      </div>
    </aside>
  );
}
