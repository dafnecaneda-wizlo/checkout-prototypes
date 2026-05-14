import { PREFILLED_SHIPPING } from "@/lib/schema/fields";

/**
 * Read-only shipping address summary. The address is captured upfront
 * in the intake form (Pratik's May 12 call). Checkout shows it pre-filled
 * and offers an Edit affordance that, in production, bounces to the
 * intake review step.
 */
export function PrefilledShipping() {
  return (
    <div className="rounded-xl glass-dim border border-white/40 p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] text-slate-600 font-semibold">
            Ships to
          </p>
          <p className="text-sm font-medium text-slate-900 mt-1">
            {PREFILLED_SHIPPING.name}
          </p>
        </div>
        <button
          type="button"
          className="text-xs font-medium text-brand-ink hover:underline"
        >
          Edit
        </button>
      </div>
      <p className="text-sm text-slate-600 leading-snug">
        {PREFILLED_SHIPPING.line1}
        {PREFILLED_SHIPPING.line2 ? `, ${PREFILLED_SHIPPING.line2}` : ""}
        <br />
        {PREFILLED_SHIPPING.city}, {PREFILLED_SHIPPING.state}{" "}
        {PREFILLED_SHIPPING.postal}
        <br />
        {PREFILLED_SHIPPING.country}
      </p>
    </div>
  );
}
