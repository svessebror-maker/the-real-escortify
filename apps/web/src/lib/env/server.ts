import "server-only";

import { parseServerEnv, type ServerEnv } from "./schema";

let cached: ServerEnv | undefined;

/** Validated server environment. Throws with variable names (never values) if invalid. */
export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  const result = parseServerEnv(process.env);
  if (!result.ok) {
    throw new Error(
      `Invalid server environment:\n  - ${result.problems.join("\n  - ")}`,
    );
  }
  cached = result.env;
  return cached;
}
