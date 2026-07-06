# MuseGrid v2 设计规范文档

**版本**：v2.1  
**日期**：2026-06-25  
**状态**：交付研发  
**配套原型**：`src/app/` — React + Tailwind CSS v4

---

## 目录

1. [设计语言概述](#1-设计语言概述)
2. [色彩系统](#2-色彩系统)
3. [字体系统](#3-字体系统)
4. [间距与圆角](#4-间距与圆角)
5. [核心组件规范](#5-核心组件规范)
6. [页面布局规范](#6-页面布局规范)
7. [交互行为规范](#7-交互行为规范)
8. [图标规范](#8-图标规范)
9. [页面交互流转图](#9-页面交互流转图)
10. [研发对接说明](#10-研发对接说明)

---

## 1. 设计语言概述

**主题**：Deep Space（深空）  
**核心感受**：专业、未来感、沉浸、可信赖  
**视觉关键词**：黑暗宇宙 / 玻璃态卡片 / 辉光激活 / 数据可视化

### 三大视觉原则

| 原则 | 含义 | 实现方式 |
|------|------|----------|
| 层次感 | 背景→卡片→浮层有明确深度差 | 背景色阶 + backdrop-filter |
| 辉光反馈 | 激活/重要状态用发光效果区分 | box-shadow + accent glow |
| 密度平衡 | 数据区紧凑，创作区留白 | 间距随场景调整 |

### 全局背景构成（三层叠加）

```
Layer 1: 纯色根背景 #06070F
Layer 2: 28px 点阵网格（固定定位，opacity: 3%）
           background-image: radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)
           background-size: 28px 28px
Layer 3: 靛蓝辉光光晕（固定定位，顶部中央）
           radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.11) 0%, transparent 70%)
           position: fixed; top: -15%; left: 15%; width: 70%; height: 55%
```

---

## 2. 色彩系统

> 单一来源：`src/app/design/tokens.ts` — 所有组件从这里引用，禁止硬编码颜色值。

### 2.1 背景色阶

| Token | 值 | 用途 |
|-------|----|------|
| `bg0` | `#06070F` | 页面根背景、侧边栏底色 |
| `bg1` | `#090B16` | 侧边栏辅助背景 |
| `bgCard` | `rgba(255,255,255,0.038)` | 玻璃卡片填充层 |
| `bgRaised` | `rgba(255,255,255,0.06)` | 悬浮/高亮卡片 |
| `bgHover` | `rgba(255,255,255,0.08)` | Hover 交互态 |
| `bgActive` | `rgba(99,102,241,0.12)` | 激活填充（accent 系） |

### 2.2 边框

| Token | 值 | 用途 |
|-------|----|------|
| `bdr0` | `rgba(255,255,255,0.05)` | 极细边框、分割线 |
| `bdr1` | `rgba(255,255,255,0.09)` | 卡片默认边框 |
| `bdrAccent` | `rgba(99,102,241,0.45)` | 激活态边框 |
| `bdrCyan` | `rgba(6,182,212,0.4)` | 科技感边框 |

### 2.3 主色调（Indigo-Violet）

| Token | 值 | 用途 |
|-------|----|------|
| `accent` | `#6366F1` | 主按钮、激活、焦点环 |
| `accentLight` | `#818CF8` | 强调文字、标签文字 |
| `accentDark` | `#4F46E5` | 渐变终点、深色按钮 |
| `accentDim` | `rgba(99,102,241,0.14)` | 激活态背景填充 |
| `accentGlow` | `0 0 24px rgba(99,102,241,0.35)` | 主色辉光阴影 |

**主色渐变公式**：`linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)`

### 2.4 副色调（Electric Cyan — 科技感点缀）

| Token | 值 | 用途 |
|-------|----|------|
| `cyan` | `#06B6D4` | 数字高亮、技术类强调 |
| `cyanDim` | `rgba(6,182,212,0.12)` | Cyan 背景填充 |

### 2.5 状态色

| Token | 值 | 用途 |
|-------|----|------|
| `success` | `#10B981` | 完成、确认、正向指标 |
| `successDim` | `rgba(16,185,129,0.12)` | 成功态背景 |
| `warning` | `#F59E0B` | 进行中、需关注、等级 |
| `warningDim` | `rgba(245,158,11,0.12)` | 警告背景 |
| `error` | `#EF4444` | 错误、删除 |
| `errorDim` | `rgba(239,68,68,0.1)` | 错误背景 |
| `gold` | `#F59E0B` | 等级徽章、优先级标识 |

### 2.6 文字色阶

| Token | 值 | 用途 |
|-------|----|------|
| `t0` | `rgba(255,255,255,0.92)` | 主要文字（标题、重要内容）|
| `t1` | `rgba(255,255,255,0.55)` | 次要文字（描述、正文）|
| `t2` | `rgba(255,255,255,0.30)` | 辅助文字（标注、说明）|
| `t3` | `rgba(255,255,255,0.16)` | 禁用/占位（placeholder）|

---

## 3. 字体系统

### 3.1 字体栈

```css
/* 中文优先 */
font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;

/* 数字和英文 */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* 等宽（数据展示）*/
font-family: 'Inter', 'SF Mono', 'Roboto Mono', monospace;
```

### 3.2 字体规模（严格 6 级，禁止使用其他尺寸）

| 级别 | fontSize | fontWeight | letterSpacing | lineHeight | 用途 |
|------|----------|------------|---------------|------------|------|
| `display` | 22px | 700 | -0.03em | 1.25 | 页面主标题 |
| `heading` | 16px | 600 | -0.02em | 1.4 | 区块标题、对话框标题 |
| `subheading` | 13px | 500 | -0.01em | 1.5 | 子标题、卡片标题 |
| `body` | 13px | 400 | 0em | 1.6 | 正文、描述文字 |
| `caption` | 11px | 400 | 0.01em | 1.5 | 标注、辅助信息 |
| `label` | 10px | 500 | 0.06em | 1.4 | 区块标签（全大写使用）|

> **⚠️ 中文行高注意**：中文正文建议 lineHeight 不低于 1.6，纯中文段落建议 1.8。

---

## 4. 间距与圆角

### 4.1 间距基准

**4px 网格系统**，只允许使用以下值：

```
4px  8px  12px  16px  20px  24px  32px  40px  48px  64px
```

**常用场景对应**：

| 场景 | 值 |
|------|-----|
| 图标与文字间距 | 6–8px |
| 行内元素间距 | 8px |
| 卡片内边距（标准）| 16–20px |
| 卡片内边距（紧凑）| 12px |
| 卡片内边距（宽松）| 24px |
| 卡片间距 | 8–12px |
| 区块间距 | 20–28px |
| 页面内边距（水平）| 24–32px |
| 页面内边距（垂直）| 20–28px |
| 大区块间距 | 32–40px |

### 4.2 圆角系统

| 名称 | 值 | 适用 |
|------|-----|------|
| `sm` | 6px | 标签、小芯片、徽章 |
| `md` | 8px | 按钮、输入框、小卡片 |
| `lg` | 10px | 按钮（中）、下拉项 |
| `xl` | 12px | 卡片（紧凑）、弹窗 |
| `2xl` | 16px | 卡片（标准）|
| `3xl` | 20px | 大卡片、面板 |
| `full` | 9999px | 圆形按钮、标签胶囊 |

---

## 5. 核心组件规范

### 5.1 GlassCard（玻璃卡片）

所有卡片统一使用以下样式，**禁止自行定义卡片背景**。

```css
/* 默认态 */
background: rgba(255,255,255,0.038);
backdrop-filter: blur(24px) saturate(1.4);
-webkit-backdrop-filter: blur(24px) saturate(1.4);
border: 1px solid rgba(255,255,255,0.09);
border-radius: 16px;
box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);

/* 激活态（active）*/
background: rgba(99,102,241,0.12);
border: 1px solid rgba(99,102,241,0.45);
box-shadow: 0 0 24px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.1);

/* 成功辉光态（glow="success"）*/
border: 1px solid rgba(16,185,129,0.35);
box-shadow: 0 0 20px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.08);

/* 警告辉光态（glow="warning"）*/
border: 1px solid rgba(245,158,11,0.35);
box-shadow: 0 0 20px rgba(245,158,11,0.2), inset 0 1px 0 rgba(255,255,255,0.08);

/* 高亮态（raised）*/
background: rgba(255,255,255,0.06);  /* 替换默认背景 */
```

**React 组件**：`src/app/components/common/GlassCard.tsx`

```tsx
<GlassCard>默认</GlassCard>
<GlassCard active>激活态</GlassCard>
<GlassCard raised>高亮态</GlassCard>
<GlassCard glow="success">成功态</GlassCard>
<GlassCard glow="warning">警告态</GlassCard>
<GlassCard glow="cyan">科技感</GlassCard>
<GlassCard pad={16}>内边距 16px</GlassCard>
<GlassCard radius={12}>圆角 12px</GlassCard>
```

---

### 5.2 按钮规范

#### Primary 主按钮
```css
background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
color: #ffffff;
font-size: 13px;
font-weight: 600;
border: none;
border-radius: 10px;
padding: 9px 22px;
box-shadow: 0 4px 20px rgba(99,102,241,0.4);
cursor: pointer;
```

#### Ghost 次要按钮
```css
background: rgba(255,255,255,0.05);
border: 1px solid rgba(255,255,255,0.09);
color: rgba(255,255,255,0.55);
font-size: 13px;
font-weight: 400;
border-radius: 10px;
padding: 9px 22px;
cursor: pointer;
```

#### Accent Outline 强调轮廓按钮
```css
background: rgba(99,102,241,0.14);
border: 1px solid rgba(99,102,241,0.35);
color: #818CF8;
font-size: 13px;
font-weight: 500;
border-radius: 10px;
padding: 9px 22px;
cursor: pointer;
```

#### Success 成功按钮
```css
background: linear-gradient(135deg, #10B981, #059669);
color: #ffffff;
font-size: 13px;
font-weight: 600;
border: none;
border-radius: 10px;
padding: 9px 22px;
box-shadow: 0 4px 16px rgba(16,185,129,0.35);
cursor: pointer;
```

#### Chip / Toggle 标签选择按钮
```css
/* 未选中 */
background: rgba(255,255,255,0.03);
border: 1px solid rgba(255,255,255,0.07);
color: rgba(255,255,255,0.30);
font-size: 12px;
padding: 5px 12px;
border-radius: 8px;

/* 选中 */
background: rgba(99,102,241,0.14);
border: 1px solid rgba(99,102,241,0.40);
color: #818CF8;
font-weight: 500;
```

**禁用态通用规则**：
```css
opacity: 0.5;
cursor: not-allowed;
/* 不改变背景色，仅降低透明度 */
```

---

### 5.3 Tag 标签

```tsx
<Tag variant="accent">作词方向</Tag>    /* 紫色，强调 */
<Tag variant="success">已完成</Tag>     /* 绿色，成功 */
<Tag variant="warning">制作中</Tag>    /* 黄色，进行中 */
<Tag variant="error">异常</Tag>        /* 红色，错误 */
<Tag variant="default">古风</Tag>      /* 默认白灰 */
<Tag variant="dim">情感叙事</Tag>      /* 极淡，弱强调 */
<Tag variant="cyan">数据</Tag>         /* 青色，科技感 */
<Tag variant="outline">民谣</Tag>      /* 无填充轮廓 */
<Tag size="sm">小号（默认）</Tag>
<Tag size="md">中号</Tag>
```

各 variant 精确样式见 `src/app/components/common/Tag.tsx`

---

### 5.4 输入框

```css
/* 默认态 */
background: rgba(255,255,255,0.04);
border: 1px solid rgba(255,255,255,0.08);
border-radius: 10px;
padding: 9px 13px;
color: rgba(255,255,255,0.92);
font-size: 13px;
outline: none;

/* 焦点态 */
border-color: rgba(99,102,241,0.5);
box-shadow: 0 0 0 3px rgba(99,102,241,0.12);

/* Placeholder */
color: rgba(255,255,255,0.16);

/* Textarea 多行 */
resize: none;
line-height: 1.7;  /* 中文多行建议 1.8 */
```

---

### 5.5 Toggle 开关

```css
/* 容器 */
width: 34px; height: 20px;
border-radius: 999px;
border: none; cursor: pointer;
transition: background 0.2s;

/* 开启 */
background: #6366F1;

/* 关闭 */
background: rgba(255,255,255,0.1);

/* 滑块 */
width: 14px; height: 14px;
border-radius: 50%;
background: #ffffff;
position: absolute; top: 3px;
transition: left 0.2s;
/* 开启：left: 17px，关闭：left: 3px */
```

---

### 5.6 波形（Waveform）

**组件**：`src/app/components/common/Waveform.tsx`

```tsx
<Waveform
  bars={48}           /* 条数，推荐 36-60 */
  progress={0.35}     /* 已播放比例 0-1 */
  height={40}         /* 容器高度 px */
  seed={3}            /* 随机种子，同 seed 产生同样波形 */
  activeColor="#6366F1"
  inactiveColor="rgba(255,255,255,0.08)"
/>
```

**颜色规则**：
- 播放器：`activeColor: #6366F1`，`inactiveColor: rgba(255,255,255,0.08)`
- 列表行：`activeColor: #6366F1`，`inactiveColor: rgba(255,255,255,0.07)`
- 成功态：`activeColor: #10B981`

---

### 5.7 雷达图（RadarChart）

**组件**：`src/app/components/common/RadarChart.tsx`

```tsx
<RadarChart
  values={[0.85, 0.70, 0.90, 0.75, 0.80]}  /* 5个维度，0-1 */
  labels={['旋律感', '节奏感', '画面感', '情感力', '风格性']}
  size={150}    /* 整体尺寸 px */
  color="#6366F1"  /* 填充色，默认主色 */
/>
```

**使用场景**：分身档案页、分身网络右侧详情面板

---

### 5.8 侧边栏

宽度固定 **196px**，不可拉伸。

```css
background: rgba(6,7,15,0.92);
backdrop-filter: blur(24px);
border-right: 1px solid rgba(255,255,255,0.06);
```

**Nav item 样式**：
```css
/* 普通态 */
padding: 7px 10px; border-radius: 10px;
color: rgba(255,255,255,0.30);
background: transparent; border: 1px solid transparent;

/* 激活态 */
background: rgba(99,102,241,0.14);
border: 1px solid rgba(99,102,241,0.3);
color: #818CF8;
box-shadow: 0 0 12px rgba(99,102,241,0.15);
```

---

### 5.9 顶栏 / 底部播放器

```css
/* 顶栏 */
height: 52px;
background: rgba(6,7,15,0.7);
backdrop-filter: blur(20px);
border-bottom: 1px solid rgba(255,255,255,0.05);

/* 底部播放器 */
height: 60px;
background: rgba(6,7,15,0.85);
backdrop-filter: blur(24px);
border-top: 1px solid rgba(255,255,255,0.05);
```

---

### 5.10 进度条

```css
/* 轨道 */
height: 4px; border-radius: 999px;
background: rgba(255,255,255,0.07);

/* 填充 — 主色 */
background: linear-gradient(90deg, #6366F1, #818CF8);

/* 填充 — 成功 */
background: #10B981;

/* 填充 — 警告 */
background: #F59E0B;
```

---

### 5.11 状态指示器（小圆点 + 文字）

```css
/* 容器 */
display: flex; align-items: center; gap: 6px;
padding: 6px 12px; border-radius: 8px;

/* 状态良好（绿）*/
background: rgba(16,185,129,0.08);
border: 1px solid rgba(16,185,129,0.2);
dot-color: #10B981; text-color: #34D399;

/* 热门召唤（黄）*/
background: rgba(245,158,11,0.08);
border: 1px solid rgba(245,158,11,0.2);
dot-color: #F59E0B; text-color: #FCD34D;

/* 需要维护（橙）*/
同上，颜色换为 warning 系

/* 正在探索（紫）*/
background: rgba(99,102,241,0.08);
border: 1px solid rgba(99,102,241,0.2);
```

---

## 6. 页面布局规范

### 全局框架

```
┌─────────────────────────────────────────────────────────┐
│  Sidebar (196px)  │  TopBar (height: 52px)   │ DS btn  │
│                   ├─────────────────────────────────────┤
│                   │                                     │
│                   │     Main Content (flex: 1)          │
│                   │                                     │
│                   ├─────────────────────────────────────┤
│                   │  BottomPlayer (height: 60px)        │
└─────────────────────────────────────────────────────────┘
```

---

### 6.1 创作台首页（home）

```
┌─────────────────────────────────┬──────────────────┐
│  Main (flex: 1)                 │ Right Panel 272px│
│  padding: 32px                  │ padding: 32px 16px│
│                                 │                  │
│  ┌──────────────────────────┐   │ 推荐人才合集      │
│  │ 标题行 + 继续按钮         │   │ (SVG网络图 185px) │
│  └──────────────────────────┘   │                  │
│  ┌──────────────────────────┐   │ 本月数据卡片      │
│  │ 灵感输入框（GlassCard）   │   │ (2×2 grid)       │
│  │ textarea 3行              │   │                  │
│  │ + 快选 chips + 开始按钮   │   │ 快捷操作 ×2      │
│  └──────────────────────────┘   │                  │
│                                 │ 平台说明          │
│  接力链提示条（全宽）            │                  │
│                                 │                  │
│  最近项目列表（4行）             │                  │
└─────────────────────────────────┴──────────────────┘
```

---

### 6.2 项目制作页（production）

```
┌──────────────┬──────────────────────────────┬─────────────┐
│ 左链路 204px │ 主工作区 (flex: 1)            │ 分身 252px  │
│ padding 24px │ padding: 24px                 │ padding 16px│
│              │                               │             │
│ 项目摘要卡片 │ 步骤标识 + 环节名             │ 分身封面卡  │
│              │ ─────────────────────         │ (高100px)   │
│ 专家接力链   │ [结果展示卡片]                │ + 数据      │
│ (4步带连线)  │  - 输出内容                  │             │
│              │  - 对比提示                   │ 贡献预写入  │
│ 贡献链路     │                               │             │
│ 预写入摘要   │ [修改意见输入]                │ 下步预览    │
│              │                               │             │
│              │ [行动按钮行]                  │ 换分身/返回 │
│              │  继续修改 | 换分身 | 确认→    │             │
└──────────────┴──────────────────────────────┴─────────────┘
```

---

### 6.3 创作人分身网络（avatarNetwork）

```
┌────────────────────────────────────────┬──────────────┐
│ 列表主区 (flex: 1)                      │ 详情 280px   │
│                                         │              │
│ Header: 标题 + 搜索框 + 筛选按钮         │ 封面 130px   │
│ ─────────────────────────────────       │              │
│ 方向 Tabs + 风格 Chips                  │ 头像+名称+Lv │
│ ─────────────────────────────────       │              │
│ "共N位" 文字                            │ 3格数据行    │
│                                         │              │
│ 分身卡片 Grid                           │ 雷达图       │
│ auto-fill, minmax(190px, 1fr)           │              │
│ 每张卡 = 封面76px + 卡体               │ 格言         │
│                                         │              │
│                                         │ 标签/擅长    │
│                                         │              │
│                                         │ 代表作       │
│                                         │              │
│                                         │ 召唤CTA      │
└────────────────────────────────────────┴──────────────┘
```

---

### 6.4 创建分身（createAvatar）

```
┌──────────────┬────────────────────────────────┬─────────────┐
│ 左导航 216px │ 表单区 (flex: 1)               │ 预览 252px  │
│              │ padding: 24px 32px             │ padding 16px│
│ 步骤列表     │                                │             │
│ (4步进度)    │ 标题 + 进度条                  │ 分身预览卡  │
│              │ ─────────────────              │             │
│ 提示卡片     │ Step 1: 基础信息               │ 雷达图      │
│              │  - 名称 input                  │             │
│              │  - 方向 chips                  │ 进度卡      │
│              │  - 代表作 tags                 │             │
│              │                                │             │
│              │ Step 2: 风格定位               │             │
│              │  - 风格标签 chips              │             │
│              │  - 擅长 chips                  │             │
│              │  - 不接受 textarea             │             │
│              │                                │             │
│              │ [上一步] [下一步/完成]          │             │
└──────────────┴────────────────────────────────┴─────────────┘
```

---

### 6.5 我的作品（myWorks）

**列表页**：
```
Header: 标题 + 3个统计数字 + 新建按钮
─────────────────────────────────────
Tabs: 全部 / 已完成 / 进行中 / 草稿
─────────────────────────────────────
项目行（每行 height auto ~64px）：
  [封面48px] [标题+标签 200px] [步骤进度条 120px] [波形 flex-1] [数据] [操作]
```

**作品详情页**（点击进入）：
```
┌──────────────────────────────────────────┬──────────────┐
│ 主内容区 (flex: 1)                        │ 贡献链 264px │
│                                           │              │
│ 面包屑                                    │ 链路标题     │
│                                           │              │
│ [封面128px] + [标题+播放器]               │ 4步贡献节点  │
│                                           │ (带连线)     │
│ 5列数据卡                                 │              │
│                                           │ 模拟收益卡   │
│ 7天折线图                                 │              │
│                                           │ 权属信息     │
│ [歌词] [Prompt] 2列                       │              │
│                                           │              │
│ 协议选择（4选1）+ 确认按钮                │              │
│                                           │              │
│ [推广分身] [发行分身] 2列                 │              │
└──────────────────────────────────────────┴──────────────┘
```

---

### 6.6 分身管理（avatarManage）

```
┌──────────────┬──────────────────────────────┬─────────────┐
│ 左总览 216px │ 主面板 (flex: 1)              │ 操作 248px  │
│              │                               │             │
│ 分身卡片     │ 标题 + 查看进化报告按钮        │ 快捷操作列表│
│ XP进度条     │ ─────────────────             │             │
│              │ Tabs: 概览/成长/记录           │ 暂停/回滚   │
│ 5项统计      │                               │             │
│              │ [概览]:                       │ 模拟收益卡  │
│ 状态指示     │   维护队列（3条任务）          │             │
│              │   风格参数进度条               │ 通知设置    │
│              │   代表贡献列表                 │ (3个开关)   │
│              │                               │             │
│              │ [成长]: 路径+雷达+升级条件     │             │
│              │                               │             │
│              │ [记录]: 校准历史               │             │
└──────────────┴──────────────────────────────┴─────────────┘
```

---

### 6.7 进化报告（evolutionReport）

单列滚动页，`maxWidth: 800px`，居中。

```
面包屑: 分身管理 > 进化报告
──────────────────────────────
标题行 + 触发原因卡片（右侧）

[市场表现]  6列数据卡（grid-cols-6）
[人格保真]  2列混合卡
[方向分析]  2列卡（上升/下降）
[代表作品]  2列×2行 打分预览卡
[校准 CTA]  全宽横幅（glass-card + accent glow）
```

---

### 6.8 3分钟校准（calibration）

单列滚动页，`maxWidth: 680px`，居中。

```
Header: 面包屑 + 剩余时间
顶部进度条（全宽 3px 渐变）

步骤指示器（3节点横向）

[Step 1] 表现回顾卡 + 触发说明
[Step 2] 4首作品打分卡（纵向列表）
         每卡: 标题+波形+描述+3选1
[Step 3] 5道方向问答（纵向列表）
         每题: 问题+4选1

[结果页]  参数更新卡列表
          预估效果卡（success glow）
          [暂不应用] [回滚] [确认进化]
```

---

### 6.9 贡献链路（contribution）

```
┌──────────────┬────────────────────────────────┬─────────────┐
│ 左列表 290px │ 链路详情 (flex: 1)              │ 收益 252px  │
│              │                                 │             │
│ 标题 + 筛选  │ 作品头部（封面+标题+数据）       │ 收益分配卡  │
│              │ ─────────────────               │             │
│ 汇总数据     │ "X/4步完成" 标签                │ 协议卡      │
│ (2×2 grid)   │                                 │             │
│              │ 接力链节点（纵向）               │ 数据卡      │
│ 作品列表     │ 每节点:                         │             │
│ (点击选中)   │   环节名 + 分身 + 权重           │ 链路完整度  │
│              │   输出摘要 + 编辑说明             │ 状态指示    │
│              │   确认时间 + 采纳率进度条         │             │
└──────────────┴────────────────────────────────┴─────────────┘
```

---

## 7. 交互行为规范

### 7.1 全局 Toast 规范

使用 `sonner` 库，配置如下：

```tsx
<Toaster
  position="bottom-right"
  toastOptions={{
    style: {
      background: 'rgba(14,16,28,0.92)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: 'rgba(255,255,255,0.92)',
      borderRadius: '12px',
    },
  }}
  richColors
/>
```

**Toast 使用场景**：

| 触发动作 | Toast 类型 | 文案示例 |
|----------|-----------|---------|
| 确认环节成果 | `toast.success` | `作词成果已确认，已写入贡献链路` |
| 分身召唤完成 | `toast.success` | `林间小调 已接入，交付内容已生成` |
| 继续修改（无意见） | `toast.info` | `请先输入修改意见` |
| 继续修改（进行中） | `toast.loading` + `toast.success` | loading → 已重新生成 |
| Demo 生成 | `toast.loading` + `toast.success` | loading 3s → Demo 已生成 |
| 收藏分身 | `toast.success` / `toast.info` | 已收藏 / 已取消收藏 |
| 分享 | `toast.success` | 分享链接已复制到剪贴板 |
| 导出 | `toast.info` + `toast.success` | 正在准备 → 导出完成 |
| 协议确认 | `toast.success` | 协议「非独家发布」已确认并记录 |
| 通知开关 | `toast.success` | 强提醒已开启/关闭 |
| 暂停召唤 toggle | `toast.success` | 分身已暂停 / 已恢复 |
| 回滚参数 | `toast.loading` + `toast.success` | loading 1.2s → 已回滚 |
| 创建分身完成 | `toast.success` + 延迟跳转 | 分身创建成功！+ 800ms 后跳转 |

### 7.2 过渡动画规范

```css
/* 颜色/边框/透明度过渡 */
transition: all 0.15s ease;

/* 宽度/高度过渡（进度条等）*/
transition: width 0.5s ease;

/* 背景过渡（Toggle 等）*/
transition: background 0.2s;

/* 位置过渡（Toggle 滑块）*/
transition: left 0.2s;
```

### 7.3 Hover 状态规范

```css
/* 卡片 Hover */
border-color: rgba(255,255,255,0.14);  /* 比默认亮一档 */

/* 按钮 Ghost Hover */
background: rgba(255,255,255,0.08);

/* 列表行 Hover */
background: rgba(255,255,255,0.04);
```

---

## 8. 图标规范

**图标库**：`lucide-react` v0.487.0

| 使用场景 | 尺寸 | 颜色 |
|---------|------|------|
| 侧边栏 Nav | 14px | 随状态变化 |
| 顶栏操作 | 12–13px | `C.t2` 或 `C.t3` |
| 按钮内图标 | 13–14px | 跟随按钮文字色 |
| 卡片标题图标 | 13–14px | `C.t3` |
| 数据卡图标 | 11–12px | 状态色（`C.success` 等）|
| 输入框内图标 | 12px | `C.t3` |
| 步骤节点 Check | 11–12px | `C.success` |

**常用图标对照**：

| 功能 | 图标名 |
|------|--------|
| 创作台/首页 | `Sparkles` |
| 我的作品 | `Music` |
| 分身网络 | `Users` |
| 申请入驻 | `UserPlus` |
| 分身管理 | `Bot` |
| 贡献链路 | `Link2` |
| 额度 | `Zap` |
| 通知 | `Bell` |
| 搜索 | `Search` |
| 播放 | `Play` |
| 暂停 | `Pause` |
| 确认 | `Check` |
| 收藏 | `Star` |
| 分享 | `Share2` |
| 导出 | `Download` |
| 返回 | `ArrowLeft` |
| 进入 | `ArrowRight` / `ChevronRight` |
| 刷新/重试 | `RefreshCw` |
| 回滚 | `RotateCcw` |
| 版权 | `Shield` |
| 趋势上升 | `TrendingUp` |
| 趋势下降 | `TrendingDown` |
| 播放量 | `Eye` |
| 点赞 | `Heart` |
| 设置 | `Settings` |

---

## 9. 页面交互流转图

```
首页（home）
│
├── 点击「开始制作」→ 项目制作页（production）
│     │
│     ├── 4步依次推进（作词→作曲→编曲→制作）
│     │   每步：选择分身 → 召唤 → 查看结果 → 确认
│     │
│     ├── 「换分身」→ 分身网络页（avatarNetwork）
│     │   └── 「召唤此分身协作」→ 回到 production
│     │
│     └── 4步全确认 → 「生成 Demo」→ 完成
│         └── 「前往作品页」→ 我的作品（myWorks）
│
├── 点击「我的作品」→ myWorks 列表
│     ├── 点击已完成项目 → 作品详情（子页面）
│     │   ├── 协议选择 → 确认 → Toast
│     │   ├── 「召唤推广分身」→ Toast 提示
│     │   └── 「召唤发行分身」→ 跳转 contribution
│     └── 「继续制作」按钮 → production
│
├── 点击「分身网络」→ avatarNetwork
│   └── 「召唤此分身协作」→ production
│
├── 点击「申请入驻」→ createAvatar
│   └── 4步表单完成 → Toast → 跳转 avatarManage
│
└── 点击「分身管理」→ avatarManage
      │
      ├── 「查看进化报告」→ evolutionReport
      │   └── 「开始3分钟校准」→ calibration
      │       ├── Step1 → Step2 → Step3 → 结果
      │       ├── 「确认进化」→ Toast → avatarManage
      │       ├── 「暂不应用」→ Toast → avatarManage
      │       └── 「回滚上一轮」→ Toast → avatarManage
      │
      ├── 维护队列「开始校准」→ evolutionReport
      ├── 维护队列「接受任务」→ production
      ├── 「手动触发校准」→ calibration
      └── Tab「校准记录」→「触发新一轮校准」→ calibration

贡献链路（contribution）— 独立功能
  └── 作品列表 → 选中 → 查看接力链详情 + 收益分配
```

---

## 10. 研发对接说明

### 10.1 代码结构（Path A 直接使用）

```
src/
├── app/
│   ├── design/
│   │   └── tokens.ts          ← 所有设计 Token 单一来源
│   ├── components/
│   │   ├── common/
│   │   │   ├── GlassCard.tsx  ← 核心卡片组件
│   │   │   ├── Tag.tsx        ← 标签组件
│   │   │   ├── Waveform.tsx   ← 波形可视化
│   │   │   └── RadarChart.tsx ← 雷达图
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx    ← 侧边导航
│   │   │   ├── TopBar.tsx     ← 顶部栏
│   │   │   └── BottomPlayer.tsx ← 底部播放器
│   │   └── pages/             ← 9个业务页面
│   └── App.tsx                ← 路由入口
└── styles/
    ├── fonts.css              ← 字体引用
    └── theme.css              ← 全局背景效果（点阵+辉光）
```

### 10.2 引用 Token 方式

```tsx
import { C, T, S } from '../../design/tokens';

// 颜色
<div style={{ color: C.t0, background: C.bgCard }}>

// 字体预设
<p style={{ ...T.caption, color: C.t1 }}>

// 样式预设（按钮等）
<button style={{ ...S.btnPrimary, padding: '9px 22px', borderRadius: 10 }}>
```

### 10.3 backdrop-filter 注意事项

- 需要父容器 **不设置** `overflow: hidden`（否则 blur 失效）
- Safari 需要 `-webkit-backdrop-filter` 前缀（已在组件中处理）
- 要有实际内容在卡片「后面」，blur 才可见（全局背景已配置）

### 10.4 字体加载

`src/styles/fonts.css` 中已引入 Google Fonts Noto Sans SC。  
**生产环境建议**：将字体托管到 CDN 或本地，避免网络请求延迟。

### 10.5 Sonner Toast

已在 `App.tsx` 全局配置 `<Toaster>`，业务代码中直接调用：

```tsx
import { toast } from 'sonner';

toast.success('操作成功');
toast.info('提示信息');
toast.loading('加载中…');
toast.error('操作失败');
toast.dismiss();  // 关闭 loading
```

---

*文档由 MuseGrid 设计系统自动生成 · 2026-06-25*
