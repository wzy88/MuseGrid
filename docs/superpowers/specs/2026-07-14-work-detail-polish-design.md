# Work Detail Polish Design

## Goal

Improve the existing work detail page without changing the public entry path or creation workflow.

## Scope

1. Replace the left decorative texture-only card with a real album-cover visual while keeping the work title and tags readable.
2. Render the work status as a compact horizontal badge aligned to the title area instead of a stretched vertical block.
3. Make `编辑作品` open a focused work-information editing page. This page edits only the song title in this iteration.

## Interaction

- The edit page shows the current cover, current title, a single required title input, `取消` and `保存修改` actions.
- An empty or whitespace-only title cannot be saved and displays an inline Simplified Chinese error.
- Saving trims surrounding whitespace, updates the active work in application state, persists through the existing snapshot storage, and returns to that work's detail view.
- Cancelling returns to the same work detail view without changing the title.

## Visual Direction

- Keep the existing dark MuseGrid dashboard language.
- The cover uses a rain-night Chinese-pop image with a subtle overlay so text stays legible.
- The status badge must remain content-sized, horizontal, and visually secondary to the work title.
- The edit page is a compact work surface rather than a creation-studio screen or marketing layout.

## Technical Boundaries

- Implement only in `musegrid-v2-standalone`, which is the GitHub Pages build source.
- Do not add a routing library or new dependency.
- Reuse the existing `Page` navigation state and snapshot persistence.
- Keep all visible copy in Simplified Chinese.

## Verification

- Automated browser verification covers the cover image, compact status geometry, edit-page navigation, validation, save, cancel, and persistence after reload.
- Production build must pass.
- Desktop and mobile screenshots must show no overlap or clipped text.
