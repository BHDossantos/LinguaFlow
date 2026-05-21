import { test, expect } from "./fixtures";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SEEDED_ASSIGNMENT_ID } from "./env";

// Exercises the one flow that touches Supabase storage: submitting an
// assignment with a file attachment. Covers SubmitForm -> storage upload ->
// submitAssignment server action -> result page.
test("submit an assignment with text + a file attachment", async ({ page }) => {
  const attachment = join(tmpdir(), "lf-e2e-attachment.txt");
  writeFileSync(attachment, "Mi rutina matutina de prueba.\n");

  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" && !m.text().includes("RSC payload")) {
      errors.push(`console: ${m.text()}`);
    }
  });

  await page.goto(`/assignments/${SEEDED_ASSIGNMENT_ID}`);
  await expect(page.locator("textarea").first()).toBeVisible();

  await page
    .locator("textarea")
    .first()
    .fill(
      "Me despierto a las siete. Desayuno cafe y pan. Estudio espanol una hora. Voy al trabajo.",
    );
  await page.locator('input[type="file"]').setInputFiles(attachment);

  await page.locator('button[type="submit"]').click();

  // submitAssignment redirects to the result page on success.
  await page.waitForURL(/\/assignments\/.*\/result/, { timeout: 30_000 });
  await expect(page.locator("summary", { hasText: "Your submission" })).toBeVisible();
  expect(errors, "no JS/console errors during submission").toEqual([]);
});
