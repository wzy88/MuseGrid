import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { join } from "node:path";

export function resetUnitDatabase() {
  const dbPaths = [join(process.cwd(), "dev.db"), join(process.cwd(), "prisma/dev.db")];
  for (const dbPath of dbPaths) {
    rmSync(dbPath, { force: true });
    rmSync(`${dbPath}-journal`, { force: true });
    rmSync(`${dbPath}-shm`, { force: true });
    rmSync(`${dbPath}-wal`, { force: true });
  }

  execFileSync(
    "corepack",
    ["pnpm", "prisma", "db", "push", "--skip-generate", "--accept-data-loss"],
    {
      cwd: process.cwd(),
      env: { ...process.env, RUST_LOG: "trace" },
      stdio: "pipe",
    },
  );
}
