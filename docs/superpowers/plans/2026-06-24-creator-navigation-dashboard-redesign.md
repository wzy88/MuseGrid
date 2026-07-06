# Creator Navigation Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Group the sidebar into `创作` and `创作人`, then make the avatar dashboard clearly distinguish primary status, actionable maintenance tasks, and secondary information.

**Architecture:** Keep existing Next.js routes and server data fetching. Update the sidebar presentation in one component, refine avatar dashboard markup in the page and avatar components, and adjust CSS in the existing global stylesheet.

**Tech Stack:** Next.js App Router, React Server Components, TypeScript, CSS in `apps/web/app/globals.css`, Playwright e2e tests, Vitest unit tests.

## Global Constraints

- Keep existing `/become-creator` and `/avatar-dashboard` routes unchanged.
- Sidebar labels become `申请入驻` and `分身管理`.
- `创作台` and `我的作品` remain peer destinations inside the `创作` group.
- Do not change backend schema, repositories, generation logic, authentication, or application submission behavior.
- Use existing UI primitives and styling approach.
- Verify navigation and creator onboarding/dashboard behavior with focused tests.

---

### Task 1: Sidebar grouping

**Files:**
- Modify: `apps/web/components/app-shell/SideNav.tsx`
- Modify: `apps/web/app/globals.css`
- Test: `apps/web/tests/e2e/auth.spec.ts`

**Interfaces:**
- Consumes: Current `SideNav` component with `usePathname()`.
- Produces: Sidebar groups rendered as non-clickable labels with child links.

- [ ] **Step 1: Write the failing test**

Update `apps/web/tests/e2e/auth.spec.ts` so the navigation checks these labels:

```ts
const navigation = page.getByRole("navigation", { name: "主导航" });
await expect(navigation.getByText("创作", { exact: true })).toBeVisible();
await expect(navigation.getByText("创作人", { exact: true })).toBeVisible();
await expect(navigation.getByRole("link", { name: "创作台" })).toBeVisible();
await expect(navigation.getByRole("link", { name: "我的作品" })).toBeVisible();
await expect(navigation.getByRole("link", { name: "申请入驻" })).toBeVisible();
await expect(navigation.getByRole("link", { name: "分身管理" })).toBeVisible();
await expect(navigation.getByRole("link", { name: "成为创作人" })).toHaveCount(0);
await expect(navigation.getByRole("link", { name: "分身后台" })).toHaveCount(0);
await expect(navigation.getByRole("link", { name: "创作人分身" })).toHaveCount(0);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter web test:e2e apps/web/tests/e2e/auth.spec.ts`

Expected: FAIL because `申请入驻` and `分身管理` do not exist yet.

- [ ] **Step 3: Implement sidebar groups**

In `SideNav.tsx`, replace the flat `navItems` array with grouped data:

```ts
const navGroups = [
  {
    label: "创作",
    items: [
      { label: "创作台", href: "/studio", match: (pathname: string) => pathname.startsWith("/studio") },
      { label: "我的作品", href: "/works", match: (pathname: string) => pathname.startsWith("/works") },
    ],
  },
  {
    label: "创作人",
    items: [
      {
        label: "申请入驻",
        href: "/become-creator",
        match: (pathname: string) => pathname.startsWith("/become-creator"),
      },
      {
        label: "分身管理",
        href: "/avatar-dashboard",
        match: (pathname: string) => pathname.startsWith("/avatar-dashboard"),
      },
    ],
  },
] as const;
```

Render each group with a `sideNavGroupLabel` and nested links.

- [ ] **Step 4: Add sidebar group styling**

In `globals.css`, add styles for `.sideNavGroup` and `.sideNavGroupLabel`, and adjust mobile `.sideNavItems` so grouped layout remains readable.

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter web test:e2e apps/web/tests/e2e/auth.spec.ts`

Expected: PASS.

### Task 2: Avatar dashboard hierarchy and action clarity

**Files:**
- Modify: `apps/web/app/avatar-dashboard/page.tsx`
- Modify: `apps/web/components/avatars/MaintenanceQueue.tsx`
- Modify: `apps/web/components/avatars/AvatarEvolutionCore.tsx`
- Modify: `apps/web/app/globals.css`
- Test: `apps/web/tests/e2e/avatar-dashboard.spec.ts`

**Interfaces:**
- Consumes: Existing dashboard server data: `primaryAvatar`, `avatars`, `maintenanceTasks`, metrics.
- Produces: Dashboard sections ordered by status, next actions, secondary summaries, and details.

- [ ] **Step 1: Write the failing test**

Update `apps/web/tests/e2e/avatar-dashboard.spec.ts` so the dashboard flow expects:

```ts
await expect(page.getByRole("heading", { level: 1, name: "创作人分身后台" })).toBeVisible();
await expect(page.getByRole("heading", { name: "当前主分身" })).toBeVisible();
await expect(page.getByRole("heading", { name: "下一步维护" })).toBeVisible();
await expect(page.getByRole("link", { name: "去处理补充作品案例" })).toBeVisible();
await expect(page.getByRole("heading", { name: "能力线与资产" })).toBeVisible();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter web test:e2e apps/web/tests/e2e/avatar-dashboard.spec.ts`

Expected: FAIL because the new headings and action link are absent.

- [ ] **Step 3: Update dashboard markup**

In `avatar-dashboard/page.tsx`, replace the generic hero with a dashboard-specific hero class. Add a main grid where `AvatarEvolutionCore` is the first primary card, `MaintenanceQueue` is the next prominent action card, `CreatorImpactMetrics` follows, and `CapabilityLevelGrid` plus owned avatar list sit in a lower `能力线与资产` section.

- [ ] **Step 4: Make maintenance tasks actionable**

In `MaintenanceQueue.tsx`, change the heading to `下一步维护`, keep the warning badge, and add an anchor per task:

```tsx
<a className="maintenanceTaskAction" href="/avatar-dashboard" aria-label={`去处理${task.title}`}>
  去处理
</a>
```

- [ ] **Step 5: Simplify primary avatar copy**

In `AvatarEvolutionCore.tsx`, change the heading to `当前主分身` and reduce explanatory copy to one concise sentence about current status and growth requirement.

- [ ] **Step 6: Add dashboard-specific CSS**

In `globals.css`, add styles for:

- `.avatarDashboardHero`
- `.avatarDashboardStatusGrid`
- `.avatarDashboardPrimaryGrid`
- `.avatarDashboardSecondarySection`
- `.maintenanceTaskAction`

Adjust existing `.maintenanceTaskCard`, `.capabilityCard`, `.metricCard`, `.timelineStep`, and `.avatarOwnedList` so task cards have stronger border/hover affordance, while passive information cards are quieter.

- [ ] **Step 7: Run test to verify it passes**

Run: `pnpm --filter web test:e2e apps/web/tests/e2e/avatar-dashboard.spec.ts`

Expected: PASS.

### Task 3: Focused verification and visual check

**Files:**
- Modify only if tests reveal regressions.

**Interfaces:**
- Consumes: Completed sidebar and dashboard changes.
- Produces: Verified local UI.

- [ ] **Step 1: Run focused tests**

Run:

```bash
pnpm --filter web test:e2e apps/web/tests/e2e/auth.spec.ts apps/web/tests/e2e/creator-onboarding.spec.ts apps/web/tests/e2e/avatar-dashboard.spec.ts
```

Expected: PASS.

- [ ] **Step 2: Run unit smoke tests if affected snapshots/assertions exist**

Run:

```bash
pnpm --filter web test:unit apps/web/tests/unit/ui-primitives.test.tsx
```

Expected: PASS or no relevant failures. Fix only failures caused by this redesign.

- [ ] **Step 3: Start the dev server**

Run:

```bash
pnpm --filter web dev
```

Expected: Local Next server starts and prints a localhost URL.

- [ ] **Step 4: Browser visual check**

Open `/avatar-dashboard` after authenticating through the existing dev login path if needed. Confirm:

- Sidebar shows `创作` and `创作人` groups.
- `申请入驻` and `分身管理` are under `创作人`.
- Dashboard first reads as current avatar status.
- Maintenance actions are visually clickable.
- Passive details do not compete with the action area.

## Self-Review

Spec coverage: Task 1 covers grouped navigation and route-preserving label changes. Task 2 covers dashboard hierarchy, actionable maintenance tasks, quieter passive information, and no backend changes. Task 3 covers test and browser verification.

Placeholder scan: No placeholders, TBDs, or deferred implementation notes remain.

Type consistency: The plan uses existing component names and route strings consistently.
