# Letsseeeify repository guide

This repository is a monorepo for the Letsseeeify product:

- Web app: [apps/web](apps/web)
- Mobile app: [apps/mobile](apps/mobile)
- Shared code: [packages/shared](packages/shared)
- Brand tooling: [brand](brand)
- Deployment scripts: [deploy](deploy)
- Product plan: [docs/build-plan.md](docs/build-plan.md)

## Mission and architecture

This is a mobile-first discovery and collaboration product. The web app is the main app and API surface, while the mobile app is a separate Expo/React Native app. Shared TypeScript lives in [packages/shared](packages/shared) and should remain dependency-free. Do not duplicate logic across apps when it belongs in the shared package.

## Important conventions

- Keep changes scoped to the relevant app or package. Use the app-specific instructions in [apps/web/AGENTS.md](apps/web/AGENTS.md) and [apps/mobile/AGENTS.md](apps/mobile/AGENTS.md) for detailed rules.
- The root is a npm workspace. Run install and common scripts from the repo root unless the task is specifically mobile-only.
- Node version is pinned in [.nvmrc](.nvmrc) and the repo expects Node 24.15+ or 26+.
- Do not commit credentials or secrets. `.env*` files are ignored except for `.env.example`.
- Treat missing environment variables as a warning during local development and as a hard failure in production builds.
- For the web app, prefer the existing Next.js app-router patterns; for the mobile app, prefer Expo Router and native-safe patterns.
- Avoid editing generated or build-output folders (for example `.next`, `dist`, Android/iOS generated folders) unless the task explicitly requires it.

## Quick start

```bash
npm install
cp apps/web/.env.example apps/web/.env.local
npm run dev
```

For the mobile app:

```bash
npm install --prefix apps/mobile
npm run mobile
```

## Common commands

Run from the repository root:

```bash
npm run dev          # web dev server
npm run build        # web production build
npm run typecheck    # web typecheck + generated route types
npm run lint         # repo lint check
npm test -- --run    # workspace tests
npm run test:e2e     # Playwright e2e tests
npm run brand:generate
npm run mobile       # Expo dev server
```

## Repo-specific guidance

- Read [README.md](README.md) for the high-level product and environment setup.
- Read [docs/build-plan.md](docs/build-plan.md) before planning larger feature work.
- For deployment and hosting operations, see [deploy/README.md](deploy/README.md).
- For product and brand assets, use the tooling under [brand](brand) and [scripts](scripts).
- Keep the codebase aligned with the currently documented stack: Next.js 16, Tailwind CSS 4, Supabase, Stytch, Vitest, Playwright, and Expo SDK 57.

## When making changes

- Prefer the smallest change that matches the existing architecture.
- Reuse shared logic for cross-app behavior instead of duplicating code.
- Validate with the most targeted command available for the changed area.
- If the work affects web behavior, follow the stronger guidance in [apps/web/AGENTS.md](apps/web/AGENTS.md).
- If the work affects mobile behavior, follow the detailed Expo guidance in [apps/mobile/AGENTS.md](apps/mobile/AGENTS.md).

## Related docs

- [README.md](README.md)
- [docs/build-plan.md](docs/build-plan.md)
- [apps/web/AGENTS.md](apps/web/AGENTS.md)
- [apps/mobile/AGENTS.md](apps/mobile/AGENTS.md)
- [deploy/README.md](deploy/README.md)
