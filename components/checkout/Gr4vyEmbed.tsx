"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Embed = dynamic(() => import("@gr4vy/embed-react"), { ssr: false });

interface Gr4vyEmbedProps {
  amountCents: number;
  currency?: string;
  enabled?: boolean;
  onComplete?: (transaction: any) => void;
  onEvent?: (event: any) => void;
}

interface SessionResponse {
  checkoutSessionId: string;
  token: string;
}

export function Gr4vyEmbed({
  amountCents,
  currency = "USD",
  enabled = true,
  onComplete,
  onEvent,
}: Gr4vyEmbedProps) {
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (fetched.current) return;
    fetched.current = true;

    fetch("/api/checkout-session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount: amountCents, currency }),
    })
      .then(async (r) => {
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j.error ?? `HTTP ${r.status}`);
        }
        return r.json() as Promise<SessionResponse>;
      })
      .then(setSession)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [amountCents, currency, enabled]);

  if (!enabled) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
        <p className="font-medium text-slate-800">
          Complete your contact and shipping information above.
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Your secure card form will load once everything checks out.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        Could not start Wiz Lopee session: {error}
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-500">
        <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-slate-300" />
        Loading secure payment form…
      </div>
    );
  }

  const gr4vyId = process.env.NEXT_PUBLIC_GR4VY_ID ?? "smarteremr";
  const environment = (process.env.NEXT_PUBLIC_GR4VY_ENVIRONMENT ?? "sandbox") as
    | "sandbox"
    | "production";

  return (
    <Embed
      gr4vyId={gr4vyId}
      amount={amountCents}
      currency={currency}
      country="US"
      token={session.token}
      environment={environment}
      intent="authorize"
      store={true}
      display="all"
      onComplete={(tx: any) => onComplete?.(tx)}
      onEvent={(ev: any) => onEvent?.(ev)}
    />
  );
}
