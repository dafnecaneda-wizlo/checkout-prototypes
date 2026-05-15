# Deploy

Azure Static Web Apps. Cross-referenced from [AGENT_CONTEXT.md](../AGENT_CONTEXT.md).

## Live URL

```
https://zealous-stone-0536e2a0f.7.azurestaticapps.net
```

Returned by the SWA deploy action in workflow logs. Not pinned in the repo. Pull from the latest successful run in https://github.com/dafnecaneda-wizlo/checkout-prototypes/actions if it ever changes.

## Workflow

`.github/workflows/azure-static-web-apps.yml` runs on `push` to `main` and on PR open/sync/reopen/close. The build approach is **Next.js hybrid**, not static export.

Key config:

```yaml
app_location: "/"
api_location: ""
output_location: ""
# no skip_app_build, no manual `npm run build` step
```

SWA's Oryx pipeline detects Next.js at `app_location`, runs `next build` itself, and uploads the result. Requires Node 20 (pinned via `actions/setup-node`).

The change history of this workflow:
- Original ran `npm install` + `npm run build` then uploaded `out/` with `skip_app_build: true`. That worked when `next.config.ts` had `output: "export"`.
- When the Gr4vy `/api/checkout-session` route was added, `output: "export"` had to come out (server route would not compile under static export). The old workflow then either failed or uploaded stale content.
- Rewritten 2026-05-15 to the hybrid form above. First three runs after the rewrite all succeeded.

## next.config.ts

```ts
output: "standalone",
trailingSlash: true,
images: { unoptimized: true },
```

`output: "standalone"` is the right choice for serverful Next.js deploys (it bundles the minimum runtime files). `trailingSlash: true` matches SWA's preference and was already there. `images: { unoptimized: true }` because the prototype does not use Next image optimization.

## env vars on SWA

**This is the open work.**

`.env.local` is gitignored so the Gr4vy creds never reach the SWA runtime. On the deployed site `POST /api/checkout-session/` returns:

```
500 {"error":"Server env missing GR4VY_PRIVATE_KEY / GR4VY_SERVER_ID / GR4VY_SERVER"}
```

The visual prototype works on the live URL. The Payment block fails when a user tries to enter card details because no token can be minted.

Two ways to fix:

### Option 1, Azure portal

Portal → Static Web Apps → pick the resource → Configuration → Application settings → "Add". Add each var below as a separate row. Save.

| Name | Value |
|---|---|
| GR4VY_PRIVATE_KEY | Same base64 string as local `.env.local` |
| GR4VY_SERVER_ID | `smarteremr` |
| GR4VY_SERVER | `production` |
| GR4VY_MERCHANT_ACCOUNT_ID | `WD9EOEClxD_AYKpHgo7pPCCCOtOIZBIhOtfmkpaG6LI` |
| NEXT_PUBLIC_GR4VY_ENVIRONMENT | `production` |
| NEXT_PUBLIC_GR4VY_ID | `smarteremr` |

`NEXT_PUBLIC_*` need to be set at **build** time for Next.js to inline them, so after adding them in SWA, push an empty commit or re-run the latest workflow to trigger a rebuild. Server-only vars (the others) take effect on the next request after save.

### Option 2, az CLI

```
az staticwebapp appsettings set \
  --name <swa-resource-name> \
  --resource-group <rg> \
  --setting-names \
    GR4VY_PRIVATE_KEY="<base64>" \
    GR4VY_SERVER_ID=smarteremr \
    GR4VY_SERVER=production \
    GR4VY_MERCHANT_ACCOUNT_ID=WD9EOEClxD_AYKpHgo7pPCCCOtOIZBIhOtfmkpaG6LI \
    NEXT_PUBLIC_GR4VY_ENVIRONMENT=production \
    NEXT_PUBLIC_GR4VY_ID=smarteremr
```

The resource name and resource group are not in the repo. Dafne or whoever set up the SWA originally has them.

## SWA tier note

Free tier supports static + managed Functions but the Next.js hybrid runtime for App Router server routes typically requires Standard tier. The deploy itself succeeds on Free tier (the build runs and uploads), but the `/api/checkout-session` route may 404 at runtime if Standard is not enabled. If env vars are correctly set and the route still 404s on the live URL, that is the tier problem. Switching tiers happens in the Azure portal under the SWA resource Pricing tab.

## Recent runs

| SHA | Conclusion | Notes |
|---|---|---|
| `b6077ad` | success | Bundle reshape 1/3/6/12 months |
| `25f44f9` | success | Mobile card restack |
| `2806ed3` | success | Workflow rewrite, AGENT_CONTEXT seeded |
| `22579a1` | (rolled into 2806ed3) | May 15 UI updates |
| `f13ce07` | (rolled into 2806ed3) | Gr4vy embed wiring |
| `1b09b6c` | success | Last green pre-Gr4vy deploy |

## How to test the live deploy

```
LIVE=https://zealous-stone-0536e2a0f.7.azurestaticapps.net

# routes
for r in "" one-page/ hybrid/ one-page-sticky/ analytics/ ; do
  curl -s -L -o /dev/null -w "/${r}: %{http_code}\n" $LIVE/${r}
done

# content sanity
curl -s -L $LIVE/one-page/ | grep -oE "1 Month Bundle|3 Month Bundle|6 Month Bundle|12 Month Bundle" | sort -u

# api route (will 500 until env vars are on SWA)
curl -s -X POST $LIVE/api/checkout-session/ \
  -H 'content-type: application/json' \
  -d '{"amount":82620,"currency":"USD"}'
```

All five route checks should return 200 (they did on the last verified run). The API check is the open one. Once env vars are configured it should return `{"checkoutSessionId":"...","token":"..."}` matching local behavior.
