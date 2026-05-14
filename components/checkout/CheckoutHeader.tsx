import Link from "next/link";
import type { VariantId } from "@/lib/analytics/adapter";

const VARIANT_LABEL: Record<VariantId, string> = {
  "one-page": "Proto A · Single long page",
  hybrid: "Proto B · Accordion",
};

export function CheckoutHeader({ variant }: { variant: VariantId }) {
  return (
    <header className="sticky top-0 z-30 glass-dim border-b border-white/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight text-slate-900 hover:text-brand">
            Wizlo
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-sm text-slate-700">Checkout</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-600 hidden sm:inline">{VARIANT_LABEL[variant]}</span>
          <Link
            href="/analytics"
            className="text-brand-ink font-medium hover:underline"
          >
            Analytics
          </Link>
        </div>
      </div>
    </header>
  );
}
