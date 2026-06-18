import { execFileSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "../..");
const dbPath = join(webRoot, "prisma/dev.db");
const migrationPath = join(webRoot, "prisma/migrations/20260618000000_init/migration.sql");

rmSync(join(webRoot, "dev.db"), { force: true });
rmSync(dbPath, { force: true });

const migration = readFileSync(migrationPath, "utf8").replaceAll("JSONB", "TEXT");

execFileSync("sqlite3", [dbPath], {
  cwd: webRoot,
  input: migration,
  stdio: ["pipe", "inherit", "inherit"],
});
