"use client";

import { useEffect, useMemo, useState } from "react";
import {
  STEPS,
  type Step,
  emptyValues,
  fieldsByStep,
  isFieldVisible,
  FIELDS,
} from "@/lib/schema/fields";
import { SAMPLE_CART } from "@/lib/schema/cart";
import { validateStep, validateAll } from "@/lib/validate";
import { placeMockOrder } from "@/lib/checkout-client";
import { track } from "@/lib/analytics/client";
import { CheckoutHeader } from "@/components/checkout/CheckoutHeader";
import { GuestCheckoutBanner } from "@/components/checkout/GuestCheckoutBanner";
import { ExpressPay } from "@/components/checkout/ExpressPay";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { AccordionSection } from "@/components/checkout/AccordionSection";
import { FieldRenderer } from "@/components/checkout/FieldRenderer";
import { PrefilledShipping } from "@/components/checkout/PrefilledShipping";
import { AffirmMessaging } from "@/components/checkout/AffirmMessaging";
import { PlanTypeTabs, type PlanType } from "@/components/checkout/PlanTypeTabs";
import {
  PlanPicker,
  DEFAULT_SELECTION,
  resolveOffer,
} from "@/components/checkout/PlanPicker";
import { Button } from "@/components/ui/Button";

const SECTION_STEPS: Step[] = ["contact", "shipping", "billing", "payment"];

export default function HybridCheckout() {
  const variant = "hybrid" as const;
  const [planType, setPlanType] = useState<PlanType>("bundle");
  const [selectionByPlan, setSelectionByPlan] = useState<Record<PlanType, string>>(
    { ...DEFAULT_SELECTION },
  );
  const selectedId = selectionByPlan[planType];
  const offer = useMemo(() => resolveOffer(planType, selectedId), [planType, selectedId]);
  const [values, setValues] = useState(emptyValues());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState<Set<Step>>(new Set());
  const [openStep, setOpenStep] = useState<Step>("contact");
  const [placed, setPlaced] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const totalCents = offer.priceCents;
  const summaryCart = { ...SAMPLE_CART, totalCents };

  useEffect(() => {
    track({ kind: "checkout_reached", variant });
    track({ kind: "step_view", variant, step: "contact" });
  }, []);

  const setField = (id: string, val: string | boolean) => {
    setValues((v) => ({ ...v, [id]: val }));
    if (errors[id]) setErrors((e) => ({ ...e, [id]: "" }));
  };

  const visibleStepFields = useMemo(
    () =>
      (step: Step) =>
        fieldsByStep(step).filter((f) => isFieldVisible(f, values)),
    [values],
  );

  const advance = (step: Step) => {
    const stepErrors = validateStep(values, step);
    setErrors((prev) => ({ ...prev, ...stepErrors }));
    if (Object.keys(stepErrors).length > 0) {
      for (const fieldId of Object.keys(stepErrors)) {
        track({
          kind: "validation_error",
          variant,
          fieldId,
          reason: stepErrors[fieldId],
        });
      }
      return;
    }
    track({ kind: "step_complete", variant, step });
    setCompleted((c) => new Set(c).add(step));
    const idx = SECTION_STEPS.indexOf(step);
    // Skip the billing step entirely when the box is checked (billing = shipping).
    let next = SECTION_STEPS[idx + 1];
    if (next === "billing" && values.billingSameAsShipping) {
      next = SECTION_STEPS[idx + 2];
    }
    if (next) {
      setOpenStep(next);
      track({ kind: "step_view", variant, step: next });
    } else {
      setOpenStep("review");
      track({ kind: "step_view", variant, step: "review" });
    }
  };

  const editStep = (step: Step) => {
    setOpenStep(step);
    track({ kind: "step_view", variant, step });
  };

  const handlePlace = async () => {
    const allErrors = validateAll(values);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      const firstErrStep = STEPS.find((s) =>
        Object.keys(allErrors).some(
          (id) => FIELDS.find((f) => f.id === id)?.step === s.id,
        ),
      );
      if (firstErrStep) setOpenStep(firstErrStep.id);
      return;
    }
    setSubmitting(true);
    const res = await placeMockOrder({
      variant,
      totalCents,
      email: String(values.email ?? "guest@wizlo.com"),
    });
    setSubmitting(false);
    if (res.ok && res.receiptId) {
      track({ kind: "order_placed", variant, totalCents });
      setPlaced(res.receiptId);
    }
  };

  const sectionState = (
    step: Step,
  ): "open" | "summary" | "locked" => {
    if (openStep === step) return "open";
    if (completed.has(step)) return "summary";
    return "locked";
  };

  const summaryFor = (step: Step) => {
    const fields = visibleStepFields(step).filter(
      (f) => f.type !== "checkbox" && values[f.id],
    );
    if (fields.length === 0) return null;
    return (
      <ul className="space-y-0.5">
        {fields.map((f) => (
          <li key={f.id}>
            <span className="text-slate-400">{f.label}: </span>
            <span>
              {f.type === "card"
                ? `•••• ${String(values[f.id] ?? "").slice(-4)}`
                : String(values[f.id])}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  if (placed) {
    return (
      <div className="min-h-screen">
        <CheckoutHeader variant={variant} />
        <main className="max-w-2xl mx-auto px-6 py-16 text-center">
          <div className="text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">
            Order placed
          </h1>
          <p className="text-slate-600 mb-6">
            Receipt {placed}. A confirmation email is on its way.
          </p>
          <a href="/" className="text-brand font-medium hover:underline">
            Back to prototypes
          </a>
        </main>
      </div>
    );
  }

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

        <div className="mb-6">
          <AffirmMessaging totalCents={totalCents} placement="banner" />
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6 lg:gap-10">
          <div className="lg:hidden">
            <OrderSummary cart={summaryCart} offer={offer} sticky={false} />
          </div>

          <div className="space-y-4">
            <PlanTypeTabs selected={planType} onChange={setPlanType} />

            <PlanPicker
              planType={planType}
              selectedId={selectedId}
              onSelect={(id) =>
                setSelectionByPlan((prev) => ({ ...prev, [planType]: id }))
              }
            />

            <GuestCheckoutBanner />

            {openStep === "contact" && (
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <ExpressPay onPay={() => setPlaced("rcpt_express_mock")} />
              </div>
            )}

            <AccordionSection
              title="Contact"
              step={1}
              state={sectionState("contact")}
              summary={summaryFor("contact")}
              onEdit={() => editStep("contact")}
            >
              {visibleStepFields("contact").map((field) => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  value={values[field.id]}
                  error={errors[field.id]}
                  variant={variant}
                  onChange={(val) => setField(field.id, val)}
                />
              ))}
              <Button onClick={() => advance("contact")} size="lg">
                Continue to shipping
              </Button>
            </AccordionSection>

            <AccordionSection
              title="Shipping Information"
              step={2}
              state={sectionState("shipping")}
              summary={summaryFor("shipping")}
              onEdit={() => editStep("shipping")}
            >
              <PrefilledShipping />
              {visibleStepFields("shipping").map((field) => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  value={values[field.id]}
                  error={errors[field.id]}
                  variant={variant}
                  onChange={(val) => setField(field.id, val)}
                />
              ))}
              <Button
                onClick={() => advance("shipping")}
                size="lg"
              >
                {values.billingSameAsShipping
                  ? "Continue to payment"
                  : "Continue to billing"}
              </Button>
            </AccordionSection>

            {!values.billingSameAsShipping && (
              <AccordionSection
                title="Billing Address"
                step={3}
                state={sectionState("billing")}
                summary={summaryFor("billing")}
                onEdit={() => editStep("billing")}
              >
                {visibleStepFields("billing").map((field) => (
                  <FieldRenderer
                    key={field.id}
                    field={field}
                    value={values[field.id]}
                    error={errors[field.id]}
                    variant={variant}
                    onChange={(val) => setField(field.id, val)}
                  />
                ))}
                <Button onClick={() => advance("billing")} size="lg">
                  Continue to payment
                </Button>
              </AccordionSection>
            )}

            <AccordionSection
              title="Payment Information"
              step={values.billingSameAsShipping ? 3 : 4}
              state={sectionState("payment")}
              summary={summaryFor("payment")}
              onEdit={() => editStep("payment")}
            >
              <AffirmMessaging totalCents={totalCents} />
              {visibleStepFields("payment").map((field) => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  value={values[field.id]}
                  error={errors[field.id]}
                  variant={variant}
                  onChange={(val) => setField(field.id, val)}
                />
              ))}
              <Button onClick={() => advance("payment")} size="lg">
                Review order
              </Button>
            </AccordionSection>

            {completed.has("payment") && (
              <div className="bg-white border border-brand rounded-xl p-5 space-y-4">
                <h2 className="text-base font-semibold text-slate-900">
                  Place order
                </h2>
                <p className="text-sm text-slate-600">
                  You will be charged{" "}
                  <strong>
                    ${(totalCents / 100).toFixed(2)}
                  </strong>{" "}
                  when your order ships.
                </p>
                <Button
                  onClick={handlePlace}
                  size="lg"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? "Placing order…" : "Place order"}
                </Button>
              </div>
            )}
          </div>

          <div className="hidden lg:block">
            <OrderSummary cart={summaryCart} offer={offer} />
          </div>
        </div>
      </main>
    </div>
  );
}
