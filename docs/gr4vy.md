# Gr4vy integration

Everything about the Gr4vy embed in this prototype. Cross-referenced from [AGENT_CONTEXT.md](../AGENT_CONTEXT.md).

## What we are talking to

| Field | Value | Source |
|---|---|---|
| Instance ID | `smarteremr` | Gr4vy dashboard, SmarterEMR org. Prateek owns it. |
| Environment | `production` (with a Test merchant) | See [Sandbox vs production](#sandbox-vs-production) for why. |
| Merchant account | `WD9EOEClxD_AYKpHgo7pPCCCOtOIZBIhOtfmkpaG6LI` | Labelled "Smarterswipe Test NT" in the dashboard. |
| Private key alg | ES512 (EC, NIST curve P-521) | Required by `getEmbedToken` in `@gr4vy/sdk`. |
| Private key ID | `4nOy2uemYDFyXdErvi-sGm0InzK_2GCuthlM6JObW0I` | From the PEM filename. Visible in JWT `kid`. |
| CDN hosts | `embed.smarteremr.gr4vy.app` (production), `embed.sandbox.smarteremr.gr4vy.app` (sandbox) | Built at runtime by `@gr4vy/embed`. |

The PEM file Prateek sent is at `~/Downloads/gr4vy-smarteremr-production-4nOy2uemYDFyXdErvi-sGm0InzK_2GCuthlM6JObW0I (1).pem`.

## Local env vars

`.env.local` (gitignored). All required for `app/api/checkout-session/route.ts` to mint a token.

```
GR4VY_PRIVATE_KEY=<base64 of the PEM, single line, no wrap>
GR4VY_SERVER_ID=smarteremr
GR4VY_SERVER=production
GR4VY_MERCHANT_ACCOUNT_ID=WD9EOEClxD_AYKpHgo7pPCCCOtOIZBIhOtfmkpaG6LI
NEXT_PUBLIC_GR4VY_ENVIRONMENT=production
NEXT_PUBLIC_GR4VY_ID=smarteremr
```

To regenerate the base64 from the PEM:

```
base64 -w0 "/home/sky/Downloads/gr4vy-smarteremr-production-4nOy2uemYDFyXdErvi-sGm0InzK_2GCuthlM6JObW0I (1).pem"
```

The server route base64-decodes it back to PEM before passing to `Gr4vy.withToken({ privateKey })`. See `app/api/checkout-session/route.ts:46`.

## Token flow

```
Browser                          Next.js                          Gr4vy
-------                          -------                          -----
Gr4vyEmbed mounts        →
                                 POST /api/checkout-session
                                 (Gr4vy.checkoutSessions.create)  →
                                 getEmbedToken({ privateKey,         ←  { id }
                                                checkoutSessionId,
                                                embedParams })
                                 returns { checkoutSessionId, token }
       ←  { token }
loads iframe at
embed.smarteremr.gr4vy.app   →
                                                                      validates JWT (alg=ES512, kid)
       ←  payment form
user enters card             →
                                                                      authorize via api.smarteremr.gr4vy.app
       ←  onComplete(tx)
```

The JWT is signed server-side with the ES512 private key. The iframe at `embed.smarteremr.gr4vy.app` and the API at `api.smarteremr.gr4vy.app` both validate it against Gr4vy's known public key. The `kid` in the JWT header tells Gr4vy which of our registered keys is being used.

## intent

`components/checkout/Gr4vyEmbed.tsx:80` sets `intent="authorize"`. Valid values per the Gr4vy README are `authorize`, `preferAuthorize`, `capture`.

`authorize` means card is verified and a hold can be placed but no settlement happens. This is the safety hedge while the prototype runs against the production instance with a Test merchant. Do not flip to `capture` without confirming with Prateek that the Test merchant cannot route to live rails, or until a real sandbox instance is wired up.

## Validation gate

`Gr4vyEmbed` accepts an `enabled` prop. When `false`, the component renders a placeholder and skips the token fetch entirely.

- `/one-page/` and `/one-page-sticky/` compute `formValid` via `validateAll(values)` minus the card fields, then pass `enabled={formValid}`. The user must fill email plus shipping method before the embed mounts and burns a token.
- `/hybrid/` does not pass `enabled` because `AccordionSection` only renders children when its state is `"open"`. The user has to advance through the accordion (each step validates) before the Payment section reveals the embed.

## Sandbox vs production

Prateek sent the production key when asked for "sandbox" creds. Gr4vy keys are per-environment. We tested:

- `GR4VY_SERVER=production` → `POST /api/checkout-session/` returns 200 with a real JWT. Iframe mounts at `embed.smarteremr.gr4vy.app`. Verified end-to-end with headless Chromium 2026-05-15.
- `GR4VY_SERVER=sandbox` → API returns 502 `Gr4vy session mint failed: No valid API authentication found`. The sandbox instance exists at `embed.sandbox.smarteremr.gr4vy.app` (curl HEAD returns 200) but the production key is not registered there.

Until we get a sandbox PEM from Prateek the prototype must stay on production + Test NT merchant + `intent: "authorize"`. The merchant is named "Test" so test card numbers (`4111 1111 1111 1111`) should route to the test network with no settlement, but no one has confirmed that in writing.

If a true sandbox key arrives later:
1. base64-encode the new PEM and replace `GR4VY_PRIVATE_KEY` in `.env.local`
2. flip `GR4VY_SERVER=sandbox` and `NEXT_PUBLIC_GR4VY_ENVIRONMENT=sandbox`
3. update `GR4VY_SERVER_ID` and `NEXT_PUBLIC_GR4VY_ID` if the sandbox instance has a different name
4. swap `GR4VY_MERCHANT_ACCOUNT_ID` to the sandbox merchant
5. restart `pnpm dev` so the route re-reads the env
6. mirror the same vars in SWA Application Settings, see [docs/deploy.md](deploy.md#env-vars-on-swa)

## Headless verification

Verifying the iframe actually mounts requires a real browser. `curl` alone cannot exercise the embed-react component. The pattern used in this session:

1. `npx playwright install chromium` (one-time)
2. Write a small `.mjs` script that loads `http://localhost:3000/one-page/`, fills the gate fields (`#email`, `#shippingMethod`), clicks "Use a new card" inside `Gr4vyBrandedFrame` (the saved-card UI defaults to selected, hides the embed children otherwise), waits, then dumps requests/responses/iframeSrcs/console errors.
3. Look for: `iframeSrcs` containing `embed.smarteremr.gr4vy.app`, gr4vy requests containing `POST /payment-options` returning 200, zero console errors.

A working reference script is at `/tmp/check-gr4vy.mjs` from this session. Not committed because it lives outside the repo.

The Gr4vyBrandedFrame saved-card row is a Wizlo-side UI, not Gr4vy. It is rendered before the embed and `useSaved` defaults to true. The embed only renders when the user picks "Use a new card". Easy to miss in headless tests.

## Key types and history

- The first `.env.local` (and `wizlo-app-latest/api/.env`) had a **2048-bit RSA** private key under `GR4VY_PRIVATE_KEY`. `getEmbedToken` rejected it with "Expected a PKCS#8 PEM-encoded EC private key on curve P-521 (ES512)". The wizlo-app backend was very likely failing every live Gr4vy call against that env, silently, because the Gr4vy client constructor does not validate the key, it only fails at first use. Worth flagging to whoever owns that service.
- The current key was decoded with `openssl pkey -text -noout` to confirm "ASN1 OID: secp521r1, NIST CURVE: P-521" before installing.

## Open

- Sandbox instance + key from Prateek. Until then production with the Test merchant is the hedge.
- Live deploy missing env vars. See [docs/deploy.md](deploy.md#env-vars-on-swa).
- `onEvent` is wired but unused on `Gr4vyEmbed`. Could forward to the analytics ring buffer if useful.
- Duplicate Affirm messaging. We render `AffirmMessaging` inside the Payment section. The Gr4vy embed will also show Affirm if the merchant has it enabled. Confirm with Johnny which one stays.
