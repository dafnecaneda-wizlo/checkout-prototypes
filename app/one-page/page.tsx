"use client";

import { useEffect, useMemo, useState } from "react";
import {
  emptyValues,
  fieldsByStep,
  isFieldVisible,
} from "@/lib/schema/fields";
import { SAMPLE_CART } from "@/lib/schema/cart";
import { validateAll } from "@/lib/validate";
import { placeMockOrder } from "@/lib/checkout-client";
import { track } from "@/lib/analytics/client";
import { CheckoutHeader } from "@/components/checkout/CheckoutHeader";
import { GuestCheckoutBanner } from "@/components/checkout/GuestCheckoutBanner";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { SectionCard } from "@/components/checkout/SectionCard";
import { FieldRenderer } from "@/components/checkout/FieldRenderer";
import { PrefilledShipping } from "@/components/checkout/PrefilledShipping";
import { AffirmMessaging } from "@/components/checkout/AffirmMessaging";
import { Gr4vyBrandedFrame } from "@/components/checkout/Gr4vyBrandedFrame";
import { Gr4vyEmbed } from "@/components/checkout/Gr4vyEmbed";

const GR4VY_CARD_FIELD_IDS = new Set([
  "paymentMethod",
  "cardNumber",
  "cardExpiry",
  "cardCvc",
]);
import { PlanTypeTabs, type PlanType } from "@/components/checkout/PlanTypeTabs";
import {
  PlanPicker,
  DEFAULT_SELECTION,
  resolveOffer,
} from "@/components/checkout/PlanPicker";
import { Button } from "@/components/ui/Button";

export default function OnePageCheckout() {
  const variant = "one-page" as const;
  const [planType, setPlanType] = useState<PlanType>("bundle");
  const [selectionByPlan, setSelectionByPlan] = useState<Record<PlanType, string>>(
    { ...DEFAULT_SELECTION },
  );
  const selectedId = selectionByPlan[planType];
  const offer = useMemo(() => resolveOffer(planType, selectedId), [planType, selectedId]);
  const [values, setValues] = useState(emptyValues());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<string | null>(null);

  useEffect(() => {
    track({ kind: "checkout_reached", variant });
  }, []);

  const setField = (id: string, val: string | boolean) => {
    setValues((v) => ({ ...v, [id]: val }));
    if (errors[id]) setErrors((e) => ({ ...e, [id]: "" }));
  };

  const visibleFields = useMemo(
    () => ({
      contact: fieldsByStep("contact").filter((f) => isFieldVisible(f, values)),
      shipping: fieldsByStep("shipping").filter((f) => isFieldVisible(f, values)),
      billing: fieldsByStep("billing").filter((f) => isFieldVisible(f, values)),
      payment: fieldsByStep("payment").filter((f) => isFieldVisible(f, values)),
    }),
    [values],
  );

  const formValid = useMemo(() => {
    const next = validateAll(values);
    for (const id of GR4VY_CARD_FIELD_IDS) delete next[id];
    return Object.keys(next).length === 0;
  }, [values]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = validateAll(values);
    setErrors(next);
    if (Object.keys(next).length > 0) {
      for (const fieldId of Object.keys(next)) {
        track({
          kind: "validation_error",
          variant,
          fieldId,
          reason: next[fieldId],
        });
      }
      return;
    }
    setSubmitting(true);
    const res = await placeMockOrder({
      variant,
      totalCents: offer.priceCents,
      email: String(values.email ?? "guest@wizlo.com"),
    });
    setSubmitting(false);
    if (res.ok && res.receiptId) {
      track({
        kind: "order_placed",
        variant,
        totalCents: offer.priceCents,
      });
      setPlaced(res.receiptId);
    }
  };

  if (placed) {
    return <OrderConfirmation receiptId={placed} variant={variant} />;
  }

  const totalCents = offer.priceCents;
  const summaryCart = { ...SAMPLE_CART, totalCents };

  return (
    <div className="min-h-screen">
      <CheckoutHeader variant={variant} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
        <div className="mb-8">
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight bg-gradient-to-br from-slate-900 via-brand-ink to-savings-ink bg-clip-text text-transparent">
            Complete your order
          </h1>
          <p className="text-sm text-slate-700 mt-2">
            Secure checkout for your treatment. Encrypted end-to-end.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6 lg:gap-10">
          <div className="lg:hidden">
            <OrderSummary cart={summaryCart} offer={offer} sticky={false} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <PlanTypeTabs selected={planType} onChange={setPlanType} />
            </div>

            <PlanPicker
              planType={planType}
              selectedId={selectedId}
              onSelect={(id) =>
                setSelectionByPlan((prev) => ({ ...prev, [planType]: id }))
              }
            />

            <GuestCheckoutBanner />

            <SectionCard
              title="Contact"
              description="Order updates only. No spam."
            >
              {visibleFields.contact.map((field) => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  value={values[field.id]}
                  error={errors[field.id]}
                  variant={variant}
                  onChange={(val) => setField(field.id, val)}
                />
              ))}
            </SectionCard>

            <SectionCard
              title="Shipping Information"
              description="Address captured in your intake. Edit it there if needed."
            >
              <PrefilledShipping />
              {visibleFields.shipping.map((field) => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  value={values[field.id]}
                  error={errors[field.id]}
                  variant={variant}
                  onChange={(val) => setField(field.id, val)}
                />
              ))}
            </SectionCard>

            {visibleFields.billing.length > 0 && (
              <SectionCard
                title="Billing Address"
                description="Where your card statement gets sent."
              >
                {visibleFields.billing.map((field) => (
                  <FieldRenderer
                    key={field.id}
                    field={field}
                    value={values[field.id]}
                    error={errors[field.id]}
                    variant={variant}
                    onChange={(val) => setField(field.id, val)}
                  />
                ))}
              </SectionCard>
            )}

            <SectionCard title="Payment Information">
              <AffirmMessaging totalCents={totalCents} />
              <Gr4vyBrandedFrame>
                <Gr4vyEmbed
                  amountCents={totalCents}
                  enabled={formValid}
                  onComplete={(tx) => {
                    track({
                      kind: "order_placed",
                      variant,
                      totalCents,
                    });
                    setPlaced(tx?.id ?? `rcpt_${Date.now()}`);
                  }}
                />
              </Gr4vyBrandedFrame>
              {visibleFields.payment
                .filter((f) => !GR4VY_CARD_FIELD_IDS.has(f.id))
                .map((field) => (
                  <FieldRenderer
                    key={field.id}
                    field={field}
                    value={values[field.id]}
                    error={errors[field.id]}
                    variant={variant}
                    onChange={(val) => setField(field.id, val)}
                  />
                ))}
            </SectionCard>

            <p className="text-xs text-center text-slate-500">
              By placing your order you agree to Wizlo&apos;s terms and privacy policy.
            </p>
          </form>

          <div className="hidden lg:block">
            <OrderSummary cart={summaryCart} offer={offer} />
          </div>
        </div>
      </main>
    </div>
  );
}

function OrderConfirmation({
  receiptId,
  variant,
}: {
  receiptId: string;
  variant: "one-page" | "hybrid";
}) {
  return (
    <div className="min-h-screen">
      <CheckoutHeader variant={variant} />
      <main className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">
          Order placed
        </h1>
        <p className="text-slate-600 mb-6">
          Receipt {receiptId}. A confirmation email is on its way.
        </p>
        <a href="/" className="text-brand font-medium hover:underline">
          Back to prototypes
        </a>
      </main>
    </div>
  );
}
