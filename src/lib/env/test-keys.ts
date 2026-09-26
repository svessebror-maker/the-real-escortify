import { generateKeyPairSync } from "node:crypto";

/** A freshly generated EC private JWK with a kid, shaped like SUPABASE_JWT_SIGNING_KEY. */
export function generateEcJwk(namedCurve = "P-256") {
  const { privateKey } = generateKeyPairSync("ec", { namedCurve });
  return { kid: "test-kid", ...privateKey.export({ format: "jwk" }) };
}
