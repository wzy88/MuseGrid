import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Eye, Filter, Heart, Link2, Shield } from 'lucide-react';
import { Tag } from '../common/Tag';
import { GlassCard } from '../common/GlassCard';
import { C, T } from '../../design/tokens';
import type { Page } from '../layout/Sidebar';
import { SAMPLE_WORKS, STEP_META, type ContributionSnapshot, type GeneratedWork } from '../../state/mockProject';

type ContributionPageProps = {
  navigate: (p: Page) => void;
  works?: GeneratedWork[];
  activeWorkId?: string | number | null;
};

const DISPLAY_DATE = '2026-06-25';

function completedContribs(work: GeneratedWork) {
  return work.contribs.filter((item) => item.avatar && item.at);
}

function chainFor(work: GeneratedWork): ContributionSnapshot[] {
  return STEP_META.map((meta) => {
    const existing = work.contribs.find((item) => item.step === meta.label);
    return existing ?? {
      step: meta.label,
      avatar: '',
      lv: 0,
      w: meta.weight,
      output: '尚未召唤',
      edit: '',
      at: '',
      adopt: 0,
    };
  });
}

function donePct(work: GeneratedWork) {
  return Math.round((completedContribs(work).length / STEP_META.length) * 100);
}

function protocolLabel(protocol: string) {
  if (protocol === 'internal') return '内部使用';
  if (protocol === 'exclusive') return '独家发行';
  if (protocol === 'commercial') return '商业授权';
  return protocol || '非独家发布';
}

export function ContributionPage({ navigate: _, works = SAMPLE_WORKS, activeWorkId = null }: ContributionPageProps) {
  const displayWorks = works.length > 0 ? works : SAMPLE_WORKS;
  const initialWork = useMemo(
    () => displayWorks.find((work) => work.id === activeWorkId) ?? displayWorks[0],
    [activeWorkId, displayWorks],
  );
  const [sel, setSel] = useState<GeneratedWork>(initialWork);

  useEffect(() => {
    setSel((current) => displayWorks.find((work) => work.id === current.id) ?? initialWork);
  }, [displayWorks, initialWork]);

  const chain = chainFor(sel);
  const confirmedChain = completedContribs(sel);
  const totalEarnings = displayWorks.reduce((sum, work) => sum + work.earnings, 0);
  const avgAdopt = Math.round(
    displayWorks.reduce((sum, work) => sum + completedContribs(work).reduce((inner, item) => inner + item.adopt, 0), 0)
    / Math.max(1, displayWorks.reduce((sum, work) => sum + completedContribs(work).length, 0)),
  );

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden', background:C.bg0 }}>
      <div style={{ width:290, flexShrink:0, borderRight:`1px solid rgba(255,255,255,0.05)`, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ padding:'20px 18px 14px', borderBottom:`1px solid rgba(255,255,255,0.05)`, flexShrink:0 }}>
          <h1 style={{ ...T.heading, color:C.t0, marginBottom:2 }}>贡献链路</h1>
          <p style={{ ...T.caption, color:C.t2, marginBottom:12 }}>每首作品的协作贡献、权重与存证记录</p>
          <div style={{ display:'flex', gap:8 }}>
            <button style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 10px', borderRadius:8, background:C.bgCard, border:`1px solid ${C.bdr0}`, color:C.t2, cursor:'pointer', ...T.caption }}>
              全部时间 <ChevronDown size={11}/>
            </button>
            <button style={{ width:32, height:32, borderRadius:8, background:C.bgCard, border:`1px solid ${C.bdr0}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <Filter size={13} color={C.t2}/>
            </button>
          </div>
        </div>

        <div style={{ padding:'12px 18px', borderBottom:`1px solid rgba(255,255,255,0.05)`, flexShrink:0, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {[
            { label:'参与作品', v:`${displayWorks.length}首` },
            { label:'模拟收益', v:`¥${totalEarnings.toFixed(2)}` },
            { label:'平均采纳率', v:`${avgAdopt}%` },
            { label:'贡献记录', v:`${displayWorks.reduce((sum, work) => sum + completedContribs(work).length, 0)}条` },
          ].map((item) => (
            <div key={item.label} style={{ padding:'8px 10px', borderRadius:8, background:C.bgCard, border:`1px solid ${C.bdr0}` }}>
              <p style={{ color:C.t0, fontSize:14, fontWeight:700, fontFamily:"'Inter',monospace" }}>{item.v}</p>
              <p style={{ ...T.label, color:C.t3, marginTop:1 }}>{item.label}</p>
            </div>
          ))}
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'8px 0' }}>
          {displayWorks.map((work) => {
            const active = sel.id === work.id;
            const pct = donePct(work);
            return (
              <button key={work.id} onClick={() => setSel(work)} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 18px', background:active?'rgba(99,102,241,0.08)':'transparent', border:'none', borderLeft:`3px solid ${active?C.accent:'transparent'}`, cursor:'pointer', textAlign:'left' }}>
                <div style={{ width:34, height:34, borderRadius:8, background:`${work.color}44`, border:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:16 }}>🎵</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                    <span style={{ ...T.caption, color:active?C.t0:C.t1, fontWeight:active?500:400 }}>{work.title}</span>
                    <span style={{ fontSize:10, color:work.status==='done'?C.success:C.warning }}>{work.status==='done'?'已完成':'进行中'}</span>
                  </div>
                  <div style={{ display:'flex', gap:3, marginBottom:5 }}>{work.tags.slice(0, 2).map((tag) => <Tag key={tag} variant="dim">{tag}</Tag>)}</div>
                  <div style={{ height:2, borderRadius:999, background:'rgba(255,255,255,0.07)' }}>
                    <div style={{ height:'100%', width:`${pct}%`, borderRadius:999, background:C.accent }}/>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 24px', borderBottom:`1px solid rgba(255,255,255,0.05)`, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:44, height:44, borderRadius:10, background:`linear-gradient(135deg,${sel.color}AA,${sel.color}44)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🎵</div>
            <div>
              <h2 style={{ ...T.subheading, color:C.t0, marginBottom:4 }}>{sel.title}</h2>
              <div style={{ display:'flex', gap:5, alignItems:'center' }}>
                {sel.tags.map((tag) => <Tag key={tag} variant="dim">{tag}</Tag>)}
                <span style={{ ...T.label, color:C.t3 }}>· {sel.status === 'done' ? DISPLAY_DATE : '制作中'}</span>
              </div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {sel.status === 'done' && <>
              <div style={{ display:'flex', alignItems:'center', gap:4 }}><Eye size={12} color={C.t3}/><span style={{ ...T.caption, color:C.t2 }}>{sel.plays.toLocaleString()}</span></div>
              <div style={{ display:'flex', alignItems:'center', gap:4 }}><Heart size={12} color={C.t3}/><span style={{ ...T.caption, color:C.t2 }}>{sel.likes}</span></div>
            </>}
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:8, background:C.accentDim, border:`1px solid rgba(99,102,241,0.2)` }}>
              <Link2 size={12} color={C.accentLight}/>
              <span style={{ ...T.caption, color:C.accentLight, fontWeight:500 }}>贡献证据链</span>
            </div>
          </div>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>
          <p style={{ ...T.label, color:C.t3, marginBottom:16 }}>
            专家接力链 · {confirmedChain.length} / {STEP_META.length} 步完成
          </p>
          <div style={{ display:'flex', flexDirection:'column' }}>
            {chain.map((step, idx) => {
              const done = !!step.at;
              return (
                <div key={step.step} style={{ display:'flex', gap:16 }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:26 }}>
                    <div style={{ width:26, height:26, borderRadius:'50%', border:`2px solid ${done?C.accent:'rgba(255,255,255,0.1)'}`, background:done?C.accentDim:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, zIndex:1 }}>
                      <span style={{ fontSize:10, fontWeight:700, color:done?C.accentLight:C.t3 }}>{idx+1}</span>
                    </div>
                    {idx < chain.length - 1 && <div style={{ width:2, flex:1, minHeight:20, margin:'3px 0', background:done?'rgba(99,102,241,0.3)':'rgba(255,255,255,0.06)' }}/>}
                  </div>
                  <div style={{ flex:1, paddingBottom:16 }}>
                    <GlassCard active={done} style={{ opacity:done?1:0.5 }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderBottom:`1px solid rgba(255,255,255,0.05)` }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <Tag variant={done?'accent':'dim'}>{step.step}</Tag>
                          {done && <><span style={{ ...T.caption, color:C.t0, fontWeight:500 }}>{step.avatar}</span><Tag variant="dim">Lv{step.lv}</Tag></>}
                          {!done && <span style={{ ...T.caption, color:C.t3 }}>尚未完成</span>}
                        </div>
                        <span style={{ color:C.accentLight, fontSize:13, fontWeight:700, fontFamily:"'Inter',monospace" }}>{step.w}%</span>
                      </div>
                      {done && (
                        <div style={{ padding:'12px 16px' }}>
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                            <div style={{ padding:'10px 12px', borderRadius:8, background:'rgba(255,255,255,0.03)' }}>
                              <p style={{ ...T.label, color:C.t3, marginBottom:4 }}>分身输出摘要</p>
                              <p style={{ ...T.caption, color:C.t1, lineHeight:1.6 }}>{step.output}</p>
                            </div>
                            <div style={{ padding:'10px 12px', borderRadius:8, background:'rgba(255,255,255,0.03)' }}>
                              <p style={{ ...T.label, color:C.t3, marginBottom:4 }}>用户编辑说明</p>
                              <p style={{ ...T.caption, color:C.t1, lineHeight:1.6 }}>{step.edit}</p>
                            </div>
                          </div>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <Shield size={11} color={C.t3}/>
                              <span style={{ ...T.label, color:C.t3 }}>确认于 {step.at}</span>
                            </div>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <span style={{ ...T.label, color:C.t2 }}>内容采纳率</span>
                              <div style={{ width:60, height:3, borderRadius:999, background:'rgba(255,255,255,0.08)' }}>
                                <div style={{ height:'100%', width:`${step.adopt}%`, borderRadius:999, background:step.adopt>=90?C.success:step.adopt>=75?C.accent:C.warning }}/>
                              </div>
                              <span style={{ ...T.caption, color:C.t1, fontWeight:600 }}>{step.adopt}%</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </GlassCard>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ width:252, flexShrink:0, borderLeft:`1px solid rgba(255,255,255,0.05)`, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:12 }}>
        <p style={{ ...T.label, color:C.t3 }}>收益分配</p>
        <GlassCard pad={14} glow="accent">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
            <p style={{ ...T.caption, color:C.accentLight, fontWeight:500 }}>模拟总收益</p>
            <p style={{ color:C.accent, fontSize:22, fontWeight:800, fontFamily:"'Inter',monospace" }}>¥{sel.earnings.toFixed(2)}</p>
          </div>
          {confirmedChain.map((item, index) => {
            const colors = [C.accent, C.cyan, C.success, C.warning];
            const amt = sel.earnings * item.w / 100;
            return (
              <div key={item.step} style={{ marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <div style={{ width:5, height:5, borderRadius:'50%', background:colors[index % colors.length] }}/>
                    <span style={{ ...T.label, color:C.t2, fontSize:10 }}>{item.avatar}（{item.step}）</span>
                  </div>
                  <span style={{ ...T.label, color:C.t0, fontWeight:600, fontFamily:"'Inter',monospace" }}>¥{amt.toFixed(2)}</span>
                </div>
                <div style={{ height:2, borderRadius:999, background:'rgba(255,255,255,0.07)', marginLeft:10 }}>
                  <div style={{ height:'100%', width:`${item.w}%`, borderRadius:999, background:colors[index % colors.length], opacity:0.7 }}/>
                </div>
              </div>
            );
          })}
          {confirmedChain.length === 0 && <p style={{ ...T.caption, color:C.t3 }}>作品完成后会在这里显示分身收益拆分。</p>}
          <p style={{ ...T.label, color:C.t3, marginTop:8, fontSize:9 }}>*Phase 4 开放真实结算</p>
        </GlassCard>

        <GlassCard pad={14}>
          <p style={{ ...T.caption, color:C.t1, fontWeight:500, marginBottom:10 }}>协议与版权</p>
          {[
            { label:'协议类型', v:protocolLabel(sel.protocol) },
            { label:'版权时间戳', v:sel.status === 'done' ? `${DISPLAY_DATE} 已记录` : '待 Demo 生成后记录' },
            { label:'存证状态', v:confirmedChain.length === STEP_META.length ? '贡献证据链完整' : '贡献证据链建立中' },
            { label:'创建者', v:'张浩' },
          ].map((item) => (
            <div key={item.label} style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ ...T.label, color:C.t3 }}>{item.label}</span>
              <span style={{ ...T.caption, color:C.t1 }}>{item.v}</span>
            </div>
          ))}
        </GlassCard>

        {sel.status === 'done' && (
          <GlassCard pad={14}>
            <p style={{ ...T.caption, color:C.t1, fontWeight:500, marginBottom:10 }}>作品表现</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[
                { label:'播放量', value:sel.plays.toLocaleString() },
                { label:'点赞', value:sel.likes },
                { label:'分享', value:sel.shares },
                { label:'完播率', value:`${sel.completion}%` },
              ].map((item) => (
                <div key={item.label} style={{ padding:'8px 10px', borderRadius:8, background:'rgba(255,255,255,0.03)' }}>
                  <p style={{ color:C.t0, fontSize:14, fontWeight:700, fontFamily:"'Inter',monospace" }}>{item.value}</p>
                  <p style={{ ...T.label, color:C.t3, marginTop:1 }}>{item.label}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        <div style={{ padding:'10px 12px', borderRadius:10, background:sel.status==='done'?C.successDim:C.warningDim, border:`1px solid ${sel.status==='done'?'rgba(16,185,129,0.2)':'rgba(245,158,11,0.2)'}`, display:'flex', alignItems:'center', gap:8 }}>
          <Shield size={14} color={sel.status==='done'?C.success:C.warning}/>
          <div>
            <p style={{ ...T.caption, color:sel.status==='done'?'#34D399':C.warning, fontWeight:500 }}>{confirmedChain.length === STEP_META.length ? '贡献链路完整' : '链路建立中'}</p>
            <p style={{ ...T.label, color:C.t3, marginTop:1 }}>{confirmedChain.length}/{STEP_META.length} 环节已确认</p>
          </div>
        </div>
      </div>
    </div>
  );
}
