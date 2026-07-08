import { useEffect, useMemo, useState } from 'react';
import { Search, Sparkles, SlidersHorizontal, Star, Music } from 'lucide-react';
import { toast } from 'sonner';
import { Tag } from '../common/Tag';
import { RadarChart } from '../common/RadarChart';
import { GlassCard } from '../common/GlassCard';
import { C, T, S } from '../../design/tokens';
import type { Page } from '../layout/Sidebar';
import { AVATARS as DEFAULT_AVATARS, mergeAvatarProfiles, normalizeAvatar, type AvatarProfile } from '../../state/mockProject';

const DIR_TABS = ['全部','作词','作曲','编曲','制作'];
const STYLE_CHIPS = ['古风','流行','电子','R&B','说唱','民谣','摇滚','爵士','治愈','实验'];

const STATIC_AVATARS = [
  { id:1, name:'林间小调', dir:'作词', lv:4, calls:560,  adopt:84, tags:['古风','情感叙事','画面感'], status:'状态良好', statusType:'success', emoji:'✍️', color:'#5B21B6', motto:'先找情绪转折点，再让 Hook 把故事收回来', strengths:'古风叙事、情感钩子', avoid:'强电子风、说唱', radar:[0.85,0.70,0.90,0.75,0.80], reps:['夏末之歌','山海之旅','繁星如故'] },
  { id:2, name:'Ray·节奏', dir:'作曲', lv:5, calls:1240, adopt:91, tags:['流行','电子','Trap'], status:'热门召唤', statusType:'warning', emoji:'🎼', color:'#1D4ED8', motto:'旋律不是被写出来的，是被听出来的', strengths:'流行旋律、电子编曲', avoid:'纯古典、传统民乐', radar:[0.95,0.88,0.70,0.92,0.85], reps:['霓虹都市','电子曙光','节拍森林'] },
  { id:3, name:'声纹织造', dir:'编曲', lv:3, calls:320,  adopt:78, tags:['氛围感','弦乐','配乐'], status:'正在探索', statusType:'accent', emoji:'🎸', color:'#065F46', motto:'层次感是编曲的灵魂', strengths:'氛围编曲、弦乐配置', avoid:'说唱节拍、重金属', radar:[0.75,0.60,0.85,0.65,0.80], reps:['星际漂流','晨雾之境'] },
  { id:4, name:'标枪小鱼', dir:'制作', lv:4, calls:890,  adopt:87, tags:['R&B','混音','人声'], status:'状态良好', statusType:'success', emoji:'🎚️', color:'#92400E', motto:'好的制作让音乐自己开口说话', strengths:'R&B制作、人声处理', avoid:'极端实验电子', radar:[0.80,0.85,0.90,0.88,0.72], reps:['暖色调','夜深话','城市夜语'] },
  { id:5, name:'山野清风', dir:'作词', lv:3, calls:245,  adopt:74, tags:['民谣','自然意象','口语'], status:'需要维护', statusType:'warning', emoji:'🌿', color:'#14532D', motto:'好的歌词像呼吸，自然且必要', strengths:'民谣叙事、自然意象', avoid:'都市流行、电子风格', radar:[0.70,0.65,0.80,0.60,0.75], reps:['林中漫步','山间雨'] },
  { id:6, name:'零度电子', dir:'作曲', lv:4, calls:670,  adopt:82, tags:['电子','实验','IDM'], status:'状态良好', statusType:'success', emoji:'⚡', color:'#1E3A5F', motto:'把不可能的声音变成可能', strengths:'电子实验、合成器音色', avoid:'传统民乐、纯人声', radar:[0.90,0.75,0.65,0.88,0.70], reps:['量子涟漪','零度之境'] },
];

const statusCol = { success: C.success, warning: C.warning, accent: C.accent };

export function AvatarNetworkPage({
  navigate,
  avatars = DEFAULT_AVATARS,
  onSummonAvatar,
  requiredDirection,
}: {
  navigate: (p: Page) => void;
  avatars?: AvatarProfile[];
  onSummonAvatar?: (avatarId: string | number) => void;
  requiredDirection?: string | null;
}) {
  const [activeDir, setActiveDir] = useState(requiredDirection ?? '全部');
  const [activeStyles, setActiveStyles] = useState<string[]>([]);
  const visibleAvatars = useMemo(
    () => mergeAvatarProfiles(avatars.length > 0 ? avatars : STATIC_AVATARS as AvatarProfile[]).map((avatar) => ({
      ...normalizeAvatar(avatar as AvatarProfile),
      strengths: (avatar as any).strengths ?? avatar.tags?.join('、') ?? '风格协作',
      avoid: (avatar as any).avoid ?? avatar.avoid ?? '暂无',
      radar: (avatar as any).radar ?? [0.72,0.66,0.78,0.74,0.70],
      reps: avatar.reps ?? avatar.representativeWorks ?? [],
      statusType: (avatar as any).statusType ?? 'success',
    })),
    [avatars],
  );
  const [selectedId, setSelectedId] = useState<string | number>(visibleAvatars[0]?.id ?? 1);
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<Set<string | number>>(new Set());
  const canSummonFromContext = Boolean(requiredDirection && onSummonAvatar);

  useEffect(() => {
    setActiveDir(requiredDirection ?? '全部');
    setSelectedId((current) => {
      const currentAvatar = visibleAvatars.find((item) => item.id === current);
      if (!requiredDirection) return currentAvatar?.id ?? visibleAvatars[0]?.id ?? current;
      if (currentAvatar?.dir === requiredDirection) return current;
      return visibleAvatars.find((item) => item.dir === requiredDirection)?.id ?? current;
    });
  }, [requiredDirection, visibleAvatars]);

  const toggleStyle = (s: string) =>
    setActiveStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const toggleFav = (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast.info('已取消收藏'); }
      else { next.add(id); toast.success('已收藏该分身'); }
      return next;
    });
  };

  const summonAvatar = (id?: string | number) => {
    if (!canSummonFromContext) {
      toast.info('请先在创作台选择具体环节，再召唤对应分身');
      navigate('production');
      return;
    }
    const nextId = id ?? selectedId;
    if (id !== undefined) setSelectedId(id);
    const avatar = visibleAvatars.find((item) => item.id === nextId);
    if (requiredDirection && avatar?.dir !== requiredDirection) {
      toast.info(`当前环节只能选择${requiredDirection}分身`);
      return;
    }
    if (nextId !== undefined) onSummonAvatar?.(nextId);
    navigate('production');
  };

  const filtered = visibleAvatars.filter(av =>
    (!requiredDirection || av.dir === requiredDirection) &&
    (activeDir === '全部' || av.dir === activeDir) &&
    (activeStyles.length === 0 || activeStyles.some(s => av.tags.includes(s))) &&
    (!search || av.name.includes(search) || av.tags.some(t => t.includes(search)))
  );

  const sel = visibleAvatars.find(a => a.id === selectedId) ?? visibleAvatars[0];
  const selColor = (statusCol as Record<string, string>)[sel.statusType] ?? C.t2;

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: C.bg0 }}>

      {/* ─── Left: list ─── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: `1px solid rgba(255,255,255,0.05)`, flexShrink: 0 }}>
          <div>
            <h1 style={{ ...T.display, color: C.t0 }}>创作人分身网络</h1>
            <p style={{ ...T.caption, color: C.t2, marginTop: 4 }}>{requiredDirection ? `当前环节只允许选择${requiredDirection}分身，避免创作流程错位` : '浏览可召唤的创作人分身，发现适合你项目的协作者'}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', height: 34, width: 200, borderRadius: 10, background: C.bgCard, border: `1px solid ${C.bdr0}` }}>
              <Search size={12} color={C.t3} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索分身或风格…"
                style={{ background: 'transparent', border: 'none', outline: 'none', color: C.t1, ...T.caption, width: '100%' }} />
            </div>
            <button style={{ ...S.btnGhost, display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', height: 34, borderRadius: 10 }}>
              <SlidersHorizontal size={12} />
              <span style={{ fontSize: 12 }}>筛选</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ padding: '12px 28px', borderBottom: `1px solid rgba(255,255,255,0.05)`, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {DIR_TABS.map(tab => {
              if (requiredDirection && tab !== requiredDirection) return null;
              const active = activeDir === tab;
              return (
                <button key={tab} onClick={() => setActiveDir(tab)} style={{
                  padding: '5px 12px', borderRadius: 8, border: active ? `1px solid rgba(99,102,241,0.35)` : '1px solid transparent',
                  background: active ? C.accentDim : 'transparent',
                  color: active ? C.accentLight : C.t2, cursor: 'pointer', fontSize: 12, fontWeight: active ? 500 : 400,
                }}>{tab}</button>
              );
            })}
            <div style={{ flex: 1 }} />
            <span style={{ ...T.caption, color: C.t3 }}>排序：采纳率最高 ▾</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {STYLE_CHIPS.map(s => {
              const active = activeStyles.includes(s);
              return (
                <button key={s} onClick={() => toggleStyle(s)} style={{
                  padding: '3px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11,
                  background: active ? C.accentDim : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${active ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)'}`,
                  color: active ? C.accentLight : C.t2,
                }}>{s}</button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
          <p style={{ ...T.caption, color: C.t3, marginBottom: 14 }}>
            共 <span style={{ color: C.t1 }}>{filtered.length}</span> 位创作人分身
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 12 }}>
            {filtered.map(av => {
              const active = selectedId === av.id;
              const sc = (statusCol as Record<string, string>)[av.statusType] ?? C.t2;
              return (
                <GlassCard
                  key={av.id}
                  active={active}
                  style={{
                    cursor: 'pointer',
                    overflow: 'hidden',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                    transform: active ? 'translateY(-1px)' : 'translateY(0)',
                  }}
                  onClick={() => setSelectedId(av.id)}
                >
                  {/* Cover */}
                  <div style={{ height: 76, background: `linear-gradient(135deg, ${av.color}CC, ${av.color}44)`, position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '0 12px 10px' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 20%, rgba(16,19,29,0.42))' }} />
                    <span style={{ position: 'absolute', top: 8, right: 8, padding: '1px 6px', borderRadius: 4, background: 'rgba(16,19,29,0.55)', backdropFilter: 'blur(4px)', color: '#C8BBFF', fontSize: 9, fontWeight: 700 }}>Lv{av.lv}</span>
                    {active && (
                      <span style={{ position: 'absolute', right: 8, bottom: 10, padding: '2px 7px', borderRadius: 999, background: 'rgba(99,102,241,0.34)', border: '1px solid rgba(165,180,252,0.44)', color: C.accentLight, fontSize: 10, fontWeight: 700, backdropFilter: 'blur(6px)' }}>
                        已选择
                      </span>
                    )}
                    <div style={{ position: 'relative', width: 36, height: 36, borderRadius: 8, background: `${av.color}66`, border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>
                      {av.emoji}
                    </div>
                    <button
                      onClick={e => toggleFav(av.id, e)}
                      style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(16,19,29,0.48)', border: 'none', borderRadius: 6, padding: '3px 5px', cursor: 'pointer' }}
                    >
                      <Star size={11} color={favorites.has(av.id) ? C.warning : 'rgba(255,255,255,0.4)'} fill={favorites.has(av.id) ? C.warning : 'none'} />
                    </button>
                  </div>
                  {/* Body */}
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ ...T.caption, color: C.t0, fontWeight: 600 }}>{av.name}</span>
                      <Tag variant="dim">{av.dir}</Tag>
                    </div>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 7 }}>
                      {av.tags.slice(0,2).map(t => <Tag key={t} variant="dim">{t}</Tag>)}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                      <span style={{ ...T.label, color: C.t3 }}>召唤 {av.calls}次</span>
                      <span style={{ ...T.label, color: C.t3 }}>采纳 {av.adopt}%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 8px', borderRadius: 7, background: `${sc}10` }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: sc, flexShrink: 0 }} />
                      <span style={{ fontSize: 10, color: sc, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{av.status}</span>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Right: selected avatar detail ─── */}
      <div style={{ width: 280, flexShrink: 0, borderLeft: `1px solid rgba(255,255,255,0.05)`, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Cover */}
        <div style={{ height: 130, background: `linear-gradient(145deg, ${sel.color}CC, ${sel.color}44)`, position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '0 18px 14px', flexShrink: 0 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 35%, rgba(16,19,29,0.58))' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: `${sel.color}88`, border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{sel.emoji}</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ ...T.heading, color: C.t0 }}>{sel.name}</span>
                <span style={{ padding: '1px 5px', borderRadius: 4, background: 'rgba(99,102,241,0.4)', color: '#C8BBFF', fontSize: 9, fontWeight: 700 }}>Lv{sel.lv}</span>
              </div>
              <Tag variant="accent">{sel.dir}方向</Tag>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Primary action */}
          {canSummonFromContext ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, borderRadius: 12, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(129,140,248,0.28)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ ...T.label, color: C.accentLight, marginBottom: 2 }}>当前{requiredDirection}环节可召唤</p>
                  <p style={{ ...T.caption, color: C.t1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sel.name} · {sel.dir} · 采纳 {sel.adopt}%</p>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: selColor, boxShadow: `0 0 12px ${selColor}`, flexShrink: 0 }} />
              </div>
              <button onClick={() => summonAvatar()} style={{ ...S.btnPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 0', borderRadius: 10, width: '100%' }}>
                <Sparkles size={14} />
                召唤{requiredDirection}分身
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.035)', border: `1px solid ${C.bdr0}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ ...T.label, color: C.t2, marginBottom: 2 }}>分身档案预览</p>
                <p style={{ ...T.caption, color: C.t1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sel.name} · {sel.dir} · 采纳 {sel.adopt}%</p>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: selColor, boxShadow: `0 0 12px ${selColor}`, flexShrink: 0 }} />
            </div>
              <p style={{ ...T.label, color: C.t3, lineHeight: 1.6 }}>这里仅用于查看能力、风格和边界。召唤需要在创作台的具体环节发起，系统才会带上歌词、旋律等上游输入。</p>
              <button onClick={() => navigate('production')} style={{ ...S.btnGhost, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '9px 0', borderRadius: 10, width: '100%' }}>
                <Music size={13} />
                前往创作台选择环节
              </button>
            </div>
          )}

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
            {[{ l:'被召唤', v:`${sel.calls}次` },{ l:'采纳率', v:`${sel.adopt}%` },{ l:'代表作', v:`${sel.reps.length}首` }].map(s => (
              <div key={s.l} style={{ textAlign: 'center', padding: '8px 6px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.bdr0}` }}>
                <p style={{ color: C.t0, fontSize: 14, fontWeight: 700, fontFamily: "'Inter', monospace" }}>{s.v}</p>
                <p style={{ ...T.label, color: C.t3, marginTop: 2 }}>{s.l}</p>
              </div>
            ))}
          </div>

          {/* Radar */}
          <GlassCard pad={14} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ ...T.label, color: C.t3, marginBottom: 8 }}>能力分布</p>
            <RadarChart values={sel.radar} labels={['旋律感','节奏感','画面感','情感力','风格性']} size={148} />
          </GlassCard>

          {/* Motto */}
          <div style={{ padding: '10px 14px', borderRadius: 10, background: C.accentDim, border: `1px solid rgba(99,102,241,0.18)` }}>
            <p style={{ ...T.caption, color: C.t1, fontStyle: 'italic', lineHeight: 1.7 }}>「{sel.motto}」</p>
          </div>

          {/* Tags */}
          <div>
            <p style={{ ...T.label, color: C.t3, marginBottom: 6 }}>风格标签</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {sel.tags.map(t => <Tag key={t} variant="default">{t}</Tag>)}
            </div>
          </div>

          {/* Strengths */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
            <GlassCard pad={10}>
              <p style={{ color: C.success, fontSize: 10, marginBottom: 3 }}>擅长</p>
              <p style={{ ...T.caption, color: C.t1 }}>{sel.strengths}</p>
            </GlassCard>
            <GlassCard pad={10}>
              <p style={{ color: C.error, fontSize: 10, marginBottom: 3 }}>不擅长 / 不接受</p>
              <p style={{ ...T.caption, color: C.t1 }}>{sel.avoid}</p>
            </GlassCard>
          </div>

          {/* Rep works */}
          <div>
            <p style={{ ...T.label, color: C.t3, marginBottom: 6 }}>代表作品</p>
            {sel.reps.map((w, i) => (
              <div key={w} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, marginBottom: 4, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.bdr0}` }}>
                <Music size={11} color={C.t3} />
                <span style={{ ...T.caption, color: C.t1, flex: 1 }}>{w}</span>
                {i === 0 && <Tag variant="accent">代表作</Tag>}
              </div>
            ))}
          </div>

          {/* Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, background: `${selColor}10`, border: `1px solid ${selColor}30` }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: selColor }} />
            <span style={{ ...T.caption, color: selColor }}>{sel.status}</span>
          </div>

          {/* CTAs */}
          <button onClick={e => toggleFav(sel.id, e)} style={{ ...S.btnGhost, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '8px 0', borderRadius: 10, width: '100%' }}>
            <Star size={13} color={favorites.has(sel.id) ? C.warning : undefined} fill={favorites.has(sel.id) ? C.warning : 'none'} />
            {favorites.has(sel.id) ? '已收藏' : '收藏分身'}
          </button>
        </div>
      </div>
    </div>
  );
}
