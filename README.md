# MuseGrid V2 Standalone Prototype

这是从 Figma Make 设计稿整理出的独立可运行版本，和仓库里之前的 `apps/web`、历史实验目录分开维护。

## 内容

- `src/app`：React + Vite 交互原型源码
- `src/app/design/tokens.ts`：设计 Token
- `src/app/data/musegridStore.ts`：Phase 2 数据层，本地持久化 + Supabase 适配
- `DESIGN_SPEC.md`：设计规范文档
- `scripts/verify-flow.cjs`：端到端流程验收脚本
- `scripts/verify-persistence.cjs`：刷新后数据仍保留的持久化验收脚本
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

脚本会验证完整闭环：

首页输入创意 -> 制作页召唤分身 -> 四步确认 -> 生成 Demo -> 我的作品 -> 贡献链路。

## 构建

```bash
npm run build
```

## 公网部署

详见 `DEPLOYMENT.md`。当前阶段是纯前端公开体验 Demo，可直接部署到 Vercel、Netlify 或 Cloudflare Pages。

## Phase 2 数据持久化

默认没有 Supabase 环境变量时，应用使用浏览器 `localStorage` 保存项目、作品和贡献链路，刷新后仍会保留。

要切换到 Supabase：

1. 在 Supabase SQL Editor 执行 `supabase/schema.sql`。
2. 复制 `.env.example` 为 `.env.local`。
3. 填入 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`。
4. 重新启动开发服务器。
