import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The mobile app has its own ESLint config (apps/mobile/eslint.config.js).
    "apps/**",
    // Test output and personal folders that are not part of the app.
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "Add random creds/**",
    "letsseeeify-hd/**",
    "For improvments/**",
    "To-use-in-future/**",
    "Svesse-Project-Template/**",
  ]),
]);

export default eslintConfig;
