# MuseGrid V2 Standalone Prototype

这是从 Figma Make 设计稿整理出的独立可运行版本，和仓库里之前的 `apps/web`、历史实验目录分开维护。

## 内容

- `src/app`：React + Vite 交互原型源码
- `src/app/design/tokens.ts`：设计 Token
- `src/app/data/musegridStore.ts`：Phase 2 数据层，本地持久化 + Supabase 适配
- `src/app/data/generationClient.ts`：生成客户端，未配置后端时走本地体验生成，配置 Worker 后走 API
- `worker/`：Cloudflare Worker 模型网关，代理 MiniMax API，避免 Key 暴露到浏览器
- `DESIGN_SPEC.md`：设计规范文档
- `scripts/verify-flow.cjs`：端到端流程验收脚本
- `scripts/verify-persistence.cjs`：刷新后数据仍保留的持久化验收脚本
- `scripts/verify-api-mode.cjs`：配置 Worker API 后的生成链路验收脚本
- `supabase/schema.sql`：Supabase 数据表与 RLS 策略
- `DEPLOYMENT.md`：公网部署说明
- `vercel.json` / `netlify.toml`：静态站点部署配置

## 本地运行

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 4326
```

打开：

```text
http://127.0.0.1:4326/
```

## 验收

先启动 dev server，然后执行：

```bash
BASE_URL=http://127.0.0.1:4326/ node scripts/verify-flow.cjs
```

持久化验收：

```bash
BASE_URL=http://127.0.0.1:4326/ node scripts/verify-persistence.cjs
```

API 模式验收：

```bash
VITE_MUSEGRID_API_BASE=http://127.0.0.1:8787 BASE_URL=http://127.0.0.1:4326/ npm run verify:api-mode
```

脚本会验证完整闭环：

首页输入创意 -> 制作页召唤分身 -> 四步确认 -> 生成 Demo -> 我的作品 -> 贡献链路。

## 构建

```bash
npm run build
```

## Worker 后端

Worker 位于 `worker/`：

```bash
cd worker
npm install
npm run test
npm run deploy
```

前端构建时设置 `VITE_MUSEGRID_API_BASE` 后，会调用 Worker；未设置时自动使用本地体验生成。

## 公网部署

详见 `DEPLOYMENT.md`。当前阶段前端可直接部署到 GitHub Pages；真实模型调用通过 Cloudflare Worker 代理。

## Phase 2 数据持久化

默认没有 Supabase 环境变量时，应用使用浏览器 `localStorage` 保存项目、作品和贡献链路，刷新后仍会保留。

要切换到 Supabase：

1. 在 Supabase SQL Editor 执行 `supabase/schema.sql`。
2. 复制 `.env.example` 为 `.env.local`。
3. 填入 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`。
4. 重新启动开发服务器。
