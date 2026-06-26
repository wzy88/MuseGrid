# MuseGrid V2 Demo 部署说明

当前阶段分两层：

- 前端公开体验 Demo：GitHub Pages 静态站点，任何人打开都能体验分身网络和完整制作流程。
- 可选 Worker 后端：Cloudflare Workers 代理 MiniMax，避免把模型 Key 暴露在浏览器里。

## 免费推荐路径：GitHub Pages

仓库已经包含 `.github/workflows/deploy-pages.yml`。推送到 `main` 后，GitHub Actions 会自动构建并发布 `dist`。

首次使用需要在 GitHub 仓库里确认 Pages 来源：

1. 打开 `https://github.com/wzy88/MuseGrid/settings/pages`
2. Source 选择 `GitHub Actions`
3. 回到 Actions 页面等待 `Deploy to GitHub Pages` 完成
4. 访问：

```text
https://wzy88.github.io/MuseGrid/
```

## 备选路径：Vercel

1. 把 `musegrid-v2-standalone` 作为一个独立项目推到 GitHub。
2. 打开 Vercel，选择 Import Project。
3. Framework 选择 `Vite`。
4. Build Command 使用：

```bash
npm run build
```

5. Output Directory 使用：

```text
dist
```

6. 部署完成后，Vercel 会生成一个公开 URL。

## Netlify

Netlify 会读取 `netlify.toml`：

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

直接导入 GitHub 仓库即可。

## Cloudflare Pages

配置如下：

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
```

## 第二阶段：Cloudflare Worker + MiniMax

Worker 代码在 `worker/`，提供三个入口：

```text
GET  /health
POST /api/generate-step
POST /api/generate-music
```

部署 Worker：

```bash
cd worker
npm install
CLOUDFLARE_API_TOKEN=你的_token npm run deploy
```

设置 MiniMax Key：

```bash
cd worker
CLOUDFLARE_API_TOKEN=你的_token npx wrangler secret put MINIMAX_API_KEY
```

音乐生成默认关闭，避免公开 Demo 被刷额度。确认要开启真实音乐生成后，把 `worker/wrangler.toml` 里的 `MINIMAX_ENABLE_MUSIC` 改成 `true` 再部署。

前端要调用 Worker，需要构建时设置：

```text
VITE_MUSEGRID_API_BASE=https://musegrid-api.<你的 workers 子域>.workers.dev
```

GitHub Pages 里可以在仓库 Settings → Secrets and variables → Actions → Variables 添加 `VITE_MUSEGRID_API_BASE`，然后 workflow 会在构建时读取。

## 本地部署前检查

```bash
npm install
npm run build
npm run dev -- --host 127.0.0.1 --port 4326
BASE_URL=http://127.0.0.1:4326/ npm run verify:flow
```

## 当前 Demo 的边界

- 已实现：可访问网址、完整交互流程、本地持久化、Worker 模型网关、模拟作品生成、贡献链路、分身协作体验。
- 可开启：MiniMax 文本生成、MiniMax 音乐生成。
- 暂不做：登录、强制数据库、真实收益结算。

下一阶段如果要做真实 MVP，需要新增数据库、任务队列、文件存储、费用控制和作品公开分享页。
