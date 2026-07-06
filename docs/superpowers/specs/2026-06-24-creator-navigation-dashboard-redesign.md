# Creator navigation and avatar dashboard redesign

## Goal

Improve the creator-side information architecture and the avatar dashboard visual hierarchy.

The current navigation presents `成为创作人` and `分身后台` as two unrelated top-level items. The dashboard also lays status, metrics, tasks, and avatar lists into similar cards, making it hard to tell what is clickable, what requires action, and what is only informational.

## Navigation model

Use two sidebar groups:

- `创作`
  - `创作台`
  - `我的作品`
- `创作人`
  - `申请入驻`
  - `分身管理`

`创作台` and `我的作品` remain peer destinations. `创作台` is for in-progress production work. `我的作品` is for saved projects, generated demos, and shareable results.

`申请入驻` replaces the visible label `成为创作人` in the sidebar but keeps the existing `/become-creator` route. `分身管理` replaces the visible label `分身后台` in the sidebar but keeps the existing `/avatar-dashboard` route.

## Sidebar behavior

Group labels are non-clickable section labels with lower visual weight than page links.

The active page link should remain visually obvious. When a user is on `/become-creator` or `/avatar-dashboard`, the `创作人` group should read as one coherent area, but only the current child link should get the active treatment.

Mobile navigation keeps the same grouping but may stack into a compact two-column layout.

## Avatar dashboard hierarchy

The dashboard should read in this order:

1. Primary avatar status
2. Next actions
3. Growth and impact summary
4. Capability lines and owned avatar details

The top area should reduce long explanation copy and focus on the currently managed avatar: avatar name, direction, level, status, maintenance completion, and simulated calls.

`维护队列` should become the clearest action area. Its cards should look more actionable than passive metric cards, with a visible status label and a short action cue such as `去处理`.

Informational cards should use quieter surfaces. Capability lines, growth timeline, simulated income, and owned avatar list should not compete visually with the maintenance tasks.

## Empty state

If the user has no avatar yet, the dashboard should direct them to `申请入驻` with a clear call to action. It should not look like an empty table.

## Scope

This redesign keeps existing routes, data fetching, authentication, and application submission behavior unchanged.

It may edit:

- `apps/web/components/app-shell/SideNav.tsx`
- `apps/web/app/avatar-dashboard/page.tsx`
- `apps/web/components/avatars/*`
- `apps/web/app/globals.css`
- tests that assert navigation labels or dashboard content

It should not change backend schema, repositories, or generation logic.

## Verification

Run focused unit or e2e tests that cover navigation and the creator onboarding/dashboard flow. Also run a browser or screenshot check if the local app can be started, because the request is primarily visual.
