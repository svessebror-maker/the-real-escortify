import path from "node:path";

import type { NextConfig } from "next";

// Baseline headers for every route. When the auth phase adds a nonce-based
// Content-Security-Policy in src/proxy.ts, merge these directives into it.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The npm workspace root, where dependencies are hoisted. Pinning it also
  // stops a stray lockfile in a parent folder from being picked up.
  turbopack: {
    root: path.join(__dirname, "..", ".."),
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
