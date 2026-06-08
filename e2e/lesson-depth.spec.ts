import { test, expect } from "./fixtures";

// A vocab lesson now drills each item in three modes: Recognize, Recall,
// Listen. This test walks the full sequence for the first lesson and asserts
// the right exercise renders at each step.
test.describe("vocab lesson — multi-mode practice", () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      // Hide SpeechRecognition so PronouncePractice falls back to the typed
      // input — headless browsers can't really transcribe speech.
      // @ts-expect-error
      delete window.SpeechRecognition;
      // @ts-expect-error
      delete window.webkitSpeechRecognition;
    });
  });

  const COURSE = "11111111-1111-1111-1111-111111111111";

  test("walks recognize → recall → listen, accepts typed answers with accents folded", async ({ page }) => {
    await page.goto(`/learn/${COURSE}`);
    await page.getByRole("link", { name: /Greetings.*introductions/ }).first().click();

    // Step 1 of N — Recognize the first term.
    await expect(page.getByText("Recognize")).toBeVisible();
    await page.getByText("Show answer").click();
    await expect(page.getByTestId("self-rate")).toBeVisible();
    await page.getByRole("button", { name: "Good" }).click();

    // Step 2 — Recall: type the term in target language (diacritic-free is OK).
    await expect(page.getByText("Recall")).toBeVisible();
    const form = page.getByTestId("typed-exercise-form");
    await expect(form).toBeVisible();
    // The first vocab item in the seeded lesson is "hola" (translated "hello").
    await form.locator("input").fill("hola");
    await form.locator('button[type="submit"]').click();
    await expect(page.getByTestId("typed-result")).toBeVisible();
    await expect(page.getByText(/correct/i)).toBeVisible();
    await page.getByTestId("typed-continue").click();

    // Step 3 — Listen: needs the prompt played before Check enables.
    await expect(page.getByText("Listen")).toBeVisible();
    await page.getByTestId("listen-play").click();
    const listenForm = page.getByTestId("typed-exercise-form");
    await listenForm.locator("input").fill("hola");
    await listenForm.locator('button[type="submit"]').click();
    await expect(page.getByText(/correct|almost/i).first()).toBeVisible();
  });

  test("recall: a wrong answer is graded as not-quite and reveals the expected term", async ({ page }) => {
    await page.goto(`/learn/${COURSE}`);
    await page.getByRole("link", { name: /Greetings.*introductions/ }).first().click();

    // Skip past Recognize quickly.
    await page.getByText("Show answer").click();
    await page.getByRole("button", { name: "Good" }).click();

    // Recall — answer with something clearly wrong.
    await expect(page.getByText("Recall")).toBeVisible();
    const form = page.getByTestId("typed-exercise-form");
    await form.locator("input").fill("xyz");
    await form.locator('button[type="submit"]').click();

    const result = page.getByTestId("typed-result");
    await expect(result).toBeVisible();
    await expect(result).toContainText(/not quite/i);
    await expect(result).toContainText("hola");
  });
});
