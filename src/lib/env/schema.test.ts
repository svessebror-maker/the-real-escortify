import { describe, expect, it } from "vitest";

import { parseServerEnv } from "./schema";

const validKey = Buffer.alloc(32, 7).toString("base64");

const validCore = {
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-test",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-test",
  STYTCH_PROJECT_ID: "project-test",
  STYTCH_SECRET: "stytch-secret-test",
  NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN: "public-token-test",
  TOKEN_ENCRYPTION_KEY: validKey,
};

describe("parseServerEnv", () => {
  it("accepts a complete core configuration without integration variables", () => {
    const result = parseServerEnv(validCore);
    expect(result.ok).toBe(true);
  });

  it("reports every missing core variable by name", () => {
    const result = parseServerEnv({});
    expect(result.ok).toBe(false);
    if (result.ok) return;
    for (const name of Object.keys(validCore)) {
      expect(result.problems).toContain(`${name} is required`);
    }
  });

  it("treats empty and whitespace-only values as unset", () => {
    const result = parseServerEnv({ ...validCore, STYTCH_SECRET: "   " });
    expect(result).toEqual({ ok: false, problems: ["STYTCH_SECRET is required"] });
  });

  it("treats empty optional integration values as unset", () => {
    const result = parseServerEnv({ ...validCore, GOOGLE_CLIENT_ID: "" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.env.GOOGLE_CLIENT_ID).toBeUndefined();
  });

  it("rejects malformed URLs", () => {
    const result = parseServerEnv({ ...validCore, NEXT_PUBLIC_SUPABASE_URL: "not a url" });
    expect(result).toEqual({
      ok: false,
      problems: ["NEXT_PUBLIC_SUPABASE_URL must be a valid URL"],
    });
  });

  it("requires the encryption key to be 32 base64-encoded bytes", () => {
    const short = Buffer.alloc(16, 1).toString("base64");
    const result = parseServerEnv({ ...validCore, TOKEN_ENCRYPTION_KEY: short });
    expect(result).toEqual({
      ok: false,
      problems: ["TOKEN_ENCRYPTION_KEY must be 32 random bytes, base64-encoded"],
    });
  });

  it("never includes variable values in problem messages", () => {
    const secret = "sk_this_value_must_not_leak";
    const result = parseServerEnv({
      ...validCore,
      NEXT_PUBLIC_APP_URL: secret,
      TOKEN_ENCRYPTION_KEY: secret,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.problems.join("\n")).not.toContain(secret);
  });

  it("ignores unrelated variables", () => {
    const result = parseServerEnv({ ...validCore, PATH: "/usr/bin", HOME: "/home/x" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.env).not.toHaveProperty("PATH");
  });
});
