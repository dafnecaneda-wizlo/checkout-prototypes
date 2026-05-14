"use client";

import { useEffect, useState } from "react";
import type { AnalyticsEvent, VariantId } from "@/lib/analytics/adapter";
import { readLocalEvents } from "@/lib/analytics/client";
import Link from "next/link";

const VARIANTS: VariantId[] = ["one-page", "hybrid"];

export default function AnalyticsDashboard() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const load = () => setEvents(readLocalEvents());
    load();
    if (!autoRefresh) return;
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
  }, [autoRefresh]);

  const byVariant = (variant: VariantId) =>
    events.filter((e) => e.variant === variant);

  const funnel = (variant: VariantId) => {
    const list = byVariant(variant);
    const reached = list.filter((e) => e.kind === "checkout_reached").length;
    const placed = list.filter((e) => e.kind === "order_placed").length;
    const errors = list.filter((e) => e.kind === "validation_error").length;
    return { reached, placed, errors, cr: reached ? (placed / reached) * 100 : 0 };
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-slate-900 hover:underline">
            Wizlo
          </Link>
          <span className="text-sm text-slate-600">Analytics dashboard</span>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">
            Funnel events
          </h1>
          <label className="text-sm text-slate-600 flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto refresh
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {VARIANTS.map((v) => {
            const f = funnel(v);
            return (
              <div
                key={v}
                className="bg-white border border-slate-200 rounded-xl p-5"
              >
                <h2 className="font-semibold text-slate-900 mb-3 capitalize">
                  {v}
                </h2>
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Reached checkout</dt>
                    <dd className="font-medium">{f.reached}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Orders placed</dt>
                    <dd className="font-medium">{f.placed}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Validation errors</dt>
                    <dd className="font-medium">{f.errors}</dd>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2 mt-2">
                    <dt className="text-slate-700 font-medium">
                      Conversion rate
                    </dt>
                    <dd className="font-semibold">{f.cr.toFixed(1)}%</dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="px-5 py-3 border-b border-slate-100 text-sm font-semibold text-slate-900">
            Recent events ({events.length})
          </div>
          <div className="max-h-[480px] overflow-auto">
            {events.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-500">
                No events yet. Open a prototype variant and fill the form.
              </p>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-slate-50 sticky top-0">
                  <tr className="text-left text-slate-500">
                    <th className="px-4 py-2 font-medium">Time</th>
                    <th className="px-4 py-2 font-medium">Variant</th>
                    <th className="px-4 py-2 font-medium">Event</th>
                    <th className="px-4 py-2 font-medium">Detail</th>
                    <th className="px-4 py-2 font-medium">Session</th>
                  </tr>
                </thead>
                <tbody>
                  {[...events].reverse().map((e, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="px-4 py-1.5 text-slate-500 whitespace-nowrap">
                        {new Date(e.ts).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-1.5">{e.variant}</td>
                      <td className="px-4 py-1.5 font-medium">{e.kind}</td>
                      <td className="px-4 py-1.5 text-slate-600">
                        {describe(e)}
                      </td>
                      <td className="px-4 py-1.5 text-slate-400">
                        {e.sessionId.slice(0, 10)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function describe(e: AnalyticsEvent): string {
  switch (e.kind) {
    case "field_focus":
    case "field_blur":
      return `field ${e.fieldId}`;
    case "step_view":
    case "step_complete":
      return `step ${e.step}`;
    case "validation_error":
      return `${e.fieldId}: ${e.reason}`;
    case "order_placed":
      return `$${(e.totalCents / 100).toFixed(2)}`;
    case "checkout_abandoned":
      return `last step ${e.lastStep}`;
    default:
      return "";
  }
}
