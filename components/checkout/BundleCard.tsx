"use client";

import { cn, formatMoney } from "@/lib/utils";
import { AffirmMessaging } from "./AffirmMessaging";

export type BundleTag = "BEST VALUE" | "MOST POPULAR" | "WE RECOMMEND";

export interface BundleItem {
  name: string;
  dosage: string;
  image?: string;
}

export interface BundleOption {
  id: string;
  name: string;
  description: string;
  items: BundleItem[];
  priceCents: number;
  savingsCents?: number;
  tag?: BundleTag;
}

interface BundleCardProps {
  bundle: BundleOption;
  selected: boolean;
  onSelect: () => void;
}

/**
 * Bundle selection card. Visual reference: InstaRx "Choose Your Bundle"
 * mockup shared 2026-05-13. Each card carries a radio, a tag, a row of
 * vial mini-cards, and a price + savings pill.
 */
export function BundleCard({ bundle, selected, onSelect }: BundleCardProps) {
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
            {selected && (
              <span className="h-2.5 w-2.5 rounded-full bg-brand" />
            )}
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-900 leading-tight">
              {bundle.name}
            </h3>
            <p className="text-sm text-slate-600 mt-1 leading-snug">
              {bundle.description}
            </p>
          </div>
        </div>
        {bundle.tag && (
          <span className="shrink-0 text-[10px] uppercase tracking-[0.12em] font-semibold bg-brand-muted text-brand-ink px-2.5 py-1 rounded-full">
            {bundle.tag}
          </span>
        )}
      </header>

      {bundle.items.length === 1 ? (
        <div className="grid grid-cols-[8rem_minmax(0,1fr)] sm:grid-cols-[13rem_minmax(0,1fr)] gap-3 sm:gap-4 items-center mt-3">
          <div className="rounded-2xl border border-stone-100 bg-stone-50/40 p-4 text-center">
            <VialIcon image={bundle.items[0].image} large />
            <p className="text-sm font-medium text-slate-900 mt-2">
              {bundle.items[0].name}
            </p>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-semibold text-slate-900 tracking-tight">
                {formatMoney(bundle.priceCents, "USD")}
              </span>
              {bundle.savingsCents && bundle.savingsCents > 0 && (
                <span className="text-[11px] font-medium bg-savings-muted text-savings-ink px-2 py-0.5 rounded-full">
                  Save {formatMoney(bundle.savingsCents, "USD")}
                </span>
              )}
            </div>
            <AffirmMessaging totalCents={bundle.priceCents} placement="product" />
            <p className="text-[11px] text-savings-ink mt-2 bg-savings-muted rounded-full inline-block px-2 py-0.5 font-medium">
              {bundle.items[0].dosage}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div
            className={cn(
              "grid gap-2 mt-3 mb-4",
              bundle.items.length === 2 && "grid-cols-2 max-w-md",
              bundle.items.length >= 3 && "grid-cols-3",
            )}
          >
            {bundle.items.map((item, i) => (
              <div
                key={`${item.name}-${i}`}
                className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-center"
              >
                <VialIcon image={item.image} />
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {item.name}
                </p>
                <p className="text-[11px] text-savings-ink mt-1.5 bg-savings-muted rounded-full inline-block px-2 py-0.5 font-medium">
                  {item.dosage}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-savings">
              {formatMoney(bundle.priceCents, "USD")}
            </span>
            {bundle.savingsCents && bundle.savingsCents > 0 && (
              <span className="text-[11px] font-semibold bg-savings-muted text-savings-ink px-2 py-0.5 rounded">
                Save {formatMoney(bundle.savingsCents, "USD")}
              </span>
            )}
          </div>
          <AffirmMessaging totalCents={bundle.priceCents} placement="product" />
        </>
      )}
    </div>
  );
}

function VialIcon({ image, large = false }: { image?: string; large?: boolean }) {
  if (image) {
    return (
      <div
        className={cn(
          "mx-auto rounded-lg overflow-hidden bg-white border border-slate-200",
          large ? "h-32 w-32" : "h-20 w-20",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }
  return (
    <div
      className={cn(
        "mx-auto rounded-md bg-gradient-to-b from-slate-100 to-slate-200 relative",
        large ? "h-28 w-20" : "h-16 w-12",
      )}
    >
      <span className="absolute top-1.5 left-1/2 -translate-x-1/2 h-2 w-5 rounded-sm bg-slate-400/70" />
      <span className="absolute top-3.5 left-1/2 -translate-x-1/2 h-3 w-6 rounded-sm bg-slate-500/80" />
      <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-7 w-8 rounded-md bg-white border border-slate-200" />
      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 h-2 w-6 bg-emerald-100/80" />
    </div>
  );
}

/**
 * Sample bundles. In production these come from the product catalog.
 * Modeled on the InstaRx GLP-1 reference (semaglutide + tirzepatide).
 */
const GLP1_IMG = "/products/glp1-vial.png";
const NAD_IMG = "/products/nad.webp";

export const SAMPLE_BUNDLES: BundleOption[] = [
  {
    id: "sema-single",
    name: "Semaglutide Starter",
    description:
      "Single-dose introduction for new patients beginning their GLP-1 journey.",
    items: [{ name: "Semaglutide", dosage: "1 mg / 0.5 mL", image: GLP1_IMG }],
    priceCents: 14900,
    savingsCents: 2000,
  },
  {
    id: "starter",
    name: "Weight Loss Starter Bundle",
    description:
      "Everything you need to begin your GLP-1 journey. Semaglutide to start, tirzepatide to advance.",
    items: [
      { name: "Semaglutide", dosage: "1 mg / 0.5 mL", image: GLP1_IMG },
      { name: "Tirzepatide", dosage: "5 mg / 0.5 mL", image: NAD_IMG },
    ],
    priceCents: 34900,
    savingsCents: 4700,
    tag: "BEST VALUE",
  },
  {
    id: "tirz-progression",
    name: "Tirzepatide Progression Bundle",
    description:
      "A structured 3-month tirzepatide progression from starter to maintenance dose.",
    items: [
      { name: "Tirzepatide", dosage: "5 mg / 0.5 mL", image: NAD_IMG },
      { name: "Tirzepatide", dosage: "10 mg / 0.5 mL", image: GLP1_IMG },
      { name: "Tirzepatide", dosage: "15 mg / 0.5 mL", image: NAD_IMG },
    ],
    priceCents: 64900,
    savingsCents: 9500,
  },
  {
    id: "sema-maintenance",
    name: "Semaglutide Maintenance Bundle",
    description:
      "Three months of semaglutide at a steady maintenance dose. Best for established patients.",
    items: [
      { name: "Semaglutide", dosage: "1 mg / 0.5 mL", image: GLP1_IMG },
      { name: "Semaglutide", dosage: "1 mg / 0.5 mL", image: GLP1_IMG },
      { name: "Semaglutide", dosage: "1 mg / 0.5 mL", image: GLP1_IMG },
    ],
    priceCents: 39900,
    savingsCents: 6000,
    tag: "MOST POPULAR",
  },
];
