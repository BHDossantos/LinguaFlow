import { test, expect } from "./fixtures";

// Plays the seeded "Checkpoint quiz" (Spanish essentials course) end to end:
// answer all four questions correctly, assert instant feedback and the
// final 100% score.
const COURSE = "11111111-1111-1111-1111-111111111112";

test("quiz lesson: answer all questions, see instant feedback and final score", async ({ page }) => {
  await page.goto(`/learn/${COURSE}`);
  await page.getByRole("link", { name: /checkpoint quiz/i }).first().click();

  const answers = ["la madre", "It's 3:30", "Hace sol", "the time"];
  for (const answer of answers) {
    await expect(page.getByTestId("quiz-prompt")).toBeVisible();
    await page.getByTestId("quiz-options").getByRole("button", { name: answer }).click();
    // Correct choice gets the ✓ mark and (when present) an explanation.
    await expect(page.getByTestId("quiz-options").getByText("✓")).toBeVisible();
    await page.getByTestId("quiz-next").click();
  }

  await expect(page.getByTestId("quiz-score")).toHaveText("100%");
});
