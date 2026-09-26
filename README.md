# Letsseeeify

Mobile-first academic discovery and collaboration: browse one relevant profile or project at a time, express interest, match on mutual interest, then chat and collaborate.

The build plan lives in [docs/build-plan.md](docs/build-plan.md). Work proceeds one phase at a time.

## Repository layout

```text
apps/
  web/              Next.js web app, also the API the mobile app uses
  mobile/           iOS and Android app (Expo); see apps/mobile/README.md
packages/
  shared/           Dependency-free TypeScript used by both apps (@shared/*)
brand/              Vector artwork for every icon and preview image
scripts/            Asset generation (npm run brand:generate)
docs/               Build plan
deploy/             Server deployment: systemd, nginx and update scripts (see deploy/README.md)
local/              Your personal files and notes: gitignored, never committed
```

The root is an npm workspace containing `apps/web` and `packages/shared`, so one `npm install` at the root sets up both. `apps/mobile` keeps its own install, because React Native pins a different React version than the web app.

## Stack

- Web: Next.js 16 (App Router, TypeScript strict), Tailwind CSS 4, Stytch auth, Supabase (Postgres, RLS, Realtime, Storage), Zod, React Hook Form, Framer Motion, Vitest, Playwright.
- Mobile: Expo SDK 57 (React Native 0.86) with Expo Router, built with EAS.

## Getting started

Requires Node 24.15+ or 26+ (`.nvmrc` pins 24).

```bash
npm install
cp apps/web/.env.example apps/web/.env.local   # then fill in values
npm run dev
```

For the mobile app, run `npm install` inside `apps/mobile`, then `npm run mobile` from the root.

In development, missing environment variables are reported as a warning. In production (`next start`), the server refuses to start until they are set. Messages list variable names only, never values.

`NEXT_PUBLIC_*` values are inlined into the browser bundle at `next build`. Set them in the build environment: changing them at runtime has no effect in the browser.

## Scripts

Run these from the repository root:

| Command | Purpose |
|---|---|
| `npm run dev` | Web development server |
| `npm run build` | Web production build |
| `npm run typecheck` | Generate route types, then `tsc --noEmit` (web app and shared code) |
| `npm run lint` | ESLint for the web app, shared code, brand artwork and scripts |
| `npm test -- --run` | Unit and component tests (Vitest) in every workspace |
| `npm run test:e2e` | End-to-end tests (Playwright; run `npx playwright install chromium` once). Reuses a dev server already running on port 3000 |
| `npm run brand:generate` | Regenerate every icon and preview image from `brand/artwork.mjs` |
| `npm run mobile` | Expo dev server for the mobile app |

## CI

Every pull request and push to `main` runs:

- **CI** (`.github/workflows/ci.yml`):
  - Web: type check, lint, unit tests and production build, then a check that server-only secrets never appear in the build output. Playwright end-to-end tests run in a separate job.
  - Mobile: type check, lint, `expo-doctor`, and a JavaScript bundle for Android and iOS.
- **Secret scan** (`.github/workflows/secret-scan.yml`): gitleaks over the full history.

Dependabot proposes weekly updates for the web app's npm packages and for GitHub Actions, and every update runs through the same checks. The mobile app is upgraded one Expo SDK at a time instead (see its README).

## Secrets

Never commit real credentials. `.env*` files (except `.env.example`) are gitignored, and CI scans every pull request for leaked secrets.
