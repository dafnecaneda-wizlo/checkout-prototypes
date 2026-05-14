"use client";

import type { AnalyticsEvent, VariantId } from "./adapter";

let cachedSessionId: string | null = null;

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  if (cachedSessionId) return cachedSessionId;
  const stored = window.sessionStorage.getItem("ck_session");
  if (stored) {
    cachedSessionId = stored;
    return stored;
  }
  const fresh = `s_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
  window.sessionStorage.setItem("ck_session", fresh);
  cachedSessionId = fresh;
  return fresh;
}

type EventInput =
  | { kind: "checkout_reached"; variant: VariantId }
  | { kind: "field_focus"; variant: VariantId; fieldId: string }
  | {
      kind: "field_blur";
      variant: VariantId;
      fieldId: string;
      hasValue: boolean;
    }
  | { kind: "step_view"; variant: VariantId; step: string }
  | { kind: "step_complete"; variant: VariantId; step: string }
  | {
      kind: "validation_error";
      variant: VariantId;
      fieldId: string;
      reason: string;
    }
  | { kind: "order_placed"; variant: VariantId; totalCents: number }
  | { kind: "checkout_abandoned"; variant: VariantId; lastStep: string };

const LS_KEY = "ck_events";
const MAX_LOCAL = 500;

function appendLocal(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    const events: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    events.push(event);
    while (events.length > MAX_LOCAL) events.shift();
    window.localStorage.setItem(LS_KEY, JSON.stringify(events));
  } catch {
    // Quota exceeded or JSON parse — drop on the floor for the prototype.
  }
}

export function readLocalEvents(): AnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}

export function track(event: EventInput) {
  const enriched: AnalyticsEvent = {
    ...event,
    ts: Date.now(),
    sessionId: getSessionId(),
  } as AnalyticsEvent;

  if (typeof window !== "undefined") {
    // Console echo for live observation during prototype review.
    // eslint-disable-next-line no-console
    console.debug("[analytics]", enriched);
    // Static export has no server-side ring buffer; persist locally so the
    // /analytics dashboard can read the same session's events.
    appendLocal(enriched);
  }
}
