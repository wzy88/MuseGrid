import { type Dispatch, type SetStateAction, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronRight, Music, RefreshCw, Search, Sparkles, Star, X, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Tag } from '../common/Tag';
import { GlassCard } from '../common/GlassCard';
import { Waveform } from '../common/Waveform';
import { C, S, T } from '../../design/tokens';
import type { Page } from '../layout/Sidebar';
import {
  AVATARS,
  STEP_META,
  avatarDirectionForStepIndex,
  buildCombinationStyleSignature,
  createContribution,
  createStepCandidate,
  finalPrompt,
  lyricText,
  outputSummary,
  type ContributionSnapshot,
  type GenerationMusicOutput,
  type GenerationStepOutput,
  type StyleSignature,
  type AvatarProfile,
  mergeAvatarProfiles,
  normalizeAvatar,
  type ProjectBrief,
  type StepCandidate,
  type StepState,
} from '../../state/mockProject';
import { generateMusic, generateStep, hasGenerationApi } from '../../data/generationClient';

const DEFAULT_AVATAR = [0, 1, 2, 3];
const projectIdeaSummaryStyle = {
  ...T.label,
  color: C.t3,
  lineHeight: 1.6,
  marginTop: 8,
  maxHeight: 220,
  overflowY: 'auto' as const,
  overscrollBehavior: 'contain' as const,
  paddingRight: 4,
  scrollbarGutter: 'stable' as const,
  whiteSpace: 'pre-wrap' as const,
  wordBreak: 'break-word' as const,
};
const stepResultScrollAreaStyle = {
  maxHeight: '58vh',
  overflowY: 'auto' as const,
  overscrollBehavior: 'contain' as const,
  padding: 16,
  scrollbarGutter: 'stable' as const,
};

type ProductionPageProps = {
  navigate: (p: Page) => void;
  navigateToAvatarNetworkForStep?: () => void;
  project: ProjectBrief;
  steps: StepState[];
  setSteps: Dispatch<SetStateAction<StepState[]>>;
  current: number;
  setCurrent: Dispatch<SetStateAction<number>>;
  contributions: ContributionSnapshot[];
  setContributions: Dispatch<SetStateAction<ContributionSnapshot[]>>;
  onDemoGenerated: (contributions: ContributionSnapshot[], musicOutput: GenerationMusicOutput, stepOutputs: (GenerationStepOutput | null | undefined)[]) => void;
  avatars?: AvatarProfile[];
  summonedAvatarId?: string | number | null;
  credits?: number;
  demoCreditCost?: number;
  onConsumeCredits?: (amount: number) => void;
  onOpenBilling?: () => void;
};

function StepResult({ stepIndex, project, revisionCount, output }: { stepIndex: number; project: ProjectBrief; revisionCount: number; output?: GenerationStepOutput | null }) {
  if (output) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ padding: '12px 16px', borderRadius: 10, background: output.source.startsWith('minimax') ? 'rgba(16,185,129,0.08)' : 'rgba(99,102,241,0.08)', border: `1px solid ${output.source.startsWith('minimax') ? 'rgba(16,185,129,0.22)' : 'rgba(99,102,241,0.2)'}` }}>
          <p style={{ ...T.label, color: output.source.startsWith('minimax') ? '#34D399' : C.accentLight, marginBottom: 6 }}>
            {output.source.startsWith('minimax') ? 'MiniMax 真实生成' : output.source.includes('worker') ? 'Worker 生成链路' : '本地体验生成'}
          </p>
          <p style={{ ...T.caption, color: C.t1, lineHeight: 1.8 }}>{output.summary}</p>
        </div>

        {output.blocks.map((block) => {
          const isLong = block.value.includes('\n') || block.value.length > 80;
          return isLong
            ? <LyricBlock key={block.label} label={block.label} text={block.value} highlight={/副歌|Prompt|Worker/.test(block.label)} />
            : <InfoRow key={block.label} label={block.label} value={block.value} />;
        })}

        <StyleSignaturePanel signature={output.styleSignature} />

        {stepIndex === 0 && output.lyrics.trim() && (
          <LyricBlock label="完整歌词" text={output.lyrics.trim()} highlight scrollable />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {typeof output.confidence === 'number' && <Tag variant="accent">匹配度 {Math.round(output.confidence * 100)}%</Tag>}
          {output.prompt && <Tag variant="dim">已生成下游 Prompt</Tag>}
          {revisionCount > 0 && <Tag variant="warning">已根据修改意见生成第 {revisionCount + 1} 版</Tag>}
        </div>
      </div>
    );
  }

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

function LyricBlock({ label, text, highlight = false, scrollable = false }: { label: string; text: string; highlight?: boolean; scrollable?: boolean }) {
  const preStyle = {
    ...T.caption,
    color: highlight ? C.t0 : C.t1,
    lineHeight: 2.1,
    whiteSpace: 'pre-wrap' as const,
    fontFamily: "'Noto Sans SC', sans-serif",
    margin: 0,
  };

  if (scrollable) {
    return (
      <div
        data-testid={`lyric-block-${label}`}
        style={{
          padding: '12px 14px',
          borderRadius: 10,
          background: highlight ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.035)',
          border: `1px solid ${highlight ? 'rgba(129,140,248,0.24)' : 'rgba(255,255,255,0.08)'}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
          <p style={{ ...T.label, color: C.t3 }}>{label}</p>
          <span style={{ ...T.label, color: C.t3 }}>在本区滚动查看全文</span>
        </div>
        <pre style={preStyle}>{text}</pre>
      </div>
    );
  }

  return (
    <div>
      <p style={{ ...T.label, color: C.t3, marginBottom: 6 }}>{label}</p>
      <pre style={preStyle}>{text}</pre>
    </div>
  );
}

function manualDraftText(output?: GenerationStepOutput | null) {
  return output?.blocks.find((block) => block.label === '手写内容')?.value ?? '';
}

function manualPlaceholder(stepIndex: number) {
  if (stepIndex === 0) return '写下完整歌词，可以包含主歌、副歌、Bridge 等段落。';
  if (stepIndex === 1) return '写下旋律结构、BPM、调性、副歌动机和给编曲的输入。';
  if (stepIndex === 2) return '写下乐器配置、鼓组、段落推进、音色和给制作的输入。';
  return '写下最终制作 Prompt、人声质感、混音方向和生成 Demo 的关键要求。';
}

function createManualStepOutput(stepIndex: number, project: ProjectBrief, text: string): GenerationStepOutput {
  const label = STEP_META[stepIndex].label;
  const clean = text.trim();
  return {
    stepLabel: label,
    source: 'manual',
    summary: clean ? `用户手写${label}内容：${clean.slice(0, 56)}` : `用户正在手写${label}内容`,
    blocks: [{ label: '手写内容', value: text }],
    lyrics: stepIndex === 0 ? text : '',
    prompt: stepIndex === 3 ? text : finalPrompt(project),
    confidence: clean ? 1 : 0.1,
  };
}

function createManualContribution(stepIndex: number, project: ProjectBrief, output: GenerationStepOutput): ContributionSnapshot {
  const meta = STEP_META[stepIndex];
  return {
    step: meta.label,
    avatar: '用户手写',
    lv: 0,
    w: meta.weight,
    output: output.summary || outputSummary(stepIndex, project),
    edit: '用户手写确认',
    at: new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    adopt: 100,
    styleSignature: output.styleSignature,
  };
}

function ManualStepEditor({ stepIndex, value, onChange }: { stepIndex: number; value: string; onChange: (value: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ ...T.label, color: C.t3 }}>手写内容</p>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={manualPlaceholder(stepIndex)}
        rows={stepIndex === 0 ? 14 : 9}
        style={{
          width: '100%',
          resize: 'vertical',
          minHeight: stepIndex === 0 ? 320 : 220,
          background: 'rgba(255,255,255,0.035)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10,
          outline: 'none',
          color: C.t0,
          padding: 14,
          ...T.caption,
          lineHeight: 1.9,
          fontFamily: "'Noto Sans SC', sans-serif",
        }}
      />
    </div>
  );
}

function StyleSignaturePanel({ signature, title = '风格指纹', compact = false }: { signature?: StyleSignature | null; title?: string; compact?: boolean }) {
  if (!signature) return null;
  const dimensions = compact ? signature.dimensions.slice(0, 3) : signature.dimensions;
  return (
    <div style={{ padding: compact ? 10 : 12, borderRadius: 10, background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.18)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
        <p style={{ ...T.label, color: C.cyan }}>{title}</p>
        <span style={{ ...T.label, color: C.t2, textAlign: 'right' }}>{signature.headline}</span>
      </div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: compact ? 8 : 10 }}>
        {signature.tags.slice(0, compact ? 3 : 5).map((tag) => <Tag key={tag} variant="dim">{tag}</Tag>)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {dimensions.map((item) => (
          <div key={item.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
              <span style={{ ...T.label, color: C.t3 }}>{item.label}</span>
              <span style={{ ...T.label, color: C.t1, textAlign: 'right' }}>{item.text}</span>
            </div>
            <div style={{ height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{ width: `${item.value}%`, height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${C.cyan}, ${C.accentLight})` }} />
            </div>
          </div>
        ))}
      </div>
      {!compact && <p style={{ ...T.label, color: C.t2, lineHeight: 1.6, marginTop: 10 }}>{signature.downstreamImpact}</p>}
    </div>
  );
}

function findStepCandidate(step: StepState) {
  return step.candidates?.find((candidate) => candidate.id === step.selectedCandidateId) ?? step.candidates?.[0] ?? null;
}

function sameAvatarCandidate(step: StepState, avatarIndex: number) {
  return step.candidates?.find((candidate) => candidate.avatarIndex === avatarIndex) ?? null;
}

function candidateValueTags(candidate: StepCandidate, stepIndex: number) {
  const base = [
    `匹配度 ${Math.round(candidate.output.confidence * 100)}%`,
    `${candidate.avatarTags.slice(0, 2).join(' / ') || '通用风格'}`,
  ];
  if (stepIndex === 0) base.push(candidate.output.lyrics ? '完整歌词' : '结构草案');
  if (candidate.output.prompt) base.push('下游 Prompt');
  return base;
}

function comparisonAvatarOptions(step: StepState, avatarPool: AvatarProfile[], stepLabel: string, selectedAvatarIndex?: number | null) {
  const mapped = avatarPool.map((avatar, index) => ({ avatar, index, existing: sameAvatarCandidate(step, index) }));
  return mapped.filter((item) => item.index !== selectedAvatarIndex && item.avatar.dir === stepLabel);
}

function stepAvatarOptions(avatarPool: AvatarProfile[], stepLabel: string, preferredAvatarId?: string | number | null) {
  return avatarPool
    .map((avatar, index) => ({ avatar, index }))
    .filter((item) => item.avatar.dir === stepLabel)
    .sort((left, right) => {
      const leftPreferred = preferredAvatarId != null && left.avatar.id === preferredAvatarId;
      const rightPreferred = preferredAvatarId != null && right.avatar.id === preferredAvatarId;
      if (leftPreferred !== rightPreferred) return leftPreferred ? -1 : 1;
      return right.avatar.adopt - left.avatar.adopt;
    });
}

type AvatarPickerMode = 'summon' | 'compare';
type AvatarSortMode = 'recommended' | 'adopt' | 'calls' | 'level';

export function ProductionPage({
  navigate,
  navigateToAvatarNetworkForStep,
  project,
  steps,
  setSteps,
  current,
  setCurrent,
  contributions,
  setContributions,
  onDemoGenerated,
  avatars = AVATARS,
  summonedAvatarId = null,
  credits = 0,
  demoCreditCost = 0,
  onConsumeCredits,
  onOpenBilling,
}: ProductionPageProps) {
  const [feedback, setFeedback] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatingDemo, setGeneratingDemo] = useState(false);
  const [demoReady, setDemoReady] = useState(false);
  const [demoOutput, setDemoOutput] = useState<GenerationMusicOutput | null>(null);
  const [avatarPickerMode, setAvatarPickerMode] = useState<AvatarPickerMode | null>(null);
  const [avatarSearch, setAvatarSearch] = useState('');
  const [avatarSort, setAvatarSort] = useState<AvatarSortMode>('recommended');
  const [activeAvatarTag, setActiveAvatarTag] = useState('全部标签');
  const [selectedPickerAvatarId, setSelectedPickerAvatarId] = useState<string | number | null>(null);
  const [creditWarning, setCreditWarning] = useState(false);
  const avatarPool = mergeAvatarProfiles(avatars.length > 0 ? avatars : AVATARS);
  const currentAvatarDirection = avatarDirectionForStepIndex(current);
  const summonedAvatarIndex = summonedAvatarId !== null ? avatarPool.findIndex((avatar) => avatar.id === summonedAvatarId) : -1;
  const summonedAvatar = summonedAvatarIndex >= 0 ? avatarPool[summonedAvatarIndex] : null;
  const recommendedAvatar = summonedAvatar ?? avatarPool.find((avatar) => avatar.dir === currentAvatarDirection) ?? avatarPool[DEFAULT_AVATAR[current]] ?? normalizeAvatar(AVATARS[DEFAULT_AVATAR[current]]);
  const recommendedAvatarIndex = Math.max(0, avatarPool.findIndex((avatar) => avatar.id === recommendedAvatar.id));
  const selectableAvatars = stepAvatarOptions(avatarPool, currentAvatarDirection, recommendedAvatar.id);

  const curStep = steps[current];
  const selectedCandidate = findStepCandidate(curStep);
  const candidateList = curStep.candidates ?? [];
  const curAvatar = selectedCandidate
    ? (avatarPool[selectedCandidate.avatarIndex] ?? recommendedAvatar)
    : curStep.avatarId !== null ? (avatarPool[curStep.avatarId] ?? recommendedAvatar) : recommendedAvatar;
  const allConfirmed = steps.every((step) => step.confirmed);
  const showChoose = curStep.mode === 'choose';
  const showSummon = curStep.mode === 'summoning';
  const showResult = curStep.mode === 'result';
  const isManualStep = curStep.output?.source === 'manual';
  const hasStepParticipant = showSummon || showResult || curStep.confirmed;
  const participantLabel = isManualStep ? '用户手写' : `${curAvatar.name} · Lv${curAvatar.lv}`;
  const comparableAvatars = comparisonAvatarOptions(curStep, avatarPool, currentAvatarDirection, selectedCandidate?.avatarIndex ?? curStep.avatarId);
  const pickerBaseOptions = avatarPickerMode === 'compare'
    ? comparableAvatars
    : selectableAvatars.map(({ avatar, index }) => ({ avatar, index, existing: sameAvatarCandidate(curStep, index) }));
  const pickerTags = ['全部标签', ...Array.from(new Set(pickerBaseOptions.flatMap(({ avatar }) => avatar.tags))).slice(0, 10)];
  const filteredPickerOptions = pickerBaseOptions
    .filter(({ avatar }) => {
      const keyword = avatarSearch.trim().toLowerCase();
      const matchesKeyword = !keyword
        || avatar.name.toLowerCase().includes(keyword)
        || avatar.tags.some((tag) => tag.toLowerCase().includes(keyword))
        || avatar.motto.toLowerCase().includes(keyword)
        || avatar.intro?.toLowerCase().includes(keyword);
      const matchesTag = activeAvatarTag === '全部标签' || avatar.tags.includes(activeAvatarTag);
      return matchesKeyword && matchesTag;
    })
    .sort((left, right) => {
      if (avatarSort === 'adopt') return right.avatar.adopt - left.avatar.adopt;
      if (avatarSort === 'calls') return right.avatar.calls - left.avatar.calls;
      if (avatarSort === 'level') return right.avatar.lv - left.avatar.lv;
      const leftPreferred = left.avatar.id === recommendedAvatar.id;
      const rightPreferred = right.avatar.id === recommendedAvatar.id;
      if (leftPreferred !== rightPreferred) return leftPreferred ? -1 : 1;
      return right.avatar.adopt - left.avatar.adopt;
    });
  const combinationSignature = buildCombinationStyleSignature(contributions);

  function updateStep(index: number, patch: Partial<StepState>) {
    setSteps((previous) => previous.map((step, stepIndex) => stepIndex === index ? { ...step, ...patch } : step));
  }

  function openAvatarPicker(mode: AvatarPickerMode) {
    setAvatarPickerMode(mode);
    setAvatarSearch('');
    setAvatarSort('recommended');
    setActiveAvatarTag('全部标签');
    setSelectedPickerAvatarId(null);
  }

  function closeAvatarPicker() {
    setAvatarPickerMode(null);
    setSelectedPickerAvatarId(null);
  }

  function startManualWriting() {
    updateStep(current, {
      mode: 'result',
      avatarId: null,
      output: createManualStepOutput(current, project, manualDraftText(curStep.output)),
      selectedCandidateId: null,
      candidates: [],
    });
    closeAvatarPicker();
    setFeedback('');
  }

  function updateManualDraft(text: string) {
    updateStep(current, { output: createManualStepOutput(current, project, text) });
  }

  async function summonAvatar(avatarIndex: number) {
    updateStep(current, { mode: 'summoning', avatarId: avatarIndex });
    closeAvatarPicker();
    try {
      const avatar = avatarPool[avatarIndex] ?? recommendedAvatar;
      const output = await generateStep({
        stepIndex: current,
        project,
        avatar,
        previousContributions: contributions,
        revisionCount: curStep.revisionCount,
      });
      const candidate = createStepCandidate(avatar, avatarIndex, output, curStep.revisionCount);
      const nextCandidates = [
        ...(curStep.candidates ?? []).filter((item) => item.avatarIndex !== avatarIndex),
        candidate,
      ];
      updateStep(current, {
        mode: 'result',
        avatarId: avatarIndex,
        output,
        selectedCandidateId: candidate.id,
        candidates: nextCandidates,
      });
      toast.success(`${avatar.name} 已接入，交付内容已生成`);
    } catch (error) {
      updateStep(current, { mode: 'choose' });
      toast.error(error instanceof Error ? error.message : '生成失败，请稍后再试');
    }
  }

  async function handleRevise() {
    if (!feedback.trim()) {
      toast.info('请先输入修改意见');
      return;
    }
    setGenerating(true);
    closeAvatarPicker();
    toast.loading('分身正在根据你的意见重新生成…');
    try {
      const avatarIndex = curStep.avatarId ?? DEFAULT_AVATAR[current];
      const avatar = avatarPool[avatarIndex] ?? recommendedAvatar;
      const output = await generateStep({
        stepIndex: current,
        project,
        avatar,
        previousContributions: contributions,
        feedback,
        revisionCount: curStep.revisionCount + 1,
      });
      setGenerating(false);
      toast.dismiss();
      const revisionCount = curStep.revisionCount + 1;
      const candidate = createStepCandidate(avatar, avatarIndex, output, revisionCount);
      const nextCandidates = [
        ...(curStep.candidates ?? []).filter((item) => item.id !== curStep.selectedCandidateId),
        candidate,
      ];
      updateStep(current, {
        revisionCount,
        avatarId: avatarIndex,
        output,
        selectedCandidateId: candidate.id,
        candidates: nextCandidates,
      });
      toast.success('已重新生成，请查看新版本');
      setFeedback('');
    } catch (error) {
      setGenerating(false);
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : '重新生成失败');
    }
  }

  function openComparePicker() {
    if (!curStep.output) {
      toast.info('当前没有可对比的分身版本');
      return;
    }
    openAvatarPicker('compare');
  }

  async function generateComparisonWithAvatar(compareIndex: number) {
    const existing = sameAvatarCandidate(curStep, compareIndex);
    if (existing) {
      updateStep(current, { selectedCandidateId: existing.id, avatarId: existing.avatarIndex, output: existing.output });
      closeAvatarPicker();
      toast.info('已切换到已有分身候选');
      return;
    }

    setGenerating(true);
    toast.loading('正在生成另一位分身的对比版本…');
    try {
      const compareAvatar = avatarPool[compareIndex] ?? recommendedAvatar;
      const output = await generateStep({
        stepIndex: current,
        project,
        avatar: compareAvatar,
        previousContributions: contributions,
        revisionCount: curStep.revisionCount,
      });
      const candidate = createStepCandidate(compareAvatar, compareIndex, output, curStep.revisionCount);
      updateStep(current, {
        selectedCandidateId: candidate.id,
        avatarId: compareIndex,
        output,
        candidates: [...(curStep.candidates ?? []), candidate],
      });
      closeAvatarPicker();
      toast.dismiss();
      toast.success('已生成分身候选对比');
    } catch (error) {
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : '对比版本生成失败');
    } finally {
      setGenerating(false);
    }
  }

  function adoptCandidate(candidate: StepCandidate) {
    updateStep(current, {
      avatarId: candidate.avatarIndex,
      output: candidate.output,
      selectedCandidateId: candidate.id,
      revisionCount: candidate.revisionCount,
    });
    toast.success(`已采纳 ${candidate.avatarName} 的版本`);
  }

  function handleConfirm() {
    const adoptedCandidate = findStepCandidate(curStep);
    const avatarIndex = adoptedCandidate?.avatarIndex ?? curStep.avatarId ?? DEFAULT_AVATAR[current];
    const output = adoptedCandidate?.output ?? curStep.output;
    const revisionCount = adoptedCandidate?.revisionCount ?? curStep.revisionCount;
    const manualText = manualDraftText(output);
    if (output?.source === 'manual' && !manualText.trim()) {
      toast.info(`请先填写${STEP_META[current].label}内容`);
      return;
    }
    const contribution = output?.source === 'manual'
      ? createManualContribution(current, project, output)
      : createContribution(current, project, avatarIndex, revisionCount, output, avatarPool[avatarIndex] ?? recommendedAvatar);
    const nextContributions = [...contributions.filter((item) => item.step !== contribution.step), contribution];

    setContributions(nextContributions);
    setSteps((previous) => previous.map((step, index) => {
      if (index === current) {
        return { ...step, confirmed: true, status: 'done', avatarId: output?.source === 'manual' ? null : avatarIndex, output, revisionCount };
      }
      if (index === current + 1 && !step.confirmed) {
        return { ...step, status: 'active', mode: 'choose' };
      }
      return step;
    }));
    toast.success(`${STEP_META[current].label}成果已确认，已写入贡献链路`);
    setFeedback('');
    closeAvatarPicker();
    setCurrent(Math.min(current + 1, 3));
  }

  async function handleGenerateDemo() {
    if (credits < demoCreditCost) {
      setCreditWarning(true);
      toast.warning('额度不足，请先开通创作者版或充值额度');
      return;
    }
    setGeneratingDemo(true);
    setCreditWarning(false);
    toast.loading(hasGenerationApi() ? '正在调用 Worker 生成最终 Demo…' : '正在生成本地体验 Demo…');
    try {
      const stepOutputs = steps.map((step) => findStepCandidate(step)?.output ?? step.output);
      const musicOutput = await generateMusic({ project, contributions, stepOutputs });
      setGeneratingDemo(false);
      setDemoOutput(musicOutput);
      setDemoReady(true);
      onConsumeCredits?.(demoCreditCost);
      onDemoGenerated(contributions, musicOutput, stepOutputs);
      toast.dismiss();
      toast.success(musicOutput.audioUrl ? '真实音频已生成！可前往「我的作品」收听' : 'Demo 已生成！可前往「我的作品」查看');
    } catch (error) {
      setGeneratingDemo(false);
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : '最终 Demo 生成失败');
    }
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: C.bg0 }}>
      <div style={{ width: 204, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.05)', overflowY: 'auto', padding: '24px 12px', display: 'flex', flexDirection: 'column' }}>
        <GlassCard pad={14} style={{ marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #6A0DAD44, #6366F144)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>🌊</div>
          <p style={{ ...T.subheading, color: C.t0 }}>{project.title}</p>
          <p style={{ ...T.caption, color: C.t2, marginTop: 2 }}>{project.genre} · {project.language} · {project.mood}</p>
          <p style={projectIdeaSummaryStyle}>{project.idea}</p>
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

        {contributions.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <StyleSignaturePanel signature={combinationSignature} title="当前组合画像" compact />
          </div>
        )}
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
              <p style={{ ...T.caption, color: C.t1, marginBottom: 12 }}>所有创作人分身已完成交付，贡献链路已记录。现在可以进入最终合成。</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 999, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.18)', marginBottom: 14 }}>
                <Zap size={12} color={C.warning} />
                <span style={{ ...T.label, color: C.warning }}>本次消耗 {demoCreditCost} 额度 · 当前 {credits.toLocaleString('zh-CN')} 额度</span>
              </div>
              {creditWarning && (
                <div style={{ maxWidth: 440, margin: '0 auto 16px', padding: 14, borderRadius: 12, background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.28)', textAlign: 'left' }}>
                  <p style={{ ...T.caption, color: C.error, fontWeight: 700, marginBottom: 6 }}>额度不足</p>
                  <p style={{ ...T.caption, color: C.t1, lineHeight: 1.7, marginBottom: 12 }}>生成最终 Demo 需要 {demoCreditCost} 额度。当前额度不足，请先开通创作者版或选择更高套餐。</p>
                  <button onClick={onOpenBilling} style={{ ...S.btnPrimary, padding: '8px 14px', borderRadius: 10 }}>开通创作者版</button>
                </div>
              )}
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
                <p style={{ ...T.caption, color: C.t1 }}>{project.title} · {project.genre} · Demo v1 · {demoOutput?.duration || '3:38'}</p>
                {demoOutput?.message && <p style={{ ...T.label, color: C.t2, marginTop: 4 }}>{demoOutput.message}</p>}
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
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
              <div>
                <p style={{ ...T.subheading, color: C.t0 }}>选择{STEP_META[current].label}方式</p>
                <p style={{ ...T.label, color: C.t3, marginTop: 4 }}>先决定由数字分身生成，还是自己来写；选择方式后再进入具体操作。</p>
              </div>
              <Tag variant="dim">{currentAvatarDirection} · {selectableAvatars.length} 位可召唤</Tag>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
              <button
                type="button"
                onClick={() => openAvatarPicker('summon')}
                style={{ padding: 18, borderRadius: 12, background: C.accentDim, border: '1px solid rgba(99,102,241,0.34)', cursor: 'pointer', textAlign: 'left', minHeight: 148 }}
              >
                <Sparkles size={18} color={C.accentLight} style={{ marginBottom: 10 }} />
                <p style={{ ...T.caption, color: C.t0, fontWeight: 700 }}>召唤数字分身</p>
                <p style={{ ...T.label, color: C.t2, marginTop: 6, lineHeight: 1.7 }}>打开{currentAvatarDirection}分身选择器，按推荐、评分、调用次数或标签筛选后再生成。</p>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 12 }}>
                  <Tag variant="accent">推荐：{recommendedAvatar.name}</Tag>
                  <Tag variant="dim">{selectableAvatars.length} 位可召唤</Tag>
                  {summonedAvatar && <Tag variant="success">来自分身网络</Tag>}
                </div>
              </button>
              <button
                type="button"
                onClick={startManualWriting}
                style={{ padding: 18, borderRadius: 12, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', textAlign: 'left', minHeight: 148 }}
              >
                <span style={{ fontSize: 20, display: 'block', marginBottom: 10 }}>✏️</span>
                <p style={{ ...T.caption, color: C.t1, fontWeight: 700 }}>自己来写</p>
                <p style={{ ...T.label, color: C.t2, marginTop: 6, lineHeight: 1.7 }}>进入手写输入流程，适合已有明确内容时直接填写，后续仍可用分身修改或对比。</p>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 12 }}>
                  <Tag variant="dim">手动创作</Tag>
                  <Tag variant="dim">可后续对比</Tag>
                </div>
              </button>
            </div>
          </GlassCard>
        )}

        {showSummon && <GlassCard pad={32} style={{ marginBottom: 16, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: '50%', background: C.accentDim, border: `2px solid ${C.accent}`, boxShadow: '0 0 24px rgba(99,102,241,0.4)', marginBottom: 16, fontSize: 24 }}>{curAvatar.emoji}</div>
          <p style={{ ...T.subheading, color: C.t0, marginBottom: 4 }}>{curAvatar.name} 正在工作</p>
              <p style={{ ...T.caption, color: C.t2 }}>{hasGenerationApi() ? 'Worker 正在调用模型网关，生成结构化交付…' : '分析项目信息中，生成结构化交付…'}</p>
        </GlassCard>}

        {showResult && !curStep.confirmed && !allConfirmed && (
          <>
            <GlassCard style={{ overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ ...T.subheading, color: C.t0 }}>{isManualStep ? `手写的${STEP_META[current].label}内容` : `生成的${STEP_META[current].label}内容`}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {isManualStep ? <Tag variant="dim">用户手写</Tag> : <Tag variant="success">{curAvatar.name} · Lv{curAvatar.lv}</Tag>}
                  <Tag variant="dim">{isManualStep ? '手写草稿' : candidateList.length > 1 ? `${candidateList.length} 个候选` : '刚刚生成'}</Tag>
                </div>
              </div>
              {selectedCandidate && (
                <div style={{ padding: '10px 16px', background: 'rgba(99,102,241,0.06)', borderBottom: '1px solid rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ ...T.caption, color: C.accentLight, fontWeight: 600 }}>当前采纳：{selectedCandidate.avatarName}</span>
                  {candidateValueTags(selectedCandidate, current).map((tag) => <Tag key={tag} variant="dim">{tag}</Tag>)}
                </div>
              )}
              <div data-testid="step-result-scroll-area" style={stepResultScrollAreaStyle}>
                {isManualStep
                  ? <ManualStepEditor stepIndex={current} value={manualDraftText(curStep.output)} onChange={updateManualDraft} />
                  : <StepResult stepIndex={current} project={project} revisionCount={selectedCandidate?.revisionCount ?? curStep.revisionCount} output={selectedCandidate?.output ?? curStep.output} />}
              </div>
            </GlassCard>

            {candidateList.length > 1 && (
              <GlassCard pad={16} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <p style={{ ...T.subheading, color: C.t0 }}>分身候选对比</p>
                  <Tag variant="dim">可采纳任一版本</Tag>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {candidateList.map((candidate) => {
                    const selected = curStep.selectedCandidateId === candidate.id;
                    return (
                      <div key={candidate.id} style={{ borderRadius: 12, border: `1px solid ${selected ? 'rgba(99,102,241,0.42)' : 'rgba(255,255,255,0.07)'}`, background: selected ? 'rgba(99,102,241,0.09)' : 'rgba(255,255,255,0.025)', overflow: 'hidden' }}>
                        <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ ...T.caption, color: C.t0, fontWeight: 600 }}>{candidate.avatarName} · Lv{candidate.avatarLevel}</p>
                            <p style={{ ...T.label, color: C.t3, marginTop: 2 }}>{STEP_META[current].label} · 匹配度 {Math.round(candidate.output.confidence * 100)}%</p>
                          </div>
                          {selected ? <Tag variant="success">当前采用</Tag> : <Tag variant="dim">候选</Tag>}
                        </div>
                        <div style={{ padding: 14 }}>
                          <p style={{ ...T.label, color: C.t2, lineHeight: 1.6, marginBottom: 10 }}>{candidate.avatarMotto || '按当前项目上下文生成独立版本。'}</p>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                            {candidateValueTags(candidate, current).map((tag) => <Tag key={tag} variant="dim">{tag}</Tag>)}
                          </div>
                          {candidate.output.styleSignature && (
                            <div style={{ marginBottom: 10 }}>
                              <p style={{ ...T.label, color: C.cyan, marginBottom: 5 }}>对后续影响</p>
                              <p style={{ ...T.label, color: C.t2, lineHeight: 1.6 }}>{candidate.output.styleSignature.downstreamImpact}</p>
                            </div>
                          )}
                          <StepResult stepIndex={current} project={project} revisionCount={candidate.revisionCount} output={candidate.output} />
                          <button onClick={() => adoptCandidate(candidate)} style={{ ...S.btnAccentOutline, width: '100%', marginTop: 12, padding: '8px 14px', borderRadius: 10 }}>
                            {selected ? '已采纳此版本' : '采纳此版本'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            )}

            <GlassCard pad={16} style={{ marginBottom: 16 }}>
              <textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="修改意见（可选）：例如，副歌情绪再强一些，意象更具体…" rows={2} style={{ width: '100%', resize: 'none', background: 'transparent', border: 'none', outline: 'none', color: C.t0, ...T.body, lineHeight: 1.7 }} />
            </GlassCard>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={handleRevise} disabled={generating} style={{ ...S.btnGhost, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10 }}><RefreshCw size={13} />{generating ? '重新生成中…' : '继续修改'}</button>
              <button onClick={openComparePicker} disabled={generating} style={{ ...S.btnGhost, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10 }}><Star size={13} />{generating ? '生成对比中…' : avatarPickerMode === 'compare' ? '收起对比分身' : '选择对比分身'}</button>
              <div style={{ flex: 1 }} />
              <button onClick={handleConfirm} style={{ ...S.btnPrimary, display: 'flex', alignItems: 'center', gap: 8, padding: '9px 24px', borderRadius: 10 }}>
                确认{STEP_META[current].label}成果，{current < 3 ? '进入下一步' : '准备生成 Demo'}<ArrowRight size={14} />
              </button>
            </div>
          </>
        )}
      </div>

      <div style={{ width: 252, flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.05)', overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {!hasStepParticipant ? (
          <GlassCard pad={14} style={{ border: '1px dashed rgba(129,140,248,0.28)', background: 'rgba(99,102,241,0.045)' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: C.accentDim, border: '1px solid rgba(129,140,248,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Sparkles size={17} color={C.accentLight} />
            </div>
            <p style={{ ...T.subheading, color: C.t0, marginBottom: 5 }}>待选择{currentAvatarDirection}分身</p>
            <p style={{ ...T.label, color: C.t2, lineHeight: 1.7, marginBottom: 12 }}>选择方式后再进入制作；未确认前不会写入贡献链路。</p>
            <button onClick={() => openAvatarPicker('summon')} style={{ ...S.btnPrimary, width: '100%', padding: '8px 0', borderRadius: 10, fontSize: 11 }}>
              选择分身
            </button>
          </GlassCard>
        ) : (
          <>
            <GlassCard style={{ overflow: 'hidden' }}>
              <div style={{ height: 100, background: `linear-gradient(135deg, ${curAvatar.color}CC, ${curAvatar.color}44)`, position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '0 14px 12px' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(16,19,29,0.5))' }} />
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
              {[['参与环节', STEP_META[current].label], ['分身', participantLabel], ['模拟权重', `${STEP_META[current].weight}%`], ['协议版本', 'v1.0']].map(([label, value]) => <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}><span style={{ ...T.label, color: C.t3 }}>{label}</span><span style={{ ...T.caption, color: C.t1, fontWeight: 500 }}>{value}</span></div>)}
            </div>
          </>
        )}

        {hasStepParticipant && contributions.length > 0 && (
          <GlassCard pad={12}>
            <p style={{ ...T.label, color: C.cyan, marginBottom: 6 }}>本环节继承</p>
            <p style={{ ...T.caption, color: C.t0, lineHeight: 1.6 }}>{STEP_META[current].label}将继承：{combinationSignature.headline}</p>
            <p style={{ ...T.label, color: C.t2, lineHeight: 1.6, marginTop: 6 }}>{combinationSignature.downstreamImpact}</p>
          </GlassCard>
        )}

        {hasStepParticipant && current < 3 && <GlassCard pad={12}>
          <p style={{ ...T.label, color: C.t3, marginBottom: 6 }}>确认后，{STEP_META[current + 1].label}将读取</p>
          {[
            '确认后的完整内容',
            contributions.length > 0 ? `${STEP_META[current + 1].label}将继承：${combinationSignature.headline}` : `情绪标签：${project.mood}`,
            `风格标签：${project.genre}`,
            contributions.length > 0 ? `组合风格指纹：${combinationSignature.tags.slice(0, 3).join(' / ')}` : '项目配置信息',
          ].map((item) => <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}><div style={{ width: 3, height: 3, borderRadius: '50%', background: C.accent, flexShrink: 0 }} /><span style={{ ...T.label, color: C.t2 }}>{item}</span></div>)}
        </GlassCard>}

        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => openAvatarPicker('summon')} style={{ ...S.btnGhost, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 0', borderRadius: 10, fontSize: 11 }}><ArrowLeft size={12} />{hasStepParticipant ? '换分身' : '选分身'}</button>
          <button onClick={() => navigate('home')} style={{ ...S.btnGhost, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 0', borderRadius: 10, fontSize: 11 }}>返回首页</button>
        </div>
      </div>

      {avatarPickerMode && (
        <div
          role="dialog"
          aria-modal="true"
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(5,8,18,0.72)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={closeAvatarPicker}
        >
          <div
            style={{ width: 'min(1080px, 96vw)', maxHeight: '88vh', borderRadius: 18, background: C.bgRaised, border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 24px 80px rgba(0,0,0,0.45)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <p style={{ ...T.heading, color: C.t0 }}>{avatarPickerMode === 'compare' ? `选择${currentAvatarDirection}分身生成对比` : `选择${currentAvatarDirection}分身`}</p>
                <p style={{ ...T.caption, color: C.t2, marginTop: 5 }}>
                  {avatarPickerMode === 'compare' ? '只展示当前环节同领域分身，生成后会保留原版本并进入候选对比。' : '先筛选分身，再点击召唤；打开选择器不会立即生成。'}
                </p>
              </div>
              <button type="button" onClick={closeAvatarPicker} style={{ ...S.btnGhost, width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }} aria-label="关闭分身选择器">
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 260px', minWidth: 220, height: 38, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Search size={14} color={C.t3} />
                  <input
                    value={avatarSearch}
                    onChange={(event) => setAvatarSearch(event.target.value)}
                    placeholder="搜索分身或风格"
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: C.t0, ...T.caption }}
                  />
                </div>
                {[
                  ['recommended', '排序：推荐'],
                  ['adopt', '评分最高'],
                  ['calls', '最多调用'],
                  ['level', '等级最高'],
                ].map(([value, label]) => {
                  const active = avatarSort === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAvatarSort(value as AvatarSortMode)}
                      style={{ padding: '8px 11px', borderRadius: 9, cursor: 'pointer', border: `1px solid ${active ? 'rgba(129,140,248,0.36)' : 'rgba(255,255,255,0.08)'}`, background: active ? C.accentDim : 'rgba(255,255,255,0.03)', color: active ? C.accentLight : C.t2, ...T.label }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {pickerTags.map((tag) => {
                  const active = activeAvatarTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setActiveAvatarTag(tag)}
                      style={{ padding: '5px 9px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${active ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.07)'}`, background: active ? C.accentDim : 'rgba(255,255,255,0.03)', color: active ? C.accentLight : C.t2, ...T.label }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ overflowY: 'auto', padding: 20 }}>
              {filteredPickerOptions.length === 0 && (
                <div style={{ padding: 24, borderRadius: 12, background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                  <p style={{ ...T.caption, color: C.t1 }}>没有符合筛选条件的{currentAvatarDirection}分身。</p>
                  <p style={{ ...T.label, color: C.t3, marginTop: 6 }}>可以清空搜索词或切回全部标签。</p>
                </div>
              )}

              {filteredPickerOptions.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                  {filteredPickerOptions.map(({ avatar, index, existing }) => {
                    const recommended = avatar.id === recommendedAvatar.id;
                    const fromNetwork = summonedAvatar?.id === avatar.id;
                    const selected = selectedPickerAvatarId === avatar.id;
                    const buttonDisabled = generating || !selected;
                    return (
                      <div
                        key={avatar.id}
                        role="button"
                        tabIndex={0}
                        data-testid={`avatar-picker-card-${avatar.id}`}
                        aria-label={`选择${avatar.name}`}
                        aria-pressed={selected}
                        onClick={() => setSelectedPickerAvatarId(avatar.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setSelectedPickerAvatarId(avatar.id);
                          }
                        }}
                        style={{ borderRadius: 14, background: selected ? 'linear-gradient(180deg, rgba(99,102,241,0.28), rgba(99,102,241,0.14))' : recommended ? 'rgba(99,102,241,0.10)' : 'rgba(255,255,255,0.03)', border: `1px solid ${selected ? 'rgba(165,180,252,0.82)' : recommended ? 'rgba(129,140,248,0.28)' : 'rgba(255,255,255,0.08)'}`, boxShadow: selected ? '0 0 0 2px rgba(129,140,248,0.24), 0 16px 42px rgba(99,102,241,0.24)' : 'none', padding: 14, display: 'flex', flexDirection: 'column', minHeight: 236, cursor: 'pointer', position: 'relative', transform: selected ? 'translateY(-1px)' : 'none' }}
                      >
                        {selected && (
                          <div style={{ position: 'absolute', top: 12, right: 12, width: 24, height: 24, borderRadius: '50%', background: C.success, boxShadow: '0 0 18px rgba(52,211,153,0.34)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Check size={13} color="#04130D" strokeWidth={3} />
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 10 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${avatar.color}55`, border: '1px solid rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{avatar.emoji}</div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ ...T.caption, color: C.t0, fontWeight: 700 }}>{avatar.name} · Lv{avatar.lv}</p>
                            <p style={{ ...T.label, color: C.t3, marginTop: 2 }}>{avatar.dir} · 采纳率 {avatar.adopt}% · 调用 {avatar.calls}次</p>
                          </div>
                        </div>
                        <p style={{ ...T.label, color: C.t2, lineHeight: 1.65, marginBottom: 10 }}>{avatar.motto || avatar.intro || '按当前项目上下文生成独立版本。'}</p>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
                          {selected && <Tag variant="success">已选中</Tag>}
                          {recommended && <Tag variant="accent">{fromNetwork ? '来自分身网络' : '推荐'}</Tag>}
                          {existing && <Tag variant="success">已有候选</Tag>}
                          {avatar.tags.slice(0, 3).map((tag) => <Tag key={tag} variant="dim">{tag}</Tag>)}
                        </div>
                        <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <div style={{ padding: 9, borderRadius: 9, background: 'rgba(255,255,255,0.035)' }}>
                            <p style={{ ...T.label, color: C.t3, marginBottom: 3 }}>方法</p>
                            <p style={{ ...T.label, color: C.t2, lineHeight: 1.5 }}>{avatar.method || avatar.intro || '按项目上下文生成。'}</p>
                          </div>
                          <div style={{ padding: 9, borderRadius: 9, background: 'rgba(255,255,255,0.035)' }}>
                            <p style={{ ...T.label, color: C.t3, marginBottom: 3 }}>避免</p>
                            <p style={{ ...T.label, color: C.t2, lineHeight: 1.5 }}>{avatar.avoid || '避免和当前方向无关的风格漂移。'}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (buttonDisabled) return;
                            avatarPickerMode === 'compare' ? generateComparisonWithAvatar(index) : summonAvatar(index);
                          }}
                          disabled={buttonDisabled}
                          style={{ ...(selected ? S.btnPrimary : S.btnAccentOutline), marginTop: 12, width: '100%', padding: '10px 12px', borderRadius: 10, opacity: buttonDisabled ? 0.38 : 1, cursor: buttonDisabled ? 'not-allowed' : 'pointer', boxShadow: selected ? '0 8px 26px rgba(99,102,241,0.5)' : 'none' }}
                        >
                          {avatarPickerMode === 'compare' ? (existing ? '查看候选' : selected ? `生成${avatar.name}对比` : `先选择${avatar.name}`) : selected ? `确认召唤${avatar.name}` : `召唤${avatar.name}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
