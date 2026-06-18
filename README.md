# MuseGrid

MuseGrid is a future music industry operating system. The first client is a Web MVP, with shared core models and API contracts prepared for future App and mini-program clients.

## Documentation

- [API contracts](/Users/wzy/Documents/音乐制作Music maker/docs/api-contracts.md): documents the current `/api/v1` surface, stable response envelope, auth requirements, and request/response shapes for Auth, Projects, production steps, Demo generation, Works, and creator applications.
- [Cross-platform architecture](/Users/wzy/Documents/音乐制作Music maker/docs/cross-platform-architecture.md): explains the ownership boundaries between `packages/core`, `packages/ui-tokens`, `/api/v1`, and Web-only visual layers.

## Development

```bash
corepack pnpm install
corepack pnpm dev
```
