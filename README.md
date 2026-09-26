# Letsseeeify

Mobile-first academic discovery and collaboration: browse one relevant profile or project at a time, express interest, match on mutual interest, then chat and collaborate.

The build plan lives in [docs/build-plan.md](docs/build-plan.md). Work proceeds one phase at a time.

## Repository layout

| Path | What it is |
|---|---|
| `src/` | Next.js web app, which is also the API the mobile app uses |
| `apps/mobile/` | iOS and Android app (Expo). See [apps/mobile/README.md](apps/mobile/README.md) |
| `packages/shared/` | Dependency-free TypeScript used by both apps, imported as `@shared/*` |
| `docs/` | Build plan |

## Stack

- Web: Next.js 16 (App Router, TypeScript strict), Tailwind CSS 4, Stytch auth, Supabase (Postgres, RLS, Realtime, Storage), Zod, React Hook Form, Framer Motion, Vitest, Playwright.
- Mobile: Expo SDK 57 (React Native 0.86) with Expo Router, built with EAS.

## Getting started

Requires Node 24.15+ or 26+ (`.nvmrc` pins 24).

```bash
npm install
cp .env.example .env.local   # then fill in values
npm run dev
```

In development, missing environment variables are reported as a warning. In production (`next start`), the server refuses to start until they are set. Messages list variable names only, never values.

`NEXT_PUBLIC_*` values are inlined into the browser bundle at `next build`. Set them in the build environment: changing them at runtime has no effect in the browser.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run typecheck` | Generate route types, then `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test -- --run` | Unit and component tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright; run `npx playwright install chromium` once). Reuses a dev server already running on port 3000 |

## CI

Every pull request and push to `main` runs:

- **CI** (`.github/workflows/ci.yml`):
  - Web: type check, lint, unit tests and production build, then a check that server-only secrets never appear in the build output. Playwright end-to-end tests run in a separate job.
  - Mobile: type check, lint, `expo-doctor`, and a JavaScript bundle for Android and iOS.
- **Secret scan** (`.github/workflows/secret-scan.yml`): gitleaks over the full history.

Dependabot proposes weekly updates for the web app's npm packages and for GitHub Actions, and every update runs through the same checks. The mobile app is upgraded one Expo SDK at a time instead (see its README).

## Secrets

Never commit real credentials. `.env*` files (except `.env.example`) are gitignored, and CI scans every pull request for leaked secrets.
