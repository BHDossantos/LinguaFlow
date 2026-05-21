import { test, expect } from "@playwright/test";

// Uses the bare (unauthenticated) test — no fixture — to confirm the auth gate.
test.describe("auth gate (signed out)", () => {
  test("protected page redirects to sign-in", async ({ page }) => {
    await page.goto("/learn");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("protected API returns 401 JSON, not an HTML redirect", async ({ request }) => {
    const resp = await request.post("/api/translate", { data: {} });
    expect(resp.status()).toBe(401);
    expect(resp.headers()["content-type"]).toContain("application/json");
  });

  test("sign-in page is publicly reachable", async ({ page }) => {
    const resp = await page.goto("/sign-in");
    expect(resp?.status()).toBe(200);
    await expect(page.getByRole("button", { name: /magic link/i })).toBeVisible();
  });
});
