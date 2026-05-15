"use client";

import { useState, type ReactNode } from "react";

/**
 * Visual-only Gr4vy skin around the existing payment fields. No real
 * @gr4vy/embed-react in the prototype. Stakeholders should see the same
 * branding, saved-card row, and security footer that the real Gr4vy
 * embed surfaces in emr-frontend / patient-portal.
 *
 * When the prototype graduates to a real integration the contents of
 * this frame are replaced by <Embed token amount currency … /> from
 * @gr4vy/embed-react. The frame chrome stays.
 */

interface Gr4vyBrandedFrameProps {
  children: ReactNode;
  showSavedCard?: boolean;
}

export function Gr4vyBrandedFrame({
  children,
  showSavedCard = true,
}: Gr4vyBrandedFrameProps) {
  const [useSaved, setUseSaved] = useState<boolean>(showSavedCard);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-[11px] font-semibold text-white"
          >
            wl
          </span>
          <div className="leading-tight">
            <p className="text-sm font-medium text-slate-900">
              Secure checkout
            </p>
            <p className="text-[11px] text-slate-500">
              Card details handled by Wiz Lopee
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
          <span aria-hidden>🔒</span> PCI DSS Level 1
        </span>
      </header>

      <div className="space-y-4 px-4 py-4">
        {showSavedCard && (
          <SavedCardRow
            selected={useSaved}
            onSelectSaved={() => setUseSaved(true)}
            onSelectNew={() => setUseSaved(false)}
          />
        )}

        {!useSaved && <div className="space-y-4">{children}</div>}
      </div>

      <footer className="flex items-center justify-between border-t border-slate-200 px-4 py-2 text-[11px] text-slate-500">
        <span>Powered by Wiz Lopee</span>
        <span className="flex items-center gap-2" aria-hidden>
          <CardScheme label="VISA" />
          <CardScheme label="MC" />
          <CardScheme label="AMEX" />
          <CardScheme label="Pay" />
        </span>
      </footer>
    </div>
  );
}

function SavedCardRow({
  selected,
  onSelectSaved,
  onSelectNew,
}: {
  selected: boolean;
  onSelectSaved: () => void;
  onSelectNew: () => void;
}) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onSelectSaved}
        className={`flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left transition ${
          selected
            ? "border-brand bg-white ring-1 ring-brand"
            : "border-slate-200 bg-white hover:border-slate-300"
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="inline-flex h-5 w-8 items-center justify-center rounded bg-blue-600 text-[10px] font-bold text-white"
          >
            VISA
          </span>
          <div className="leading-tight">
            <p className="text-sm font-medium text-slate-900">
              Visa ending in 4242
            </p>
            <p className="text-[11px] text-slate-500">Expires 12 / 27</p>
          </div>
        </div>
        <span
          aria-hidden
          className={`inline-flex h-4 w-4 items-center justify-center rounded-full border ${
            selected ? "border-brand bg-brand" : "border-slate-300 bg-white"
          }`}
        >
          {selected && (
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          )}
        </span>
      </button>

      <button
        type="button"
        onClick={onSelectNew}
        className={`flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left transition ${
          !selected
            ? "border-brand bg-white ring-1 ring-brand"
            : "border-slate-200 bg-white hover:border-slate-300"
        }`}
      >
        <div className="flex items-center gap-3">
          <span aria-hidden className="text-base">
            ＋
          </span>
          <p className="text-sm font-medium text-slate-900">Use a new card</p>
        </div>
        <span
          aria-hidden
          className={`inline-flex h-4 w-4 items-center justify-center rounded-full border ${
            !selected ? "border-brand bg-brand" : "border-slate-300 bg-white"
          }`}
        >
          {!selected && (
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          )}
        </span>
      </button>
    </div>
  );
}

function CardScheme({ label }: { label: string }) {
  return (
    <span className="inline-flex h-4 items-center rounded bg-white px-1.5 text-[9px] font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
      {label}
    </span>
  );
}
