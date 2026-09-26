import { createPrivateKey, createPublicKey, sign, verify } from "node:crypto";

import { z } from "zod";

// Pure schema and parser, safe to import from tests and from instrumentation.
// App code should read variables through `getServerEnv()` in ./server.ts.

const required = () =>
  z.string({ error: "is required" }).min(1, { error: "is required" });

// Only http(s): bare hosts like "localhost:3000" and schemes like
// "javascript:" otherwise pass z.url().
const httpProtocol = /^https?$/;

const requiredUrl = () =>
  z.url({
    protocol: httpProtocol,
    error: (issue) =>
      issue.input === undefined ? "is required" : "must be a valid URL",
  });

const optional = () => z.string().min(1).optional();

const base64Key32 = () =>
  required().refine((value) => Buffer.from(value, "base64").length === 32, {
    error: "must be 32 random bytes, base64-encoded",
  });

// A usable ES256 signing key: a P-256 private JWK with a kid for the JWT
// header, whose private part matches its public coordinates.
const signingProbe = Buffer.from("letsseeeify-signing-key-check");

const isEs256PrivateJwk = (value: string) => {
  try {
    const jwk: unknown = JSON.parse(value);
    if (typeof jwk !== "object" || jwk === null || Array.isArray(jwk)) return false;
    const { kid, kty, crv, x, y, d } = jwk as Record<string, unknown>;
    if (typeof kid !== "string" || kid === "") return false;
    if (kty !== "EC" || crv !== "P-256") return false;
    if (typeof x !== "string" || typeof y !== "string" || typeof d !== "string") {
      return false;
    }
    const privateKey = createPrivateKey({ key: { kty, crv, x, y, d }, format: "jwk" });
    const publicKey = createPublicKey({ key: { kty, crv, x, y }, format: "jwk" });
    const signature = sign("sha256", signingProbe, privateKey);
    return verify("sha256", signingProbe, publicKey, signature);
  } catch {
    return false;
  }
};

const es256PrivateJwk = () =>
  required().refine(isEs256PrivateJwk, {
    error: "must be an ES256 private JWK (P-256 with kid, x, y and d)",
  });

export const serverEnvSchema = z.object({
  // Core: required from the auth phase onward.
  NEXT_PUBLIC_APP_URL: requiredUrl(),
  NEXT_PUBLIC_SUPABASE_URL: requiredUrl(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: required(),
  SUPABASE_SERVICE_ROLE_KEY: required(),
  // Signs short-lived Supabase access tokens (docs/build-plan.md, Step 7).
  SUPABASE_JWT_SIGNING_KEY: es256PrivateJwk(),
  STYTCH_PROJECT_ID: required(),
  STYTCH_SECRET: required(),
  NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN: required(),
  TOKEN_ENCRYPTION_KEY: base64Key32(),

  // Optional until the phase that uses them makes them required.
  STYTCH_WEBHOOK_SECRET: optional(),
  GOOGLE_CLIENT_ID: optional(),
  GOOGLE_CLIENT_SECRET: optional(),
  GOOGLE_REDIRECT_URI: z
    .url({ protocol: httpProtocol, error: "must be a valid URL" })
    .optional(),
  GITHUB_CLIENT_ID: optional(),
  GITHUB_CLIENT_SECRET: optional(),
  FIGMA_CLIENT_ID: optional(),
  FIGMA_CLIENT_SECRET: optional(),
  ASANA_CLIENT_ID: optional(),
  ASANA_CLIENT_SECRET: optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export type EnvParseResult =
  | { ok: true; env: ServerEnv }
  | { ok: false; problems: string[] };

/**
 * Validates environment variables. Empty strings count as unset, so a copied
 * `.env.example` fails loudly. Problems name variables only, never values.
 */
export function parseServerEnv(
  source: Record<string, string | undefined>,
): EnvParseResult {
  const keys = Object.keys(serverEnvSchema.shape);
  const cleaned: Record<string, string> = {};
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value.trim() !== "") cleaned[key] = value.trim();
  }

  const result = serverEnvSchema.safeParse(cleaned);
  if (result.success) return { ok: true, env: result.data };

  const problems = result.error.issues.map(
    (issue) => `${issue.path.join(".")} ${issue.message}`,
  );
  return { ok: false, problems };
}
