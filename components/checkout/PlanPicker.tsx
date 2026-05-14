"use client";

import { useMemo } from "react";
import type { PlanType } from "./PlanTypeTabs";
import {
  BundleCard,
  SAMPLE_BUNDLES,
  type BundleOption,
} from "./BundleCard";
import {
  SubscriptionCard,
  SAMPLE_SUBSCRIPTIONS,
  type SubscriptionPlan,
} from "./SubscriptionCard";
import {
  OneTimeCard,
  SAMPLE_ONE_TIME,
  type OneTimeProduct,
} from "./OneTimeCard";

/**
 * Unified selection model across the three plan-type tabs. The selected
 * offer always carries enough data for the order summary / checkout total,
 * so downstream code never has to branch on planType.
 */
export interface SelectedOffer {
  type: PlanType;
  id: string;
  name: string;
  description: string;
  /** Charged at checkout. For subscriptions, this is the first cycle. */
  priceCents: number;
  /** Optional recurring cycle copy for the order summary. */
  recurringNote?: string;
  /** Savings to render in the order summary "You save" line. */
  savingsCents?: number;
  /** First product image, surfaced as the order-summary thumbnail. */
  image?: string;
  /** Number of distinct items in this offer (for the "X items included" pill). */
  itemCount: number;
}

interface PlanPickerProps {
  planType: PlanType;
  selectedId: string;
  onSelect: (id: string) => void;
}

const HEADINGS: Record<PlanType, { icon: string; label: string; intro: string }> = {
  subscription: {
    icon: "🔁",
    label: "Choose Your Plan",
    intro: "Recurring shipments. Lower per-month price. Cancel anytime.",
  },
  "one-time": {
    icon: "📦",
    label: "Choose a One-Time Order",
    intro: "Single shipment. No subscription. Upgrade to a plan later.",
  },
  bundle: {
    icon: "🎁",
    label: "Choose Your Bundle",
    intro: "Multi-product packages with the steepest savings.",
  },
};

export function PlanPicker({ planType, selectedId, onSelect }: PlanPickerProps) {
  const heading = HEADINGS[planType];
  return (
    <section>
      <header className="mb-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <span aria-hidden>{heading.icon}</span> {heading.label}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">{heading.intro}</p>
      </header>
      <div className="space-y-3">
        {planType === "subscription" &&
          SAMPLE_SUBSCRIPTIONS.map((p) => (
            <SubscriptionCard
              key={p.id}
              plan={p}
              selected={p.id === selectedId}
              onSelect={() => onSelect(p.id)}
            />
          ))}
        {planType === "one-time" &&
          SAMPLE_ONE_TIME.map((p) => (
            <OneTimeCard
              key={p.id}
              product={p}
              selected={p.id === selectedId}
              onSelect={() => onSelect(p.id)}
            />
          ))}
        {planType === "bundle" &&
          SAMPLE_BUNDLES.map((b) => (
            <BundleCard
              key={b.id}
              bundle={b}
              selected={b.id === selectedId}
              onSelect={() => onSelect(b.id)}
            />
          ))}
      </div>
    </section>
  );
}

/** Default selected id when switching into a tab. */
export const DEFAULT_SELECTION: Record<PlanType, string> = {
  subscription: SAMPLE_SUBSCRIPTIONS.find((p) => p.tag === "MOST POPULAR")!.id,
  "one-time": SAMPLE_ONE_TIME[0].id,
  bundle: SAMPLE_BUNDLES.find((b) => b.tag === "BEST VALUE")!.id,
};

/** Resolve the currently selected offer regardless of tab. */
export function resolveOffer(planType: PlanType, id: string): SelectedOffer {
  if (planType === "subscription") {
    const p =
      SAMPLE_SUBSCRIPTIONS.find((s) => s.id === id) ?? SAMPLE_SUBSCRIPTIONS[0];
    return subscriptionToOffer(p);
  }
  if (planType === "one-time") {
    const p = SAMPLE_ONE_TIME.find((s) => s.id === id) ?? SAMPLE_ONE_TIME[0];
    return oneTimeToOffer(p);
  }
  const b = SAMPLE_BUNDLES.find((s) => s.id === id) ?? SAMPLE_BUNDLES[0];
  return bundleToOffer(b);
}

function subscriptionToOffer(plan: SubscriptionPlan): SelectedOffer {
  const recurringNote =
    plan.cadence === "monthly"
      ? "Then billed monthly. Cancel anytime."
      : plan.cadence === "quarterly"
      ? "Then billed every 3 months. Cancel anytime."
      : "Then billed annually. Cancel anytime.";
  return {
    type: "subscription",
    id: plan.id,
    name: plan.name,
    description: plan.description,
    priceCents: plan.cyclePriceCents,
    recurringNote,
    image: plan.image,
    itemCount: 1,
  };
}

function oneTimeToOffer(product: OneTimeProduct): SelectedOffer {
  return {
    type: "one-time",
    id: product.id,
    name: product.name,
    description: product.description,
    priceCents: product.priceCents,
    recurringNote: "One-time payment. No recurring charges.",
    image: product.image,
    itemCount: 1,
  };
}

function bundleToOffer(bundle: BundleOption): SelectedOffer {
  return {
    type: "bundle",
    id: bundle.id,
    name: bundle.name,
    description: bundle.description,
    priceCents: bundle.priceCents,
    savingsCents: bundle.savingsCents,
    image: bundle.items[0]?.image,
    itemCount: bundle.items.length,
    recurringNote: "One-time bundle. Reorder any time.",
  };
}

/** Convenience hook-shape memo wrapper for consumers. */
export function useSelectedOffer(planType: PlanType, id: string) {
  return useMemo(() => resolveOffer(planType, id), [planType, id]);
}
