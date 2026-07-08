# MuseGrid Voice Selection Step Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a required `选声` step between arrangement and production, backed by seeded voice avatars and included in final Demo prompt building.

**Architecture:** Extend the existing `ProductionStepType` union and `PRODUCTION_STEPS` order with `voice`. Reuse the current avatar selection, step generation, confirmation, quick generation, and contribution systems so voice is one more production capability rather than a parallel feature.

**Tech Stack:** TypeScript, Next.js, Prisma SQLite, Vitest, React Server Components and client components.

## Global Constraints

- Do not add a database migration because step type and avatar capability are stored as strings.
- `production` remains the final step that triggers Demo generation.
- Voice prompt content must be included as a required prompt section before production content.
- Existing projects and tests should continue to use the same API routes.

---

### Task 1: Core Step Order And Prompt Tests

**Files:**
- Modify: `packages/core/tests/domain.test.ts`
- Modify: `packages/core/tests/prompt-builder.test.ts`
- Modify: `packages/core/src/domain.ts`
- Modify: `packages/core/src/fixtures.ts`
- Modify: `packages/core/src/prompt-builder.ts`

**Interfaces:**
- Produces: `ProductionStepType` includes `"voice"`.
- Produces: `buildMiniMaxInput(project, steps)` reads the `"voice"` output and emits a `Voice:` prompt section.

- [ ] Write failing tests expecting `PRODUCTION_STEPS` to equal `["lyrics", "composition", "arrangement", "voice", "production"]`.
- [ ] Write a failing prompt-builder assertion that the prompt contains `Voice:` and a voice phrase from fixture data.
- [ ] Run `corepack pnpm --filter @musegrid/core test` and confirm those tests fail.
- [ ] Add `"voice"` to the production step type order and demo fixtures.
- [ ] Read the voice output in `buildMiniMaxInput` and add a required `Voice:` section before `Production:`.
- [ ] Re-run `corepack pnpm --filter @musegrid/core test`.

### Task 2: Server Generation And Seed Data

**Files:**
- Modify: `apps/web/tests/unit/step-generator.test.ts`
- Modify: `apps/web/prisma/seed.ts`
- Modify: `apps/web/lib/server/step-generator.ts`

**Interfaces:**
- Consumes: `ProductionStepType` includes `"voice"`.
- Produces: voice avatars with `capabilityDirection = "voice"`.
- Produces: generated voice output with `voiceType`, `vocalRange`, `performanceStyle`, `pronunciation`, `referenceMood`, and `draft`.

- [ ] Write a failing unit test that seeds voice avatars, creates a project, confirms lyrics/composition/arrangement, then generates and confirms `voice`.
- [ ] Run `corepack pnpm --filter @musegrid/web test -- tests/unit/step-generator.test.ts` and confirm it fails because no voice avatars/output exists.
- [ ] Add four seeded voice avatars.
- [ ] Add `generateVoice` and route `generateOutput("voice", ...)` to it.
- [ ] Ensure self/edit/revision helpers use `draft` for non-lyrics steps, including voice.
- [ ] Re-run the targeted web test.

### Task 3: Studio UI And Data Loading

**Files:**
- Modify: `apps/web/app/studio/projects/[projectId]/page.tsx`
- Modify: `apps/web/app/works/[projectId]/page.tsx`
- Modify: `apps/web/components/studio/StudioProjectShell.tsx`
- Modify: `apps/web/components/studio/StepWorkspace.tsx`
- Modify: `apps/web/components/avatars/AvatarSelector.tsx`
- Modify: `apps/web/app/avatar-dashboard/page.tsx`

**Interfaces:**
- Consumes: `avatarsByStep: Record<ProductionStepType, AvatarRecordView[]>`.
- Produces: studio labels and text for `voice`.

- [ ] Add voice avatar loading to studio and work pages.
- [ ] Add `voice` keys to all `Record<ProductionStepType, ...>` UI maps.
- [ ] Update quick-mode status copy and visible quick steps to include `选声`.
- [ ] Change contribution progress from a hardcoded `/4` to `/${PRODUCTION_STEPS.length}`.
- [ ] Keep Demo generation bound to `activeStep === "production"`.

### Task 4: Verification

**Files:**
- Verify only.

- [ ] Run `corepack pnpm --filter @musegrid/core test`.
- [ ] Run `corepack pnpm --filter @musegrid/web test`.
- [ ] Run `corepack pnpm --filter @musegrid/web typecheck`.
- [ ] Run `corepack pnpm --filter @musegrid/web lint`.
