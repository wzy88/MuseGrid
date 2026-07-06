import { type Dispatch, type SetStateAction, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronRight, Music, RefreshCw, Sparkles, Star, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Tag } from '../common/Tag';
import { GlassCard } from '../common/GlassCard';
import { Waveform } from '../common/Waveform';
import { C, S, T } from '../../design/tokens';
import type { Page } from '../layout/Sidebar';
import {
  AVATARS,
  STEP_META,
  createContribution,
  finalPrompt,
  lyricText,
  outputSummary,
  type ContributionSnapshot,
  type ProjectBrief,
  type StepState,
} from '../../state/mockProject';

const DEFAULT_AVATAR = [0, 1, 2, 3];

type ProductionPageProps = {
  navigate: (p: Page) => void;
  project: ProjectBrief;
  steps: StepState[];
  setSteps: Dispatch<SetStateAction<StepState[]>>;
  current: number;
  setCurrent: Dispatch<SetStateAction<number>>;
  contributions: ContributionSnapshot[];
  setContributions: Dispatch<SetStateAction<ContributionSnapshot[]>>;
  onDemoGenerated: (contributions: ContributionSnapshot[]) => void;
};

function StepResult({ stepIndex, project, revisionCount }: { stepIndex: number; project: ProjectBrief; revisionCount: number }) {
  if (stepIndex === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <InfoBlock label="主题理解" value={`围绕「${project.idea}」提炼成 ${project.mood} 的叙事情绪。`} />
          <InfoBlock label="故事角度" value={`以「${project.title}」为核心意象，把重逢、离别和自我和解压进副歌。`} />
        </div>
        <div>
          <p style={{ ...T.label, color: C.t3, marginBottom: 8 }}>Hook 候选（3条）</p>
          {[
            `「${project.title}开向没有你的远方」`,
            `「我把遗憾唱给雨夜听」`,
            `「重逢像一盏快熄灭的灯」`,
          ].map((hook, index) => (
            <div key={hook} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, marginBottom: 4, background: index === 1 ? C.accentDim : 'rgba(255,255,255,0.03)', border: `1px solid ${index === 1 ? 'rgba(99,102,241,0.3)' : 'transparent'}` }}>
              <span style={{ color: C.t3, fontSize: 10, fontWeight: 700, fontFamily: "'Inter', monospace" }}>0{index + 1}</span>
              <span style={{ ...T.caption, color: index === 1 ? C.t0 : C.t2, fontStyle: 'italic', flex: 1 }}>{hook}</span>
              {index === 1 && <Tag variant="accent">推荐</Tag>}
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <LyricBlock label="主歌（Verse 1）" text={lyricText(project).split('【副歌】')[0].replace('【主歌】', '').trim()} />
          <LyricBlock label="副歌（Chorus）" text={(lyricText(project).split('【副歌】')[1] ?? '').trim()} highlight />
        </div>
        {revisionCount > 0 && <Tag variant="warning">已根据修改意见生成第 {revisionCount + 1} 版</Tag>}
      </div>
    );
  }

  if (stepIndex === 3) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <p style={{ ...T.label, color: C.accentLight, marginBottom: 6 }}>最终制作 Prompt</p>
          <p style={{ ...T.caption, color: C.t1, lineHeight: 1.8, fontStyle: 'italic' }}>{finalPrompt(project)}</p>
        </div>
        <InfoRow label="人声质感" value="温暖女声，略带气声，真诚感优先" />
        <InfoRow label="演唱建议" value="主歌克制，副歌释放，Bridge 音量收回后再推出" />
        <InfoRow label="混音倾向" value="中频饱满，低频收紧，高频清透不刺耳" />
      </div>
    );
  }

  const rows = stepIndex === 1
    ? [
        ['歌曲结构', '主歌×2 → 副歌 → 主歌 → 副歌 → Bridge → 副歌×2'],
        ['Hook 情绪', `${project.mood} · 克制 · 有记忆点`],
        ['速度范围', '118-122 BPM，大调，适合流行副歌抬升'],
        ['旋律描述', '主歌旋律平缓叙事，副歌跃升明显，Bridge 转调营造高潮'],
        ['给编曲的输入', `需要 ${project.genre} 的核心音色，intro 保留故事感引子`],
      ]
    : [
        ['乐器配置', '古琴 / 合成器 / 钢琴 / 弦乐组 / 电子鼓组 / Bass'],
        ['鼓组方向', '轻拍打点为主，副歌全鼓进入，强调 kick 与 snare 对比'],
        ['和声铺底', '弦乐 pad 始终存在，副歌增加 vocal harmony'],
        ['段落推进', 'Intro 留白 → Verse 轻器乐 → Chorus 全编 → Bridge 剥离后爆发'],
        ['给制作的输入', '整体偏暖色调混音，人声前置，reverb 不要过深'],
      ];

  return <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{rows.map(([label, value]) => <InfoRow key={label} label={label} value={value} />)}</div>;
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 14 }}>
      <p style={{ ...T.label, color: C.t3, marginBottom: 6 }}>{label}</p>
      <p style={{ ...T.caption, color: C.t1, lineHeight: 1.7 }}>{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>
      <span style={{ ...T.label, color: C.t3, width: 80, flexShrink: 0, paddingTop: 1 }}>{label}</span>
      <span style={{ ...T.caption, color: C.t1, lineHeight: 1.7 }}>{value}</span>
    </div>
  );
}

function LyricBlock({ label, text, highlight = false }: { label: string; text: string; highlight?: boolean }) {
  return (
    <div>
      <p style={{ ...T.label, color: C.t3, marginBottom: 6 }}>{label}</p>
      <pre style={{ ...T.caption, color: highlight ? C.t0 : C.t1, lineHeight: 2.1, whiteSpace: 'pre-wrap', fontFamily: "'Noto Sans SC', sans-serif", margin: 0 }}>{text}</pre>
    </div>
  );
}

export function ProductionPage({
  navigate,
  project,
  steps,
  setSteps,
  current,
  setCurrent,
  contributions,
  setContributions,
  onDemoGenerated,
}: ProductionPageProps) {
  const [feedback, setFeedback] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatingDemo, setGeneratingDemo] = useState(false);
  const [demoReady, setDemoReady] = useState(false);
  const [comparingId, setComparingId] = useState<number | null>(null);

  const curStep = steps[current];
  const curAvatar = curStep.avatarId !== null ? AVATARS[curStep.avatarId] : AVATARS[DEFAULT_AVATAR[current]];
  const allConfirmed = steps.every((step) => step.confirmed);
  const showChoose = curStep.mode === 'choose';
  const showSummon = curStep.mode === 'summoning';
  const showResult = curStep.mode === 'result';

  function updateStep(index: number, patch: Partial<StepState>) {
    setSteps((previous) => previous.map((step, stepIndex) => stepIndex === index ? { ...step, ...patch } : step));
  }

  function summonAvatar(avatarIndex: number) {
    updateStep(current, { mode: 'summoning', avatarId: avatarIndex });
    setTimeout(() => {
      updateStep(current, { mode: 'result' });
      toast.success(`${AVATARS[avatarIndex].name} 已接入，交付内容已生成`);
    }, 1800);
  }

  function handleRevise() {
    if (!feedback.trim()) {
      toast.info('请先输入修改意见');
      return;
    }
    setGenerating(true);
    toast.loading('分身正在根据你的意见重新生成…');
    setTimeout(() => {
      setGenerating(false);
      toast.dismiss();
      updateStep(current, { revisionCount: curStep.revisionCount + 1 });
      toast.success('已重新生成，请查看新版本');
      setFeedback('');
    }, 1400);
  }

  function handleCompare() {
    setComparingId(comparingId !== null ? null : (curStep.avatarId === 0 ? 1 : 0));
    toast.info(comparingId !== null ? '已退出对比模式' : '已加载对比版本（另一位分身生成）');
  }

  function handleConfirm() {
    const avatarIndex = curStep.avatarId ?? DEFAULT_AVATAR[current];
    const contribution = createContribution(current, project, avatarIndex, curStep.revisionCount);
    const nextContributions = [...contributions.filter((item) => item.step !== contribution.step), contribution];

    setContributions(nextContributions);
    setSteps((previous) => previous.map((step, index) => {
      if (index === current) {
        return { ...step, confirmed: true, status: 'done' };
      }
      if (index === current + 1 && !step.confirmed) {
        return { ...step, status: 'active', mode: 'choose' };
      }
      return step;
    }));
    toast.success(`${STEP_META[current].label}成果已确认，已写入贡献链路`);
    setFeedback('');
    setComparingId(null);
    setCurrent(Math.min(current + 1, 3));
  }

  function handleGenerateDemo() {
    setGeneratingDemo(true);
    toast.loading('正在调用生成模型，约需 30 秒…');
    setTimeout(() => {
      setGeneratingDemo(false);
      setDemoReady(true);
      onDemoGenerated(contributions);
      toast.dismiss();
      toast.success('Demo 已生成！可前往「我的作品」收听');
    }, 2200);
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: C.bg0 }}>
      <div style={{ width: 204, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.05)', overflowY: 'auto', padding: '24px 12px', display: 'flex', flexDirection: 'column' }}>
        <GlassCard pad={14} style={{ marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #6A0DAD44, #6366F144)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>🌊</div>
          <p style={{ ...T.subheading, color: C.t0 }}>{project.title}</p>
          <p style={{ ...T.caption, color: C.t2, marginTop: 2 }}>{project.genre} · {project.language} · {project.mood}</p>
          <p style={{ ...T.label, color: C.t3, marginTop: 8, lineHeight: 1.6 }}>{project.idea}</p>
        </GlassCard>

        <p style={{ ...T.label, color: C.t3, padding: '0 6px', marginBottom: 8 }}>专家接力链</p>
        {STEP_META.map((meta, index) => {
          const step = steps[index];
          const isActive = index === current && !step.confirmed;
          const isDone = step.confirmed;
          return (
            <div key={meta.label} style={{ display: 'flex', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <button onClick={() => isDone && setCurrent(index)} style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, cursor: isDone ? 'pointer' : 'default', background: isDone ? C.successDim : isActive ? C.accentDim : 'rgba(255,255,255,0.04)', border: `2px solid ${isDone ? C.success : isActive ? C.accent : 'rgba(255,255,255,0.1)'}`, boxShadow: isActive ? '0 0 14px rgba(99,102,241,0.5)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isDone ? <Check size={12} color={C.success} /> : <span style={{ fontSize: 10, fontWeight: 700, color: isActive ? C.accentLight : C.t3 }}>{index + 1}</span>}
                </button>
                {index < 3 && <div style={{ width: 2, flex: 1, minHeight: 36, margin: '3px 0', background: isDone ? `linear-gradient(${C.success}, rgba(16,185,129,0.1))` : 'rgba(255,255,255,0.06)' }} />}
              </div>
              <div style={{ paddingBottom: index < 3 ? 16 : 0, paddingTop: 2, flex: 1, minWidth: 0 }}>
                <p style={{ ...T.caption, color: isDone ? '#34D399' : isActive ? C.t0 : C.t3, fontWeight: isActive ? 500 : 400 }}>{meta.label}</p>
                {isActive && <p style={{ ...T.label, color: C.t2, marginTop: 3, lineHeight: 1.5 }}>{meta.desc}</p>}
                {isDone && <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}><Check size={9} color={C.success} /><span style={{ ...T.label, color: C.success, fontSize: 9 }}>已确认 · {meta.weight}%权重</span></div>}
              </div>
            </div>
          );
        })}

        <div style={{ marginTop: 20, padding: 12, borderRadius: 12, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <p style={{ ...T.label, color: C.accentLight, marginBottom: 8 }}>贡献链路预写入</p>
          {STEP_META.map((meta, index) => {
            const contribution = contributions.find((item) => item.step === meta.label);
            return (
              <div key={meta.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ ...T.label, color: contribution ? '#34D399' : C.t3 }}>{meta.label}</span>
                <span style={{ ...T.label, color: contribution ? C.t2 : C.t3 }}>{contribution?.avatar ?? '—'}</span>
                <span style={{ ...T.label, color: contribution ? C.accentLight : C.t3, fontWeight: 600 }}>{meta.weight}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 8, background: C.accentDim, border: '1px solid rgba(99,102,241,0.3)' }}>
            <Sparkles size={13} color={C.accentLight} />
            <span style={{ ...T.caption, color: C.accentLight, fontWeight: 600 }}>当前环节：{STEP_META[current].label}</span>
          </div>
          <ChevronRight size={13} color={C.t3} />
          <span style={{ ...T.caption, color: C.t2 }}>{STEP_META[current].desc}</span>
        </div>

        {allConfirmed && !demoReady && (
          <GlassCard pad={24} style={{ marginBottom: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ ...T.heading, color: C.t0, marginBottom: 8 }}>四步全部完成</p>
              <p style={{ ...T.caption, color: C.t1, marginBottom: 20 }}>所有创作人分身已完成交付，贡献链路已记录。现在可以进入最终合成。</p>
              <button onClick={handleGenerateDemo} disabled={generatingDemo} style={{ ...S.btnPrimary, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 28px', borderRadius: 12, fontSize: 14 }}>
                <Sparkles size={16} />{generatingDemo ? '生成中，请稍候…' : '生成最终 Demo'}
              </button>
            </div>
          </GlassCard>
        )}

        {demoReady && (
          <GlassCard glow="success" pad={20} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ ...T.subheading, color: '#34D399', marginBottom: 4 }}>✓ Demo 已生成</p>
                <p style={{ ...T.caption, color: C.t1 }}>{project.title} · {project.genre} · Demo v1 · 3:38</p>
              </div>
              <button onClick={() => navigate('myWorks')} style={{ ...S.btnSuccess, display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 10 }}>
                <Music size={13} />前往作品页收听
              </button>
            </div>
            <div style={{ marginTop: 12 }}><Waveform bars={48} progress={0} height={32} seed={5} activeColor={C.success} inactiveColor="rgba(255,255,255,0.08)" /></div>
          </GlassCard>
        )}

        {showChoose && !curStep.confirmed && !allConfirmed && (
          <GlassCard pad={20} style={{ marginBottom: 16 }}>
            <p style={{ ...T.subheading, color: C.t0, marginBottom: 12 }}>选择{STEP_META[current].label}方式</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button onClick={() => summonAvatar(DEFAULT_AVATAR[current])} style={{ padding: 16, borderRadius: 12, background: C.accentDim, border: '1px solid rgba(99,102,241,0.3)', cursor: 'pointer', textAlign: 'left' }}>
                <Sparkles size={18} color={C.accentLight} style={{ marginBottom: 8 }} />
                <p style={{ ...T.caption, color: C.t0, fontWeight: 500 }}>召唤推荐分身</p>
                <p style={{ ...T.label, color: C.t2, marginTop: 4 }}>系统将推荐最适合的创作人分身</p>
              </button>
              <button style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ fontSize: 18, display: 'block', marginBottom: 8 }}>✏️</span>
                <p style={{ ...T.caption, color: C.t1, fontWeight: 500 }}>自己来写</p>
                <p style={{ ...T.label, color: C.t2, marginTop: 4 }}>直接在编辑器中输入内容</p>
              </button>
            </div>
          </GlassCard>
        )}

        {showSummon && <GlassCard pad={32} style={{ marginBottom: 16, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: '50%', background: C.accentDim, border: `2px solid ${C.accent}`, boxShadow: '0 0 24px rgba(99,102,241,0.4)', marginBottom: 16, fontSize: 24 }}>{curAvatar.emoji}</div>
          <p style={{ ...T.subheading, color: C.t0, marginBottom: 4 }}>{curAvatar.name} 正在工作</p>
          <p style={{ ...T.caption, color: C.t2 }}>分析项目信息中，生成结构化交付…</p>
        </GlassCard>}

        {showResult && !curStep.confirmed && !allConfirmed && (
          <>
            <GlassCard style={{ overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ ...T.subheading, color: C.t0 }}>生成的{STEP_META[current].label}内容</p>
                <div style={{ display: 'flex', gap: 8 }}><Tag variant="success">{curAvatar.name} · Lv{curAvatar.lv}</Tag><Tag variant="dim">刚刚生成</Tag></div>
              </div>
              {comparingId !== null && <div style={{ padding: '8px 16px', background: 'rgba(6,182,212,0.06)', borderBottom: '1px solid rgba(6,182,212,0.15)' }}><p style={{ ...T.caption, color: C.cyan }}>对比模式：左侧为 {curAvatar.name}，右侧为 {AVATARS[comparingId].name}</p></div>}
              <div style={{ padding: 16 }}><StepResult stepIndex={current} project={project} revisionCount={curStep.revisionCount} /></div>
            </GlassCard>

            <GlassCard pad={16} style={{ marginBottom: 16 }}>
              <textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="修改意见（可选）：例如，副歌情绪再强一些，意象更具体…" rows={2} style={{ width: '100%', resize: 'none', background: 'transparent', border: 'none', outline: 'none', color: C.t0, ...T.body, lineHeight: 1.7 }} />
            </GlassCard>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={handleRevise} disabled={generating} style={{ ...S.btnGhost, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10 }}><RefreshCw size={13} />{generating ? '重新生成中…' : '继续修改'}</button>
              <button onClick={handleCompare} style={{ ...S.btnGhost, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10 }}><Star size={13} />{comparingId !== null ? '退出对比' : '换分身对比'}</button>
              <div style={{ flex: 1 }} />
              <button onClick={handleConfirm} style={{ ...S.btnPrimary, display: 'flex', alignItems: 'center', gap: 8, padding: '9px 24px', borderRadius: 10 }}>
                确认{STEP_META[current].label}成果，{current < 3 ? '进入下一步' : '准备生成 Demo'}<ArrowRight size={14} />
              </button>
            </div>
          </>
        )}
      </div>

      <div style={{ width: 252, flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.05)', overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <GlassCard style={{ overflow: 'hidden' }}>
          <div style={{ height: 100, background: `linear-gradient(135deg, ${curAvatar.color}CC, ${curAvatar.color}44)`, position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '0 14px 12px' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(6,7,15,0.6))' }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 10 }}>
              <div style={{ width: 46, height: 46, borderRadius: 10, background: `${curAvatar.color}66`, border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{curAvatar.emoji}</div>
              <div><div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}><span style={{ ...T.subheading, color: C.t0 }}>{curAvatar.name}</span><span style={{ padding: '1px 5px', borderRadius: 4, background: 'rgba(99,102,241,0.4)', color: '#C8BBFF', fontSize: 9, fontWeight: 700 }}>Lv{curAvatar.lv}</span></div><Tag variant="accent">{curAvatar.dir}方向</Tag></div>
            </div>
          </div>
          <div style={{ padding: '12px 14px' }}>
            <p style={{ ...T.caption, color: C.t2, fontStyle: 'italic', lineHeight: 1.7, marginBottom: 10 }}>{curAvatar.motto}</p>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>{curAvatar.tags.map((tag) => <Tag key={tag} variant="dim">{tag}</Tag>)}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {[{ label: '被召唤', value: `${curAvatar.calls}次` }, { label: '采纳率', value: `${curAvatar.adopt}%` }].map((item) => <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}><p style={{ color: C.t0, fontSize: 14, fontWeight: 700, fontFamily: "'Inter', monospace" }}>{item.value}</p><p style={{ ...T.label, color: C.t3 }}>{item.label}</p></div>)}
            </div>
          </div>
        </GlassCard>

        <div style={{ padding: 14, borderRadius: 12, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}><Zap size={12} color={C.accentLight} /><p style={{ ...T.caption, color: C.accentLight, fontWeight: 500 }}>本步贡献将记录为</p></div>
          {[['参与环节', STEP_META[current].label], ['分身', `${curAvatar.name} · Lv${curAvatar.lv}`], ['模拟权重', `${STEP_META[current].weight}%`], ['协议版本', 'v1.0']].map(([label, value]) => <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}><span style={{ ...T.label, color: C.t3 }}>{label}</span><span style={{ ...T.caption, color: C.t1, fontWeight: 500 }}>{value}</span></div>)}
        </div>

        {current < 3 && <GlassCard pad={12}>
          <p style={{ ...T.label, color: C.t3, marginBottom: 6 }}>确认后，{STEP_META[current + 1].label}将读取</p>
          {['确认后的完整内容', `情绪标签：${project.mood}`, `风格标签：${project.genre}`, '项目配置信息'].map((item) => <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}><div style={{ width: 3, height: 3, borderRadius: '50%', background: C.accent, flexShrink: 0 }} /><span style={{ ...T.label, color: C.t2 }}>{item}</span></div>)}
        </GlassCard>}

        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => navigate('avatarNetwork')} style={{ ...S.btnGhost, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 0', borderRadius: 10, fontSize: 11 }}><ArrowLeft size={12} />换分身</button>
          <button onClick={() => navigate('home')} style={{ ...S.btnGhost, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 0', borderRadius: 10, fontSize: 11 }}>返回首页</button>
        </div>
      </div>
    </div>
  );
}
