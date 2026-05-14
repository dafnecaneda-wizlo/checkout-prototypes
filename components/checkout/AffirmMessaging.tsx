"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/utils";
import { AffirmInfoModal } from "./AffirmInfoModal";

/**
 * Affirm BNPL promotional messaging at four placements, mirroring what
 * Stripe's PaymentMethodMessagingElement supports natively (and what
 * Gr4vy cannot). Reference prototype: ../../../BNPL-promotional-messaging-.
 *
 * Per Kevin (Apr 29 meeting) + Johnny (May 12 meeting): BNPL messaging
 * should not only sit on the payment page. It surfaces wherever a
 * shopper is weighing price, so they decide faster.
 */
export type AffirmPlacement = "banner" | "product" | "summary" | "payment";

interface AffirmMessagingProps {
  totalCents: number;
  placement?: AffirmPlacement;
}

export function AffirmMessaging({
  totalCents,
  placement = "payment",
}: AffirmMessagingProps) {
  const [open, setOpen] = useState(false);
  const openModal = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setOpen(true);
  };

  let body: React.ReactNode;
  if (placement === "banner") body = <AffirmBanner totalCents={totalCents} onLearnMore={openModal} />;
  else if (placement === "product") body = <AffirmProduct totalCents={totalCents} onLearnMore={openModal} />;
  else if (placement === "summary") body = <AffirmSummary totalCents={totalCents} onLearnMore={openModal} />;
  else body = <AffirmPayment totalCents={totalCents} onLearnMore={openModal} />;

  return (
    <>
      {body}
      <AffirmInfoModal
        open={open}
        totalCents={totalCents}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

function AffirmPayment({
  totalCents,
  onLearnMore,
}: {
  totalCents: number;
  onLearnMore: (e: React.MouseEvent) => void;
}) {
  const installmentCents = Math.round(totalCents / 4);
  return (
    <div className="flex items-start gap-3 rounded-xl glass-dim border border-white/40 p-3.5">
      <AffirmBadge />
      <div className="text-sm text-slate-700 leading-snug">
        <p>
          <strong className="font-semibold text-slate-900">4 interest-free payments</strong>{" "}
          of{" "}
          <strong className="font-semibold text-slate-900">
            {formatMoney(installmentCents, "USD")}
          </strong>{" "}
          with Affirm.
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          No impact to credit score. Subject to eligibility.{" "}
          <button
            type="button"
            onClick={onLearnMore}
            className="text-brand-ink font-medium hover:underline"
          >
            Learn more
          </button>
        </p>
      </div>
    </div>
  );
}

/**
 * Inline placement for product (bundle) cards. Short copy, one line,
 * mirrors Stripe's compact element under a price.
 */
function AffirmProduct({
  totalCents,
  onLearnMore,
}: {
  totalCents: number;
  onLearnMore: (e: React.MouseEvent) => void;
}) {
  const monthlyCents = Math.round(totalCents / 12);
  return (
    <p className="text-xs text-slate-600 mt-1">
      <AffirmBadge inline /> As low as{" "}
      <strong className="text-slate-900">
        {formatMoney(monthlyCents, "USD")}/mo
      </strong>{" "}
      with{" "}
      <button
        type="button"
        onClick={onLearnMore}
        className="text-brand-ink font-medium hover:underline"
      >
        Affirm
      </button>
      .
    </p>
  );
}

/** Order-summary placement. Sits near "Due Today". */
function AffirmSummary({
  totalCents,
  onLearnMore,
}: {
  totalCents: number;
  onLearnMore: (e: React.MouseEvent) => void;
}) {
  const installmentCents = Math.round(totalCents / 4);
  return (
    <button
      type="button"
      onClick={onLearnMore}
      className="block w-full text-left rounded-xl glass-dim border border-white/40 p-3 mt-3 hover:border-brand/40 transition-colors"
    >
      <p className="text-xs text-slate-700 leading-snug">
        <AffirmBadge inline /> Or pay in{" "}
        <strong className="text-slate-900">
          4 of {formatMoney(installmentCents, "USD")}
        </strong>{" "}
        with Affirm.{" "}
        <span className="text-brand-ink font-medium underline">
          See plans →
        </span>
      </p>
    </button>
  );
}

/**
 * Site-wide marketing strip. This is the placement Kevin specifically
 * called out on Apr 29: a promotional banner that is not tied to any
 * product page ("you can get 18 months…").
 */
function AffirmBanner({
  totalCents,
  onLearnMore,
}: {
  totalCents: number;
  onLearnMore: (e: React.MouseEvent) => void;
}) {
  const monthlyCents = Math.round(totalCents / 18);
  return (
    <div className="glass rounded-2xl px-5 py-4 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center h-8 px-2 rounded bg-violet-50 text-violet-700 text-xs font-bold tracking-wider">
            affirm
          </span>
          <p className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
            Spread payments up to 18 months.
          </p>
        </div>
        <div className="h-px sm:h-6 sm:w-px bg-white/60 sm:mx-1" />
        <p className="text-xs sm:text-sm text-slate-700 leading-snug flex-1">
          As low as{" "}
          <strong className="text-slate-900 font-semibold">
            {formatMoney(monthlyCents, "USD")}/mo
          </strong>
          . Soft credit check at checkout, no impact to your score.
        </p>
        <button
          type="button"
          onClick={onLearnMore}
          className="self-start sm:self-auto text-xs font-medium text-brand-ink hover:underline whitespace-nowrap"
        >
          Learn more →
        </button>
      </div>
    </div>
  );
}

function AffirmBadge({ inline = false }: { inline?: boolean }) {
  if (inline) {
    return (
      <span className="inline-block align-middle h-4 px-1.5 rounded bg-violet-50 text-violet-700 text-[10px] font-bold tracking-wider mr-1">
        affirm
      </span>
    );
  }
  return (
    <span className="shrink-0 inline-flex items-center justify-center h-7 px-2 rounded bg-violet-50 text-violet-700 text-[11px] font-bold tracking-wider">
      affirm
    </span>
  );
}
