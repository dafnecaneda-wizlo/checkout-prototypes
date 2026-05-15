# Checkout Prototypes — Agent Context

Pickup brief for agents working on UI updates and finishing the Gr4vy sandbox wiring. Written 2026-05-15.

## What this repo is

Two Next.js 16 prototypes of the Wizlo checkout, rendered from a shared field schema so stakeholders can A/B between them on the same flow.

- `/one-page` (variant A) — single long page, sticky desktop order summary, mobile summary expanded at top. Johnny's pick.
- `/hybrid` (variant B) — accordion with edit-in-place. Dafne's pick, current default recommendation.
- `/analytics` — in-memory funnel dashboard for prototype events.
- `/` — landing page linking the two variants.

Multi-page variant was dropped May 12.

See `README.md` for product-level decisions (product pills, no insurance, shipping captured in intake, billing defaults to same-as-shipping, Affirm in payment block).

## Repo + deploy

- GitHub: `dafnecaneda-wizlo/checkout-prototypes`
- Default branch: `main`
- Deploy: Azure Static Web Apps, via `.github/workflows/azure-static-web-apps.yml` on push to `main`.
- Workflow runs `npm install` then `npm run build`, then deploys the `out/` directory with `skip_app_build: true`.
- Last green deploy: commit `1b09b6c` (May 14, 18:57 UTC).
- Site URL: returned by the SWA deploy action, not pinned in the repo. Pull it from a recent Actions run summary or ask Dafne.

## Current git state (read this before touching anything)

```
* main (local, 1 ahead of origin/main)
  eccd0b5 Add visual Gr4vy frame to payment block on both variants   <-- not pushed
  1b09b6c Wire up dead user-flow handlers                            <-- origin/main HEAD
  3acc02b ci: point app_location at out/ for skip_app_build deploy
  70729e8 ci: add Azure Static Web Apps deploy workflow
  dc3f7e0 Initial checkout prototypes commit
```

Unpushed commit `eccd0b5` only adds the visual mock chrome (`Gr4vyBrandedFrame`). It does **not** wire a real Gr4vy session.

On top of that commit, the working tree has uncommitted changes that **do** wire the real Gr4vy SDK. Specifically:

Modified:
- `app/one-page/page.tsx` — renders `<Gr4vyEmbed>` inside `Gr4vyBrandedFrame`. Filters out `paymentMethod` / `cardNumber` / `cardExpiry` / `cardCvc` from the schema field renderer so they don't double up. **Removed the "Place order" submit button**; the embed's `onComplete` callback is now the only path that calls `setPlaced`.
- `app/hybrid/page.tsx` — same swap inside the Payment accordion. **Removed the "Review order" button** that previously advanced the accordion.
- `next.config.ts` — `output: "export"` removed. This is what lets the new `/api/checkout-session` route compile, but it also breaks the SWA deploy (see Blockers).
- `package.json` + `pnpm-lock.yaml` — adds `@gr4vy/embed-react@^2.36.1` and `@gr4vy/sdk@^2.0.42`.

Untracked:
- `app/api/checkout-session/route.ts` — Node-runtime POST handler. Calls `Gr4vy.checkoutSessions.create` with the sandbox private key, then `getEmbedToken` to mint the embed token. Returns `{ checkoutSessionId, token }`.
- `components/checkout/Gr4vyEmbed.tsx` — client component, fetches `/api/checkout-session` once, then renders the dynamically-imported `@gr4vy/embed-react` `Embed` with `intent: "capture"`, `store: true`, `display: "all"`.

## Blockers / things you will trip on

1. **Static export vs server API route — deploy is broken on this working tree.**
   The SWA workflow still expects a static export in `out/`. With `output: "export"` removed from `next.config.ts`, `next build` will not generate `out/` and the deploy step will fail or upload stale content. Three reasonable fixes; the user should pick:
   - Re-add `output: "export"` and move the Gr4vy session minting to an SWA Managed Function (`/api` Azure Function on Node), Vercel function, or an existing Wizlo backend endpoint. Then `Gr4vyEmbed` calls that absolute URL instead of `/api/checkout-session`.
   - Switch deploy target off SWA to a Node-capable host (Azure App Service, Vercel, Cloudflare Pages with workers). This needs new infra approval.
   - Mock the Gr4vy session in `/api/checkout-session` for the static-export deploy (sandbox-only stub) so the prototype builds without server runtime. Loses the real card-tokenization demo.
   Do not push the current working tree as-is — it will fail the deploy job.

2. **`.env.local` is gitignored.** It is present locally and is what `app/api/checkout-session/route.ts` reads. As of 2026-05-15 it points at the SmarterEMR Gr4vy **production** instance using a **test merchant account**, per creds Prateek sent when asked for "sandbox" access:
   - `GR4VY_PRIVATE_KEY` = base64 of `gr4vy-smarteremr-production-4nOy2uem…-2GCuthlM6JObW0I.pem` (ES512 / EC P-521, validated)
   - `GR4VY_SERVER_ID=smarteremr`
   - `GR4VY_SERVER=production`
   - `GR4VY_MERCHANT_ACCOUNT_ID=WD9EOEClxD_AYKpHgo7pPCCCOtOIZBIhOtfmkpaG6LI` (the "Smarterswipe Test NT" merchant)
   - `NEXT_PUBLIC_GR4VY_ENVIRONMENT=production`
   - `NEXT_PUBLIC_GR4VY_ID=smarteremr`

   Verified working 2026-05-15: `POST /api/checkout-session/` returns 200 with a real ES512 JWT. The embed mounts.

   **Production instance, test merchant — read this before clicking.** The instance is the live SmarterEMR Gr4vy environment. The merchant account is labelled "Test NT" and is intended for sandbox-style flows (test card numbers like `4111 1111 1111 1111` route to the Visa/MC test network with no settlement). But the embed in `components/checkout/Gr4vyEmbed.tsx:80-81` is still configured with `intent: "capture"` and `store: true`. If anyone enters a real card by mistake, it will be authed-and-captured against the production processor. Before doing live demos:
   - Switch `intent` to `"auth"` while debugging, or
   - Confirm with Prateek that the Test NT merchant cannot route to live rails regardless of card number, or
   - Ask Prateek for a dedicated sandbox instance and key so we can flip `GR4VY_SERVER` back to `sandbox`.

   Original RSA key that was in `.env.local` (and is still in `wizlo-app-latest/api/.env`) is the wrong key type. The Gr4vy SDK requires ES512 / EC P-521. The wizlo-app backend has very likely been failing every live Gr4vy call against that env. Worth flagging to whoever owns that service.

3. **Schema validation is bypassed.** Both pages used `validateAll(values)` inside a submit handler. Now that the submit/advance buttons are removed and the embed drives completion via `onComplete`, the `handleSubmit` function on `one-page/page.tsx` and `handlePlace` on `hybrid/page.tsx` are unreachable for the normal path. Contact email, prefilled-shipping edits, billing-not-same-as-shipping, and any future required schema fields are no longer gated before tokenization. Decide:
   - Keep schema validation by calling `validateAll` before mounting `<Gr4vyEmbed>` (lazy-mount pattern) — preferred for the hybrid accordion.
   - Or move all those fields to the Gr4vy embed metadata and rely on Gr4vy for required-field gating — simpler but loses our analytics events `validation_error` and `step_complete` for those fields.

4. **Affirm messaging is duplicated.** `AffirmMessaging` still renders above `Gr4vyBrandedFrame` in both pages, but Gr4vy's embed (`display: "all"`) will also surface Affirm as a payment method if it's enabled on the merchant account. Confirm with Johnny whether to keep our hand-rolled messaging block or drop it once the embed loads.

5. **No state for the prefilled shipping edit-out.** README promises "Editing routes back to intake in production." Right now `PrefilledShipping.tsx` is read-only with no edit path wired. Out of scope for the Gr4vy pass but flag if you touch shipping UI.

## File map (after working-tree changes)

```
app/
  page.tsx                          landing
  layout.tsx
  globals.css
  analytics/page.tsx                live funnel dashboard
  one-page/page.tsx                 Variant A. Gr4vyEmbed wired in payment section.
  hybrid/page.tsx                   Variant B. Gr4vyEmbed wired in payment accordion.
  api/
    checkout-session/route.ts       NEW. Server POST that mints Gr4vy embed token.
lib/
  schema/fields.ts                  Shared field schema + PREFILLED_SHIPPING
  schema/cart.ts                    Sample cart (3-mo semaglutide bundle, $826.20)
  validate.ts                       Shared validation respecting showWhen
  analytics/{adapter,client,store}.ts   Event types + in-memory ring buffer
  payment/adapter.ts                Mock charge (pre-Gr4vy)
  eligibility/adapter.ts            Mock HSA/FSA stub
  checkout-client.ts                placeMockOrder() — now only used for Express pay path
  utils.ts                          cn(), formatMoney()
components/
  ui/{Button,Input,Select}.tsx
  checkout/
    FieldRenderer.tsx
    OrderSummary.tsx
    ExpressPay.tsx                  Apple / Google / Shop mock
    AccordionSection.tsx
    SectionCard.tsx
    ProductPills.tsx
    PlanTypeTabs.tsx                One-time vs Bundle vs Subscription tabs
    PlanPicker.tsx                  Cards inside each tab
    BundleCard.tsx
    OneTimeCard.tsx
    SubscriptionCard.tsx
    PrefilledShipping.tsx
    AffirmMessaging.tsx
    AffirmInfoModal.tsx
    CheckoutHeader.tsx
    GuestCheckoutBanner.tsx
    Gr4vyBrandedFrame.tsx           Visual chrome (saved-card row, PCI badge, scheme footer)
    Gr4vyEmbed.tsx                  NEW. Real @gr4vy/embed-react integration.
.github/workflows/
  azure-static-web-apps.yml         SWA deploy on push to main
.env.local                          Sandbox creds. Not committed.
```

## How to run

```
pnpm install
pnpm dev
```

Then http://localhost:3000. `.env.local` must exist for `/api/checkout-session` to work — without it the embed renders the "Could not start Gr4vy session" red banner.

Node 20+ (the SWA workflow pins 20; local works on 22).

## Sample cart (anchor for amounts)

`lib/schema/cart.ts` ships a fixed cart:
- Semaglutide 3-month bundle: $765.00 (strike-through $900.00)
- Provider consultation: $0
- Tax: $61.20
- **Total: $826.20** (`82620` cents)

`Gr4vyEmbed` is called with `amountCents={totalCents}` from each page, which resolves to the plan-picker `offer.priceCents`. The default selection is the 3-month bundle, so the embed will load with `amount: 82620, currency: "USD"`.

## Analytics events emitted

`checkout_reached`, `step_view`, `step_complete`, `field_focus`, `field_blur`, `validation_error`, `order_placed`, `checkout_abandoned`. Sink is in-memory at `/api/analytics` — restart wipes it. Visible at `/analytics`. Production destination is still an open question (GA4 vs PostHog vs internal).

## Open product questions (from README, still unresolved)

1. HSA / FSA placement — currently tagged `telehealthStub: true` in `lib/eligibility/adapter.ts`. Awaiting Johnny on whether it lives in Payment or somewhere else.
2. Intake handoff for prefilled shipping — placeholder; needs real intake schema and edit-out route.
3. Analytics destination — see above.
4. Drop or keep `AffirmMessaging` once the Gr4vy embed handles BNPL.

## Suggested order of work for a pickup agent

1. Decide deploy strategy for the new server route (Blocker #1) before pushing anything. Until that's decided, do not push `main`.
2. Fix `NEXT_PUBLIC_GR4VY_ID` vs `GR4VY_SERVER_ID` mismatch (Blocker #2). Verify the embed actually mounts and a sandbox charge token can be created end-to-end.
3. Re-introduce a validation gate before the Gr4vy embed mounts (Blocker #3), or formally drop schema validation for those fields.
4. Audit Gr4vy event payloads (`onEvent` is wired but unused) and decide which to forward to our analytics ring buffer.
5. Resolve duplicate Affirm messaging (Blocker #4).
6. UI updates per Dafne/Johnny direction — confirm what's actually in scope before refactoring shared components, since both variants render from the same shared field schema.
