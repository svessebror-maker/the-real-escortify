import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so a stray lockfile in a parent folder is ignored.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
