// Runs once when a Next.js server instance starts.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { parseServerEnv } = await import("./lib/env/schema");
  const result = parseServerEnv(process.env);
  if (result.ok) return;

  const message = `Invalid server environment:\n  - ${result.problems.join("\n  - ")}\nSee .env.example.`;

  // Fail fast in production; in development, warn so the app can still be
  // explored before every service is configured.
  if (process.env.NODE_ENV === "production") throw new Error(message);
  console.warn(`[env] ${message}`);
}
