# Shared code

TypeScript shared by the web app (`src/`) and the mobile app (`apps/mobile/`). Both import it as `@shared/*`:

```ts
import { APP_NAME } from "@shared/brand";
```

Keep this folder **dependency-free**, with no `react`, `react-native` or other package imports. The mobile app bundles it from outside its own project. Any package imported here would resolve against the web app's `node_modules` and could load a second copy of React into the mobile app. When shared code needs a library such as `zod`, convert the repository to npm workspaces first so Expo's automatic monorepo setup applies.
