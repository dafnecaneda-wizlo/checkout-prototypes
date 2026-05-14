# Wizlo Checkout Prototypes

Two checkout variants rendered from a **shared field schema** so stakeholders can pick between them on the same flow.

## Variants

| Code | Route | Pattern | Best when |
|------|-------|---------|-----------|
| A | `/one-page` | Single long page. Everything visible. Sticky order summary on desktop, expanded summary at the top on mobile. | Returning users. Simple cart. Johnny's pick for fewest clicks. |
| B | `/hybrid` | Accordion. Stacked sections with a preview of what was entered. Click any block to edit in place. | Default recommendation. Dafne's pick for mid-flow address or card edits. |

**Dropped May 12:** the traditional multi-page variant. On mobile it duplicated the accordion without the edit-in-place affordance.

## May 12 product changes (Johnny + Dafne sync)

These shaped the current shape of the prototypes:

- **Product pills are back.** The May 5 brainstorm's product boxes are rendered above checkout (`components/checkout/ProductPills.tsx`) with cadence, dosage, tag (Most popular / Best value), and a price + strike-through.
- **No insurance providers anywhere.** Wizlo does not use insurance. The field was removed from the schema.
- **Shipping address moved to intake.** Captured upfront in the intake form (Pratik's call). Checkout pre-fills it via `PrefilledShipping`. Editing routes back to intake in production.
- **Billing defaults to "same as shipping".** Unchecking the box reveals an alternate billing-address field via `showWhen` in the schema.
- **Affirm messaging is in the payment block** of both variants. Component lives at `components/checkout/AffirmMessaging.tsx`.
- **Mobile order summary sits expanded at the top** of the page. Desktop keeps it in the sticky sidebar.
- **Payment fields consolidated** into one block. Affirm is one of the `paymentMethod` options and hides the card fields when selected.

## Shared spine (both variants)

- Schema-driven fields. Source of truth: `lib/schema/fields.ts`.
- Conditional visibility via `showWhen`. Validation honors it (`lib/validate.ts`).
- Guest checkout default. Account creation deferred post-purchase.
- Express pay (Apple / Google / Shop) above the fold.
- Mock payment adapter (`lib/payment/adapter.ts`). Same interface as Stripe PaymentIntents so swapping in real Stripe is a one-file change.
- Mock eligibility adapter (`lib/eligibility/adapter.ts`). HSA / FSA tagged `telehealthStub: true` and rendered with a visible badge until Johnny confirms placement.
- Analytics emit `checkout_reached`, `step_view`, `step_complete`, `field_focus`, `field_blur`, `validation_error`, `order_placed`, `checkout_abandoned`. Sink is `/api/analytics` in-memory ring buffer for the prototype.

## Run it

```bash
cd checkout-prototypes
pnpm install
pnpm dev
```

Open http://localhost:3000

- Landing page links both variants.
- `/analytics` shows live funnel events and per-variant conversion rate.

## Open questions to Johnny

1. **HSA / FSA placement.** Still tagged as a stub until Johnny confirms whether it sits inside Payment or elsewhere.
2. **Real intake handoff.** Prototype assumes shipping is pre-filled from intake. Wire up the actual intake schema once the integration is decided.
3. **Analytics destination.** GA4, PostHog, or internal? Current sink is an in-memory ring buffer.

## File map

```
app/
  page.tsx                          landing
  analytics/page.tsx                live funnel dashboard
  one-page/page.tsx                 Proto A. single long page
  hybrid/page.tsx                   Proto B. accordion
  api/
    checkout/route.ts               mock charge
    analytics/route.ts              ring buffer sink
lib/
  schema/
    fields.ts                       shared field schema + PREFILLED_SHIPPING
    cart.ts                         sample cart with cadence / dosage / discount
  validate.ts                       shared validation, respects showWhen
  analytics/
    adapter.ts                      event types
    client.ts                       track() helper
    store.ts                        in-memory ring buffer
  payment/adapter.ts                mock charge
  eligibility/adapter.ts            mock eligibility
  utils.ts                          cn() + formatMoney()
components/
  ui/{Button,Input,Select}.tsx      primitives
  checkout/
    FieldRenderer.tsx               renders any field from schema
    OrderSummary.tsx                desktop sticky, mobile expanded at top
    ExpressPay.tsx                  Apple / Google / Shop buttons
    AccordionSection.tsx            hybrid variant primitive
    SectionCard.tsx                 generic card
    ProductPills.tsx                product boxes (May 5 brainstorm)
    PrefilledShipping.tsx           read-only address from intake
    AffirmMessaging.tsx             "4 interest-free payments" block
    CheckoutHeader.tsx              top bar with variant label
    GuestCheckoutBanner.tsx         no-account-needed reassurance
```
