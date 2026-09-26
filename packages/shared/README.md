# Shared code

TypeScript shared by the web app (`apps/web/`) and the mobile app (`apps/mobile/`). Both import it as `@shared/*`:

```ts
import { APP_NAME } from "@shared/brand";
```

Current modules are `brand` (product name and tagline), `discovery` (card data and sample profiles) and `swipe` (the deck's swipe rules). Their `*.test.ts` files run with Vitest from this package (`npm test` at the repository root runs them); tests are the one place imports are allowed.

Keep this folder **dependency-free**, with no `react`, `react-native` or other package imports. The mobile app bundles it from outside its own project. Any package imported here would resolve against the repository's `node_modules`, which hold the web app's dependencies, and could load a second copy of React into the mobile app. The root is an npm workspace, but `apps/mobile` is not part of it, because React Native pins a different React version. When shared code needs a library such as `zod`, first align the React versions and add `apps/mobile` to the workspace, so Expo's automatic monorepo setup applies.
