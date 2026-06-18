# MuseGrid MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first usable MuseGrid Web MVP: authenticated users can create a song project, move through lyrics/composition/arrangement/production steps with creator avatars, call MiniMax to generate playable audio, view saved works and contribution chains, and submit a creator-avatar onboarding application.

**Architecture:** Use a monorepo so Web is the first client, not the only client. Put cross-platform domain models, enums, state machines, prompt builders, and validation in `packages/core`; put reusable design tokens in `packages/ui-tokens`; build the first client in `apps/web` with Next.js API routes that expose `/api/v1/*` endpoints designed for future App and mini-program clients.

**Tech Stack:** TypeScript, Next.js App Router, React, Tailwind CSS, Prisma, SQLite for local MVP storage, Vitest for unit tests, Playwright for end-to-end tests, MiniMax Music Generation API for playable demos.

## Global Constraints

- Product identity: MuseGrid is a future music industry operating system, not a generic AI song generator or ordinary admin dashboard.
- Supply-side terminology: use `创作人` and `创作人分身`; do not use `专家` in product UI.
- MVP demand-side flow: login -> create project -> lyrics -> composition -> arrangement -> production/demo -> playable audio -> contribution chain.
- MVP supply-side flow: become a creator -> choose capability direction -> submit profile/cases/questionnaire -> preview Level 1 avatar -> dashboard with growth tasks and simulated metrics.
- Cross-platform constraint: core business concepts, enums, API contracts, and state machines must live outside Web page components so App and mini-program clients can reuse them.
- MiniMax constraint: call MiniMax only from the server; never expose `MINIMAX_API_KEY` to the browser.
- MiniMax current official API reference: `POST https://api.minimax.io/v1/music_generation`, Bearer auth, `music-2.6` or `music-2.6-free`, `lyrics` 1-3500 chars for non-instrumental generation, `prompt` max 2000 chars, `output_format` can be `url` or `hex`, and `url` results expire after 24 hours.
- Design constraint: use dark spatial UI, luminous cyan/green accents, contribution nodes, waveform language, and creator-avatar evolution visuals while maintaining real SaaS usability.
- Accessibility constraint: interactive targets at least 44px, visible focus states, no color-only status meaning, clear loading/error states.
- First version storage: local SQLite via Prisma is acceptable for MVP; schema must be portable to Postgres.
- Shell constraint: paths containing parentheses, such as `apps/web/app/(app)`, must be quoted in shell commands.

---

## File Structure

Create this structure during implementation:

```text
.
├── apps/
│   └── web/
│       ├── app/
│       │   ├── (auth)/
│       │   ├── (app)/
│       │   ├── api/v1/
│       │   ├── globals.css
│       │   └── layout.tsx
│       ├── components/
│       │   ├── app-shell/
│       │   ├── audio/
│       │   ├── avatars/
│       │   ├── contribution/
│       │   ├── creator-onboarding/
│       │   ├── studio/
│       │   └── ui/
│       ├── lib/
│       │   ├── auth/
│       │   ├── db/
│       │   ├── minimax/
│       │   ├── repositories/
│       │   └── server/
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── seed.ts
│       ├── tests/
│       │   ├── e2e/
│       │   └── unit/
│       ├── next.config.ts
│       ├── package.json
│       ├── playwright.config.ts
│       ├── tailwind.config.ts
│       └── vitest.config.ts
├── packages/
│   ├── core/
│   │   ├── src/
│   │   │   ├── domain.ts
│   │   │   ├── fixtures.ts
│   │   │   ├── prompt-builder.ts
│   │   │   ├── state-machines.ts
│   │   │   ├── validation.ts
│   │   │   └── index.ts
│   │   ├── tests/
│   │   └── package.json
│   └── ui-tokens/
│       ├── src/
│       │   ├── tokens.ts
│       │   ├── tokens.css
│       │   └── index.ts
│       └── package.json
├── docs/
│   └── superpowers/
│       ├── plans/
│       └── specs/
├── .env.example
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

Responsibility boundaries:

- `packages/core`: cross-platform product model and logic. No React, no DOM, no Next.js imports.
- `packages/ui-tokens`: visual language that can later be translated to App and mini-program theme tokens.
- `apps/web/lib/repositories`: database read/write functions. Page components must not call Prisma directly.
- `apps/web/app/api/v1`: client-facing API contracts that future App and mini-program clients can reuse.
- `apps/web/components`: Web implementation of the future music operating system UI.

---

### Task 1: Scaffold Monorepo And Web App

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `.env.example`
- Create: `README.md`
- Create: `apps/web/package.json`
- Create: `apps/web/app/layout.tsx`
- Create: `apps/web/app/globals.css`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/vitest.config.ts`
- Create: `apps/web/playwright.config.ts`
- Create: `packages/core/package.json`
- Create: `packages/ui-tokens/package.json`

**Interfaces:**
- Produces workspace scripts:
  - `pnpm dev`
  - `pnpm test`
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm e2e`
- Produces import aliases:
  - `@musegrid/core`
  - `@musegrid/ui-tokens`

- [ ] **Step 1: Initialize package manager workspace**

Run:

```bash
pnpm init
```

Expected:

```text
package.json
```

- [ ] **Step 2: Create Next.js app and package folders**

Run:

```bash
pnpm create next-app@latest apps/web --ts --tailwind --eslint --app --src-dir false --import-alias "@/*"
mkdir -p packages/core/src packages/core/tests packages/ui-tokens/src
```

Expected:

```text
apps/web/app
packages/core/src
packages/ui-tokens/src
```

- [ ] **Step 3: Add workspace configuration**

Create `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

Create root `package.json` scripts:

```json
{
  "name": "musegrid",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter @musegrid/web dev",
    "build": "pnpm --filter @musegrid/web build",
    "lint": "pnpm --filter @musegrid/web lint",
    "typecheck": "pnpm -r typecheck",
    "test": "pnpm -r test",
    "e2e": "pnpm --filter @musegrid/web e2e"
  }
}
```

Create `README.md`:

```md
# MuseGrid

MuseGrid is a future music industry operating system. The first client is a Web MVP, with shared core models and API contracts prepared for future App and mini-program clients.

## Development

```bash
pnpm install
pnpm dev
```
```

- [ ] **Step 4: Add environment template**

Create `.env.example`:

```bash
DATABASE_URL="file:./dev.db"
SESSION_SECRET="replace-with-32-character-minimum-secret"
MINIMAX_API_KEY=""
MINIMAX_MODEL="music-2.6-free"
MINIMAX_OUTPUT_FORMAT="url"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

- [ ] **Step 5: Verify scaffold**

Run:

```bash
pnpm install
pnpm typecheck
```

Expected:

```text
No TypeScript errors
```

- [ ] **Step 6: Commit**

Run:

```bash
git add package.json pnpm-workspace.yaml tsconfig.base.json .env.example README.md apps packages
git commit -m "chore: scaffold MuseGrid monorepo"
```

---

### Task 2: Define Cross-Platform Core Domain And State Machines

**Files:**
- Create: `packages/core/src/domain.ts`
- Create: `packages/core/src/state-machines.ts`
- Create: `packages/core/src/validation.ts`
- Create: `packages/core/src/index.ts`
- Create: `packages/core/tests/domain.test.ts`
- Modify: `packages/core/package.json`

**Interfaces:**
- Produces enums:
  - `ProductionStepType = "lyrics" | "composition" | "arrangement" | "production"`
  - `GenerationStatus = "draft" | "ready" | "generating" | "completed" | "failed"`
  - `CreatorApplicationStatus = "draft" | "submitted" | "reviewing" | "approved" | "rejected"`
- Produces functions:
  - `getNextProductionStep(step: ProductionStepType): ProductionStepType | null`
  - `canGenerateStep(status: ProductionStepStatus): boolean`
  - `assertValidInitialIdea(input: string): void`

- [ ] **Step 1: Write failing domain tests**

Create `packages/core/tests/domain.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  PRODUCTION_STEPS,
  assertValidInitialIdea,
  canGenerateStep,
  getNextProductionStep,
} from "../src";

describe("MuseGrid core domain", () => {
  it("keeps the song production chain in the required order", () => {
    expect(PRODUCTION_STEPS).toEqual(["lyrics", "composition", "arrangement", "production"]);
    expect(getNextProductionStep("lyrics")).toBe("composition");
    expect(getNextProductionStep("composition")).toBe("arrangement");
    expect(getNextProductionStep("arrangement")).toBe("production");
    expect(getNextProductionStep("production")).toBeNull();
  });

  it("allows generation only for draft or failed step states", () => {
    expect(canGenerateStep("draft")).toBe(true);
    expect(canGenerateStep("failed")).toBe(true);
    expect(canGenerateStep("ready")).toBe(false);
    expect(canGenerateStep("generating")).toBe(false);
    expect(canGenerateStep("completed")).toBe(false);
  });

  it("rejects empty or too-short song ideas", () => {
    expect(() => assertValidInitialIdea("")).toThrow("请输入至少 6 个字的歌曲灵感");
    expect(() => assertValidInitialIdea("想唱歌")).toThrow("请输入至少 6 个字的歌曲灵感");
    expect(() => assertValidInitialIdea("想写一首深夜开车听的中文 R&B")).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test and verify it fails**

Run:

```bash
pnpm --filter @musegrid/core test
```

Expected:

```text
FAIL packages/core/tests/domain.test.ts
```

- [ ] **Step 3: Implement core domain**

Create `packages/core/src/domain.ts`:

```ts
export const PRODUCTION_STEPS = ["lyrics", "composition", "arrangement", "production"] as const;

export type ProductionStepType = (typeof PRODUCTION_STEPS)[number];
export type CapabilityDirection = ProductionStepType;
export type ProductionStepStatus = "draft" | "ready" | "generating" | "completed" | "failed";
export type GenerationStatus = "draft" | "ready" | "generating" | "completed" | "failed";
export type CreatorApplicationStatus = "draft" | "submitted" | "reviewing" | "approved" | "rejected";
export type UserRole = "creator_user" | "music_creator" | "operator";

export type CreatorAvatarSummary = {
  id: string;
  name: string;
  direction: CapabilityDirection;
  level: number;
  styleTags: string[];
  intro: string;
  simulatedCallCount: number;
  recommendedReason: string;
};

export type SongProjectBrief = {
  title: string;
  initialIdea: string;
  language: string;
  genre: string;
  mood: string;
  intendedUse: string;
};
```

Create `packages/core/src/state-machines.ts`:

```ts
import { PRODUCTION_STEPS, type ProductionStepStatus, type ProductionStepType } from "./domain";

export function getNextProductionStep(step: ProductionStepType): ProductionStepType | null {
  const index = PRODUCTION_STEPS.indexOf(step);
  return PRODUCTION_STEPS[index + 1] ?? null;
}

export function canGenerateStep(status: ProductionStepStatus): boolean {
  return status === "draft" || status === "failed";
}
```

Create `packages/core/src/validation.ts`:

```ts
export function assertValidInitialIdea(input: string): void {
  if (input.trim().length < 6) {
    throw new Error("请输入至少 6 个字的歌曲灵感");
  }
}
```

Create `packages/core/src/index.ts`:

```ts
export * from "./domain";
export * from "./state-machines";
export * from "./validation";
```

- [ ] **Step 4: Run tests**

Run:

```bash
pnpm --filter @musegrid/core test
```

Expected:

```text
3 passed
```

- [ ] **Step 5: Commit**

Run:

```bash
git add packages/core
git commit -m "feat: add cross-platform MuseGrid core domain"
```

---

### Task 3: Add Cross-Platform Design Tokens

**Files:**
- Create: `packages/ui-tokens/src/tokens.ts`
- Create: `packages/ui-tokens/src/tokens.css`
- Create: `packages/ui-tokens/src/index.ts`
- Create: `packages/ui-tokens/tests/tokens.test.ts`
- Modify: `packages/ui-tokens/package.json`
- Modify: `apps/web/app/globals.css`

**Interfaces:**
- Produces CSS variables:
  - `--mg-bg`
  - `--mg-panel`
  - `--mg-text`
  - `--mg-muted`
  - `--mg-accent`
  - `--mg-growth`
  - `--mg-revenue`
  - `--mg-danger`
- Produces object export:
  - `museGridTokens`

- [ ] **Step 1: Write token tests**

Create `packages/ui-tokens/tests/tokens.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { museGridTokens } from "../src";

describe("MuseGrid design tokens", () => {
  it("defines the required future music operating system colors", () => {
    expect(museGridTokens.color.accent).toBe("#21F3D0");
    expect(museGridTokens.color.growth).toBe("#B6FF4D");
    expect(museGridTokens.color.revenue).toBe("#FFB84D");
  });

  it("uses an 8px-first radius system", () => {
    expect(museGridTokens.radius.panel).toBe("12px");
    expect(museGridTokens.radius.control).toBe("8px");
  });
});
```

- [ ] **Step 2: Run test and verify it fails**

Run:

```bash
pnpm --filter @musegrid/ui-tokens test
```

Expected:

```text
FAIL packages/ui-tokens/tests/tokens.test.ts
```

- [ ] **Step 3: Implement tokens**

Create `packages/ui-tokens/src/tokens.ts`:

```ts
export const museGridTokens = {
  color: {
    bg: "#060A12",
    bgElevated: "#0B1220",
    panel: "#101826",
    panelSoft: "#152033",
    text: "#EEF6FF",
    muted: "#8EA3B8",
    accent: "#21F3D0",
    growth: "#B6FF4D",
    revenue: "#FFB84D",
    danger: "#FF5C7A",
  },
  radius: {
    control: "8px",
    panel: "12px",
    node: "999px",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
} as const;
```

Create `packages/ui-tokens/src/tokens.css`:

```css
:root {
  --mg-bg: #060a12;
  --mg-bg-elevated: #0b1220;
  --mg-panel: #101826;
  --mg-panel-soft: #152033;
  --mg-text: #eef6ff;
  --mg-muted: #8ea3b8;
  --mg-accent: #21f3d0;
  --mg-growth: #b6ff4d;
  --mg-revenue: #ffb84d;
  --mg-danger: #ff5c7a;
  --mg-radius-control: 8px;
  --mg-radius-panel: 12px;
}
```

Create `packages/ui-tokens/src/index.ts`:

```ts
export * from "./tokens";
```

- [ ] **Step 4: Import token CSS into Web**

Modify `apps/web/app/globals.css`:

```css
@import "@musegrid/ui-tokens/tokens.css";
@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body {
  min-height: 100%;
  background: var(--mg-bg);
  color: var(--mg-text);
}
```

- [ ] **Step 5: Run tests**

Run:

```bash
pnpm --filter @musegrid/ui-tokens test
pnpm --filter @musegrid/web typecheck
```

Expected:

```text
2 passed
No TypeScript errors
```

- [ ] **Step 6: Commit**

Run:

```bash
git add packages/ui-tokens apps/web/app/globals.css
git commit -m "feat: add MuseGrid cross-platform design tokens"
```

---

### Task 4: Add Database Schema And Repository Boundary

**Files:**
- Create: `apps/web/prisma/schema.prisma`
- Create: `apps/web/prisma/seed.ts`
- Create: `apps/web/lib/db/prisma.ts`
- Create: `apps/web/lib/repositories/projects.ts`
- Create: `apps/web/lib/repositories/avatars.ts`
- Create: `apps/web/lib/repositories/creator-applications.ts`
- Create: `apps/web/tests/unit/repositories.test.ts`
- Modify: `apps/web/package.json`

**Interfaces:**
- Produces repository functions:
  - `createProject(userId, brief)`
  - `getProject(projectId, userId)`
  - `listProjects(userId)`
  - `listSeededAvatars(direction?)`
  - `submitCreatorApplication(userId, input)`

- [ ] **Step 1: Write repository tests**

Create `apps/web/tests/unit/repositories.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createProject, getProject, listProjects } from "../../lib/repositories/projects";
import { listSeededAvatars } from "../../lib/repositories/avatars";
import { submitCreatorApplication } from "../../lib/repositories/creator-applications";
import { prisma } from "../../lib/db/prisma";

describe("MuseGrid repositories", () => {
  it("creates a project with the four required production steps", async () => {
    const user = await prisma.user.create({
      data: {
        email: `repo-${Date.now()}@musegrid.local`,
        name: "Repo Tester",
        passwordHash: "test-hash",
      },
    });

    const project = await createProject(user.id, {
      title: "深夜开车",
      initialIdea: "想写一首深夜开车听的中文 R&B",
      language: "中文",
      genre: "R&B",
      mood: "克制想念",
      intendedUse: "个人 Demo",
    });

    const loaded = await getProject(project.id, user.id);
    expect(loaded?.steps.map((step) => step.stepType)).toEqual([
      "lyrics",
      "composition",
      "arrangement",
      "production",
    ]);

    const projects = await listProjects(user.id);
    expect(projects.some((item) => item.id === project.id)).toBe(true);
  });

  it("lists seeded avatars by capability direction", async () => {
    const avatars = await listSeededAvatars("lyrics");
    expect(avatars.length).toBeGreaterThan(0);
    expect(avatars.every((avatar) => avatar.capabilityDirection === "lyrics")).toBe(true);
  });

  it("submits a creator application", async () => {
    const user = await prisma.user.create({
      data: {
        email: `creator-${Date.now()}@musegrid.local`,
        name: "Creator Tester",
        passwordHash: "test-hash",
      },
    });

    const application = await submitCreatorApplication(user.id, {
      capabilityDirection: "lyrics",
      profileData: { displayName: "夜航作词人", styles: ["R&B"] },
      workSamples: [{ title: "样例作品", description: "情绪叙事歌词" }],
      questionnaireAnswers: { tone: "克制", boundary: "不模仿具体歌手" },
    });

    expect(application.status).toBe("submitted");
  });
});
```

- [ ] **Step 2: Add Prisma schema**

Create `apps/web/prisma/schema.prisma` with these models:

```prisma
model User {
  id                 String   @id @default(cuid())
  email              String   @unique
  name               String
  passwordHash       String
  role               String   @default("creator_user")
  quotaBalance       Int      @default(3)
  subscriptionStatus String   @default("free")
  createdAt          DateTime @default(now())
  projects           Project[]
  creatorApplications CreatorApplication[]
  creatorAvatars     CreatorAvatar[]
}

model Project {
  id          String   @id @default(cuid())
  userId      String
  title       String
  initialIdea String
  language    String
  genre       String
  mood        String
  intendedUse String
  status      String   @default("draft")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id])
  steps       ProductionStep[]
  generations GenerationJob[]
  contributions ContributionRecord[]
}

model ProductionStep {
  id               String   @id @default(cuid())
  projectId        String
  stepType         String
  selectedAvatarId String?
  inputPayload     Json
  outputPayload    Json?
  userEdits        Json?
  status           String   @default("draft")
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  project          Project  @relation(fields: [projectId], references: [id])
}

model CreatorAvatar {
  id                 String   @id @default(cuid())
  ownerUserId         String?
  avatarName          String
  capabilityDirection String
  level               Int      @default(1)
  styleTags           Json
  intro               String
  sampleOutputs       Json
  maintenanceScore    Int      @default(0)
  status              String   @default("seeded")
  simulatedCallCount  Int      @default(0)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  owner               User?    @relation(fields: [ownerUserId], references: [id])
}

model CreatorApplication {
  id                   String   @id @default(cuid())
  userId               String
  capabilityDirection  String
  profileData          Json
  workSamples          Json
  questionnaireAnswers Json
  status               String   @default("submitted")
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  user                 User     @relation(fields: [userId], references: [id])
}

model GenerationJob {
  id                String   @id @default(cuid())
  projectId         String
  userId            String
  provider          String
  model             String
  lyrics            String
  prompt            String
  status            String   @default("draft")
  providerRequestId String?
  audioAssetId      String?
  errorMessage      String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  project           Project  @relation(fields: [projectId], references: [id])
}

model AudioAsset {
  id         String   @id @default(cuid())
  projectId String
  storageUrl String
  duration   Int?
  format     String
  createdAt  DateTime @default(now())
}

model ContributionRecord {
  id                String   @id @default(cuid())
  projectId          String
  workId             String?
  stepType           String
  avatarId           String
  avatarLevelAtTime  Int
  outputSummary      String
  contributionWeight Int
  createdAt          DateTime @default(now())
  project            Project  @relation(fields: [projectId], references: [id])
}
```

- [ ] **Step 3: Implement repository functions**

Create repository modules with these exact signatures:

```ts
// apps/web/lib/repositories/projects.ts
import { PRODUCTION_STEPS, type SongProjectBrief } from "@musegrid/core";
import { prisma } from "../db/prisma";

export async function createProject(userId: string, brief: SongProjectBrief) {
  return prisma.project.create({
    data: {
      userId,
      title: brief.title,
      initialIdea: brief.initialIdea,
      language: brief.language,
      genre: brief.genre,
      mood: brief.mood,
      intendedUse: brief.intendedUse,
      steps: {
        create: PRODUCTION_STEPS.map((stepType) => ({
          stepType,
          inputPayload: {},
          status: "draft",
        })),
      },
    },
    include: { steps: true },
  });
}

export async function getProject(projectId: string, userId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, userId },
    include: { steps: true, contributions: true, generations: true },
  });
}

export async function listProjects(userId: string) {
  return prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { generations: true },
  });
}
```

```ts
// apps/web/lib/repositories/avatars.ts
import type { CapabilityDirection } from "@musegrid/core";
import { prisma } from "../db/prisma";

export async function listSeededAvatars(direction?: CapabilityDirection) {
  return prisma.creatorAvatar.findMany({
    where: {
      status: "seeded",
      ...(direction ? { capabilityDirection: direction } : {}),
    },
    orderBy: [{ level: "desc" }, { simulatedCallCount: "desc" }],
  });
}
```

```ts
// apps/web/lib/repositories/creator-applications.ts
import { prisma } from "../db/prisma";

type CreatorApplicationInput = {
  capabilityDirection: string;
  profileData: unknown;
  workSamples: unknown;
  questionnaireAnswers: unknown;
};

export async function submitCreatorApplication(userId: string, input: CreatorApplicationInput) {
  return prisma.creatorApplication.create({
    data: {
      userId,
      capabilityDirection: input.capabilityDirection,
      profileData: input.profileData,
      workSamples: input.workSamples,
      questionnaireAnswers: input.questionnaireAnswers,
      status: "submitted",
    },
  });
}
```

- [ ] **Step 4: Run migration and seed**

Run:

```bash
pnpm --filter @musegrid/web prisma migrate dev --name init
pnpm --filter @musegrid/web prisma db seed
pnpm --filter @musegrid/web test
```

Expected:

```text
Repository tests pass
Seeded creator avatars exist for lyrics, composition, arrangement, production
```

- [ ] **Step 5: Commit**

Run:

```bash
git add apps/web/prisma apps/web/lib/db apps/web/lib/repositories apps/web/tests/unit apps/web/package.json
git commit -m "feat: add MuseGrid data model and repositories"
```

---

### Task 5: Implement Authenticated App Shell

**Files:**
- Create: `apps/web/lib/auth/password.ts`
- Create: `apps/web/lib/auth/session.ts`
- Create: `apps/web/app/(auth)/login/page.tsx`
- Create: `apps/web/app/(auth)/register/page.tsx`
- Create: `apps/web/app/api/v1/auth/login/route.ts`
- Create: `apps/web/app/api/v1/auth/register/route.ts`
- Create: `apps/web/app/api/v1/auth/logout/route.ts`
- Create: `apps/web/components/app-shell/AppShell.tsx`
- Create: `apps/web/components/app-shell/SideNav.tsx`
- Create: `apps/web/tests/e2e/auth.spec.ts`

**Interfaces:**
- API:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/logout`
- Server helper:
  - `requireUser(): Promise<{ id: string; email: string; name: string; role: string }>`

- [ ] **Step 1: Write Playwright auth test**

Create `apps/web/tests/e2e/auth.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("user registers and lands inside MuseGrid app shell", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("名称").fill("MuseGrid Tester");
  await page.getByLabel("邮箱").fill(`tester-${Date.now()}@musegrid.local`);
  await page.getByLabel("密码").fill("musegrid-pass-123");
  await page.getByRole("button", { name: "创建账户" }).click();
  await expect(page.getByText("新建歌曲项目")).toBeVisible();
  await expect(page.getByText("创作台")).toBeVisible();
});
```

- [ ] **Step 2: Implement password hashing and signed session cookies**

Use a server-only password hash dependency and an HTTP-only cookie session. Keep the session helper inside `apps/web/lib/auth` so future mobile token auth can be added without changing page components.

- [ ] **Step 3: Implement auth pages**

Requirements:

- Labels above inputs.
- Submit loading state.
- Inline error near form.
- Successful register/login redirects to `/studio`.

- [ ] **Step 4: Implement app shell**

Navigation items:

- 创作台
- 创作人分身
- 我的作品
- 贡献链路
- 成为创作人
- 分身后台
- 账户

- [ ] **Step 5: Run verification**

Run:

```bash
pnpm --filter @musegrid/web test
pnpm --filter @musegrid/web e2e --grep "user registers"
```

Expected:

```text
Unit tests pass
1 Playwright test passed
```

- [ ] **Step 6: Commit**

Run:

```bash
git add apps/web/lib/auth apps/web/app apps/web/components/app-shell apps/web/tests/e2e
git commit -m "feat: add authenticated MuseGrid app shell"
```

---

### Task 6: Build Studio Home And Project Creation API

**Files:**
- Create: `apps/web/app/(app)/studio/page.tsx`
- Create: `apps/web/app/api/v1/projects/route.ts`
- Create: `apps/web/components/studio/NewProjectPanel.tsx`
- Create: `apps/web/components/studio/IndustryLoop.tsx`
- Create: `apps/web/components/studio/RecentProjects.tsx`
- Create: `apps/web/tests/e2e/project-create.spec.ts`

**Interfaces:**
- API:
  - `GET /api/v1/projects`
  - `POST /api/v1/projects`
- Request:
  - `{ title, initialIdea, language, genre, mood, intendedUse }`
- Response:
  - `{ project: { id, title, status } }`

- [ ] **Step 1: Write E2E project creation test**

Create `apps/web/tests/e2e/project-create.spec.ts` to register/login, fill the new project panel, click `开始制作`, and assert redirect to `/studio/projects/:id`.

- [ ] **Step 2: Implement project API**

The API must:

- Require authenticated user.
- Validate initial idea with `assertValidInitialIdea`.
- Create four `ProductionStep` records in the required order.
- Return the created project id.

- [ ] **Step 3: Implement future music OS home**

The page must show:

- New song project panel.
- Recent projects.
- Industry loop: 灵感 -> 分身 -> Demo -> 发布 -> 二创 -> 收益 -> 分身成长.
- Become creator entry.

- [ ] **Step 4: Verify**

Run:

```bash
pnpm --filter @musegrid/web test
pnpm --filter @musegrid/web e2e --grep "project"
```

Expected:

```text
Project creation test passed
```

- [ ] **Step 5: Commit**

Run:

```bash
git add apps/web/app apps/web/components/studio apps/web/tests/e2e
git commit -m "feat: add studio home and project creation"
```

---

### Task 7: Build Step Generation Engine With Seeded Avatar Outputs

**Files:**
- Create: `packages/core/src/fixtures.ts`
- Create: `packages/core/src/prompt-builder.ts`
- Create: `packages/core/tests/prompt-builder.test.ts`
- Create: `apps/web/app/api/v1/projects/[projectId]/steps/[stepType]/generate/route.ts`
- Create: `apps/web/app/api/v1/projects/[projectId]/steps/[stepType]/confirm/route.ts`
- Create: `apps/web/lib/server/step-generator.ts`
- Create: `apps/web/tests/unit/step-generator.test.ts`

**Interfaces:**
- Core function:
  - `buildMiniMaxInput(project, steps): { lyrics: string; prompt: string }`
- API:
  - `POST /api/v1/projects/:projectId/steps/:stepType/generate`
  - `POST /api/v1/projects/:projectId/steps/:stepType/confirm`

- [ ] **Step 1: Write prompt-builder tests**

Test that confirmed lyrics, composition, arrangement, and production outputs produce:

- Lyrics with `[Verse]` and `[Chorus]` sections.
- Prompt under 2000 characters.
- Prompt includes genre, mood, arrangement, and production direction.

- [ ] **Step 2: Implement seeded deterministic generation**

For MVP, structured text generation can be deterministic seed logic before adding LLM orchestration.

Outputs must differ by step:

- Lyrics: theme, hook options, full lyric draft.
- Composition: tempo, structure, hook mood, melody description.
- Arrangement: instruments, rhythm, section development, sound texture.
- Production: vocal tone, mix direction, final prompt.

- [ ] **Step 3: Implement generate and confirm APIs**

Rules:

- Require auth.
- Validate user owns project.
- Require selected avatar id.
- Save generated output.
- Save contribution record on confirm.

- [ ] **Step 4: Verify**

Run:

```bash
pnpm --filter @musegrid/core test
pnpm --filter @musegrid/web test -- step-generator
```

Expected:

```text
Prompt builder tests pass
Step generator tests pass
```

- [ ] **Step 5: Commit**

Run:

```bash
git add packages/core apps/web/app/api/v1/projects apps/web/lib/server apps/web/tests/unit
git commit -m "feat: add production step generation engine"
```

---

### Task 8: Build Project Studio UI

**Files:**
- Create: `apps/web/app/(app)/studio/projects/[projectId]/page.tsx`
- Create: `apps/web/components/studio/ProductionStepRail.tsx`
- Create: `apps/web/components/studio/StepWorkspace.tsx`
- Create: `apps/web/components/avatars/AvatarSelector.tsx`
- Create: `apps/web/components/contribution/ContributionChain.tsx`
- Create: `apps/web/tests/e2e/studio-flow.spec.ts`

**Interfaces:**
- Consumes Task 7 APIs.
- Produces complete four-step UI flow.

- [ ] **Step 1: Write E2E studio flow test**

The test must:

1. Create project.
2. Select lyrics avatar.
3. Generate lyrics output.
4. Confirm lyrics.
5. Repeat for composition, arrangement, and production.
6. Assert production page shows `生成可播放 Demo`.

- [ ] **Step 2: Implement layout**

Desktop layout:

- Left: step rail with lyrics/composition/arrangement/production.
- Center: current step workspace.
- Right: selected avatar and contribution chain.
- Bottom: compact generation/audio status bar.

Mobile layout:

- Top: step progress.
- Center: current step.
- Avatar and contribution panels collapse below.

- [ ] **Step 3: Implement avatar selector**

Requirements:

- Filter by current capability direction.
- Show level, style tags, simulated calls, recommended reason.
- Selection connects visually to current step.

- [ ] **Step 4: Implement generate/confirm interactions**

Requirements:

- One primary action per step.
- Loading state.
- Error state with retry.
- Confirm enables next step.

- [ ] **Step 5: Verify**

Run:

```bash
pnpm --filter @musegrid/web e2e --grep "studio"
```

Expected:

```text
Studio flow test passed
```

- [ ] **Step 6: Commit**

Run:

```bash
git add 'apps/web/app/(app)/studio' apps/web/components/studio apps/web/components/avatars apps/web/components/contribution apps/web/tests/e2e
git commit -m "feat: add four-step MuseGrid studio workflow"
```

---

### Task 9: Add MiniMax Server Integration And Generation Jobs

**Files:**
- Create: `apps/web/lib/minimax/client.ts`
- Create: `apps/web/lib/minimax/audio-storage.ts`
- Create: `apps/web/app/api/v1/projects/[projectId]/generate-demo/route.ts`
- Create: `apps/web/public/samples/midnight-drive-sample.mp3`
- Create: `apps/web/tests/unit/minimax-client.test.ts`
- Create: `apps/web/tests/e2e/generate-demo.spec.ts`

**Interfaces:**
- Server function:
  - `generateMusicDemo(input: { lyrics: string; prompt: string }): Promise<{ audioUrl: string; durationMs?: number; providerTraceId?: string }>`
- API:
  - `POST /api/v1/projects/:projectId/generate-demo`

- [ ] **Step 1: Write MiniMax client unit tests**

Mock `fetch` and assert the request:

- Uses `POST https://api.minimax.io/v1/music_generation`.
- Sends Bearer token.
- Sends `model`, `prompt`, `lyrics`, `audio_setting`, and `output_format`.
- Rejects lyrics longer than 3500 characters.
- Rejects prompt longer than 2000 characters.

- [ ] **Step 2: Implement MiniMax client**

Request body:

```ts
{
  model: process.env.MINIMAX_MODEL ?? "music-2.6-free",
  prompt,
  lyrics,
  audio_setting: {
    sample_rate: 44100,
    bitrate: 256000,
    format: "mp3",
  },
  output_format: process.env.MINIMAX_OUTPUT_FORMAT ?? "url",
}
```

Rules:

- If `MINIMAX_API_KEY` is empty in local development, return the cached sample audio and mark provider as `sample`.
- If MiniMax returns `url`, copy it into `AudioAsset.storageUrl` and document that production must persist it before 24-hour expiry.
- If MiniMax returns `hex`, convert it to a stored `.mp3` asset.

- [ ] **Step 3: Implement generation API**

Rules:

- Require auth.
- Validate project ownership.
- Require production step confirmed.
- Build final MiniMax input using `buildMiniMaxInput`.
- Create `GenerationJob`.
- Decrement quota only when generation starts.
- Save `AudioAsset`.
- Mark job completed or failed.

- [ ] **Step 4: Add E2E generation test**

Use empty `MINIMAX_API_KEY` so the sample fallback runs. Assert:

- User clicks `生成可播放 Demo`.
- Player appears.
- Contribution chain remains visible.
- Generation job is saved.

- [ ] **Step 5: Verify**

Run:

```bash
pnpm --filter @musegrid/web test -- minimax-client
pnpm --filter @musegrid/web e2e --grep "generate demo"
```

Expected:

```text
MiniMax client tests pass
Demo generation E2E passes with sample fallback
```

- [ ] **Step 6: Commit**

Run:

```bash
git add apps/web/lib/minimax apps/web/app/api/v1/projects apps/web/public/samples apps/web/tests
git commit -m "feat: add MiniMax demo generation pipeline"
```

---

### Task 10: Build My Works And Work Result Page

**Files:**
- Create: `apps/web/app/(app)/works/page.tsx`
- Create: `apps/web/app/(app)/works/[projectId]/page.tsx`
- Create: `apps/web/components/audio/WaveformPlayer.tsx`
- Create: `apps/web/components/contribution/RevenueSimulation.tsx`
- Create: `apps/web/components/contribution/SevenDayMetrics.tsx`
- Create: `apps/web/tests/e2e/works.spec.ts`

**Interfaces:**
- Consumes:
  - Projects repository.
  - Audio assets.
  - Contribution records.
- Produces:
  - Work list.
  - Result page with player and contribution chain.

- [ ] **Step 1: Write E2E works test**

Test:

- User generates sample demo.
- User opens `我的作品`.
- User opens work detail.
- Player is visible.
- Contribution chain shows four steps.
- `7 天后模拟` section is visible.

- [ ] **Step 2: Implement WaveformPlayer**

Requirements:

- Uses native `<audio>`.
- Shows play/pause button.
- Shows progress.
- Shows waveform-style visual bars.
- Has accessible button labels.

- [ ] **Step 3: Implement Works pages**

Works list:

- Project title.
- Status.
- Latest generation state.
- Open detail.

Detail:

- Player.
- Lyrics.
- Final prompt summary.
- Contribution chain.
- Simulated plays/remixes/estimated split.
- Share button copies URL.

- [ ] **Step 4: Verify**

Run:

```bash
pnpm --filter @musegrid/web e2e --grep "works"
```

Expected:

```text
Works E2E test passed
```

- [ ] **Step 5: Commit**

Run:

```bash
git add 'apps/web/app/(app)/works' apps/web/components/audio apps/web/components/contribution apps/web/tests/e2e
git commit -m "feat: add works library and playable result page"
```

---

### Task 11: Build Creator Onboarding Flow

**Files:**
- Create: `apps/web/app/(app)/become-creator/page.tsx`
- Create: `apps/web/app/api/v1/creator-applications/route.ts`
- Create: `apps/web/components/creator-onboarding/CreatorDirectionStep.tsx`
- Create: `apps/web/components/creator-onboarding/CreatorProfileStep.tsx`
- Create: `apps/web/components/creator-onboarding/CalibrationStep.tsx`
- Create: `apps/web/components/creator-onboarding/AvatarPreviewStep.tsx`
- Create: `apps/web/tests/e2e/creator-onboarding.spec.ts`

**Interfaces:**
- API:
  - `POST /api/v1/creator-applications`
- Request:
  - `{ capabilityDirection, profileData, workSamples, questionnaireAnswers }`

- [ ] **Step 1: Write E2E onboarding test**

Test:

- User opens `成为创作人`.
- Selects `作词`.
- Fills profile.
- Adds case description.
- Answers calibration questions.
- Previews Level 1 avatar.
- Submits application.
- Lands on avatar dashboard.

- [ ] **Step 2: Implement multi-step form**

Requirements:

- Progress indicator.
- Labels above inputs.
- Draft state preserved while moving back and forth.
- Submit loading and error states.
- Preview describes Level 1 avatar and growth tasks.

- [ ] **Step 3: Implement API**

Rules:

- Require auth.
- Save application.
- Create a draft `CreatorAvatar` owned by user with status `pending_review`.
- Return dashboard URL.

- [ ] **Step 4: Verify**

Run:

```bash
pnpm --filter @musegrid/web e2e --grep "creator onboarding"
```

Expected:

```text
Creator onboarding E2E passed
```

- [ ] **Step 5: Commit**

Run:

```bash
git add 'apps/web/app/(app)/become-creator' apps/web/app/api/v1/creator-applications apps/web/components/creator-onboarding apps/web/tests/e2e
git commit -m "feat: add creator avatar onboarding"
```

---

### Task 12: Build Avatar Dashboard

**Files:**
- Create: `apps/web/app/(app)/avatar-dashboard/page.tsx`
- Create: `apps/web/components/avatars/AvatarEvolutionCore.tsx`
- Create: `apps/web/components/avatars/CapabilityLevelGrid.tsx`
- Create: `apps/web/components/avatars/MaintenanceQueue.tsx`
- Create: `apps/web/components/avatars/CreatorImpactMetrics.tsx`
- Create: `apps/web/tests/e2e/avatar-dashboard.spec.ts`

**Interfaces:**
- Consumes:
  - Creator avatar records.
  - Creator application status.
- Produces:
  - Independent capability level dashboard.
  - Maintenance task UI.

- [ ] **Step 1: Write E2E dashboard test**

Test:

- After onboarding, dashboard shows selected direction at Level 1.
- Other directions display inactive or not-opened states.
- Maintenance tasks show `补充作品案例`, `回答校准问卷`, `纠偏分身输出`.
- Estimated income is labeled as simulated.

- [ ] **Step 2: Implement dashboard components**

Visual structure:

- Central avatar evolution core.
- Direction modules around or beside the core.
- Right rail for maintenance queue.
- Bottom or side area for growth timeline and simulated metrics.

- [ ] **Step 3: Verify**

Run:

```bash
pnpm --filter @musegrid/web e2e --grep "avatar dashboard"
```

Expected:

```text
Avatar dashboard E2E passed
```

- [ ] **Step 4: Commit**

Run:

```bash
git add 'apps/web/app/(app)/avatar-dashboard' apps/web/components/avatars apps/web/tests/e2e
git commit -m "feat: add creator avatar evolution dashboard"
```

---

### Task 13: Polish Future Music OS Visual System

**Files:**
- Create: `apps/web/components/ui/Button.tsx`
- Create: `apps/web/components/ui/Panel.tsx`
- Create: `apps/web/components/ui/StatusBadge.tsx`
- Create: `apps/web/components/ui/NodeGraph.tsx`
- Create: `apps/web/components/ui/ProgressTrack.tsx`
- Modify: `apps/web/app/globals.css`
- Modify: all page components created in prior tasks.
- Create: `apps/web/tests/e2e/visual-regression.spec.ts`

**Interfaces:**
- Produces reusable Web UI primitives that consume `packages/ui-tokens`.

- [ ] **Step 1: Implement shared UI primitives**

Requirements:

- `Button` supports `variant`, `loading`, `disabled`.
- `Panel` enforces 8-12px radius and tokenized border/background.
- `StatusBadge` uses text and color, not color alone.
- `NodeGraph` renders accessible list semantics plus visual nodes.
- `ProgressTrack` renders step status and aria-current for active step.

- [ ] **Step 2: Apply primitives across pages**

Replace one-off buttons, cards, badges, and progress rails with shared primitives.

- [ ] **Step 3: Add visual quality E2E checks**

Test at desktop and mobile viewports:

- No horizontal scroll.
- Navigation visible.
- Primary action visible.
- Text for main buttons visible.
- Player visible on result page.

- [ ] **Step 4: Verify**

Run:

```bash
pnpm --filter @musegrid/web e2e --grep "visual"
pnpm --filter @musegrid/web lint
pnpm --filter @musegrid/web typecheck
```

Expected:

```text
Visual checks pass
No lint errors
No TypeScript errors
```

- [ ] **Step 5: Commit**

Run:

```bash
git add apps/web/components/ui apps/web/app apps/web/components apps/web/tests/e2e
git commit -m "feat: polish MuseGrid future music OS visual system"
```

---

### Task 14: Add API Contract Tests And Cross-Platform Documentation

**Files:**
- Create: `apps/web/tests/unit/api-contracts.test.ts`
- Create: `docs/api-contracts.md`
- Create: `docs/cross-platform-architecture.md`
- Modify: `README.md`

**Interfaces:**
- Documents API endpoints:
  - Auth
  - Projects
  - Production steps
  - Demo generation
  - Works
  - Creator applications

- [ ] **Step 1: Write API contract tests**

Assert every `/api/v1/*` response uses a stable envelope:

```ts
type ApiSuccess<T> = { ok: true; data: T };
type ApiFailure = { ok: false; error: { code: string; message: string } };
```

- [ ] **Step 2: Document API contracts**

`docs/api-contracts.md` must include:

- Endpoint.
- Method.
- Request body.
- Success response.
- Failure response.
- Auth requirement.

- [ ] **Step 3: Document cross-platform architecture**

`docs/cross-platform-architecture.md` must explain:

- `packages/core` is client-independent.
- `packages/ui-tokens` maps to Web, App, and mini-program tokens.
- `/api/v1` is the shared client API.
- Web-specific visuals must not own business state.

- [ ] **Step 4: Verify**

Run:

```bash
pnpm test
pnpm typecheck
```

Expected:

```text
All unit tests pass
No TypeScript errors
```

- [ ] **Step 5: Commit**

Run:

```bash
git add apps/web/tests/unit docs README.md
git commit -m "docs: add API contracts and cross-platform architecture"
```

---

### Task 15: Final MVP Verification

**Files:**
- Modify only files required to fix verification failures.

**Interfaces:**
- Confirms complete vertical slice is working.

- [ ] **Step 1: Run full verification**

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm e2e
pnpm build
```

Expected:

```text
Lint passes
Typecheck passes
Unit tests pass
E2E tests pass
Production build succeeds
```

- [ ] **Step 2: Manual browser verification**

Run:

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

Verify:

- Register user.
- Create project.
- Complete lyrics/composition/arrangement/production steps.
- Generate sample fallback demo without `MINIMAX_API_KEY`.
- Play audio.
- View contribution chain.
- Submit creator onboarding.
- View avatar dashboard.
- Check desktop viewport 1440x900.
- Check mobile viewport 390x844.

- [ ] **Step 3: Fix failures with focused commits**

For each failure:

```bash
git add <changed-files>
git commit -m "fix: address <specific failure>"
```

- [ ] **Step 4: Final commit if verification docs changed**

If README or docs changed:

```bash
git add README.md docs
git commit -m "docs: record MuseGrid MVP verification"
```

---

## Execution Notes

Implementation order is intentionally vertical:

1. Shared domain and visual tokens first.
2. Persistent data and auth second.
3. Demand-side creation flow third.
4. MiniMax generation fourth.
5. Supply-side creator onboarding fifth.
6. Visual polish, cross-platform contracts, and verification last.

This keeps the Web MVP usable while preserving the future App and mini-program path.

## Self-Review Checklist

- Product requirement coverage:
  - Login: Task 5.
  - Project creation: Task 6.
  - Four-step production chain: Tasks 7 and 8.
  - Creator-avatar selection: Task 8.
  - MiniMax playable demo: Task 9.
  - My Works and result page: Task 10.
  - Contribution chain: Tasks 8 and 10.
  - Creator onboarding: Task 11.
  - Avatar dashboard: Task 12.
  - Cross-platform architecture: Tasks 2, 3, and 14.
  - Future Music OS UI: Tasks 3, 8, 10, 12, and 13.
- Scope control:
  - Real revenue settlement is not included.
  - Real remix marketplace is not included.
  - Mobile App and mini-program implementations are not included.
  - Advanced DAW, stems, mix, and master workflows are not included.
- Risk controls:
  - MiniMax API key is server-only.
  - Empty MiniMax key uses sample fallback for demos.
  - API contracts use stable envelopes for future clients.
  - Core business state is not owned by page routes.
