import { test, expect } from "./fixtures";

// Headless browsers don't actually transcribe speech, so this test forces the
// PronouncePractice component into its typed-fallback path (by hiding
// SpeechRecognition before the page loads) and drives a real round-trip
// against /api/pronunciation.
test.describe("pronunciation practice on a vocab lesson", () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      // @ts-expect-error — clearing both vendor-prefixed and standard names.
      delete window.SpeechRecognition;
      // @ts-expect-error
      delete window.webkitSpeechRecognition;
    });
  });

  // Navigate to the first vocab lesson of the seeded Spanish course via the UI.
  // Lesson UUIDs are random per seed run, so we discover via course detail.
  const COURSE = "11111111-1111-1111-1111-111111111111";

  test("good attempt scores high; wrong attempt scores low", async ({ page }) => {
    await page.goto(`/learn/${COURSE}`);
    await page.getByRole("link", { name: /Greetings.*introductions/ }).first().click();
    await expect(page.getByText("Show answer")).toBeVisible();
    await page.getByText("Show answer").click();

    const widget = page.getByTestId("pronounce-practice");
    await expect(widget).toBeVisible();
    const fallback = widget.getByTestId("typed-fallback");
    await expect(fallback).toBeVisible();

    // Good attempt — type the reference verbatim.
    const referenceExample = "Hola, ¿cómo estás?";
    await fallback.locator("input").fill(referenceExample);
    await fallback.locator('button[type="submit"]').click();

    const goodScore = await widget.getByTestId("pronunciation-score").textContent();
    expect(Number(goodScore)).toBeGreaterThanOrEqual(80);

    // Re-attempt with a clearly wrong phrase.
    await widget.getByRole("button", { name: "Clear" }).click();
    await fallback.locator("input").fill("totally wrong attempt");
    await fallback.locator('button[type="submit"]').click();

    const badScore = await widget.getByTestId("pronunciation-score").textContent();
    expect(Number(badScore)).toBeLessThanOrEqual(40);

    // The wrong-phrase result colors at least one reference word as missed.
    await expect(widget.locator(".bg-red-100").first()).toBeVisible();
  });
});
