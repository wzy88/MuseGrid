# MuseGrid release and promotion avatar flow design

## Goal

Clarify the post-completion workflow on `我的作品` so a finished song feels ready to move from creation into publishing, authorization, promotion, and later revenue tracking.

The current version does not need to integrate the already-launched musician website immediately. It should express that MuseGrid is the unified front door for platform distribution while the existing musician site remains the production system for signing, authorization, release operations, and future status writeback.

## Product Positioning

MuseGrid should not present this area as a set of disconnected buttons. It should present a finished work as entering an operational pipeline:

```text
作品完成
→ 贡献链路归档
→ 选择版权与发行方式
→ 发行分身启动模拟发行
→ 推广分身生成增长素材
→ 未来由平台音乐人发行体系承接真实授权、签约、发行和结算
```

In the user-facing product, MuseGrid is the unified release console. In the backend reality, the existing musician website remains the authoritative system for signing, authorization, distribution workflow, and settlement status.

## Module Structure

Replace the current red-box area with three clearer modules.

### 1. Copyright And Release Direction

Rename `协议选择 · 版权时间戳` to `版权与发行方式`.

The four choices can remain, but their meaning should shift from isolated legal choices to release intent:

- `内部使用`: 仅保存、试听、平台内播放或私域分享。
- `非独家发布`: 用户保留外部分发权，平台记录贡献链路和授权意向。
- `平台代理发行`: 进入平台音乐人发行体系，由平台承接授权、上架和结算。
- `商业授权`: 进入广告、游戏、品牌、影视等授权使用流程。

Rename the confirmation button from `确认协议选择` to `确认发行方向`.

After confirmation, show that the contribution evidence chain and release direction have been recorded. Do not imply that a legally complete contract has already been signed inside MuseGrid.

### 2. Platform Release Avatar

The release avatar is not a checklist generator. It is the user's platform release manager.

Recommended card copy:

```text
平台代理发行
发行分身将检查作品资料、版权链路与授权状态，并接入平台音乐人发行体系。
```

Primary action:

```text
启动模拟发行
```

After the user starts it, show a simulated release timeline rather than a real integration result.

Timeline states:

1. `贡献链路归档`
   - Completed by default when the work has all creative steps confirmed.
   - Avatar note: `Demo、歌词、Prompt、分身贡献和确认时间已归档。`
2. `授权路径确认`
   - Completed after the user confirms `平台代理发行` or another release direction.
   - Avatar note: `当前发行方向已记录，未来将由平台音乐人授权体系承接正式签约。`
3. `发行资料准备`
   - Current active state in the mock flow.
   - Avatar note: `待补充封面、艺人名、发行标题、简介和平台展示信息。`
4. `平台发行审核`
   - Pending in the mock flow.
   - Avatar note: `资料完整后将提交平台发行团队审核。`
5. `上架与结算跟踪`
   - Pending in the mock flow.
   - Avatar note: `发行成功后将回写平台、播放、收益和结算状态。`

The copy should make the simulated state feel useful without falsely claiming that real signing or platform submission has happened.

### 3. Promotion Growth Pack

The promotion avatar is the work's growth planner. It helps the song get heard; it does not make the song legally releasable.

Recommended card copy:

```text
推广增长包
生成发行前预热文案、短视频切片建议、封面方向和平台发布文案。
```

Primary action:

```text
生成推广包
```

Promotion deliverables for the current version:

- 3-5 title or hook candidates.
- Cover direction suggestions.
- Short-video cut points or scene ideas.
- Xiaohongshu, Douyin, Weibo, and private-domain copy variants.
- Target audience and listening-scene suggestions.

Promotion remains a side branch next to release. It should not block the simulated release timeline.

## User Flow

For a finished work:

1. User reviews the final demo, lyrics, prompt, and contribution chain.
2. User chooses a copyright and release direction.
3. User confirms the release direction.
4. User starts simulated release.
5. The page shows the release avatar timeline with the current state at `发行资料准备`.
6. User may generate a promotion growth pack independently.
7. Future real integration can replace simulated states with musician-site status writeback.

For unfinished works, the release and promotion area should stay disabled or explain that the final demo and contribution chain must be completed first.

## Future Integration Contract

When the old musician site is connected, MuseGrid should receive and display status writeback from the authoritative release system.

Target statuses:

- `未开始`
- `资料待补全`
- `协议待签署`
- `审核中`
- `已授权`
- `已提交发行`
- `发行成功`
- `发行失败/需修改`

The frontend should be designed so the current simulated timeline can later map to these real statuses without changing the overall mental model.

## Out Of Scope

This design does not require:

- Real account linking with the musician website.
- Real contract signing inside MuseGrid.
- Real distribution API submission.
- Real revenue settlement.
- New backend schema for authoritative release records.

The implementation may use local UI state, mock project state, or prototype fixtures to express the flow.

## Success Criteria

- Users understand that `平台代理发行` is the primary release path.
- Users understand that the release avatar manages release readiness and platform handoff.
- Users understand that the promotion avatar creates growth materials, not legal authorization.
- The UI no longer feels like `协议选择`, `推广分身`, and `发行分身` are unrelated controls.
- The current mock flow can later be replaced by real musician-site status writeback.
