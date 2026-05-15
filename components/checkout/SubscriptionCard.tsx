"use client";

import { cn, formatMoney } from "@/lib/utils";
import { AffirmMessaging } from "./AffirmMessaging";

export type SubscriptionTag = "BEST VALUE" | "MOST POPULAR";
export type Cadence = "monthly" | "quarterly" | "annual";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  productName: string;
  dosage: string;
  image: string;
  cadence: Cadence;
  /** Price billed per cycle (e.g. $149/mo, $399/3-mo, $1499/yr) */
  cyclePriceCents: number;
  /** Effective monthly price for marketing comparison */
  monthlyPriceCents: number;
  /** Total saved per year vs monthly */
  yearlySavingsCents?: number;
  tag?: SubscriptionTag;
  perks: string[];
}

const CADENCE_LABEL: Record<Cadence, string> = {
  monthly: "Billed monthly",
  quarterly: "Billed every 3 months",
  annual: "Billed once a year",
};

const CADENCE_SUFFIX: Record<Cadence, string> = {
  monthly: "/mo",
  quarterly: "/3 mo",
  annual: "/yr",
};

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  selected: boolean;
  onSelect: () => void;
}

export function SubscriptionCard({ plan, selected, onSelect }: SubscriptionCardProps) {
  return (
    <div
      role="radio"
      tabIndex={0}
      aria-checked={selected}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "glass w-full text-left rounded-2xl p-5 sm:p-6 transition-all shadow-card cursor-pointer",
        "hover:shadow-cardLift hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-brand/40",
        selected && "ring-2 ring-brand/40 shadow-glow",
      )}
    >
      <header className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-start gap-3 min-w-0">
          <span
            aria-hidden
            className={cn(
              "mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center",
              selected ? "border-brand" : "border-stone-300",
            )}
          >
            {selected && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-900 leading-tight">
              {plan.name}
            </h3>
            <p className="text-sm text-slate-600 mt-1 leading-snug">
              {plan.description}
            </p>
          </div>
        </div>
        {plan.tag && (
          <span className="shrink-0 text-[10px] uppercase tracking-[0.12em] font-semibold bg-brand-muted text-brand-ink px-2.5 py-1 rounded-full">
            {plan.tag}
          </span>
        )}
      </header>

      <div className="flex flex-col sm:grid sm:grid-cols-[13rem_minmax(0,1fr)] sm:items-center gap-3 sm:gap-4 mt-3">
        <div className="rounded-2xl border border-stone-100 bg-stone-50/40 p-4 text-center">
          <div className="mx-auto h-32 w-32 rounded-lg overflow-hidden bg-white border border-stone-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={plan.image}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <p className="text-sm font-medium text-slate-900 mt-2">
            {plan.productName}
          </p>
          <p className="text-[11px] text-savings-ink mt-1.5 bg-savings-muted rounded-full inline-block px-2 py-0.5 font-medium">
            {plan.dosage}
          </p>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-3xl font-display font-semibold text-slate-900 tracking-tight">
              {formatMoney(plan.cyclePriceCents, "USD")}
            </span>
            <span className="text-sm font-medium text-slate-500">
              {CADENCE_SUFFIX[plan.cadence]}
            </span>
          </div>
          {plan.cadence !== "monthly" && (
            <p className="text-xs text-slate-500 mt-0.5">
              Just{" "}
              <strong className="text-slate-700">
                {formatMoney(plan.monthlyPriceCents, "USD")}/mo
              </strong>{" "}
              effective rate
            </p>
          )}
          <p className="text-xs text-slate-500 mt-1.5">
            {CADENCE_LABEL[plan.cadence]} · Cancel anytime
          </p>
          {plan.yearlySavingsCents && plan.yearlySavingsCents > 0 && (
            <p className="text-[11px] text-savings-ink mt-2 bg-savings-muted rounded-full inline-block px-2.5 py-0.5 font-medium">
              Save {formatMoney(plan.yearlySavingsCents, "USD")} / year
            </p>
          )}
          <AffirmMessaging
            totalCents={plan.cyclePriceCents}
            placement="product"
          />
        </div>
      </div>

      <ul className="mt-5 grid sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[12.5px] text-slate-600 pt-4 border-t border-stone-100">
        {plan.perks.map((p) => (
          <li key={p} className="flex items-start gap-1.5">
            <span aria-hidden className="text-brand mt-0.5">✓</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const GLP1_IMG = "/products/glp1-vial.png";

export const SAMPLE_SUBSCRIPTIONS: SubscriptionPlan[] = [
  {
    id: "sub-monthly",
    name: "Monthly Plan",
    description: "Flexible month-to-month. Pause or cancel any time from your dashboard.",
    productName: "Semaglutide",
    dosage: "1 mg / 0.5 mL",
    image: GLP1_IMG,
    cadence: "monthly",
    cyclePriceCents: 14900,
    monthlyPriceCents: 14900,
    perks: [
      "Ships every month",
      "Cancel anytime",
      "Provider check-ins included",
      "Free shipping",
    ],
  },
  {
    id: "sub-quarterly",
    name: "Quarterly Plan",
    description: "Ships every 3 months. Best for patients who have settled on a dose.",
    productName: "Semaglutide",
    dosage: "1 mg / 0.5 mL",
    image: GLP1_IMG,
    cadence: "quarterly",
    cyclePriceCents: 39900,
    monthlyPriceCents: 13300,
    yearlySavingsCents: 19200,
    tag: "MOST POPULAR",
    perks: [
      "Ships every 3 months",
      "Save 11% vs monthly",
      "Lock in your dose for a quarter",
      "Free shipping",
    ],
  },
  {
    id: "sub-annual",
    name: "Annual Plan",
    description: "Pay once a year. Lowest effective price for committed patients.",
    productName: "Semaglutide",
    dosage: "1 mg / 0.5 mL",
    image: GLP1_IMG,
    cadence: "annual",
    cyclePriceCents: 149900,
    monthlyPriceCents: 12500,
    yearlySavingsCents: 28800,
    tag: "BEST VALUE",
    perks: [
      "12 months of shipments",
      "Save 16% vs monthly",
      "Priority provider access",
      "Free shipping + Affirm available",
    ],
  },
];
