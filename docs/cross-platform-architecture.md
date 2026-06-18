# MuseGrid Cross-Platform Architecture

MuseGrid is a future music industry operating system. The current Web MVP is only the first client. The codebase is organized so shared product concepts stay portable across Web, App, and mini-program surfaces.

## Architecture Boundaries

### `packages/core` owns client-independent concepts

`packages/core` is the source of truth for reusable business concepts and logic that must behave the same across all clients.

It currently owns:

- Production step definitions such as `PRODUCTION_STEPS`
- Shared domain types like `ProductionStepType`, `CapabilityDirection`, and `SongProjectBrief`
- Validation helpers
- State-machine helpers
- Prompt-building helpers and deterministic fixtures

Rules:

- No React, DOM, browser, or Next.js imports
- No Web-only view state
- No direct ownership of HTTP transport concerns

If a rule must be identical in Web, App, and mini-program experiences, it belongs in `packages/core` first.

### `packages/ui-tokens` maps design tokens across clients

`packages/ui-tokens` is the presentation bridge between brand/system styling and concrete client platforms.

Its role is to define token values once, then map them into platform-specific delivery forms such as:

- Web CSS tokens
- App-native token objects
- Mini-program compatible token exports

Rules:

- Tokens describe visual language, not business workflows
- Tokens may be consumed by Web today, but must not become Web-owned semantics
- Product state, permissions, and data orchestration stay outside this package

### `/api/v1` is the shared client API

The Next.js route handlers under `apps/web/app/api/v1/**` are not just Web implementation details. They are the current shared network contract for all MuseGrid clients.

That means `/api/v1` should:

- Use stable response envelopes
- Reuse shared domain vocabulary
- Keep request/response shapes client-agnostic
- Avoid UI-specific assumptions in payload design

Current route groups include:

- Auth
- Projects
- Production steps
- Demo generation
- Creator applications

The contract rule is simple: App and mini-program clients should be able to call the same `/api/v1` endpoints without depending on Web component internals.

### Web visuals must not own business state

`apps/web` is responsible for rendering the first client experience, not for becoming the source of truth for product behavior.

Web components may own:

- Local interaction state
- Presentation-only loading/error affordances
- View composition

Web components must not own:

- Cross-client business rules
- Production-step progression rules that need to stay portable
- Canonical permission logic
- API contract semantics

When business behavior is shared, the ownership order should be:

1. `packages/core` for portable rules and vocabulary
2. Server/repository/API layers for persistence and transport
3. Web components for rendering and interaction

## Practical Flow

Today the stack works like this:

1. `packages/core` defines the music-production model and shared rules.
2. Repositories and server helpers in `apps/web/lib/**` translate those rules into persistence and generation workflows.
3. `/api/v1` exposes shared HTTP contracts for authenticated clients.
4. Web pages and components consume those contracts and render the MuseGrid experience.
5. `packages/ui-tokens` keeps the visual system portable so future App and mini-program clients can align without duplicating token decisions.

## Decision Checklist

When adding new behavior, ask:

- Is this concept or rule identical across clients? Move it to `packages/core`.
- Is this a visual primitive or token mapping? Put it in `packages/ui-tokens`.
- Is this the remote contract shared by multiple clients? Put it behind `/api/v1`.
- Is this only about how the Web UI displays or stages interaction? Keep it in `apps/web`.

That boundary discipline is what keeps MuseGrid from collapsing into a Web-only AI song generator. It preserves the product as a cross-platform operating system for creators, projects, works, and 创作人分身 collaboration.
