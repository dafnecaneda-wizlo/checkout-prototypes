import type { AnalyticsEvent } from "./adapter";

const MAX_EVENTS = 500;
const events: AnalyticsEvent[] = [];

export function appendEvent(event: AnalyticsEvent) {
  events.push(event);
  if (events.length > MAX_EVENTS) events.shift();
}

export function readEvents(): AnalyticsEvent[] {
  return [...events];
}
