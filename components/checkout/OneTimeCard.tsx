"use client";

import { cn, formatMoney } from "@/lib/utils";
import { AffirmMessaging } from "./AffirmMessaging";

export interface OneTimeProduct {
  id: string;
  name: string;
  description: string;
  productName: string;
  dosage: string;
  image: string;
  priceCents: number;
  badge?: "Try this first" | "Single use" | "No commitment";
  perks: string[];
}

interface OneTimeCardProps {
  product: OneTimeProduct;
  selected: boolean;
  onSelect: () => void;
}

export function OneTimeCard({ product, selected, onSelect }: OneTimeCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "glass w-full text-left rounded-2xl p-5 sm:p-6 transition-all shadow-card",
        "hover:shadow-cardLift hover:-translate-y-0.5",
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
              {product.name}
            </h3>
            <p className="text-sm text-slate-600 mt-1 leading-snug">
              {product.description}
            </p>
          </div>
        </div>
        {product.badge && (
          <span className="shrink-0 text-[10px] uppercase tracking-[0.12em] font-semibold bg-stone-100 text-slate-700 px-2.5 py-1 rounded-full">
            {product.badge}
          </span>
        )}
      </header>

      <div className="grid grid-cols-[1fr_8rem] gap-4 items-center mt-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-semibold text-slate-900 tracking-tight">
              {formatMoney(product.priceCents, "USD")}
            </span>
            <span className="text-xs text-slate-500">one-time</span>
          </div>
          <p className="text-xs text-slate-500 mt-1.5">
            Single shipment · No recurring charges
          </p>
          <AffirmMessaging
            totalCents={product.priceCents}
            placement="product"
          />
        </div>
        <div className="rounded-2xl border border-stone-100 bg-stone-50/40 p-3 text-center">
          <div className="mx-auto h-20 w-20 rounded-lg overflow-hidden bg-white border border-stone-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <p className="text-sm font-medium text-slate-900 mt-1">
            {product.productName}
          </p>
          <p className="text-[11px] text-savings-ink mt-1.5 bg-savings-muted rounded-full inline-block px-2 py-0.5 font-medium">
            {product.dosage}
          </p>
        </div>
      </div>

      <ul className="mt-5 grid sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[12.5px] text-slate-600 pt-4 border-t border-stone-100">
        {product.perks.map((p) => (
          <li key={p} className="flex items-start gap-1.5">
            <span aria-hidden className="text-brand mt-0.5">✓</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}

const GLP1_IMG = "/products/glp1-vial.png";
const NAD_IMG = "/products/nad.webp";

export const SAMPLE_ONE_TIME: OneTimeProduct[] = [
  {
    id: "ot-sema-4wk",
    name: "Semaglutide · 4-week supply",
    description: "Try semaglutide for four weeks before deciding on a longer plan.",
    productName: "Semaglutide",
    dosage: "1 mg / 0.5 mL",
    image: GLP1_IMG,
    priceCents: 18900,
    badge: "Try this first",
    perks: [
      "Single shipment",
      "No subscription required",
      "Provider consult included",
      "Upgrade to a plan any time",
    ],
  },
  {
    id: "ot-tirz-4wk",
    name: "Tirzepatide · 4-week supply",
    description: "A four-week course of tirzepatide for patients ready for a stronger GLP-1.",
    productName: "Tirzepatide",
    dosage: "5 mg / 0.5 mL",
    image: NAD_IMG,
    priceCents: 28900,
    badge: "No commitment",
    perks: [
      "Single shipment",
      "Provider supervision",
      "Cold-chain shipping",
      "Free upgrade path",
    ],
  },
  {
    id: "ot-consult",
    name: "Standalone Provider Consult",
    description: "Async telehealth visit if you just want a medical opinion before buying.",
    productName: "Consult",
    dosage: "Async visit",
    image: NAD_IMG,
    priceCents: 4900,
    badge: "Single use",
    perks: [
      "Same-day provider review",
      "Written care plan",
      "Eligible for HSA / FSA",
      "Counts toward any future plan",
    ],
  },
];
