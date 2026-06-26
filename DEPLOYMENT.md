# MuseGrid V2 Demo 部署说明

当前阶段是公开体验 Demo：纯前端静态站点，不需要服务端，也不接真实大模型 API。

## 推荐路径：Vercel

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

## 本地部署前检查

```bash
npm install
npm run build
npm run dev -- --host 127.0.0.1 --port 4326
BASE_URL=http://127.0.0.1:4326/ npm run verify:flow
```

## 当前 Demo 的边界

- 已实现：可访问网址、完整交互流程、模拟作品生成、贡献链路、分身协作体验。
- 未实现：登录、数据库、真实音频生成、真实大模型调用、作品持久化、真实收益结算。

下一阶段如果要做真实 MVP，需要新增服务端 API、数据库、任务队列、模型网关和文件存储。
