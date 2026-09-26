// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { register } from "./instrumentation";

const leakCheck = "service-role-value-must-not-leak";

describe("register", () => {
  beforeEach(() => {
    // An invalid environment: one secret set, every other core variable missing.
    for (const name of [
      "NEXT_PUBLIC_APP_URL",
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "SUPABASE_JWT_SIGNING_KEY",
      "STYTCH_PROJECT_ID",
      "STYTCH_SECRET",
      "NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN",
      "TOKEN_ENCRYPTION_KEY",
    ]) {
      vi.stubEnv(name, "");
    }
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", leakCheck);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does nothing outside the Node.js runtime", async () => {
    vi.stubEnv("NEXT_RUNTIME", "edge");
    vi.stubEnv("NODE_ENV", "production");
    await expect(register()).resolves.toBeUndefined();
  });

  it("refuses to start in production with names-only problems", async () => {
    vi.stubEnv("NEXT_RUNTIME", "nodejs");
    vi.stubEnv("NODE_ENV", "production");
    const failure = register();
    await expect(failure).rejects.toThrow(/STYTCH_SECRET is required/);
    await expect(failure).rejects.not.toThrow(leakCheck);
  });

  it("still refuses in production unless preview is exactly 1", async () => {
    vi.stubEnv("NEXT_RUNTIME", "nodejs");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("LETSSEEEIFY_PREVIEW", "true");
    await expect(register()).rejects.toThrow(/STYTCH_SECRET is required/);
  });

  it("only warns in production preview mode", async () => {
    vi.stubEnv("NEXT_RUNTIME", "nodejs");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("LETSSEEEIFY_PREVIEW", "1");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await expect(register()).resolves.toBeUndefined();
    expect(String(warn.mock.calls[0]?.[0])).toMatch(/^\[env\] Preview mode: [\s\S]*STYTCH_SECRET is required/);
    expect(String(warn.mock.calls[0]?.[0])).not.toContain(leakCheck);
  });

  it("only warns in development", async () => {
    vi.stubEnv("NEXT_RUNTIME", "nodejs");
    vi.stubEnv("NODE_ENV", "development");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await expect(register()).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[0])).toMatch(/STYTCH_SECRET is required/);
    expect(String(warn.mock.calls[0]?.[0])).not.toContain(leakCheck);
  });
});
