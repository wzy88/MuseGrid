import { defineConfig } from "@playwright/test";

const skipWebServer = process.env.PLAYWRIGHT_SKIP_WEBSERVER === "1";

export default defineConfig({
  testDir: "./tests/e2e",
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3000",
  },
  webServer: skipWebServer
    ? undefined
    : {
        command: "node tests/e2e/setup-db.mjs && corepack pnpm dev",
        env: {
          DATABASE_URL: "file:./dev.db",
          SESSION_SECRET: "musegrid-playwright-session-secret",
        },
        url: "http://127.0.0.1:3000",
        reuseExistingServer: !process.env.CI,
      },
});
