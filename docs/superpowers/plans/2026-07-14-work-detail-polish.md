# Work Detail Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real cover visual, compact the work status badge, and provide a dedicated song-title editing flow on the work detail page.

**Architecture:** Extend the existing state-driven `Page` navigation with a `workEdit` page. Keep the selected work in `App`, update it through one callback, and let the existing snapshot effect persist the edited title. Add a Playwright regression script that exercises the public user flow.

**Tech Stack:** React 18, TypeScript, Vite, inline design tokens, Playwright.

## Global Constraints

- Modify only `musegrid-v2-standalone` application code for the deployed experience.
- Add no dependencies.
- Keep all visible copy in Simplified Chinese.
- Editing in this iteration changes only the song title.

---

### Task 1: Work Detail Regression Test

**Files:**
- Create: `musegrid-v2-standalone/scripts/verify-work-detail-polish.cjs`
- Modify: `musegrid-v2-standalone/package.json`

**Interfaces:**
- Consumes: the existing browser flow from `我的作品` to a selected work.
- Produces: `npm run verify:work-detail-polish`.

- [ ] Write a Playwright script that asserts a cover image exists, the status badge is wider than it is tall, and `编辑作品` opens a title form instead of `创作台`.
- [ ] Assert blank titles show `请输入歌曲名称` and do not save.
- [ ] Assert a valid renamed title appears in detail view and remains after reload.
- [ ] Run the test and verify it fails because the cover and edit page are not implemented.

### Task 2: Cover And Compact Status

**Files:**
- Create: `musegrid-v2-standalone/src/assets/work-cover-rain-night.jpg`
- Modify: `musegrid-v2-standalone/src/app/components/pages/MyWorksPage.tsx`

**Interfaces:**
- Consumes: `GeneratedWork` title, tags, color, and status.
- Produces: `data-testid="work-cover-image"` and `data-testid="work-status-badge"`.

- [ ] Add the square rain-night cover asset to the deployed application.
- [ ] Layer the existing work metadata over the image with a dark readable overlay.
- [ ] Put the status badge in a non-stretching wrapper with compact padding.
- [ ] Run the regression test and confirm the visual assertions pass while edit navigation still fails.

### Task 3: Song Title Edit Page

**Files:**
- Create: `musegrid-v2-standalone/src/app/components/pages/WorkEditPage.tsx`
- Modify: `musegrid-v2-standalone/src/app/components/layout/Sidebar.tsx`
- Modify: `musegrid-v2-standalone/src/app/App.tsx`
- Modify: `musegrid-v2-standalone/src/app/components/pages/MyWorksPage.tsx`

**Interfaces:**
- Consumes: `work: GeneratedWork`, `onCancel(): void`, and `onSave(title: string): void`.
- Produces: a `workEdit` page and `handleWorkTitleSave(workId, title)` state update.

- [ ] Add `workEdit` to the `Page` union and map its sidebar parent to `myWorks`.
- [ ] Add a focused edit page with cover preview, required title input, inline error, cancel, and save actions.
- [ ] Change `编辑作品` to navigate to `workEdit` while keeping the active work selected.
- [ ] Update the matching work title immutably and return to `myWorks`; rely on the existing snapshot effect for persistence.
- [ ] Run the regression test and confirm all assertions pass.

### Task 4: Final Verification And Release

**Files:**
- Modify: `.github/workflows/deploy-pages.yml`

**Interfaces:**
- Consumes: the built GitHub Pages bundle.
- Produces: deployment probes for `编辑歌曲信息`, `保存修改`, and the cover asset reference.

- [ ] Run `npm run build`.
- [ ] Run `npm run verify:work-detail-polish` against the local server.
- [ ] Capture desktop and mobile screenshots and inspect for overlap, clipping, and correct navigation.
- [ ] Add deployment bundle probes for the new edit flow.
- [ ] Commit, push, merge to `main`, and verify the public GitHub Pages bundle and page.
