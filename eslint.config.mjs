// One ESLint config for the repository: the web app, shared code, brand
// artwork and scripts. The mobile app has its own (apps/mobile/eslint.config.js).
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  { settings: { next: { rootDir: "apps/web/" } } },
  globalIgnores([
    "**/.next/**",
    "**/out/**",
    "**/build/**",
    "**/next-env.d.ts",
    "**/coverage/**",
    "**/playwright-report/**",
    "**/test-results/**",
    "apps/mobile/**",
    "local/**",
  ]),
]);

export default eslintConfig;
