import { useEffect, useRef, useState } from 'react';
import { Play, Share2, Download, ChevronRight, Eye, Heart, FileText, Link2, Sparkles, Check, ArrowLeft, TrendingUp, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Waveform } from '../common/Waveform';
import { Tag } from '../common/Tag';
import { GlassCard } from '../common/GlassCard';
import { C, T, S } from '../../design/tokens';
import type { Page } from '../layout/Sidebar';
import { SAMPLE_WORKS, type GeneratedWork } from '../../state/mockProject';

const DAY_DATA = [120,210,180,290,150,190,100];
const DAY_LABELS = ['6/19','6/20','6/21','6/22','6/23','6/24','6/25'];
const PROTOCOLS = [
  { key:'internal',    label:'内部使用',   desc:'仅平台内播放和分享',      icon:'🔒' },
  { key:'nonexclusive',label:'非独家发布', desc:'可在外部平台发布',        icon:'📢' },
  { key:'exclusive',   label:'独家发行',   desc:'由平台代理发行结算',      icon:'⭐' },
  { key:'commercial',  label:'商业授权',   desc:'广告、游戏、品牌场景',    icon:'💼' },
];

const statusLabel: Record<string, string> = { done:'已完成', active:'制作中', draft:'草稿' };
const statusColor: Record<string, string> = { done: C.success, active: C.warning, draft: C.t2 };

export function MyWorksPage({
  navigate,
  works = SAMPLE_WORKS,
  activeWorkId = null,
  onPlayWork,
  playingWorkId = null,
}: {
  navigate: (p: Page) => void;
  works?: GeneratedWork[];
  activeWorkId?: string | number | null;
  onPlayWork?: (work: GeneratedWork) => void;
  playingWorkId?: string | number | null;
}) {
  const [tab, setTab] = useState('全部');
  const [sel, setSel] = useState<GeneratedWork|null>(() => works.find((work) => work.id === activeWorkId) ?? null);
  useEffect(() => {
    if (activeWorkId === null) return;
    const active = works.find((work) => work.id === activeWorkId);
    if (active) setSel(active);
  }, [activeWorkId, works]);
  if (sel) return <WorkResult work={sel} onBack={()=>setSel(null)} navigate={navigate} onPlayWork={onPlayWork} playing={playingWorkId === sel.id}/>;

  const filtered = works.filter(w => tab==='全部'||(tab==='已完成'&&w.status==='done')||(tab==='进行中'&&w.status==='active')||(tab==='草稿'&&w.status==='draft'));

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', background:C.bg0 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 28px', borderBottom:`1px solid rgba(255,255,255,0.05)`, flexShrink:0 }}>
        <div>
          <h1 style={{ ...T.display, color:C.t0 }}>我的作品</h1>
          <p style={{ ...T.caption, color:C.t2, marginTop:4 }}>管理歌曲项目，查看 Demo 和贡献记录</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {[{l:'总项目',v:works.length},{l:'已完成 Demo',v:works.filter(w=>w.status==='done').length},{l:'模拟收益',v:`¥${works.reduce((s,w)=>s+w.earnings,0).toFixed(2)}`}].map(s=>(
            <div key={s.l} style={{ textAlign:'center', padding:'8px 14px', borderRadius:10, background:C.bgCard, border:`1px solid ${C.bdr0}` }}>
              <p style={{ color:C.t0, fontSize:16, fontWeight:700, fontFamily:"'Inter',monospace" }}>{s.v}</p>
              <p style={{ ...T.label, color:C.t3, marginTop:1 }}>{s.l}</p>
            </div>
          ))}
          <button onClick={()=>navigate('production')} style={{ ...S.btnPrimary, display:'flex', alignItems:'center', gap:8, padding:'9px 16px', borderRadius:10 }}>
            <Sparkles size={13}/>新建项目
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, padding:'12px 28px', borderBottom:`1px solid rgba(255,255,255,0.05)`, flexShrink:0 }}>
        {['全部','已完成','进行中','草稿'].map(t=>{
          const cnt = t==='全部'?works.length:works.filter(w=>(t==='已完成'&&w.status==='done')||(t==='进行中'&&w.status==='active')||(t==='草稿'&&w.status==='draft')).length;
          const active = tab===t;
          return (
            <button key={t} onClick={()=>setTab(t)} style={{ padding:'5px 14px', borderRadius:8, border:active?`1px solid rgba(99,102,241,0.35)`:'1px solid transparent', background:active?C.accentDim:'transparent', color:active?C.accentLight:C.t2, cursor:'pointer', fontSize:12, fontWeight:active?500:400 }}>
              {t} <span style={{ marginLeft:4, fontSize:10, color:active?C.accent:C.t3 }}>{cnt}</span>
            </button>
          );
        })}
      </div>

      {/* List */}
      <div style={{ flex:1, overflowY:'auto', padding:'20px 28px', display:'flex', flexDirection:'column', gap:8 }}>
        {filtered.map(w=>(
          <GlassCard key={w.id} style={{ display:'flex', alignItems:'center', gap:16, padding:'12px 16px', cursor:'pointer' }} onClick={()=>setSel(w)}>
            <div style={{ width:48, height:48, borderRadius:10, flexShrink:0, background:`linear-gradient(135deg,${w.color}BB,${w.color}44)`, border:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🎵</div>
            <div style={{ width:200, minWidth:200 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
                <span style={{ ...T.subheading, color:C.t0 }}>{w.title}</span>
                <span style={{ fontSize:10, color:statusColor[w.status], background:`${statusColor[w.status]}18`, padding:'1px 6px', borderRadius:4 }}>{statusLabel[w.status]}</span>
              </div>
              <div style={{ display:'flex', gap:4 }}>{w.tags.map(t=><Tag key={t} variant="dim">{t}</Tag>)}</div>
            </div>
            <div style={{ width:120 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ ...T.label, color:C.t3 }}>制作进度</span>
                <span style={{ ...T.label, color:C.t2 }}>{w.stepsDone}/4步</span>
              </div>
              <div style={{ display:'flex', gap:3 }}>
                {[0,1,2,3].map(i=><div key={i} style={{ flex:1, height:3, borderRadius:999, background:i<w.stepsDone?C.accent:'rgba(255,255,255,0.08)' }}/>)}
              </div>
            </div>
            <div style={{ flex:1 }}>
              {w.status==='done'
                ?<Waveform bars={40} progress={0} height={28} seed={w.seed} inactiveColor="rgba(255,255,255,0.09)"/>
                :<span style={{ ...T.caption, color:C.t3 }}>{w.desc}</span>}
            </div>
            {w.status==='done' && (
              <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:4 }}><Eye size={11} color={C.t3}/><span style={{ ...T.caption, color:C.t2 }}>{w.plays.toLocaleString()}</span></div>
                <div style={{ display:'flex', alignItems:'center', gap:4 }}><Heart size={11} color={C.t3}/><span style={{ ...T.caption, color:C.t2 }}>{w.likes}</span></div>
                <span style={{ color:C.accentLight, fontSize:12, fontWeight:600 }}>¥{w.earnings.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
              {w.status==='done' && <button aria-label={`播放${w.title}`} style={{ width:30, height:30, borderRadius:'50%', background:C.accent, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 12px rgba(99,102,241,0.4)' }} onClick={e=>{e.stopPropagation(); onPlayWork?.(w);}}><Play size={12} color="#fff" fill="#fff"/></button>}
              {w.status==='active' && <button style={{ ...S.btnAccentOutline, display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:8, fontSize:11 }} onClick={e=>{e.stopPropagation();navigate('production');}}>继续制作<ChevronRight size={10}/></button>}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function WorkResult({ work, onBack, navigate, onPlayWork, playing = false }: { work: GeneratedWork; onBack:()=>void; navigate:(p:Page)=>void; onPlayWork?: (work: GeneratedWork) => void; playing?: boolean }) {
  const [protocol, setProtocol] = useState(work.protocol);
  const [protocolConfirmed, setProtocolConfirmed] = useState(false);
  const maxD = Math.max(...DAY_DATA);

  function shareLink() {
    if (work.shareUrl) return `${window.location.origin}${window.location.pathname}?work=${encodeURIComponent(String(work.id))}`;
    return `${window.location.origin}${window.location.pathname}?work=${encodeURIComponent(String(work.id))}`;
  }
  async function handleShare() {
    if (!work.shareUrl || String(work.id).startsWith('local_work_')) {
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
  function handleExport() { toast.info('正在准备导出包，包含 Demo 音频、歌词和 Prompt…'); setTimeout(()=>toast.success('导出完成，已保存到下载目录'),2000); }
  function handleProtocolConfirm() { setProtocolConfirmed(true); toast.success(`协议「${PROTOCOLS.find(p=>p.key===protocol)?.label}」已确认并记录`); }
  function handlePromo() { toast.info('推广分身正在准备素材包，包含标题候选、封面方向和发布文案…'); }
  function handlePublish() { navigate('contribution'); toast.info('正在准备发行 checklist，跳转至贡献链路查看'); }
  const hasAudio = Boolean(work.audioUrl);
  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden', background:C.bg0 }}>
      <div style={{ flex:1, overflowY:'auto' }}>
        {/* Breadcrumb */}
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'14px 28px', borderBottom:`1px solid rgba(255,255,255,0.05)`, flexShrink:0 }}>
          <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:C.t2, ...T.caption }}><ArrowLeft size={13}/>我的作品</button>
          <ChevronRight size={12} color={C.t3}/>
          <span style={{ ...T.caption, color:C.t1 }}>{work.title}</span>
        </div>

        <div style={{ padding:'24px 28px', display:'flex', flexDirection:'column', gap:24 }}>
          {/* Hero */}
          <div style={{ display:'flex', gap:20, alignItems:'flex-start' }}>
            <div style={{ width:128, height:128, borderRadius:16, flexShrink:0, background:`linear-gradient(135deg,${work.color}DD,${work.color}66)`, border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:48 }}>🎵</div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8 }}>
                <div>
                  <h1 style={{ ...T.display, color:C.t0, marginBottom:6 }}>{work.title}</h1>
                  <div style={{ display:'flex', gap:5 }}>{work.tags.map(t=><Tag key={t} variant="default">{t}</Tag>)}<span style={{ ...T.caption, color:C.t3 }}>· {work.duration}</span></div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={handleShare} style={{ ...S.btnGhost, display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:10, fontSize:12 }}><Share2 size={13}/>分享</button>
                  <button onClick={handleExport} style={{ ...S.btnGhost, display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:10, fontSize:12 }}><Download size={13}/>导出</button>
                </div>
              </div>
              <GlassCard pad={16}>
                <Waveform bars={60} progress={0.35} height={48} seed={work.seed} activeColor={C.accent} inactiveColor="rgba(255,255,255,0.08)"/>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:12 }}>
                  {work.status === 'done' && (
                    <button
                      aria-label={`播放${work.title}`}
                      onClick={() => onPlayWork?.(work)}
                      style={{ ...S.btnPrimary, display:'flex', alignItems:'center', gap:8, padding:'8px 16px', borderRadius:10, opacity:hasAudio?1:0.78 }}
                    >
                      <Play size={13} color="#fff" fill="#fff"/>{hasAudio ? (playing ? '正在播放' : '播放') : '暂无音频'}
                    </button>
                  )}
                  <span style={{ ...T.caption, color:C.t2 }}>{playing ? '已进入底部播放器' : '点击播放后进入底部播放器'}</span>
                  {work.generationSource && <Tag variant={work.generationSource.startsWith('minimax') ? 'success' : 'dim'}>{work.generationSource.startsWith('minimax') ? '真实音频' : '体验 Demo'}</Tag>}
                  <div style={{ flex:1, height:3, borderRadius:999, background:'rgba(255,255,255,0.08)' }}>
                    <div style={{ height:'100%', width:'35%', background:C.accent, borderRadius:999 }}/>
                  </div>
                  <span style={{ ...T.caption, color:C.t3, whiteSpace:'nowrap' }}>{work.duration}</span>
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Stats */}
          {work.status==='done' && (
            <>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10 }}>
                {[
                  { icon:Eye,        label:'总播放', value:work.plays.toLocaleString(), color:C.cyan },
                  { icon:Heart,      label:'点赞',   value:work.likes,                  color:C.error },
                  { icon:Share2,     label:'分享',   value:work.shares,                 color:C.success },
                  { icon:TrendingUp, label:'完播率', value:`${work.completion}%`,       color:C.warning },
                  { icon:Sparkles,   label:'模拟收益', value:`¥${work.earnings.toFixed(2)}`, color:C.accentLight },
                ].map(s=>(
                  <GlassCard key={s.label} pad={14}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <s.icon size={12} color={s.color}/>
                      <span style={{ ...T.label, color:C.t3 }}>{s.label}</span>
                    </div>
                    <p style={{ color:s.color, fontSize:20, fontWeight:700, fontFamily:"'Inter',monospace" }}>{s.value}</p>
                  </GlassCard>
                ))}
              </div>

              {/* 7-day chart */}
              <GlassCard pad={18}>
                <p style={{ ...T.subheading, color:C.t0, marginBottom:14 }}>7 天播放趋势（模拟数据）</p>
                <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:80 }}>
                  {DAY_DATA.map((d,i)=>(
                    <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                      <div style={{ width:'100%', borderRadius:'4px 4px 0 0', background:`linear-gradient(to top,${C.accent},${C.accentLight})`, height:Math.round((d/maxD)*68), opacity:0.85 }}/>
                      <span style={{ ...T.label, color:C.t3, fontSize:9 }}>{DAY_LABELS[i]}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </>
          )}

          {/* Lyrics + Prompt */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <GlassCard pad={18}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}><FileText size={14} color={C.t3}/><p style={{ ...T.subheading, color:C.t0 }}>最终歌词</p></div>
              <pre style={{ ...T.caption, color:C.t1, lineHeight:2.1, whiteSpace:'pre-wrap', fontFamily:"'Noto Sans SC',sans-serif", margin:0 }}>
                {work.lyrics || '（制作中，歌词尚未确认）'}
              </pre>
            </GlassCard>
            <GlassCard pad={18}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}><Sparkles size={14} color={C.t3}/><p style={{ ...T.subheading, color:C.t0 }}>最终制作 Prompt</p></div>
              {work.finalPrompt
                ?<><p style={{ ...T.caption, color:C.t1, lineHeight:1.8 }}>{work.finalPrompt}</p><div style={{ marginTop:10 }}><Tag variant="dim">已用于生成 Demo</Tag></div></>
                :<p style={{ ...T.caption, color:C.t3 }}>制作完成后展示最终 Prompt</p>}
            </GlassCard>
          </div>

          {/* Protocol */}
          <GlassCard pad={18}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
              <Shield size={14} color={C.t3}/>
              <p style={{ ...T.subheading, color:C.t0 }}>协议选择 · 版权时间戳</p>
              <Tag variant="dim">贡献证据链已记录</Tag>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
              {PROTOCOLS.map(p=>{
                const active = protocol===p.key;
                return (
                  <button key={p.key} onClick={()=>{setProtocol(p.key);setProtocolConfirmed(false);}} style={{ padding:14, borderRadius:10, textAlign:'left', border:`1px solid ${active?'rgba(99,102,241,0.4)':'rgba(255,255,255,0.06)'}`, background:active?C.accentDim:'rgba(255,255,255,0.03)', cursor:'pointer' }}>
                    <span style={{ fontSize:22, display:'block', marginBottom:8 }}>{p.icon}</span>
                    <p style={{ ...T.caption, color:active?C.t0:C.t1, fontWeight:500, marginBottom:3 }}>{p.label}</p>
                    <p style={{ ...T.label, color:C.t3, lineHeight:1.5 }}>{p.desc}</p>
                  </button>
                );
              })}
            </div>
            {protocol && !protocolConfirmed && (
              <div style={{ display:'flex', justifyContent:'flex-end', marginTop:12 }}>
                <button onClick={handleProtocolConfirm} style={{ ...S.btnPrimary, display:'flex', alignItems:'center', gap:8, padding:'8px 18px', borderRadius:10 }}>
                  <Check size={13}/>确认协议选择
                </button>
              </div>
            )}
            {protocolConfirmed && (
              <div style={{ marginTop:12, padding:'8px 14px', borderRadius:8, background:C.successDim, border:`1px solid rgba(16,185,129,0.2)`, display:'flex', alignItems:'center', gap:6 }}>
                <Check size={12} color={C.success}/><span style={{ ...T.caption, color:'#34D399' }}>协议「{PROTOCOLS.find(p=>p.key===protocol)?.label}」已确认并记录</span>
              </div>
            )}
          </GlassCard>

          {/* Promo + Publish */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div style={{ padding:18, borderRadius:14, background:'rgba(99,102,241,0.06)', border:`1px solid rgba(99,102,241,0.18)` }}>
              <p style={{ ...T.subheading, color:C.accentLight, marginBottom:4 }}>📣 推广分身</p>
              <p style={{ ...T.caption, color:C.t2, lineHeight:1.7, marginBottom:12 }}>生成标题候选、封面方向、小红书 / 抖音发布文案</p>
              <button onClick={handlePromo} style={{ ...S.btnAccentOutline, display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, fontSize:12 }}>召唤推广分身</button>
            </div>
            <div style={{ padding:18, borderRadius:14, background:'rgba(16,185,129,0.06)', border:`1px solid rgba(16,185,129,0.18)` }}>
              <p style={{ ...T.subheading, color:'#34D399', marginBottom:4 }}>🚀 发行分身</p>
              <p style={{ ...T.caption, color:C.t2, lineHeight:1.7, marginBottom:12 }}>发行 checklist、格式检查、平台上传素材包</p>
              <button onClick={handlePublish} style={{ ...S.btnSuccess, display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, fontSize:12 }}>召唤发行分身</button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Contribution chain */}
      <div style={{ width:264, flexShrink:0, borderLeft:`1px solid rgba(255,255,255,0.05)`, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:14 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
            <Link2 size={13} color={C.accentLight}/><p style={{ ...T.subheading, color:C.t0 }}>贡献链路</p>
          </div>
          <p style={{ ...T.label, color:C.t3 }}>版权时间戳 · 已记录</p>
        </div>

        {work.contribs.map((c,idx)=>{
          const done = !!c.avatar;
          return (
            <div key={c.step}>
              {idx>0&&<div style={{ width:2, height:12, background:done?'rgba(99,102,241,0.3)':'rgba(255,255,255,0.06)', margin:'0 0 0 11px' }}/>}
              <GlassCard active={done} pad={12}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:done?8:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ width:18, height:18, borderRadius:'50%', background:done?C.accentDim:'rgba(255,255,255,0.05)', border:`2px solid ${done?C.accent:'rgba(255,255,255,0.1)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:done?C.accentLight:C.t3, flexShrink:0 }}>{idx+1}</span>
                    <span style={{ ...T.caption, color:done?C.t0:C.t3, fontWeight:done?500:400 }}>{c.step}</span>
                  </div>
                  <span style={{ color:C.accentLight, fontSize:11, fontWeight:700 }}>{c.w}%</span>
                </div>
                {done && (
                  <>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
                      <span style={{ ...T.caption, color:C.t1 }}>{c.avatar}</span>
                      <Tag variant="dim">Lv{c.lv}</Tag>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ flex:1, height:3, borderRadius:999, background:'rgba(255,255,255,0.08)' }}>
                        <div style={{ height:'100%', width:`${c.adopt}%`, borderRadius:999, background:c.adopt>=90?C.success:C.accent }}/>
                      </div>
                      <span style={{ ...T.label, color:C.t2 }}>采纳{c.adopt}%</span>
                    </div>
                  </>
                )}
                {!done && <span style={{ ...T.label, color:C.t3 }}>尚未完成</span>}
              </GlassCard>
            </div>
          );
        })}

        {/* Simulated earnings */}
        {work.status==='done' && (
          <GlassCard pad={14} glow="accent">
            <p style={{ ...T.caption, color:C.accentLight, fontWeight:500, marginBottom:8 }}>模拟收益分配</p>
            {work.contribs.filter(c=>c.avatar).map(c=>(
              <div key={c.step} style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ ...T.label, color:C.t2 }}>{c.avatar}</span>
                <span style={{ ...T.label, color:C.accentLight, fontWeight:500 }}>¥{((work.earnings*c.w)/100).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ borderTop:`1px solid rgba(99,102,241,0.2)`, marginTop:8, paddingTop:8, display:'flex', justifyContent:'space-between' }}>
              <span style={{ ...T.caption, color:C.accentLight, fontWeight:500 }}>合计</span>
              <span style={{ ...T.caption, color:C.accentLight, fontWeight:700 }}>¥{work.earnings.toFixed(2)}</span>
            </div>
            <p style={{ ...T.label, color:C.t3, marginTop:8, fontSize:9 }}>*Phase 4 开放真实结算</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
