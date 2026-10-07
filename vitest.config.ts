import { defineConfig } from "vitest/config";

// Unit tests for pure logic libraries (no DB, no network). Component/route and
// RLS coverage lives in the Playwright e2e suite.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
