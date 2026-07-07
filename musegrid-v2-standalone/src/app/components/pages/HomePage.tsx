import { useState } from 'react';
import { ArrowRight, Plus, ChevronDown, Sparkles, Music2, TrendingUp, Play, MoreHorizontal, Zap, SlidersHorizontal, CheckCircle2 } from 'lucide-react';
import { Waveform } from '../common/Waveform';
import { Tag } from '../common/Tag';
import { GlassCard } from '../common/GlassCard';
import { C, T, S } from '../../design/tokens';
import type { Page } from '../layout/Sidebar';
import type { GeneratedWork, ProjectBrief } from '../../state/mockProject';

const QUICK_OPTS = [
  { key: 'language', label: '语言', options: ['中文', '粤语', '英文', '中英双语'] },
  { key: 'genre', label: '风格', options: ['古风流行', '电子国风', '民谣流行', 'R&B', '都市电子'] },
  { key: 'mood', label: '情绪', options: ['治愈·温暖', '克制·遗憾', '轻盈·明亮', '孤独·释怀', '热烈·上扬'] },
  { key: 'intendedUse', label: '用途', options: ['个人创作', '短视频发布', '商业 Demo', '舞台演出', '作品集'] },
];

type EntryMode = 'quick' | 'professional';

const ENTRY_MODE_COPY: Record<EntryMode, {
  label: string;
  title: string;
  description: string;
  action: string;
  icon: typeof Zap;
}> = {
  quick: {
    label: '极速模式',
    title: '一句话先生成可听草案',
    description: '适合灵感刚出现时快速落地，系统会按当前提示词和参数直接推进歌曲草案。',
    action: '极速生成',
    icon: Zap,
  },
  professional: {
    label: '专业模式',
    title: '逐环节控制创作过程',
    description: '适合认真打磨作品，你可以逐步确认作词、作曲、编曲和制作结果。',
    action: '开始制作',
    icon: SlidersHorizontal,
  },
};

const AV_NODES = [
  { name: '林间小调', dir: '作词', lv: 4, x: 128, y: 60,  c: '#6366F1', e: '✍️' },
  { name: 'Ray·节奏', dir: '作曲', lv: 5, x: 230, y: 32,  c: '#2563EB', e: '🎼' },
  { name: '声纹织造', dir: '编曲', lv: 3, x: 290, y: 108, c: '#059669', e: '🎸' },
  { name: '标枪小鱼', dir: '制作', lv: 4, x: 195, y: 158, c: '#D97706', e: '🎚️' },
  { name: '山野清风', dir: '作词', lv: 3, x: 75,  y: 145, c: '#14532D', e: '🌿' },
];
const AV_LINKS = [[0,1],[1,2],[2,3],[3,4],[4,0],[0,3]];

export function HomePage({
  navigate,
  onStartProject,
  onContinueProject,
  works,
}: {
  navigate: (p: Page) => void;
  onStartProject: (idea: string, options: Pick<ProjectBrief, 'language' | 'genre' | 'mood' | 'intendedUse'>) => void;
  onContinueProject: () => void;
  works: GeneratedWork[];
}) {
  const [idea, setIdea] = useState('');
  const [entryMode, setEntryMode] = useState<EntryMode>('professional');
  const [quickValues, setQuickValues] = useState({
    language: QUICK_OPTS[0].options[0],
    genre: QUICK_OPTS[1].options[0],
    mood: QUICK_OPTS[2].options[0],
    intendedUse: QUICK_OPTS[3].options[0],
  });
  const recentProjects = works.slice(0, 4).map((work) => ({
    id: work.id,
    title: work.title,
    status: work.status,
    statusColor: work.status === 'done' ? C.success : work.status === 'active' ? C.warning : C.t2,
    tags: work.tags.slice(0, 2),
    seed: work.seed,
    color: work.color,
    progress: work.progress,
    desc: work.desc,
  }));
  const continueWork = works.find((work) => work.status === 'active') ?? works[0];
  const activeMode = ENTRY_MODE_COPY[entryMode];

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: C.bg0 }}>

      {/* ─── Main ─── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 32px 32px 32px', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ ...T.display, color: C.t0 }}>创作台</h1>
            <p style={{ ...T.caption, color: C.t2, marginTop: 4 }}>召唤你的创作班底，开始下一首作品</p>
          </div>
          <button
            onClick={onContinueProject}
            style={{ ...S.btnGhost, display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 10 }}
          >
            <Music2 size={13} />
            <span style={{ ...T.caption }}>继续上次创作</span>
            <span style={{ color: C.accentLight, fontSize: 10, fontWeight: 500 }}>{continueWork.title} · {continueWork.status === 'done' ? '已完成' : '制作中'}</span>
          </button>
        </div>

        {/* Idea input */}
        <GlassCard pad={20}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            padding: 6,
            marginBottom: 16,
            borderRadius: 16,
            background: 'rgba(255,255,255,0.045)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
          }} role="radiogroup" aria-label="创作台模式">
            {(Object.keys(ENTRY_MODE_COPY) as EntryMode[]).map((mode) => {
              const selected = entryMode === mode;
              const ModeIcon = ENTRY_MODE_COPY[mode].icon;
              return (
                <button
                  key={mode}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setEntryMode(mode)}
                  style={{
                    position: 'relative',
                    minHeight: 92,
                    borderRadius: 12,
                    border: selected ? '1px solid rgba(129,140,248,0.86)' : '1px solid rgba(255,255,255,0.06)',
                    background: selected
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.34), rgba(79,70,229,0.14))'
                      : 'rgba(255,255,255,0.025)',
                    color: selected ? C.t0 : C.t2,
                    cursor: 'pointer',
                    padding: '16px 18px',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 9,
                    boxShadow: selected ? '0 18px 45px rgba(49,46,129,0.32), inset 0 1px 0 rgba(255,255,255,0.12)' : 'none',
                    transition: 'transform 180ms ease, border-color 180ms ease, background 180ms ease, box-shadow 180ms ease',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 9, ...T.subheading, color: selected ? C.t0 : C.t1 }}>
                      <ModeIcon size={16} color={selected ? C.accentLight : C.t3} />
                      {ENTRY_MODE_COPY[mode].label}
                    </span>
                    {selected && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '3px 7px',
                        borderRadius: 999,
                        background: 'rgba(255,255,255,0.12)',
                        color: C.accentLight,
                        fontSize: 10,
                        fontWeight: 700,
                      }}>
                        <CheckCircle2 size={11} />已选择
                      </span>
                    )}
                  </span>
                  <strong style={{ color: selected ? C.t0 : C.t1, fontSize: 15, lineHeight: 1.35 }}>{ENTRY_MODE_COPY[mode].title}</strong>
                  <span style={{ ...T.caption, color: selected ? C.t2 : C.t3, lineHeight: 1.55 }}>{ENTRY_MODE_COPY[mode].description}</span>
                </button>
              );
            })}
          </div>

          <div role="status" aria-live="polite" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
            marginBottom: 14,
            padding: '10px 12px',
            borderRadius: 12,
            background: entryMode === 'quick' ? 'rgba(34,197,94,0.08)' : 'rgba(99,102,241,0.08)',
            border: `1px solid ${entryMode === 'quick' ? 'rgba(34,197,94,0.22)' : 'rgba(129,140,248,0.24)'}`,
          }}>
            <div>
              <p style={{ ...T.caption, color: C.t0, fontWeight: 700 }}>当前模式：{activeMode.label}</p>
              <p style={{ ...T.label, color: C.t3, marginTop: 3 }}>{activeMode.description}</p>
            </div>
            <Tag variant={entryMode === 'quick' ? 'success' : 'accent'}>
              {entryMode === 'quick' ? '快速出草案' : '白盒工作流'}
            </Tag>
          </div>

          <textarea
            value={idea}
            onChange={e => setIdea(e.target.value)}
            placeholder="写下你的创作灵感……例如：一首关于夏天告别的歌，带着些许不舍但又轻盈的情绪"
            rows={3}
            style={{
              width: '100%', resize: 'none', background: 'transparent',
              border: 'none', outline: 'none', color: C.t0, ...T.body,
              lineHeight: 1.8, caretColor: C.accent,
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {QUICK_OPTS.map(opt => (
              <label key={opt.key} htmlFor={`home-${opt.key}`} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 28px 5px 12px', borderRadius: 8,
                background: C.bgCard, border: `1px solid ${C.bdr0}`,
                color: C.t1, cursor: 'pointer', fontSize: 11,
                position: 'relative', minHeight: 30,
              }}>
                <span style={{ color: C.t3 }}>{opt.label}：</span>
                <select
                  id={`home-${opt.key}`}
                  aria-label={opt.label}
                  value={quickValues[opt.key as keyof typeof quickValues]}
                  onChange={(event) => setQuickValues((current) => ({ ...current, [opt.key]: event.target.value }))}
                  style={{
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: C.t1,
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: 0,
                    minWidth: opt.key === 'intendedUse' ? 58 : 48,
                  }}
                >
                  {opt.options.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
                <ChevronDown size={10} color={C.t3} style={{ position: 'absolute', right: 10, pointerEvents: 'none' }} />
              </label>
            ))}
            <div style={{ flex: 1 }} />
            <button
              onClick={() => onStartProject(idea, quickValues)}
              style={{
                ...S.btnPrimary,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 22px',
                borderRadius: 10,
                boxShadow: entryMode === 'quick'
                  ? '0 0 0 1px rgba(134,239,172,0.18), 0 16px 34px rgba(22,163,74,0.28)'
                  : '0 0 0 1px rgba(165,180,252,0.18), 0 16px 34px rgba(79,70,229,0.32)',
              }}
            >
              {entryMode === 'quick' ? <Zap size={14} /> : <Sparkles size={14} />}
              {activeMode.action}
            </button>
          </div>
        </GlassCard>

        {/* Chain hint */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 0,
          padding: '10px 16px', borderRadius: 12,
          background: 'rgba(99,102,241,0.06)', border: `1px solid rgba(99,102,241,0.15)`,
        }}>
          {['灵感', '作词', '作曲', '编曲', '制作', 'Demo'].map((step, i, arr) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <span style={{
                padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                background: i === 0 ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${i === 0 ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`,
                color: i === 0 ? C.accentLight : C.t2,
              }}>{step}</span>
              {i < arr.length - 1 && (
                <ArrowRight size={11} color={C.t3} style={{ margin: '0 4px' }} />
              )}
            </div>
          ))}
          <span style={{ ...T.caption, color: C.t3, marginLeft: 16 }}>每步由专属分身协作完成，确认后记入贡献链路</span>
        </div>

        {/* Recent projects */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ ...T.heading, color: C.t0 }}>最近项目</h2>
            <button
              onClick={() => navigate('myWorks')}
              style={{ ...S.btnAccentOutline, display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, fontSize: 11 }}
            >
              <Plus size={12} />
              新建项目
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentProjects.map(p => (
              <GlassCard
                key={p.id}
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', cursor: 'pointer' }}
                onClick={() => navigate('myWorks')}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                  background: `linear-gradient(135deg, ${p.color}AA, ${p.color}44)`,
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>🎵</div>

                <div style={{ width: 180, minWidth: 180 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <span style={{ ...T.subheading, color: C.t0 }}>{p.title}</span>
                    <span style={{ fontSize: 10, color: p.statusColor, background: `${p.statusColor}18`, padding: '1px 6px', borderRadius: 4 }}>
                      {p.status === 'done' ? '已完成' : p.status === 'active' ? '制作中' : '草稿'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {p.tags.map(t => <Tag key={t} variant="dim">{t}</Tag>)}
                  </div>
                </div>

                {/* Mini step progress */}
                <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  {[0,1,2,3].map(i => (
                    <div key={i} style={{
                      width: 24, height: 3, borderRadius: 999,
                      background: i < p.progress * 4 ? C.accent : 'rgba(255,255,255,0.08)',
                    }} />
                  ))}
                </div>

                <div style={{ flex: 1 }}>
                  <Waveform bars={36} progress={p.progress} height={28} seed={p.seed}
                    activeColor={C.accent} inactiveColor="rgba(255,255,255,0.07)" />
                </div>

                <span style={{ ...T.caption, color: C.t3, flexShrink: 0 }}>{p.desc}</span>

                <button style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: p.status === 'done' ? C.accent : 'rgba(255,255,255,0.06)',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: p.status === 'done' ? '0 0 12px rgba(99,102,241,0.4)' : 'none',
                }}>
                  <Play size={11} color="#fff" fill="#fff" />
                </button>
                <MoreHorizontal size={14} color={C.t3} style={{ cursor: 'pointer', flexShrink: 0 }} />
              </GlassCard>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Right panel ─── */}
      <div style={{
        width: 272, flexShrink: 0, borderLeft: `1px solid rgba(255,255,255,0.05)`,
        overflowY: 'auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: 20,
      }}>

        {/* Avatar network */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ ...T.subheading, color: C.t0 }}>推荐人才合集</span>
            <button onClick={() => navigate('avatarNetwork')} style={{
              display: 'flex', alignItems: 'center', gap: 4, background: 'none',
              border: 'none', color: C.accentLight, fontSize: 11, cursor: 'pointer',
            }}>查看全部 <ArrowRight size={11} /></button>
          </div>
          <GlassCard style={{ position: 'relative', height: 185, overflow: 'hidden' }}>
            <svg width="100%" height="100%" viewBox="0 0 360 185" style={{ position: 'absolute', inset: 0 }}>
              {AV_LINKS.map(([a, b], i) => (
                <line key={i}
                  x1={AV_NODES[a].x} y1={AV_NODES[a].y}
                  x2={AV_NODES[b].x} y2={AV_NODES[b].y}
                  stroke="rgba(99,102,241,0.18)" strokeWidth="1" strokeDasharray="3 4"
                />
              ))}
              {AV_NODES.map(av => (
                <g key={av.name}>
                  <circle cx={av.x} cy={av.y} r={22}
                    fill={`${av.c}28`} stroke={`${av.c}70`} strokeWidth="1.5" />
                  <text x={av.x} y={av.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="14">{av.e}</text>
                  <text x={av.x} y={av.y + 31} textAnchor="middle" fill={C.t1} fontSize="8.5">{av.name}</text>
                  <text x={av.x} y={av.y + 42} textAnchor="middle" fill={C.t3} fontSize="7.5">{av.dir} · Lv{av.lv}</text>
                </g>
              ))}
            </svg>
          </GlassCard>
        </div>

        {/* Stats */}
        <GlassCard pad={16}>
          <p style={{ ...T.label, color: C.t3, marginBottom: 12 }}>本月数据</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: '已完成项目', value: '4', color: C.accent },
              { label: '总播放量',   value: '1,840', color: C.success },
              { label: '分身召唤',   value: '23次',  color: C.warning },
              { label: '平均采纳率', value: '87%',  color: C.cyan },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: 10,
                padding: '10px 12px', border: `1px solid rgba(255,255,255,0.04)`,
              }}>
                <p style={{ color: s.color, fontSize: 18, fontWeight: 700, fontFamily: "'Inter', monospace" }}>{s.value}</p>
                <p style={{ ...T.label, color: C.t3, marginTop: 2, fontSize: 9 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: '浏览分身网络', sub: '发现更多协作人', page: 'avatarNetwork' as Page },
            { label: '申请入驻创作人', sub: '创建你的分身资产', page: 'createAvatar' as Page },
          ].map(a => (
            <GlassCard
              key={a.label}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', cursor: 'pointer' }}
              onClick={() => navigate(a.page)}
            >
              <div>
                <p style={{ ...T.caption, color: C.t0, fontWeight: 500 }}>{a.label}</p>
                <p style={{ ...T.label, color: C.t3, marginTop: 2 }}>{a.sub}</p>
              </div>
              <ArrowRight size={13} color={C.t3} />
            </GlassCard>
          ))}
        </div>

        {/* Platform tip */}
        <div style={{
          borderRadius: 12, padding: 14,
          background: 'rgba(99,102,241,0.06)', border: `1px solid rgba(99,102,241,0.15)`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <TrendingUp size={13} color={C.accentLight} />
            <span style={{ ...T.caption, color: C.accentLight, fontWeight: 500 }}>平台说明</span>
          </div>
          <p style={{ ...T.caption, color: C.t2, lineHeight: 1.7 }}>
            MuseGrid 不只是生成一首歌，而是帮你组建一支可持续进化的创作班底。每个分身有档案、有成长、有贡献记录。
          </p>
        </div>
      </div>
    </div>
  );
}
