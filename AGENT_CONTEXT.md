# Checkout Prototypes — Agent Pickup Brief

You are picking up work on the Wizlo checkout prototypes. Read this first. Last updated 2026-05-16.

## What this repo is

Three live checkout variants in a Next.js 16 app, all rendered from the same shared field schema so stakeholders can A/B between them.

| Route | Variant | Pattern |
|---|---|---|
| `/one-page/` | A | Single long page. Johnny's pick. |
| `/hybrid/` | B | Accordion with edit-in-place. Dafne's pick. |
| `/one-page-sticky/` | A with sticky-mobile-summary mockup | Same as A but compact pill follows on mobile scroll. Built for visual comparison only. |
| `/analytics/` | | In-memory funnel dashboard. |

Multi-page variant dropped May 12.

## Where it is

| | |
|---|---|
| GitHub | `dafnecaneda-wizlo/checkout-prototypes` |
| Default branch | `main` |
| Local + remote | In sync. `git status` clean except gitignored `tsconfig.tsbuildinfo`. |
| Live URL | `https://zealous-stone-0536e2a0f.7.azurestaticapps.net` |
| Deploy | Azure Static Web Apps via `.github/workflows/azure-static-web-apps.yml` on push to `main`. Next.js hybrid build, Oryx-detected. |
| Latest commit | `b6077ad Reshape bundles to 1, 3, 6, 12 month durations` |

## State right now

Everything from the May 15 Johnny meeting landed. The UI is live and the local dev environment runs the real Gr4vy embed end to end (verified by headless Chromium 2026-05-15).

**Working locally:** card form mounts, token mints, payment options retrieved, Google Pay session opened, zero console errors.

**NOT working on the live site:** `/api/checkout-session/` returns 500 because the Gr4vy env vars are gitignored and were never added to SWA application settings. The live demo shows the visual checkout flow correctly but the Payment block will surface the "Could not start Wiz Lopee session" placeholder when a user tries to enter card details.

This is the single biggest open item. Fix described in [docs/deploy.md](docs/deploy.md).

## How to run locally

```
pnpm install
pnpm dev
```

Then `http://localhost:3000`. The Gr4vy embed needs `.env.local` to exist. Creds are documented in [docs/gr4vy.md](docs/gr4vy.md). Node 20+.

## Open work, in priority order

1. **Add Gr4vy env vars to Azure SWA Application Settings** so the live embed mounts. See [docs/deploy.md](docs/deploy.md#env-vars-on-swa).
2. **Chase Prateek for a real sandbox Gr4vy instance.** Current setup is production-instance plus the "Test NT" merchant account plus `intent: "authorize"` as the hedge. The Gr4vy sandbox host exists at `embed.sandbox.smarteremr.gr4vy.app` but the production ES512 key is rejected there ("No valid API authentication found"). See [docs/gr4vy.md](docs/gr4vy.md#sandbox-vs-production).
3. **Stripe and Gravy rebrand sweep.** UI strings already changed to "Wiz Lopee" in `Gr4vyBrandedFrame` and the embed-error banner. Component file names, npm package names (`@gr4vy/sdk`), and env var names (`GR4VY_PRIVATE_KEY`) intentionally untouched because those are the literal vendor name. If a future ask wants those renamed too, it is a larger refactor.
4. **Open product questions** from `README.md`: HSA / FSA placement, intake handoff for prefilled shipping, analytics destination (GA4 vs PostHog vs internal), whether to drop `AffirmMessaging` once the Gr4vy embed surfaces Affirm itself.

## Document map

| File | Purpose |
|---|---|
| [AGENT_CONTEXT.md](AGENT_CONTEXT.md) | This file. Pickup brief. |
| [README.md](README.md) | Variant overview and the May 12 product decisions. |
| [docs/gr4vy.md](docs/gr4vy.md) | Gr4vy credentials, env vars, token flow, sandbox-vs-production, how to verify end to end. |
| [docs/deploy.md](docs/deploy.md) | Azure SWA workflow, live URL, env vars not yet on SWA, build mode. |
| [docs/session-2026-05-15.md](docs/session-2026-05-15.md) | Log of what changed this session, the May 15 meeting context, the parallel-agent dispatch pattern used. |

## File map of the app

```
app/
  page.tsx                          landing
  layout.tsx
  globals.css
  analytics/page.tsx                in-memory funnel dashboard
  one-page/page.tsx                 Variant A
  hybrid/page.tsx                   Variant B
  one-page-sticky/page.tsx          Variant A with sticky-mobile mockup
  api/checkout-session/route.ts     Server POST that mints Gr4vy embed token
lib/
  schema/fields.ts                  Shared field schema + PREFILLED_SHIPPING
  schema/cart.ts                    Sample cart
  validate.ts                       Shared validation, respects showWhen
  analytics/{adapter,client,store}.ts
  payment/adapter.ts                Mock charge (pre-Gr4vy, dead path now)
  eligibility/adapter.ts            Mock HSA/FSA stub
  checkout-client.ts                placeMockOrder, unreachable since embed onComplete drives setPlaced
  utils.ts                          cn, formatMoney
components/
  ui/{Button,Input,Select}.tsx
  checkout/
    FieldRenderer.tsx
    OrderSummary.tsx
    StickyMobileSummary.tsx         Compact mobile pill for /one-page-sticky/
    ExpressPay.tsx                  Wallet buttons, no longer used on either page
    AccordionSection.tsx
    SectionCard.tsx
    ProductPills.tsx
    PlanTypeTabs.tsx                Subscription / One-time / Bundle tabs
    PlanPicker.tsx                  Cards inside each tab
    BundleCard.tsx                  Bundles are 1, 3, 6, 12 month durations
    OneTimeCard.tsx
    SubscriptionCard.tsx
    PrefilledShipping.tsx
    AffirmMessaging.tsx
    AffirmInfoModal.tsx
    CheckoutHeader.tsx
    GuestCheckoutBanner.tsx
    Gr4vyBrandedFrame.tsx           Wiz-Lopee branded chrome around the embed
    Gr4vyEmbed.tsx                  Real @gr4vy/embed-react integration
.github/workflows/
  azure-static-web-apps.yml         Next.js hybrid deploy on push to main
.env.local                          Gr4vy creds. Gitignored.
```

## Code rules worth knowing

- `intent: "authorize"` on `Gr4vyEmbed.tsx:80`. Do not change to `"capture"` without confirming the merchant account is not on production live rails.
- Product cards (`BundleCard`, `OneTimeCard`, `SubscriptionCard`) are `<div role="radio">` not `<button>`. The Affirm "Learn more" inside them was nested invalidly when the outer was a button and caused React hydration errors. Keep the radio pattern.
- The mobile card layout is `flex flex-col sm:grid sm:grid-cols-[13rem_minmax(0,1fr)]`. The `minmax(0, 1fr)` is load-bearing. Drop it and the price text forces horizontal overflow on 390px viewports.
- `Gr4vyEmbed` takes an `enabled` prop. `/one-page` and `/one-page-sticky` pass `enabled={formValid}` so the token fetch is deferred until contact email plus shipping method validate. `/hybrid` does not pass it because `AccordionSection` only renders children when state is `"open"`, so the embed only mounts when the user advances through the steps. Do not remove the gate.
