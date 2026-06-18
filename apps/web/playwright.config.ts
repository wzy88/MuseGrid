import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:3000",
  },
  webServer: {
    command: "node tests/e2e/setup-db.mjs && corepack pnpm dev",
    env: {
      DATABASE_URL: "file:./dev.db",
      SESSION_SECRET: "musegrid-playwright-session-secret",
    },
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
  },
});
