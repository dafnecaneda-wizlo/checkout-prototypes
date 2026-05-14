/**
 * Analytics adapter. Swap to GA4 / PostHog / internal later.
 * Until Johnny picks a destination, events go to /api/analytics
 * and get echoed to the browser console + an in-memory ring buffer.
 */

export type AnalyticsEvent =
  | {
      kind: "checkout_reached";
      variant: VariantId;
      ts: number;
      sessionId: string;
    }
  | {
      kind: "field_focus";
      variant: VariantId;
      fieldId: string;
      ts: number;
      sessionId: string;
    }
  | {
      kind: "field_blur";
      variant: VariantId;
      fieldId: string;
      hasValue: boolean;
      ts: number;
      sessionId: string;
    }
  | {
      kind: "step_view";
      variant: VariantId;
      step: string;
      ts: number;
      sessionId: string;
    }
  | {
      kind: "step_complete";
      variant: VariantId;
      step: string;
      ts: number;
      sessionId: string;
    }
  | {
      kind: "validation_error";
      variant: VariantId;
      fieldId: string;
      reason: string;
      ts: number;
      sessionId: string;
    }
  | {
      kind: "order_placed";
      variant: VariantId;
      totalCents: number;
      ts: number;
      sessionId: string;
    }
  | {
      kind: "checkout_abandoned";
      variant: VariantId;
      lastStep: string;
      ts: number;
      sessionId: string;
    };

export type VariantId = "one-page" | "hybrid";

export interface AnalyticsAdapter {
  track(event: AnalyticsEvent): void | Promise<void>;
}
