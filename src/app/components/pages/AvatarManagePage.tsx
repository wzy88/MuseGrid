import { useState } from 'react';
import { TrendingUp, TrendingDown, ChevronRight, Check, Zap, Sparkles, BarChart2, Shield, RotateCcw, AlertCircle, Music } from 'lucide-react';
import { toast } from 'sonner';
import { Tag } from '../common/Tag';
import { RadarChart } from '../common/RadarChart';
import { Waveform } from '../common/Waveform';
import { GlassCard } from '../common/GlassCard';
import { C, T, S } from '../../design/tokens';
import type { Page } from '../layout/Sidebar';
import { AVATARS, normalizeAvatar, type AvatarProfile } from '../../state/mockProject';

const AV = {
  name: '林间小调', dir: '作词', lv: 4, xp: 720, maxXp: 1000,
  calls: 560, adopt: 84, maint: 87, fidelity: 82, earnings: 168.50,
  tags: ['古风', '情感叙事', '画面感'],
  motto: '「先找情绪转折点，再让 Hook 把故事收回来。」',
  radar: [0.85, 0.70, 0.90, 0.75, 0.80],
  styleWeights: [
    { key: '古风',    w: 0.72, delta: +0.08 },
    { key: '情感叙事', w: 0.64, delta: +0.05 },
    { key: '画面感',  w: 0.71, delta:  0 },
    { key: '电子国风', w: 0.20, delta: 'new' as const },
    { key: '口语化',  w: 0.55, delta: -0.05 },
  ],
  repContribs: [
    { work: '山海之旅', step: '作词', adopt: 92, date: '06-20', seed: 3 },
    { work: '光年以外', step: '作词', adopt: 88, date: '06-18', seed: 15 },
    { work: '城市夜语', step: '作词', adopt: 80, date: '06-22', seed: 7 },
  ],
  growth: [
    { lv: 1, label: '分身创建',          done: true },
    { lv: 2, label: '10次召唤',          done: true },
    { lv: 3, label: '采纳率 > 70%',      done: true },
    { lv: 4, label: '100次召唤',         done: true },
    { lv: 5, label: '采纳率 > 85% + 进化3次', done: false },
  ],
};

const QUEUE = [
  { id:1, type:'calibration', urgent:true,  title:'进化报告待处理',   desc:'完成了 100 次新召唤，本周期有 2 个方向值得校准。预计 3 分钟。', action:'开始校准',  page:'evolutionReport' as Page },
  { id:2, type:'sample',      urgent:false, title:'风格样本补充建议', desc:'古风类型作品样本偏少，建议补充 2-3 首代表作以提高分身精度。', action:'上传样本',  page:null },
  { id:3, type:'explore',     urgent:false, title:'新风格探索任务',   desc:'系统检测到你近期对电子国风有兴趣，建议完成一首作品来强化该方向。', action:'接受任务', page:'production' as Page },
];

const HISTORY = [
  { date:'2026-06-10', summary:'古风权重 +0.08，新增「电子国风」探索标签', result:'已确认' },
  { date:'2026-05-28', summary:'情感叙事 +0.05，降低重复意象「月/霜」频率', result:'已确认' },
  { date:'2026-05-12', summary:'口语化 -0.05，强化画面感输出约束', result:'已确认' },
];

function managedAvatar(profile?: AvatarProfile | null) {
  const avatar = normalizeAvatar(profile ?? AVATARS[0]);
  const styleEntries = Object.entries(avatar.styleWeights || {});
  return {
    ...AV,
    ...avatar,
    xp: avatar.lv * 180,
    maxXp: Math.max(1000, (avatar.lv + 1) * 220),
    maint: avatar.status.includes('自动发布') ? 78 : avatar.status === '本地保存' ? 72 : AV.maint,
    fidelity: avatar.status.includes('自动发布') ? 76 : avatar.status === '本地保存' ? 68 : AV.fidelity,
    earnings: avatar.calls > 0 ? AV.earnings : 0,
    radar: (avatar as any).radar ?? AV.radar,
    styleWeights: styleEntries.length > 0
      ? styleEntries.map(([key, w]) => ({ key, w, delta: key === '电子国风' ? 'new' as const : 0 }))
      : AV.styleWeights,
    repContribs: (avatar.representativeWorks || avatar.reps || []).length > 0
      ? (avatar.representativeWorks || avatar.reps || []).map((work, index) => ({ work, step: avatar.dir, adopt: Math.max(60, avatar.adopt || 70), date: '刚刚', seed: index + 2 }))
      : AV.repContribs,
  };
}

export function AvatarManagePage({ navigate, avatars = AVATARS, activeAvatarId = null }: { navigate: (p: Page) => void; avatars?: AvatarProfile[]; activeAvatarId?: string | number | null }) {
  const [tab, setTab] = useState<'overview'|'growth'|'history'>('overview');
  const [paused, setPaused] = useState(false);
  const [notifs, setNotifs] = useState({ strong: true, weak: true, milestone: false });
  const selected = avatars.find((avatar) => avatar.id === activeAvatarId) ?? avatars[0] ?? AVATARS[0];
  const av = managedAvatar(selected);
  const autoPublished = String(av.status || '').includes('自动发布');

  function handleUploadSample() {
    toast.info('样本上传功能将在 Phase 2 正式开放，当前可通过校准会话补充案例');
  }
  function handlePause() {
    setPaused(v => !v);
    toast.success(paused ? '分身已恢复对外召唤' : '分身已暂停对外召唤，仅你本人可使用');
  }
  function handleRollback() {
    toast.loading('正在回滚上一轮参数…');
    setTimeout(() => { toast.dismiss(); toast.success('参数已回滚至第 2 轮校准状态'); }, 1500);
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: C.bg0 }}>

      {/* ─── Left: avatar summary ─── */}
      <div style={{ width: 216, flexShrink: 0, borderRight: `1px solid rgba(255,255,255,0.05)`, overflowY: 'auto', padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Card */}
        <GlassCard style={{ overflow: 'hidden' }}>
          <div style={{ height: 88, background: 'linear-gradient(135deg, #2D1B6988, #1A3A4A88)', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '0 14px 10px' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(6,7,15,0.5))' }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg,#6366F1,#C084FC)', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>✍️</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span style={{ ...T.subheading, color: C.t0 }}>{av.name}</span>
                  <span style={{ padding: '1px 5px', borderRadius: 4, background: 'rgba(99,102,241,0.4)', color: '#C8BBFF', fontSize: 9, fontWeight: 700 }}>Lv{av.lv}</span>
                </div>
                <Tag variant="accent">{av.dir}</Tag>
              </div>
            </div>
          </div>
          <div style={{ padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ ...T.label, color: C.t3 }}>经验值</span>
              <span style={{ ...T.label, color: C.accentLight, fontWeight: 600 }}>{av.xp}/{av.maxXp}</span>
            </div>
            <div style={{ height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.08)', marginBottom: 8 }}>
              <div style={{ height: '100%', borderRadius: 999, width: `${(av.xp/av.maxXp)*100}%`, background: `linear-gradient(90deg,${C.accent},${C.accentLight})` }} />
            </div>
            <p style={{ ...T.label, color: C.t3 }}>距 Lv5 还需 <span style={{ color: C.accentLight }}>{av.maxXp-av.xp} XP</span></p>
          </div>
        </GlassCard>

        {/* Stats */}
        {[
          { label:'被召唤',  value:`${av.calls}次`, color:C.accent,   trend:+12 },
          { label:'采纳率',  value:`${av.adopt}%`,  color:C.success,  trend:+3  },
          { label:'维护评分', value:`${av.maint}`,   color:C.warning,  trend:0   },
          { label:'人格保真', value:`${av.fidelity}%`, color:C.cyan,  trend:-2  },
          { label:'模拟收益', value:`¥${av.earnings.toFixed(0)}`, color:C.accentLight, trend:+8 },
        ].map(s => (
          <div key={s.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 12px', borderRadius:10, background:C.bgCard, border:`1px solid ${C.bdr0}` }}>
            <div>
              <p style={{ color:s.color, fontSize:15, fontWeight:700, fontFamily:"'Inter',monospace" }}>{s.value}</p>
              <p style={{ ...T.label, color:C.t3, marginTop:1 }}>{s.label}</p>
            </div>
            {s.trend !== 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:3 }}>
                {s.trend > 0 ? <TrendingUp size={11} color={C.success}/> : <TrendingDown size={11} color={C.error}/>}
                <span style={{ fontSize:10, color: s.trend>0 ? C.success : C.error }}>{s.trend>0?'+':''}{s.trend}</span>
              </div>
            )}
          </div>
        ))}

        {/* Status */}
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:10, background:paused?C.warningDim:C.successDim, border:`1px solid ${paused?'rgba(245,158,11,0.25)':'rgba(16,185,129,0.2)'}` }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background: paused?C.warning:C.success }} />
          <span style={{ ...T.caption, color: paused?C.warning:'#34D399' }}>{paused?'已暂停对外召唤':autoPublished?'自动发布 · 可被召唤':'状态良好'}</span>
        </div>
      </div>

      {/* ─── Center ─── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:`1px solid rgba(255,255,255,0.05)`, flexShrink:0 }}>
          <div>
            <h1 style={{ ...T.display, color:C.t0 }}>分身管理</h1>
            <p style={{ ...T.caption, color:C.t2, marginTop:4 }}>维护你的分身资产，查看成长轨迹</p>
          </div>
          <button onClick={() => navigate('evolutionReport')} style={{ ...S.btnPrimary, display:'flex', alignItems:'center', gap:8, padding:'9px 18px', borderRadius:10, position:'relative' }}>
            <BarChart2 size={14}/>
            查看进化报告
            <span style={{ position:'absolute', top:-3, right:-3, width:9, height:9, borderRadius:'50%', background:C.warning, border:`2px solid ${C.bg0}` }}/>
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, padding:'12px 24px', borderBottom:`1px solid rgba(255,255,255,0.05)`, flexShrink:0 }}>
          {(['overview','growth','history'] as const).map(t => {
            const lbl = { overview:'概览', growth:'成长路径', history:'校准记录' };
            const active = tab === t;
            return (
              <button key={t} onClick={() => setTab(t)} style={{ padding:'5px 14px', borderRadius:8, border: active?`1px solid rgba(99,102,241,0.35)`:'1px solid transparent', background: active?C.accentDim:'transparent', color: active?C.accentLight:C.t2, cursor:'pointer', fontSize:12, fontWeight: active?500:400 }}>
                {lbl[t]}
              </button>
            );
          })}
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>

          {tab==='overview' && (
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <GlassCard pad={16} glow="success">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14 }}>
                  <div>
                    <p style={{ ...T.subheading, color:C.t0, marginBottom:6 }}>发布与召唤状态</p>
                    <p style={{ ...T.caption, color:C.t2, lineHeight:1.7 }}>
                      体验阶段暂不接入审核后台。分身创建成功后默认自动发布，并立即进入分身网络，可被创作链路按对应领域召唤。
                    </p>
                  </div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'flex-end', flexShrink:0 }}>
                    <Tag variant="success">自动发布</Tag>
                    <Tag variant="accent">可被召唤</Tag>
                    <Tag variant="dim">{av.dir}领域</Tag>
                  </div>
                </div>
              </GlassCard>

              {/* Queue */}
              <div>
                <p style={{ ...T.subheading, color:C.t0, marginBottom:10 }}>
                  维护队列
                  <span style={{ marginLeft:8, padding:'2px 7px', borderRadius:999, background:C.warningDim, color:C.warning, fontSize:10 }}>{QUEUE.length}项</span>
                </p>
                {QUEUE.map(task => (
                  <GlassCard key={task.id} glow={task.urgent?'warning':'none'} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:16, marginBottom:8 }}>
                    <div style={{ width:32, height:32, borderRadius:8, flexShrink:0, background: task.urgent?C.warningDim:C.accentDim, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {task.type==='calibration'?<Zap size={15} color={C.warning}/>:task.type==='sample'?<Music size={15} color={C.accentLight}/>:<Sparkles size={15} color={C.accentLight}/>}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                        <p style={{ ...T.caption, color:C.t0, fontWeight:500 }}>{task.title}</p>
                        {task.urgent && <Tag variant="warning">需处理</Tag>}
                      </div>
                      <p style={{ ...T.caption, color:C.t2, lineHeight:1.6 }}>{task.desc}</p>
                    </div>
                    <button
                      onClick={() => task.page ? navigate(task.page) : handleUploadSample()}
                      style={{ ...task.urgent ? S.btnPrimary : S.btnAccentOutline, display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:8, fontSize:12, flexShrink:0 }}
                    >
                      {task.action}<ChevronRight size={11}/>
                    </button>
                  </GlassCard>
                ))}
              </div>

              {/* Style weights */}
              <GlassCard pad={18}>
                <p style={{ ...T.subheading, color:C.t0, marginBottom:14 }}>当前风格参数</p>
                {av.styleWeights.map(sw => {
                  const isNew = sw.delta==='new';
                  const isUp  = typeof sw.delta==='number' && sw.delta>0;
                  const isDn  = typeof sw.delta==='number' && sw.delta<0;
                  return (
                    <div key={sw.key} style={{ marginBottom:12 }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
                        <span style={{ ...T.caption, color:C.t1 }}>{sw.key}</span>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <span style={{ padding:'1px 6px', borderRadius:4, fontSize:9, fontWeight:500,
                            background: isNew?C.accentDim:isUp?C.successDim:isDn?C.errorDim:'rgba(255,255,255,0.05)',
                            color: isNew?C.accentLight:isUp?C.success:isDn?C.error:C.t3 }}>
                            {isNew?'新增':isUp?`+${sw.delta}`:isDn?sw.delta:'—'}
                          </span>
                          <span style={{ color:C.t0, fontSize:12, fontWeight:600, fontFamily:"'Inter',monospace" }}>{Math.round(sw.w*100)}%</span>
                        </div>
                      </div>
                      <div style={{ height:4, borderRadius:999, background:'rgba(255,255,255,0.07)' }}>
                        <div style={{ height:'100%', borderRadius:999, width:`${sw.w*100}%`, background: isUp?`linear-gradient(90deg,${C.accent},${C.success})`:C.accent, transition:'width 0.4s' }}/>
                      </div>
                    </div>
                  );
                })}
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
                  <p style={{ ...T.label, color:C.t3 }}>上次更新：2026-06-10 · 第3轮校准</p>
                  <button onClick={() => navigate('calibration')} style={{ ...S.btnAccentOutline, padding:'3px 10px', borderRadius:6, fontSize:11 }}>手动触发校准</button>
                </div>
              </GlassCard>

              {/* Rep contribs */}
              <div>
                <p style={{ ...T.subheading, color:C.t0, marginBottom:10 }}>代表贡献</p>
                {av.repContribs.map(c => (
                  <GlassCard key={c.work} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', marginBottom:6 }}>
                    <div style={{ width:34, height:34, borderRadius:8, background:'rgba(255,255,255,0.04)', border:`1px solid ${C.bdr0}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Music size={14} color={C.t3}/>
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ ...T.caption, color:C.t0, fontWeight:500, marginBottom:3 }}>{c.work}</p>
                      <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                        <Tag variant="dim">{c.step}</Tag>
                        <span style={{ ...T.label, color:C.t3 }}>{c.date}</span>
                      </div>
                    </div>
                    <Waveform bars={22} progress={0} height={20} seed={c.seed} inactiveColor="rgba(255,255,255,0.1)"/>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <p style={{ color:C.success, fontSize:13, fontWeight:700 }}>{c.adopt}%</p>
                      <p style={{ ...T.label, color:C.t3 }}>采纳率</p>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {tab==='growth' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
              <GlassCard pad={18}>
                <p style={{ ...T.subheading, color:C.t0, marginBottom:16 }}>成长路径</p>
                {av.growth.map((step, idx) => {
                  const doneCnt = av.growth.filter(s=>s.done).length;
                  const isCurrent = idx===doneCnt;
                  return (
                    <div key={step.lv} style={{ display:'flex', gap:10 }}>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                        <div style={{ width:24, height:24, borderRadius:'50%', border:`2px solid ${step.done?C.success:isCurrent?C.accent:'rgba(255,255,255,0.1)'}`, background:step.done?C.successDim:isCurrent?C.accentDim:'transparent', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:isCurrent?`0 0 12px rgba(99,102,241,0.4)`:'' }}>
                          {step.done?<Check size={11} color={C.success}/>:<span style={{ fontSize:9, fontWeight:700, color:isCurrent?C.accentLight:C.t3 }}>{step.lv}</span>}
                        </div>
                        {idx<av.growth.length-1&&<div style={{ width:2, flex:1, minHeight:28, margin:'3px 0', background:step.done?`rgba(16,185,129,0.3)`:'rgba(255,255,255,0.06)' }}/>}
                      </div>
                      <div style={{ paddingBottom:14, paddingTop:2 }}>
                        <p style={{ ...T.caption, color:step.done?'#34D399':isCurrent?C.t0:C.t3, fontWeight:isCurrent?500:400 }}>Lv{step.lv}：{step.label}</p>
                        {isCurrent&&<p style={{ ...T.label, color:C.accentLight, marginTop:2 }}>当前目标</p>}
                      </div>
                    </div>
                  );
                })}
              </GlassCard>
              <GlassCard pad={18} style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                <p style={{ ...T.subheading, color:C.t0, marginBottom:12, alignSelf:'flex-start' }}>能力雷达</p>
                <RadarChart values={av.radar} labels={['旋律感','节奏感','画面感','情感力','风格性']} size={180}/>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:4, marginTop:12, width:'100%' }}>
                  {['旋律感','节奏感','画面感','情感力','风格性'].map((l,i)=>(
                    <div key={l} style={{ textAlign:'center' }}>
                      <p style={{ color:C.accent, fontSize:12, fontWeight:700 }}>{Math.round(av.radar[i]*100)}</p>
                      <p style={{ ...T.label, color:C.t3, fontSize:9 }}>{l}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
              <GlassCard pad={16} style={{ gridColumn:'1/-1' }}>
                <p style={{ ...T.subheading, color:C.accentLight, marginBottom:12 }}>升级到 Lv5 的条件</p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                  {[
                    { label:'采纳率 > 85%', cur:`${av.adopt}%`, target:'85%', met: av.adopt>85 },
                    { label:'进化次数 ≥ 3',  cur:'3次',  target:'3次',  met: true  },
                    { label:'作品数 ≥ 5首',  cur:'3首',  target:'5首',  met: false },
                  ].map(req=>(
                    <GlassCard key={req.label} glow={req.met?'success':'none'} pad={12}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                        {req.met?<Check size={11} color={C.success}/>:<AlertCircle size={11} color={C.t3}/>}
                        <span style={{ ...T.caption, color:req.met?'#34D399':C.t1, fontWeight:500 }}>{req.label}</span>
                      </div>
                      <p style={{ color:C.t0, fontSize:16, fontWeight:700, fontFamily:"'Inter',monospace" }}>{req.cur}</p>
                      <p style={{ ...T.label, color:C.t3, marginTop:2 }}>目标：{req.target}</p>
                    </GlassCard>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}

          {tab==='history' && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <p style={{ ...T.subheading, color:C.t0, marginBottom:4 }}>校准历史记录</p>
              {HISTORY.map((h,idx)=>(
                <GlassCard key={h.date} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:16 }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:0, flexShrink:0 }}>
                    <div style={{ width:26, height:26, borderRadius:'50%', background:C.successDim, border:`2px solid ${C.success}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Check size={11} color={C.success}/>
                    </div>
                    {idx<HISTORY.length-1&&<div style={{ width:2, height:28, background:'rgba(16,185,129,0.2)', marginTop:3 }}/>}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ ...T.label, color:C.t3 }}>第{HISTORY.length-idx}轮 · {h.date}</span>
                      <Tag variant="success">{h.result}</Tag>
                    </div>
                    <p style={{ ...T.caption, color:C.t1, lineHeight:1.6 }}>{h.summary}</p>
                  </div>
                </GlassCard>
              ))}
              <button onClick={()=>navigate('calibration')} style={{ ...S.btnAccentOutline, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'11px 0', borderRadius:12, width:'100%', marginTop:4 }}>
                <Sparkles size={13}/> 触发新一轮校准
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Right: actions ─── */}
      <div style={{ width:248, flexShrink:0, borderLeft:`1px solid rgba(255,255,255,0.05)`, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:12 }}>
        <p style={{ ...T.label, color:C.t3 }}>快捷操作</p>

        {[
          { label:'查看进化报告', sub:'本周期有2个方向待校准', page:'evolutionReport' as Page, urgent:true,  icon:BarChart2 },
          { label:'开始3分钟校准', sub:'帮助分身更像你本人',   page:'calibration'    as Page, urgent:false, icon:Zap },
        ].map(a=>(
          <GlassCard key={a.label} glow={a.urgent?'warning':'none'} style={{ display:'flex', alignItems:'center', gap:10, padding:14, cursor:'pointer' }} onClick={()=>navigate(a.page)}>
            <div style={{ width:30, height:30, borderRadius:8, background:a.urgent?C.warningDim:C.accentDim, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <a.icon size={14} color={a.urgent?C.warning:C.accentLight}/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ ...T.caption, color:C.t0, fontWeight:500 }}>{a.label}</p>
              <p style={{ ...T.label, color:C.t3, marginTop:2 }}>{a.sub}</p>
            </div>
            <ChevronRight size={12} color={C.t3}/>
          </GlassCard>
        ))}

        <button onClick={handlePause} style={{ ...S.btnGhost, display:'flex', alignItems:'center', gap:10, padding:14, borderRadius:12, width:'100%', textAlign:'left' }}>
          <div style={{ width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Shield size={14} color={paused?C.warning:C.t2}/>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ ...T.caption, color:C.t1, fontWeight:500 }}>{paused?'恢复对外召唤':'暂停被外部召唤'}</p>
            <p style={{ ...T.label, color:C.t3, marginTop:2 }}>{paused?'当前：仅你可使用':'临时设为不可召唤'}</p>
          </div>
        </button>

        <button onClick={handleRollback} style={{ ...S.btnGhost, display:'flex', alignItems:'center', gap:10, padding:14, borderRadius:12, width:'100%', textAlign:'left' }}>
          <div style={{ width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <RotateCcw size={14} color={C.t2}/>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ ...T.caption, color:C.t1, fontWeight:500 }}>回滚上一轮参数</p>
            <p style={{ ...T.label, color:C.t3, marginTop:2 }}>恢复至第2轮校准状态</p>
          </div>
        </button>

        {/* Earnings */}
        <GlassCard pad={14} glow="accent">
          <p style={{ ...T.caption, color:C.accentLight, fontWeight:500, marginBottom:6 }}>模拟收益预览</p>
          <p style={{ color:C.accent, fontSize:24, fontWeight:800, fontFamily:"'Inter',monospace", marginBottom:4 }}>¥{av.earnings.toFixed(2)}</p>
          <p style={{ ...T.label, color:C.t3, marginBottom:10 }}>累计模拟分配（展示用）</p>
          {[
            { label:'山海之旅（作词20%）', value:'¥1.68' },
            { label:'光年以外（作词20%）', value:'¥1.04' },
            { label:'其他项目（共15首）',  value:'¥165.78' },
          ].map(r=>(
            <div key={r.label} style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ ...T.label, color:C.t2, fontSize:10 }}>{r.label}</span>
              <span style={{ ...T.label, color:C.accentLight, fontWeight:500 }}>{r.value}</span>
            </div>
          ))}
          <p style={{ ...T.label, color:C.t3, marginTop:8, fontSize:9 }}>*Phase 4 开放真实结算</p>
        </GlassCard>

        {/* Notification settings */}
        <GlassCard pad={14}>
          <p style={{ ...T.caption, color:C.t1, fontWeight:500, marginBottom:10 }}>校准提醒设置</p>
          {([
            { key:'strong'    as const, label:'强提醒（异常触发）' },
            { key:'weak'      as const, label:'弱提醒（周期累计）' },
            { key:'milestone' as const, label:'成长里程碑提醒' },
          ]).map(s=>(
            <div key={s.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ ...T.caption, color:C.t2 }}>{s.label}</span>
              <button
                onClick={() => { setNotifs(prev=>({...prev,[s.key]:!prev[s.key]})); toast.success(`${s.label}已${notifs[s.key]?'关闭':'开启'}`); }}
                style={{ width:34, height:20, borderRadius:999, border:'none', cursor:'pointer', position:'relative', background:notifs[s.key]?C.accent:'rgba(255,255,255,0.1)', transition:'background 0.2s' }}
              >
                <div style={{ position:'absolute', top:3, width:14, height:14, borderRadius:'50%', background:'#fff', left:notifs[s.key]?17:3, transition:'left 0.2s' }}/>
              </button>
            </div>
          ))}
        </GlassCard>
      </div>
    </div>
  );
}
