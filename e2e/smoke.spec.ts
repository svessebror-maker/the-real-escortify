import { expect, test } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Letsseeeify");
  await expect(
    page.getByRole("heading", { level: 1, name: "Letsseeeify" }),
  ).toBeVisible();
});

test("page links its icons and link-preview image", async ({ page, request }) => {
  await page.goto("/");
  for (const selector of [
    'link[rel="icon"][type="image/svg+xml"]',
    'link[rel="apple-touch-icon"]',
    'meta[property="og:image"]',
  ]) {
    const element = page.locator(selector).first();
    const url = (await element.getAttribute("href")) ?? (await element.getAttribute("content"));
    expect(url, selector).toBeTruthy();
    const response = await request.get(url!);
    expect(response.ok(), `${selector} -> ${url}`).toBe(true);
  }
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute("content", /Letsseeeify/);
});

test("responses carry baseline security headers", async ({ page }) => {
  const response = await page.goto("/");
  const headers = response?.headers() ?? {};
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["x-powered-by"]).toBeUndefined();
});
