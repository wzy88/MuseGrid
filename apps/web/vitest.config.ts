import { defineConfig } from "vitest/config";

process.env.DATABASE_URL ??= "file:./dev.db";

export default defineConfig({
  test: {
    environment: "node",
    fileParallelism: false,
    include: ["**/*.test.ts", "**/*.test.tsx"],
  },
});
