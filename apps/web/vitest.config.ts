import { defineConfig } from "vitest/config";

process.env.DATABASE_URL ??= "file:./dev.db";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts", "**/*.test.tsx"],
  },
});
