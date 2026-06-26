# MuseGrid V2 Standalone Prototype

这是从 Figma Make 设计稿整理出的独立可运行版本，和仓库里之前的 `apps/web`、历史实验目录分开维护。

## 内容

- `src/app`：React + Vite 交互原型源码
- `src/app/design/tokens.ts`：设计 Token
- `DESIGN_SPEC.md`：设计规范文档
- `scripts/verify-flow.cjs`：端到端流程验收脚本
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

脚本会验证完整闭环：

首页输入创意 -> 制作页召唤分身 -> 四步确认 -> 生成 Demo -> 我的作品 -> 贡献链路。

## 构建

```bash
npm run build
```

## 公网部署

详见 `DEPLOYMENT.md`。当前阶段是纯前端公开体验 Demo，可直接部署到 Vercel、Netlify 或 Cloudflare Pages。
