"use client";

import { useEffect } from "react";
import { formatMoney } from "@/lib/utils";

interface AffirmInfoModalProps {
  open: boolean;
  totalCents: number;
  onClose: () => void;
}

/**
 * Inline explainer modal that opens from any Affirm "Learn more" affordance.
 * In production this is replaced by Affirm's hosted modal SDK; here we
 * present the same plan breakdown so the demo flow feels real.
 */
export function AffirmInfoModal({ open, totalCents, onClose }: AffirmInfoModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const plans = [
    { months: 4, label: "Pay in 4", apr: "0% APR", note: "Every 2 weeks" },
    { months: 6, label: "6 months", apr: "0-36% APR", note: "Monthly" },
    { months: 12, label: "12 months", apr: "10-36% APR", note: "Monthly" },
    { months: 18, label: "18 months", apr: "10-36% APR", note: "Monthly" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="affirm-info-title"
    >
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full sm:max-w-md glass-strong rounded-t-2xl sm:rounded-2xl shadow-cardLift p-6">
        <header className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center h-9 px-2.5 rounded bg-violet-50 text-violet-700 text-sm font-bold tracking-wider">
              affirm
            </span>
            <h2
              id="affirm-info-title"
              className="font-display text-xl font-semibold tracking-tight text-slate-900"
            >
              Pay over time with Affirm
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="h-8 w-8 rounded-full glass-dim border border-white/50 flex items-center justify-center text-slate-700 hover:text-brand-ink"
          >
            ✕
          </button>
        </header>

        <p className="text-sm text-slate-700 leading-relaxed mb-4">
          Choose the plan that fits your budget. Soft credit check at checkout —
          <strong className="font-semibold"> no impact to your score</strong>.
          Rates from 0–36% APR.
        </p>

        <div className="rounded-xl glass-dim border border-white/40 divide-y divide-white/40 mb-4">
          {plans.map((p) => {
            const monthly = Math.round(totalCents / p.months);
            return (
              <div
                key={p.months}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {p.label}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    {p.note} · {p.apr}
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {formatMoney(monthly, "USD")}
                  <span className="text-xs font-normal text-slate-500">
                    {p.months === 4 ? "/2 wk" : "/mo"}
                  </span>
                </p>
              </div>
            );
          })}
        </div>

        <ul className="text-xs text-slate-600 space-y-1.5 mb-5">
          <li className="flex items-start gap-2">
            <span className="text-brand-ink mt-0.5">✓</span>
            <span>Never any late or hidden fees</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-ink mt-0.5">✓</span>
            <span>Eligibility decided in seconds at checkout</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-ink mt-0.5">✓</span>
            <span>Manage payments in the Affirm app</span>
          </li>
        </ul>

        <button
          type="button"
          onClick={onClose}
          className="w-full h-11 rounded-xl bg-gradient-to-br from-brand to-savings text-white text-sm font-medium shadow-card hover:shadow-cardLift transition-all"
        >
          Got it
        </button>
        <p className="text-[10px] text-slate-500 text-center mt-3 leading-snug">
          Estimates only. Final eligibility, APR, and plan options determined
          by Affirm at checkout.
        </p>
      </div>
    </div>
  );
}
