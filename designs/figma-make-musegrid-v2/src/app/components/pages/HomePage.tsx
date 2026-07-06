import { useState } from 'react';
import { ArrowRight, Plus, ChevronDown, Sparkles, Music2, TrendingUp, Play, MoreHorizontal } from 'lucide-react';
import { Waveform } from '../common/Waveform';
import { Tag } from '../common/Tag';
import { GlassCard } from '../common/GlassCard';
import { C, T, S } from '../../design/tokens';
import type { Page } from '../layout/Sidebar';

const QUICK_OPTS = [
  { label: '语言', value: '中文' },
  { label: '风格', value: '古风流行' },
  { label: '情绪', value: '治愈·温暖' },
  { label: '用途', value: '个人创作' },
];

const PROJECTS = [
  { id: 1, title: '山海之旅', status: 'done',   statusColor: C.success, tags: ['古风','流行'], seed: 3,  color: '#5B21B6', progress: 1,    desc: '已生成 Demo · 四步完成' },
  { id: 2, title: '城市夜语', status: 'active',  statusColor: C.warning, tags: ['R&B','都市'],  seed: 7,  color: '#1D4ED8', progress: 0.5,  desc: '正在编曲 · 分身工作中' },
  { id: 3, title: '繁星如故', status: 'draft',   statusColor: C.t2,      tags: ['民谣','治愈'],  seed: 11, color: '#065F46', progress: 0.25, desc: '作词完成 · 待作曲' },
  { id: 4, title: '光年以外', status: 'done',   statusColor: C.success, tags: ['流行','摇滚'], seed: 15, color: '#7D2E46', progress: 1,    desc: '已生成 Demo · 四步完成' },
];

const AV_NODES = [
  { name: '林间小调', dir: '作词', lv: 4, x: 128, y: 60,  c: '#6366F1', e: '✍️' },
  { name: 'Ray·节奏', dir: '作曲', lv: 5, x: 230, y: 32,  c: '#2563EB', e: '🎼' },
  { name: '声纹织造', dir: '编曲', lv: 3, x: 290, y: 108, c: '#059669', e: '🎸' },
  { name: '标枪小鱼', dir: '制作', lv: 4, x: 195, y: 158, c: '#D97706', e: '🎚️' },
  { name: '山野清风', dir: '混音', lv: 3, x: 75,  y: 145, c: '#DB2777', e: '🎛️' },
];
const AV_LINKS = [[0,1],[1,2],[2,3],[3,4],[4,0],[0,3]];

export function HomePage({
  navigate,
  onStartProject,
  onContinueProject,
}: {
  navigate: (p: Page) => void;
  onStartProject: (idea: string) => void;
  onContinueProject: () => void;
}) {
  const [idea, setIdea] = useState('');

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
            <span style={{ color: C.accentLight, fontSize: 10, fontWeight: 500 }}>城市夜语 · 编曲中</span>
          </button>
        </div>

        {/* Idea input */}
        <GlassCard pad={20}>
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
              <button key={opt.label} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 8,
                background: C.bgCard, border: `1px solid ${C.bdr0}`,
                color: C.t1, cursor: 'pointer', fontSize: 11,
              }}>
                <span style={{ color: C.t3 }}>{opt.label}：</span>
                {opt.value}
                <ChevronDown size={10} color={C.t3} />
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <button
              onClick={() => onStartProject(idea)}
              style={{ ...S.btnPrimary, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderRadius: 10 }}
            >
              <Sparkles size={14} />
              开始制作
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
            {PROJECTS.map(p => (
              <GlassCard
                key={p.id}
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', cursor: 'pointer' }}
                onClick={onContinueProject}
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
