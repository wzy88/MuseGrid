# MuseGrid Release Avatar Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the MuseGrid v2 works result page so the completed-work post-production area presents copyright direction, simulated platform release, and promotion growth pack as one coherent flow.

**Architecture:** Keep the change scoped to the existing Figma Make prototype page. Add local React state and small local constants inside `MyWorksPage.tsx`; do not add backend integration or new routes. The simulated release timeline and promotion pack are rendered inline in the work result page so the future real musician-site status writeback can replace the local state later.

**Tech Stack:** React 18, TypeScript, Vite, lucide-react icons, existing inline design token system from `designs/figma-make-musegrid-v2/src/app/design/tokens.ts`.

## Global Constraints

- Current version must not integrate the already-launched musician website.
- MuseGrid should present itself as the unified release console.
- Existing musician website remains the authoritative system for signing, authorization, distribution workflow, and settlement status.
- Current UI must show simulated release timeline, not real signing or distribution.
- Rename `协议选择 · 版权时间戳` to `版权与发行方式`.
- Rename `确认协议选择` to `确认发行方向`.
- Replace `独家发行` with `平台代理发行`.
- Promotion avatar creates growth materials and must not block release.
- No new backend schema, API, or real account linking.

---

### Task 1: Update Release Direction Copy

**Files:**
- Modify: `designs/figma-make-musegrid-v2/src/app/components/pages/MyWorksPage.tsx`

**Interfaces:**
- Consumes: existing `PROTOCOLS` array and `protocol` state.
- Produces: updated protocol labels and release-direction confirmation copy used by later release timeline logic.

- [ ] **Step 1: Replace protocol choices with release-direction choices**

Change the `PROTOCOLS` constant to:

```ts
const PROTOCOLS = [
  { key:'internal',     label:'内部使用',     desc:'保存、试听或私域分享',          icon:'🔒' },
  { key:'nonexclusive', label:'非独家发布',   desc:'保留外部分发权',              icon:'📢' },
  { key:'exclusive',    label:'平台代理发行', desc:'平台承接授权、上架和结算',    icon:'⭐' },
  { key:'commercial',   label:'商业授权',     desc:'广告、游戏、品牌、影视流程',  icon:'💼' },
];
```

- [ ] **Step 2: Update the protocol section title and confirmation copy**

Change visible copy in the protocol card:

```tsx
<p style={{ ...T.subheading, color:C.t0 }}>版权与发行方式</p>
<Tag variant="dim">贡献证据链已记录</Tag>
```

Change the confirmation button text:

```tsx
<Check size={13}/>确认发行方向
```

Change the confirmation message:

```tsx
<Check size={12} color={C.success}/><span style={{ ...T.caption, color:'#34D399' }}>发行方向「{PROTOCOLS.find(p=>p.key===protocol)?.label}」已记录，正式授权将由平台音乐人发行体系承接</span>
```

- [ ] **Step 3: Run focused build check**

Run: `corepack pnpm --dir designs/figma-make-musegrid-v2 build`

Expected: Vite build completes successfully.

### Task 2: Add Simulated Release Timeline

**Files:**
- Modify: `designs/figma-make-musegrid-v2/src/app/components/pages/MyWorksPage.tsx`

**Interfaces:**
- Consumes: `protocol`, `protocolConfirmed`, and existing `work.status`.
- Produces: `releaseStarted` UI state and timeline rendering.

- [ ] **Step 1: Add release timeline constants near `PROTOCOLS`**

Add:

```ts
const RELEASE_TIMELINE = [
  { title:'贡献链路归档', status:'done', note:'Demo、歌词、Prompt、分身贡献和确认时间已归档。' },
  { title:'授权路径确认', status:'done', note:'当前发行方向已记录，未来将由平台音乐人授权体系承接正式签约。' },
  { title:'发行资料准备', status:'active', note:'待补充封面、艺人名、发行标题、简介和平台展示信息。' },
  { title:'平台发行审核', status:'pending', note:'资料完整后将提交平台发行团队审核。' },
  { title:'上架与结算跟踪', status:'pending', note:'发行成功后将回写平台、播放、收益和结算状态。' },
] as const;
```

- [ ] **Step 2: Add local state and replace publish handler**

Inside `WorkResult`, add:

```ts
const [releaseStarted, setReleaseStarted] = useState(false);
```

Replace `handlePublish` with:

```ts
function handleReleaseStart() {
  if (!protocolConfirmed) {
    toast.warning('请先确认发行方向');
    return;
  }
  setReleaseStarted(true);
  toast.success('发行分身已创建模拟发行流程');
}
```

- [ ] **Step 3: Replace the release card**

Replace the old `发行分身` card with:

```tsx
<div style={{ padding:18, borderRadius:14, background:'rgba(16,185,129,0.06)', border:`1px solid rgba(16,185,129,0.18)` }}>
  <p style={{ ...T.subheading, color:'#34D399', marginBottom:4 }}>平台代理发行</p>
  <p style={{ ...T.caption, color:C.t2, lineHeight:1.7, marginBottom:12 }}>发行分身将检查作品资料、版权链路与授权状态，并接入平台音乐人发行体系。</p>
  <button onClick={handleReleaseStart} style={{ ...S.btnSuccess, display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, fontSize:12 }}>启动模拟发行</button>
</div>
```

- [ ] **Step 4: Render timeline after release is started**

Below the promotion/release card grid, add:

```tsx
{releaseStarted && (
  <GlassCard pad={18}>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
      <div>
        <p style={{ ...T.subheading, color:C.t0 }}>发行分身已创建发行流程</p>
        <p style={{ ...T.caption, color:C.t2, marginTop:4 }}>当前阶段：发行资料准备</p>
      </div>
      <Tag variant="dim">模拟发行</Tag>
    </div>
    <div style={{ display:'grid', gap:10 }}>
      {RELEASE_TIMELINE.map((item, idx) => {
        const done = item.status === 'done';
        const active = item.status === 'active';
        return (
          <div key={item.title} style={{ display:'grid', gridTemplateColumns:'24px 1fr', gap:10 }}>
            <span style={{ width:22, height:22, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background:done?C.successDim:active?C.accentDim:'rgba(255,255,255,0.05)', border:`1px solid ${done?'rgba(16,185,129,0.35)':active?'rgba(99,102,241,0.45)':'rgba(255,255,255,0.08)'}`, color:done?'#34D399':active?C.accentLight:C.t3, fontSize:10, fontWeight:700 }}>{done?'✓':idx+1}</span>
            <div style={{ padding:'0 0 10px 0', borderBottom:idx<RELEASE_TIMELINE.length-1?'1px solid rgba(255,255,255,0.06)':'none' }}>
              <p style={{ ...T.caption, color:active?C.t0:C.t1, fontWeight:active?600:500 }}>{item.title}</p>
              <p style={{ ...T.label, color:C.t3, lineHeight:1.6, marginTop:3 }}>{item.note}</p>
            </div>
          </div>
        );
      })}
    </div>
  </GlassCard>
)}
```

- [ ] **Step 5: Run focused build check**

Run: `corepack pnpm --dir designs/figma-make-musegrid-v2 build`

Expected: Vite build completes successfully.

### Task 3: Add Promotion Growth Pack State

**Files:**
- Modify: `designs/figma-make-musegrid-v2/src/app/components/pages/MyWorksPage.tsx`

**Interfaces:**
- Consumes: existing `handlePromo` button behavior.
- Produces: `promoGenerated` UI state and a visible promotion pack summary.

- [ ] **Step 1: Add promotion deliverable constants**

Add near the timeline constant:

```ts
const PROMO_PACK = [
  '标题 / Hook 候选 5 条',
  '封面方向 3 组',
  '短视频切片建议',
  '小红书 / 抖音 / 微博发布文案',
  '目标受众与收听场景',
] as const;
```

- [ ] **Step 2: Add local state and replace promo handler**

Inside `WorkResult`, add:

```ts
const [promoGenerated, setPromoGenerated] = useState(false);
```

Replace `handlePromo` with:

```ts
function handlePromo() {
  setPromoGenerated(true);
  toast.success('推广增长包已生成');
}
```

- [ ] **Step 3: Update promotion card copy**

Replace the old promotion card text with:

```tsx
<p style={{ ...T.subheading, color:C.accentLight, marginBottom:4 }}>推广增长包</p>
<p style={{ ...T.caption, color:C.t2, lineHeight:1.7, marginBottom:12 }}>生成发行前预热文案、短视频切片建议、封面方向和平台发布文案。</p>
<button onClick={handlePromo} style={{ ...S.btnAccentOutline, display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, fontSize:12 }}>生成推广包</button>
```

- [ ] **Step 4: Render promotion pack summary after generation**

Add inside the promotion card:

```tsx
{promoGenerated && (
  <div style={{ marginTop:12, display:'grid', gap:6 }}>
    {PROMO_PACK.map(item => (
      <div key={item} style={{ display:'flex', alignItems:'center', gap:6 }}>
        <Check size={11} color={C.accentLight}/>
        <span style={{ ...T.label, color:C.t2 }}>{item}</span>
      </div>
    ))}
  </div>
)}
```

- [ ] **Step 5: Run focused build check**

Run: `corepack pnpm --dir designs/figma-make-musegrid-v2 build`

Expected: Vite build completes successfully.

### Task 4: Verify Interaction In Browser

**Files:**
- Modify: none
- Test: local browser check

**Interfaces:**
- Consumes: completed UI from Tasks 1-3.
- Produces: visual and interaction confidence for the prototype page.

- [ ] **Step 1: Start the prototype dev server**

Run: `corepack pnpm --dir designs/figma-make-musegrid-v2 dev -- --host 127.0.0.1`

Expected: Vite prints a local URL.

- [ ] **Step 2: Open the app and navigate to a finished work**

Use browser automation to open the Vite URL, enter `我的作品`, and select a completed work.

Expected: The post-completion area shows `版权与发行方式`, `平台代理发行`, and `推广增长包`.

- [ ] **Step 3: Exercise the flow**

Click `平台代理发行`, click `确认发行方向`, click `启动模拟发行`, and click `生成推广包`.

Expected: The page shows `发行分身已创建发行流程`, `当前阶段：发行资料准备`, and the promotion pack checklist. No text claims that a real contract has been signed or a real distribution submission completed.

- [ ] **Step 4: Stop the dev server**

Stop the running Vite process.

Expected: No lingering development server remains.
