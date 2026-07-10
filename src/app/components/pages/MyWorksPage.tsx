import { useEffect, useState } from 'react';
import {
  Play,
  MoreHorizontal,
  Share2,
  Download,
  ChevronRight,
  Eye,
  Heart,
  FileText,
  Link2,
  Sparkles,
  Check,
  ArrowLeft,
  Shield,
  Music3,
  Clock3,
  Disc3,
  AudioWaveform,
  Wallet,
  Copy,
  Mail,
  Pause,
} from 'lucide-react';
import { toast } from 'sonner';
import { Waveform } from '../common/Waveform';
import { Tag } from '../common/Tag';
import { GlassCard } from '../common/GlassCard';
import { C, T, S } from '../../design/tokens';
import type { Page } from '../layout/Sidebar';
import { SAMPLE_WORKS, type GeneratedWork } from '../../state/mockProject';

const DAY_DATA = [13275, 12940, 13320, 13680, 14010, 14390, 14148];
const PROTOCOLS = [
  { key: 'internal', label: '内部使用', desc: '仅平台内播放和分享', icon: '🔒' },
  { key: 'nonexclusive', label: '非独家发布', desc: '可在外部平台发布', icon: '📢' },
  { key: 'exclusive', label: '独家发行', desc: '由平台代理发行结算', icon: '⭐' },
  { key: 'commercial', label: '商业授权', desc: '广告、游戏、品牌场景', icon: '💼' },
];

const statusLabel: Record<string, string> = { done: '已完成', active: '制作中', draft: '草稿' };
const statusColor: Record<string, string> = { done: C.success, active: C.warning, draft: C.t2 };
const MINT = '#8EF7B6';
const MINT_DIM = 'rgba(142,247,182,0.12)';
const MINT_LINE = 'rgba(142,247,182,0.28)';

function formatTimestamp(value?: string) {
  if (!value) return '2026-07-10 17:56';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date).replace(/\//g, '-');
}

function formatNumber(value: number) {
  return value.toLocaleString('zh-CN');
}

function parseDurationSeconds(input?: string) {
  if (!input || input === '—') return 0;
  const parts = input.split(':').map((part) => Number(part));
  if (parts.some((part) => Number.isNaN(part))) return 0;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function formatDuration(input?: string) {
  const totalSeconds = parseDurationSeconds(input);
  if (!totalSeconds) return input && input !== '—' ? input : '--:--';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getProjectSummary(work: GeneratedWork) {
  if (work.finalPrompt) return `写一首关于${work.title}的中文流行歌，${work.finalPrompt.replace(/，/g, '，').slice(0, 68)}。`;
  return work.desc || '作品内容正在整理，稍后会补充完整的制作摘要。';
}

function inferTempo(prompt: string) {
  const match = prompt.match(/(\d{2,3})\s*BPM/i);
  return match?.[1] ? `${match[1]} BPM` : '78 BPM';
}

function inferKey(prompt: string) {
  const majorMinor = prompt.match(/([A-G](?:#|b)?\s?(?:Major|Minor|大调|小调))/i);
  return majorMinor?.[1]?.replace(/\s+/g, ' ') ?? 'A Minor';
}

function inferMeter(prompt: string) {
  const match = prompt.match(/(2\/4|3\/4|4\/4|6\/8)/);
  return match?.[1] ?? '4/4';
}

function buildStageFacts(work: GeneratedWork) {
  return [
    work.tags[0] || '中文',
    work.tags[1] || '都市流行',
    work.tags[2] || '雨夜氛围',
    '作品展示',
  ];
}

function buildStatCards(work: GeneratedWork) {
  return [
    { label: '播放', value: formatNumber(work.plays || DAY_DATA[0]), delta: '+32%', trend: [44, 52, 60, 68, 74, 81, 69] },
    { label: '分享', value: formatNumber(work.shares || 1448), delta: '+28%', trend: [63, 55, 61, 68, 75, 82, 88] },
    { label: '二创', value: formatNumber(Math.max(24, Math.round(work.likes * 0.3))), delta: '+67%', trend: [38, 45, 52, 59, 66, 72, 55] },
  ];
}

function buildRevenueParts(work: GeneratedWork) {
  const total = Math.max(work.earnings, 190);
  return [
    { label: '播放收益', ratio: 0.65, amount: total * 0.65, color: MINT },
    { label: '二创收益', ratio: 0.25, amount: total * 0.25, color: '#F0C36C' },
    { label: '分成协议激励', ratio: 0.1, amount: total * 0.1, color: 'rgba(255,255,255,0.32)' },
  ];
}

function buildContributionItems(work: GeneratedWork) {
  if (work.contribs.length) return work.contribs;
  return [
    { step: '作词', avatar: '雨幕钢琴手', lv: 3, w: 25, output: '', edit: '', at: '07/10 17:56', adopt: 84 },
    { step: '作曲', avatar: 'Hook 旋律师', lv: 3, w: 25, output: '', edit: '', at: '07/10 17:56', adopt: 87 },
    { step: '编曲', avatar: '低频建筑师', lv: 3, w: 25, output: '', edit: '', at: '07/10 17:56', adopt: 79 },
    { step: '制作 Demo', avatar: '人声策展师', lv: 3, w: 25, output: '', edit: '', at: '07/10 17:56', adopt: 91 },
  ];
}

function buildPromptSummary(work: GeneratedWork) {
  if (!work.finalPrompt) return '制作完成后，这里会展示完整的成品提示词、风格约束和人声制作要求。';
  return [
    `Song: ${work.title}`,
    `Language: ${work.tags[0] || '中文'}`,
    `Genre: ${work.tags[1] || '都市流行'}`,
    `Mood: ${work.tags[2] || '雨夜释怀'}`,
    'Use: 作品展示',
    `Composition: ${work.finalPrompt}`,
    'Arrangement: warm electric piano, round bass, tight electronic kick, 都市流行 groove with controlled push and 雨夜释怀 dynamics.',
    'Voice: 女声 / 气声靠前，中文咬字清楚，句尾保留呼吸细节，适合作品展示的清澈空间感。',
    'Production: 轻微房间感主唱，保留雨夜释怀里的细小呼吸；人声置感舒适融入声像前景，低频圆润，鼓组不抢旋律压缩，保持都市流行空间。',
    `Idea: ${getProjectSummary(work)}`,
  ].join('\n');
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * 100;
      const y = 88 - ((value - min) / range) * 52;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: 92, height: 34 }}>
      <polyline fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

export function MyWorksPage({
  navigate,
  works = SAMPLE_WORKS,
  activeWorkId = null,
  onPlayWork,
  playingWorkId = null,
  onUpdateWork,
}: {
  navigate: (p: Page) => void;
  works?: GeneratedWork[];
  activeWorkId?: string | number | null;
  onPlayWork?: (work: GeneratedWork) => void;
  playingWorkId?: string | number | null;
  onUpdateWork?: (work: GeneratedWork) => void;
}) {
  const [tab, setTab] = useState('全部');
  const [sel, setSel] = useState<GeneratedWork | null>(() => works.find((work) => work.id === activeWorkId) ?? null);
  const [editingWorkId, setEditingWorkId] = useState<string | number | null>(null);

  useEffect(() => {
    if (activeWorkId === null) return;
    const active = works.find((work) => work.id === activeWorkId);
    if (active) setSel(active);
  }, [activeWorkId, works]);

  if (sel) {
    return (
      <WorkResult
        work={sel}
        onBack={() => {
          setSel(null);
          setEditingWorkId(null);
        }}
        navigate={navigate}
        onPlayWork={onPlayWork}
        playing={playingWorkId === sel.id}
        startEditing={editingWorkId === sel.id}
        onUpdateWork={(work) => {
          setSel(work);
          onUpdateWork?.(work);
        }}
      />
    );
  }

  const filtered = works.filter((work) => (
    tab === '全部'
    || (tab === '已完成' && work.status === 'done')
    || (tab === '进行中' && work.status === 'active')
    || (tab === '草稿' && work.status === 'draft')
  ));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: C.bg0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: `1px solid rgba(255,255,255,0.05)`, flexShrink: 0 }}>
        <div>
          <h1 style={{ ...T.display, color: C.t0 }}>我的作品</h1>
          <p style={{ ...T.caption, color: C.t2, marginTop: 4 }}>管理歌曲项目，查看 Demo 和贡献记录</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {[{ l: '总项目', v: works.length }, { l: '已完成 Demo', v: works.filter((work) => work.status === 'done').length }, { l: '模拟收益', v: `¥${works.reduce((sum, work) => sum + work.earnings, 0).toFixed(2)}` }].map((item) => (
            <div key={item.l} style={{ textAlign: 'center', padding: '8px 14px', borderRadius: 10, background: C.bgCard, border: `1px solid ${C.bdr0}` }}>
              <p style={{ color: C.t0, fontSize: 16, fontWeight: 700, fontFamily: "'Inter',monospace" }}>{item.v}</p>
              <p style={{ ...T.label, color: C.t3, marginTop: 1 }}>{item.l}</p>
            </div>
          ))}
          <button onClick={() => navigate('production')} style={{ ...S.btnPrimary, display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 10 }}>
            <Sparkles size={13} />
            新建项目
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, padding: '12px 28px', borderBottom: `1px solid rgba(255,255,255,0.05)`, flexShrink: 0 }}>
        {['全部', '已完成', '进行中', '草稿'].map((item) => {
          const count = item === '全部'
            ? works.length
            : works.filter((work) => (
              (item === '已完成' && work.status === 'done')
              || (item === '进行中' && work.status === 'active')
              || (item === '草稿' && work.status === 'draft')
            )).length;
          const active = tab === item;
          return (
            <button
              key={item}
              onClick={() => setTab(item)}
              style={{
                padding: '5px 14px',
                borderRadius: 8,
                border: active ? `1px solid rgba(99,102,241,0.35)` : '1px solid transparent',
                background: active ? C.accentDim : 'transparent',
                color: active ? C.accentLight : C.t2,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: active ? 500 : 400,
              }}
            >
              {item}
              <span style={{ marginLeft: 4, fontSize: 10, color: active ? C.accent : C.t3 }}>{count}</span>
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((work) => (
          <GlassCard key={work.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', cursor: 'pointer' }} onClick={() => { setEditingWorkId(null); setSel(work); }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg,${work.color}BB,${work.color}44)`, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎵</div>
            <div style={{ width: 200, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{ ...T.subheading, color: C.t0 }}>{work.title}</span>
                <span style={{ fontSize: 10, color: statusColor[work.status], background: `${statusColor[work.status]}18`, padding: '1px 6px', borderRadius: 4 }}>{statusLabel[work.status]}</span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>{work.tags.map((tag) => <Tag key={tag} variant="dim">{tag}</Tag>)}</div>
            </div>
            <div style={{ width: 120 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ ...T.label, color: C.t3 }}>制作进度</span>
                <span style={{ ...T.label, color: C.t2 }}>{work.stepsDone}/4步</span>
              </div>
              <div style={{ display: 'flex', gap: 3 }}>
                {[0, 1, 2, 3].map((index) => <div key={index} style={{ flex: 1, height: 3, borderRadius: 999, background: index < work.stepsDone ? C.accent : 'rgba(255,255,255,0.08)' }} />)}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {work.status === 'done'
                ? <Waveform bars={40} progress={0} height={28} seed={work.seed} inactiveColor="rgba(255,255,255,0.09)" />
                : <span style={{ ...T.caption, color: C.t3 }}>{work.desc}</span>}
            </div>
            {work.status === 'done' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={11} color={C.t3} /><span style={{ ...T.caption, color: C.t2 }}>{work.plays.toLocaleString()}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Heart size={11} color={C.t3} /><span style={{ ...T.caption, color: C.t2 }}>{work.likes}</span></div>
                <span style={{ color: C.accentLight, fontSize: 12, fontWeight: 600 }}>¥{work.earnings.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {work.status === 'done' && (
                <button
                  aria-label={`播放${work.title}`}
                  style={{ width: 30, height: 30, borderRadius: '50%', background: C.accent, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(99,102,241,0.4)' }}
                  onClick={(event) => {
                    event.stopPropagation();
                    onPlayWork?.(work);
                  }}
                >
                  <Play size={12} color="#fff" fill="#fff" />
                </button>
              )}
              {work.status === 'active' && <button style={{ ...S.btnAccentOutline, display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 8, fontSize: 11 }} onClick={(event) => { event.stopPropagation(); navigate('production'); }}>继续制作<ChevronRight size={10} /></button>}
              <button style={{ ...S.btnGhost, padding: '6px 10px', borderRadius: 8, fontSize: 11, whiteSpace: 'nowrap' }} onClick={(event) => { event.stopPropagation(); setEditingWorkId(work.id); setSel(work); }}>编辑作品</button>
              <MoreHorizontal size={14} color={C.t3} style={{ cursor: 'pointer' }} />
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function WorkResult({
  work,
  onBack,
  navigate,
  onPlayWork,
  playing = false,
  startEditing = false,
  onUpdateWork,
}: {
  work: GeneratedWork;
  onBack: () => void;
  navigate: (p: Page) => void;
  onPlayWork?: (work: GeneratedWork) => void;
  playing?: boolean;
  startEditing?: boolean;
  onUpdateWork?: (work: GeneratedWork) => void;
}) {
  const [currentWork, setCurrentWork] = useState(work);
  const [protocol, setProtocol] = useState(work.protocol || 'nonexclusive');
  const [protocolConfirmed, setProtocolConfirmed] = useState(false);
  const [editing, setEditing] = useState(startEditing);
  const [draft, setDraft] = useState(() => ({
    title: work.title,
    tags: work.tags.join(', '),
    desc: work.desc,
    lyrics: work.lyrics,
    finalPrompt: work.finalPrompt,
  }));

  useEffect(() => {
    setCurrentWork(work);
    setProtocol(work.protocol || 'nonexclusive');
    setProtocolConfirmed(false);
    setDraft({
      title: work.title,
      tags: work.tags.join(', '),
      desc: work.desc,
      lyrics: work.lyrics,
      finalPrompt: work.finalPrompt,
    });
    setEditing(startEditing);
  }, [startEditing, work]);

  const viewWork = currentWork;
  const hasAudio = Boolean(viewWork.audioUrl);
  const stageFacts = buildStageFacts(viewWork);
  const stageMetrics = buildStatCards(viewWork);
  const revenueParts = buildRevenueParts(viewWork);
  const contributionItems = buildContributionItems(viewWork);
  const totalRevenue = revenueParts.reduce((sum, item) => sum + item.amount, 0);
  const donutGradient = `conic-gradient(${revenueParts[0].color} 0deg ${revenueParts[0].ratio * 360}deg, ${revenueParts[1].color} ${revenueParts[0].ratio * 360}deg ${(revenueParts[0].ratio + revenueParts[1].ratio) * 360}deg, ${revenueParts[2].color} ${(revenueParts[0].ratio + revenueParts[1].ratio) * 360}deg 360deg)`;
  const stagePrompt = viewWork.finalPrompt || '暖色流行女声，保留副歌空旷留白和雨夜里带一点反光的空气感。';
  const stageDescription = getProjectSummary(viewWork);

  function updateDraft(field: keyof typeof draft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function handleSaveWorkInfo() {
    const nextTags = draft.tags.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean).slice(0, 6);
    const nextWork = {
      ...viewWork,
      title: draft.title.trim() || viewWork.title,
      tags: nextTags.length ? nextTags : viewWork.tags,
      desc: draft.desc.trim() || viewWork.desc,
      lyrics: draft.lyrics,
      finalPrompt: draft.finalPrompt,
      updatedAt: new Date().toISOString(),
    };
    setCurrentWork(nextWork);
    onUpdateWork?.(nextWork);
    setEditing(false);
    toast.success('作品信息已保存');
  }

  function shareLink() {
    return `${window.location.origin}${window.location.pathname}?work=${encodeURIComponent(String(viewWork.id))}`;
  }

  async function handleShare() {
    if (!viewWork.shareUrl || String(viewWork.id).startsWith('local_work_')) {
      toast.info('作品还没有保存到云端，稍等几秒再分享；如果一直不行，请重新生成 Demo。');
      return;
    }
    const link = shareLink();
    try {
      await navigator.clipboard.writeText(link);
      toast.success('分享链接已复制，可以发给别人体验');
    } catch {
      toast.info(link);
    }
  }

  function handleExport() {
    toast.info('正在准备导出包，包含 Demo 音频、歌词和 Prompt…');
    window.setTimeout(() => toast.success('导出完成，已保存到下载目录'), 1800);
  }

  function handleProtocolConfirm() {
    setProtocolConfirmed(true);
    toast.success(`协议「${PROTOCOLS.find((item) => item.key === protocol)?.label}」已确认并记录`);
  }

  function handlePromo() {
    toast.info('推广分身正在准备标题候选、封面方向和发布文案…');
  }

  function handlePublish() {
    navigate('contribution');
    toast.info('正在准备发行 checklist，跳转至贡献链路查看');
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: 'radial-gradient(circle at top left, rgba(35,75,82,0.18), transparent 24%), radial-gradient(circle at bottom center, rgba(109,93,232,0.08), transparent 28%), #0a1018' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px 28px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 6px 18px 6px' }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: C.t2, ...T.caption }}>
            <ArrowLeft size={13} />
            我的作品
          </button>
          <ChevronRight size={12} color={C.t3} />
          <span style={{ ...T.caption, color: C.t1 }}>{viewWork.title}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) 314px', gap: 18, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '220px minmax(0,1fr)', gap: 16 }}>
              <GlassCard
                radius={20}
                style={{
                  padding: 14,
                  minHeight: 452,
                  background: `linear-gradient(180deg, rgba(14,22,34,0.92), rgba(15,14,12,0.96)), radial-gradient(circle at 70% 15%, ${viewWork.color}35, transparent 22%), radial-gradient(circle at 20% 70%, rgba(240,184,108,0.22), transparent 22%)`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ position: 'absolute', inset: 12, borderRadius: 18, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)', transform: 'skewX(-16deg) translateX(-24%)' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(100deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 14px)' }} />
                </div>
                <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tag variant="dim">MuseGrid Tester</Tag>
                    <Tag variant="warning">{viewWork.tags[2] || '雨夜释怀'}</Tag>
                  </div>
                  <div style={{ display: 'flex', gap: 16, minHeight: 200 }}>
                    <div style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', fontSize: 24, letterSpacing: '0.12em', color: 'rgba(241,247,255,0.88)', lineHeight: 1.1 }}>
                      {viewWork.title}
                    </div>
                  </div>
                  <div>
                    <p style={{ ...T.caption, color: C.t3, marginBottom: 6 }}>我的作品 · {viewWork.generationSource?.startsWith('minimax') ? '真实音频' : 'sample Demo'}</p>
                    <p style={{ color: C.t0, fontSize: 28, fontWeight: 700, marginBottom: 10 }}>{viewWork.title}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {viewWork.tags.map((tag) => <Tag key={tag} variant="outline">{tag}</Tag>)}
                    </div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard
                radius={20}
                style={{
                  padding: 18,
                  minHeight: 452,
                  background: 'linear-gradient(180deg, rgba(27,51,57,0.95), rgba(11,16,24,0.94) 58%)',
                  border: `1px solid ${MINT_LINE}`,
                  boxShadow: '0 30px 70px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
                  <div>
                    <p style={{ ...T.label, color: MINT, marginBottom: 8, textTransform: 'none' }}>作品舞台</p>
                    <p style={{ ...T.caption, color: C.t2, marginBottom: 4 }}>作品舞台</p>
                    <h1 style={{ color: C.t0, fontSize: 54, lineHeight: 1, fontWeight: 700, marginBottom: 10 }}>{viewWork.title}</h1>
                    <p style={{ color: C.t2, fontSize: 13, lineHeight: 1.8, maxWidth: 660 }}>{stageDescription}</p>
                  </div>
                  <Tag variant={viewWork.status === 'done' ? 'success' : 'warning'}>{statusLabel[viewWork.status]}</Tag>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 8, marginBottom: 12 }}>
                  {stageFacts.map((fact) => (
                    <div key={fact} style={{ minHeight: 30, borderRadius: 10, background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(243,247,250,0.88)', fontSize: 12, fontWeight: 500 }}>
                      {fact}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 10, marginBottom: 12 }}>
                  {[
                    { label: '完成时间', value: formatTimestamp(viewWork.updatedAt || viewWork.createdAt) },
                    { label: '声音方向', value: `${viewWork.tags[2] || '女声'} / 氛围靠前` },
                    { label: '时长', value: formatDuration(viewWork.duration) },
                    { label: '段落结构', value: 'Intro - Verse - Pre-Chorus - Chorus - Verse - Chorus - Bridge - Final Chorus' },
                    { label: '制作方向', value: '轻微房间感主唱，保留雨夜释怀里的细小呼吸' },
                    { label: '空间质感', value: '适合作品展示的清澈空间感，整幅温暖、克制、可继续制作。' },
                  ].map((item) => (
                    <div key={item.label} style={{ borderRadius: 14, background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.06)', padding: 14 }}>
                      <p style={{ ...T.label, color: C.t3, marginBottom: 8, textTransform: 'none' }}>{item.label}</p>
                      <p style={{ color: C.t1, fontSize: 12, lineHeight: 1.7 }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Tag variant="success">{viewWork.generationSource?.startsWith('minimax') ? 'real audio' : 'sample'}</Tag>
                    <button onClick={() => setEditing((value) => !value)} style={{ ...S.btnGhost, borderRadius: 10, padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {editing ? '取消编辑' : '编辑作品信息'}
                    </button>
                    <button onClick={() => navigate('production')} style={{ ...S.btnPrimary, borderRadius: 10, padding: '9px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      编辑作品
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={handleExport} style={{ ...S.btnGhost, borderRadius: 10, padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Download size={13} />
                      下载 MP3
                    </button>
                  </div>
                </div>
              </GlassCard>
            </div>

            {editing && (
              <GlassCard radius={18} style={{ padding: 16, background: 'linear-gradient(180deg, rgba(19,27,39,0.96), rgba(17,24,34,0.94))', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <label style={{ ...T.label, color: C.t2, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    作品标题
                    <input aria-label="作品标题" value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.bdr0}`, borderRadius: 10, color: C.t0, padding: '10px 12px', outline: 'none' }} />
                  </label>
                  <label style={{ ...T.label, color: C.t2, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    作品标签
                    <input aria-label="作品标签" value={draft.tags} onChange={(event) => updateDraft('tags', event.target.value)} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.bdr0}`, borderRadius: 10, color: C.t0, padding: '10px 12px', outline: 'none' }} />
                  </label>
                </div>
                <label style={{ ...T.label, color: C.t2, display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                  作品描述
                  <input aria-label="作品描述" value={draft.desc} onChange={(event) => updateDraft('desc', event.target.value)} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.bdr0}`, borderRadius: 10, color: C.t0, padding: '10px 12px', outline: 'none' }} />
                </label>
                <button onClick={handleSaveWorkInfo} style={{ ...S.btnPrimary, padding: '8px 16px', borderRadius: 10 }}>保存作品信息</button>
              </GlassCard>
            )}

            <GlassCard radius={20} style={{ padding: 18, background: 'linear-gradient(180deg, rgba(19,27,39,0.96), rgba(17,24,34,0.94))', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <p style={{ ...T.label, color: MINT, marginBottom: 8, textTransform: 'none' }}>可播放成品</p>
                  <p style={{ ...T.heading, color: C.t0 }}>作品主播放器</p>
                </div>
                <Tag variant="dim">{formatDuration(viewWork.duration)}</Tag>
              </div>

              {hasAudio ? (
                <audio controls src={viewWork.audioUrl} style={{ width: '100%', marginBottom: 14, filter: 'brightness(1.03) contrast(0.96)' }} />
              ) : (
                <div style={{ width: '100%', marginBottom: 14, borderRadius: 18, border: '1px dashed rgba(255,255,255,0.12)', padding: '20px 18px', color: C.t3, fontSize: 12 }}>
                  真实音频还没生成完成，这里先保留播放器位。点击下方按钮后会进入底部播放器体验。
                </div>
              )}

              <div style={{ borderRadius: 20, background: 'linear-gradient(180deg, rgba(38,47,60,0.92), rgba(21,30,40,0.96))', padding: 18, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: `radial-gradient(circle at 30% 30%, ${MINT} 0%, ${viewWork.color} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 22px ${MINT_DIM}` }}>
                    <Music3 size={20} color="#fff" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ color: C.t0, fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{viewWork.title}</p>
                    <p style={{ color: C.t3, fontSize: 12 }}>{viewWork.generationSource?.startsWith('minimax') ? '真实音频 Demo' : 'MuseGrid Tester · sample Demo'}</p>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.05)', color: C.t3, cursor: 'pointer' }}>{'<'}</button>
                    <button
                      onClick={() => onPlayWork?.(viewWork)}
                      style={{ minWidth: 60, height: 36, borderRadius: 18, border: 'none', background: '#EDF3EE', color: '#0A1118', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                      {playing ? <Pause size={13} /> : <Play size={13} fill="currentColor" />}
                      播放
                    </button>
                    <button style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.05)', color: C.t3, cursor: 'pointer' }}>{'>'}</button>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: C.t2, fontSize: 12, minWidth: 42 }}>00:00</span>
                  <div style={{ flex: 1 }}>
                    <Waveform bars={54} progress={playing ? 0.42 : 0} height={30} seed={viewWork.seed} activeColor={MINT} inactiveColor="rgba(255,255,255,0.12)" />
                  </div>
                  <span style={{ color: C.t2, fontSize: 12, minWidth: 42, textAlign: 'right' }}>{formatDuration(viewWork.duration)}</span>
                </div>
              </div>
            </GlassCard>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 18 }}>
              <GlassCard radius={18} style={{ padding: 18, background: 'linear-gradient(180deg, rgba(18,26,38,0.96), rgba(14,20,29,0.94))' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <p style={{ ...T.label, color: MINT, marginBottom: 8, textTransform: 'none' }}>提示词摘要</p>
                    <p style={{ ...T.heading, color: C.t0 }}>最终提示词雪摘</p>
                  </div>
                  <Tag variant="success">制作</Tag>
                </div>
                {editing ? (
                  <textarea aria-label="最终制作 Prompt" value={draft.finalPrompt} onChange={(event) => updateDraft('finalPrompt', event.target.value)} rows={14} style={{ width: '100%', resize: 'vertical', background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.bdr0}`, borderRadius: 12, color: C.t0, padding: 12, outline: 'none', lineHeight: 1.8 }} />
                ) : (
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: C.t1, fontSize: 12, lineHeight: 1.8, fontFamily: "'Noto Sans SC',sans-serif" }}>{buildPromptSummary(viewWork)}</pre>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 8, marginTop: 18 }}>
                  {stageFacts.map((fact) => (
                    <div key={fact} style={{ minHeight: 58, borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: C.t1, fontSize: 12, fontWeight: 500, padding: '0 8px' }}>
                      {fact}
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard radius={18} style={{ padding: 18, background: 'linear-gradient(180deg, rgba(18,26,38,0.96), rgba(14,20,29,0.94))' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <p style={{ ...T.label, color: MINT, marginBottom: 8, textTransform: 'none' }}>辞章</p>
                    <p style={{ ...T.heading, color: C.t0 }}>歌词</p>
                  </div>
                  <Tag variant="cyan">作曲</Tag>
                </div>
                {editing ? (
                  <textarea aria-label="最终歌词" value={draft.lyrics} onChange={(event) => updateDraft('lyrics', event.target.value)} rows={14} style={{ width: '100%', resize: 'vertical', background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.bdr0}`, borderRadius: 12, color: C.t0, padding: 12, outline: 'none', lineHeight: 1.8 }} />
                ) : (
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: C.t1, fontSize: 12, lineHeight: 2, fontFamily: "'Noto Sans SC',sans-serif" }}>
                    {viewWork.lyrics || '歌词尚未确认，完成制作后会显示在这里。'}
                  </pre>
                )}
              </GlassCard>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <GlassCard radius={18} style={{ padding: 16, background: 'linear-gradient(180deg, rgba(20,28,40,0.96), rgba(14,18,26,0.96))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <p style={{ ...T.label, color: MINT, marginBottom: 8, textTransform: 'none' }}>7 天侧向</p>
                  <p style={{ ...T.heading, color: C.t0 }}>7 天模锯数据</p>
                </div>
                <Tag variant="cyan">近 7 天</Tag>
              </div>
              <p style={{ ...T.caption, color: C.t3, marginBottom: 12 }}>数据更新于 {formatTimestamp(viewWork.updatedAt || viewWork.createdAt)}</p>
              {stageMetrics.map((item) => (
                <div key={item.label} style={{ borderRadius: 14, background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <p style={{ ...T.label, color: C.t3, marginBottom: 6, textTransform: 'none' }}>{item.label}</p>
                    <p style={{ color: C.t0, fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{item.value}</p>
                    <p style={{ color: MINT, fontSize: 11, fontWeight: 600 }}>较前 7 日 {item.delta}</p>
                  </div>
                  <Sparkline values={item.trend} color={MINT} />
                </div>
              ))}
            </GlassCard>

            <GlassCard radius={18} style={{ padding: 16, background: 'linear-gradient(180deg, rgba(20,28,40,0.96), rgba(14,18,26,0.96))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Link2 size={13} color={MINT} />
                  <p style={{ ...T.heading, color: C.t0 }}>真值链路</p>
                </div>
                <Tag variant="success">{contributionItems.length}/{contributionItems.length} 已确认</Tag>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {contributionItems.map((item, index) => (
                  <div key={`${item.step}-${item.avatar}`} style={{ display: 'grid', gridTemplateColumns: '10px minmax(0,1fr)', gap: 10 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: MINT }} />
                      {index < contributionItems.length - 1 && <div style={{ width: 1, flex: 1, background: 'rgba(255,255,255,0.08)', marginTop: 4 }} />}
                    </div>
                    <div style={{ paddingBottom: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <div>
                          <p style={{ color: C.t0, fontSize: 12, fontWeight: 600 }}>{item.step}</p>
                          <p style={{ color: C.t2, fontSize: 11 }}>{item.avatar}</p>
                        </div>
                        <p style={{ color: C.t3, fontSize: 10 }}>Lv.{item.lv} / {item.w}%</p>
                      </div>
                      <p style={{ color: C.t3, fontSize: 10, lineHeight: 1.5 }}>{item.at}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard radius={18} style={{ padding: 16, background: 'linear-gradient(180deg, rgba(20,28,40,0.96), rgba(14,18,26,0.96))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <p style={{ ...T.label, color: MINT, marginBottom: 8, textTransform: 'none' }}>7 天后侧链</p>
                  <p style={{ ...T.heading, color: C.t0 }}>模锯初收（未来 7 天）</p>
                </div>
                <Tag variant="warning">预估结算</Tag>
              </div>
              <div style={{ borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', padding: 14, marginBottom: 12 }}>
                <p style={{ ...T.label, color: C.t3, marginBottom: 8, textTransform: 'none' }}>模锯初收</p>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <p style={{ color: C.t0, fontSize: 24, fontWeight: 700 }}>¥{totalRevenue.toFixed(2)}</p>
                  <p style={{ color: MINT, fontSize: 11, fontWeight: 600 }}>较前 7 日 +42%</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <div style={{ width: 112, height: 112, borderRadius: '50%', background: donutGradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#121A24', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: C.t0, fontSize: 16, fontWeight: 700 }}>{formatNumber(Math.max(viewWork.plays, DAY_DATA[0]))}</p>
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {revenueParts.map((item) => (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ color: C.t2, fontSize: 11 }}>{item.label}</span>
                        <span style={{ color: C.t1, fontSize: 11 }}>{Math.round(item.ratio * 100)}%</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.08)' }}>
                        <div style={{ width: `${item.ratio * 100}%`, height: '100%', borderRadius: 999, background: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
                <div style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', padding: 12, background: 'rgba(255,255,255,0.03)' }}>
                  <p style={{ ...T.label, color: C.t3, marginBottom: 6, textTransform: 'none' }}>预估播放</p>
                  <p style={{ color: C.t0, fontSize: 22, fontWeight: 700 }}>{formatNumber(Math.max(viewWork.plays, DAY_DATA[0]))}</p>
                </div>
                <div style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', padding: 12, background: 'rgba(255,255,255,0.03)' }}>
                  <p style={{ ...T.label, color: C.t3, marginBottom: 6, textTransform: 'none' }}>预估二创</p>
                  <p style={{ color: C.t0, fontSize: 22, fontWeight: 700 }}>{formatNumber(Math.max(247, Math.round(viewWork.likes * 0.3)))}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard radius={18} style={{ padding: 16, background: 'linear-gradient(180deg, rgba(20,28,40,0.96), rgba(14,18,26,0.96))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Share2 size={13} color={MINT} />
                <p style={{ ...T.heading, color: C.t0 }}>快捷分享</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
                <button onClick={handleShare} style={{ ...S.btnGhost, minHeight: 52, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Copy size={13} />复制分享链接</button>
                <button onClick={() => toast.info('邮件分享模版已准备好')} style={{ ...S.btnGhost, minHeight: 52, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Mail size={13} />邮件分享</button>
                <button onClick={() => toast.info('微信分享文案已复制')} style={{ ...S.btnGhost, minHeight: 52, borderRadius: 12 }}>微信分享</button>
                <button onClick={handlePromo} style={{ ...S.btnGhost, minHeight: 52, borderRadius: 12 }}>保存封面</button>
              </div>
            </GlassCard>

            <GlassCard radius={18} style={{ padding: 16, background: 'linear-gradient(180deg, rgba(20,28,40,0.96), rgba(14,18,26,0.96))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Shield size={13} color={MINT} />
                <p style={{ ...T.heading, color: C.t0 }}>协议与导出</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 8, marginBottom: 12 }}>
                {PROTOCOLS.map((item) => {
                  const active = protocol === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        setProtocol(item.key);
                        setProtocolConfirmed(false);
                      }}
                      style={{
                        borderRadius: 12,
                        border: `1px solid ${active ? MINT_LINE : 'rgba(255,255,255,0.06)'}`,
                        background: active ? MINT_DIM : 'rgba(255,255,255,0.03)',
                        padding: 12,
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: 18, marginBottom: 8 }}>{item.icon}</div>
                      <p style={{ color: active ? C.t0 : C.t1, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{item.label}</p>
                      <p style={{ color: C.t3, fontSize: 10, lineHeight: 1.5 }}>{item.desc}</p>
                    </button>
                  );
                })}
              </div>
              {!protocolConfirmed ? (
                <button onClick={handleProtocolConfirm} style={{ ...S.btnPrimary, width: '100%', borderRadius: 12, minHeight: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
                  <Check size={13} />
                  确认协议选择
                </button>
              ) : (
                <div style={{ marginBottom: 10, borderRadius: 12, background: 'rgba(66,201,154,0.12)', border: '1px solid rgba(66,201,154,0.24)', padding: '10px 12px', color: '#A7F3D0', fontSize: 12 }}>
                  协议「{PROTOCOLS.find((item) => item.key === protocol)?.label}」已确认并记录
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
                <button onClick={handleExport} style={{ ...S.btnGhost, minHeight: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Download size={13} />下载音频 MP3</button>
                <button onClick={() => toast.info('无损导出正在排队')} style={{ ...S.btnGhost, minHeight: 48, borderRadius: 12 }}>下载无损 WAV</button>
                <button onClick={() => toast.info('提示词 TXT 已导出')} style={{ ...S.btnGhost, minHeight: 48, borderRadius: 12 }}><FileText size={13} />导出提示词 TXT</button>
                <button onClick={handlePublish} style={{ ...S.btnGhost, minHeight: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Wallet size={13} />导出发行包</button>
              </div>
            </GlassCard>

            <GlassCard radius={18} style={{ padding: 16, background: 'linear-gradient(180deg, rgba(20,28,40,0.96), rgba(14,18,26,0.96))' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 10 }}>
                {[
                  { icon: Disc3, label: '节拍', value: inferTempo(stagePrompt) },
                  { icon: AudioWaveform, label: '调性', value: inferKey(stagePrompt) },
                  { icon: Clock3, label: '拍号', value: inferMeter(stagePrompt) },
                ].map((item) => (
                  <div key={item.label} style={{ borderRadius: 12, padding: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <item.icon size={12} color={MINT} />
                      <span style={{ ...T.label, color: C.t3, textTransform: 'none' }}>{item.label}</span>
                    </div>
                    <p style={{ color: C.t0, fontSize: 13, fontWeight: 600 }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
