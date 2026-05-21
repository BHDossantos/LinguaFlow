import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Loads .env.local into process.env (Playwright doesn't do this the way Next does).
export function loadEnv() {
  try {
    const txt = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of txt.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
    }
  } catch {
    // no .env.local — rely on the ambient environment
  }
}

loadEnv();

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost:54321";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const TEST_USER = {
  email: "learner@test.local",
  password: "test-password-123",
};

// Seeded by devstack/setup.sh — a project-kind assignment in the Spanish course.
export const SEEDED_ASSIGNMENT_ID = "33333333-3333-3333-3333-333333333333";
