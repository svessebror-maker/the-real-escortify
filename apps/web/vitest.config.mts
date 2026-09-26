import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const fromHere = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// Workspace packages are hoisted to the repository's node_modules, so resolve
// server-only through Node rather than a fixed path.
const serverOnlyDir = dirname(createRequire(import.meta.url).resolve("server-only"));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fromHere("./src"),
      "@shared": fromHere("../../packages/shared/src"),
      // `server-only` throws outside React Server Components; tests exercise
      // server modules directly, so resolve it to its no-op build.
      "server-only": join(serverOnlyDir, "empty.js"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    unstubEnvs: true,
  },
});
