// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

import { generateEcJwk } from "./test-keys";

const core = {
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-test",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-value-must-not-leak",
  SUPABASE_JWT_SIGNING_KEY: JSON.stringify(generateEcJwk()),
  STYTCH_PROJECT_ID: "project-test",
  STYTCH_SECRET: "stytch-secret-value-must-not-leak",
  NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN: "public-token-test",
  TOKEN_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString("base64"),
};

function stubCore(overrides: Partial<Record<keyof typeof core, string>> = {}) {
  for (const [name, value] of Object.entries({ ...core, ...overrides })) {
    vi.stubEnv(name, value);
  }
}

// server.ts caches the parsed env at module level; load a fresh copy per test.
async function loadServerEnv() {
  vi.resetModules();
  return (await import("./server")).getServerEnv;
}

describe("getServerEnv", () => {
  beforeEach(() => {
    stubCore();
  });

  it("returns the validated environment and caches it", async () => {
    const getServerEnv = await loadServerEnv();
    const first = getServerEnv();
    expect(first.STYTCH_PROJECT_ID).toBe("project-test");
    expect(getServerEnv()).toBe(first);
  });

  it("throws naming the missing variable without leaking any value", async () => {
    stubCore({ STYTCH_SECRET: "" });
    const getServerEnv = await loadServerEnv();
    expect(getServerEnv).toThrow(/STYTCH_SECRET is required/);
    try {
      getServerEnv();
    } catch (error) {
      expect(String(error)).not.toContain(core.SUPABASE_SERVICE_ROLE_KEY);
    }
  });
});
