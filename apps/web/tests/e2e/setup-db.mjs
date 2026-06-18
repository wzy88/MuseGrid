import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "../..");
const dbPath = join(webRoot, "prisma/dev.db");
const migrationsPath = join(webRoot, "prisma/migrations");

rmSync(join(webRoot, "dev.db"), { force: true });
rmSync(dbPath, { force: true });

const migration = readdirSync(migrationsPath)
  .sort()
  .map((migrationDir) => readFileSync(join(migrationsPath, migrationDir, "migration.sql"), "utf8"))
  .join("\n")
  .replaceAll("JSONB", "TEXT");

execFileSync("sqlite3", [dbPath], {
  cwd: webRoot,
  input: migration,
  stdio: ["pipe", "inherit", "inherit"],
});

execFileSync("corepack", ["pnpm", "tsx", "prisma/seed.ts"], {
  cwd: webRoot,
  env: {
    ...process.env,
    DATABASE_URL: "file:./dev.db",
  },
  stdio: "inherit",
});
