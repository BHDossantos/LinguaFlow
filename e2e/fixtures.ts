import { test as base, type BrowserContext } from "@playwright/test";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY, TEST_USER } from "./env";

// A Playwright `test` whose browser context is pre-authenticated as the seeded
// learner. It signs in through @supabase/ssr (same library the app uses),
// captures the cookies that library would set, and injects them — so the
// app's middleware and server components see a real logged-in session.
async function authCookies() {
  const captured: { name: string; value: string }[] = [];
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => [],
      setAll: (toSet: { name: string; value: string }[]) =>
        toSet.forEach((c) => captured.push({ name: c.name, value: c.value })),
    },
  });
  const { error } = await supabase.auth.signInWithPassword(TEST_USER);
  if (error) throw new Error(`e2e sign-in failed: ${error.message}`);
  return captured.map((c) => ({
    name: c.name,
    value: c.value,
    domain: "localhost",
    path: "/",
    sameSite: "Lax" as const,
  }));
}

export const test = base.extend<{ context: BrowserContext }>({
  context: async ({ context }, use) => {
    await context.addCookies(await authCookies());
    await use(context);
  },
});

export { expect } from "@playwright/test";
