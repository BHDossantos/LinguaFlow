import { test, expect } from "./fixtures";

// Every authenticated route should render: respond < 400, not bounce to
// /sign-in, and produce no uncaught JS / console errors. RSC-prefetch aborts
// are filtered — they're benign dev-mode HMR noise, not app bugs.
const ROUTES = [
  "/",
  "/onboarding",
  "/learn",
  "/learn?scope=all",
  "/review",
  "/assignments",
  "/practice",
  "/community",
  "/career",
  "/translate",
  "/tutors",
  "/family",
  "/teach",
  "/school",
  "/inbox",
  "/coach",
  "/profile",
  "/settings",
  "/leaderboard",
  "/search",
];

for (const route of ROUTES) {
  test(`signed-in render: ${route}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error" && !m.text().includes("RSC payload")) {
        errors.push(`console: ${m.text()}`);
      }
    });

    const resp = await page.goto(route, { waitUntil: "networkidle" });

    expect(resp?.status(), "HTTP status").toBeLessThan(400);
    expect(page.url(), "should not redirect to sign-in").not.toContain("/sign-in");
    await expect(page.locator("body")).not.toBeEmpty();
    expect(errors, "no JS/console errors").toEqual([]);
  });
}
