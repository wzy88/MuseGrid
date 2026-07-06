import { TrendingUp, TrendingDown, Minus, AlertCircle, ChevronRight, Play, Clock, ArrowLeft } from 'lucide-react';
import { Tag } from '../common/Tag';
import { Waveform } from '../common/Waveform';
import { GlassCard } from '../common/GlassCard';
import { C, T, S } from '../../design/tokens';
import type { Page } from '../layout/Sidebar';

const MARKET = [
  { label:'生成作品',v:8,  unit:'首',prev:6,  icon:'🎵' },
  { label:'平均播放',v:920,unit:'次',prev:780, icon:'▶️' },
  { label:'平均点赞',v:64, unit:'个',prev:55,  icon:'❤️' },
  { label:'完播率',  v:73, unit:'%', prev:68,  icon:'✅' },
  { label:'分享数',  v:18, unit:'次',prev:22,  icon:'🔗', neg:true },
  { label:'采纳率',  v:84, unit:'%', prev:81,  icon:'🎯' },
];

const SAMPLES = [
  { id:1, title:'山海之旅', seed:3,  plays:1240, type:'good',   typeLabel:'数据最好', score:'这就是我会写的',    desc:'古风情感叙事，画面感强，Hook 简洁有力' },
  { id:2, title:'光年以外', seed:15, plays:843,  type:'good',   typeLabel:'数据较好', score:'这就是我会写的',    desc:'流行摇滚风格，旋律记忆点突出' },
  { id:3, title:'繁星如故', seed:11, plays:310,  type:'medium', typeLabel:'数据中等', score:'有点接近，但不太对', desc:'民谣治愈风，歌词略显平淡，缺少意象层次' },
  { id:4, title:'晨雾之境', seed:19, plays:95,   type:'bad',    typeLabel:'数据较差', score:'完全不是我',        desc:'尝试实验电子风格，文字感弱，偏差较大' },
];

const DIRECTIONS = [
  { type:'up',  dir:'古风情感叙事', desc:'本周期采纳率 91%，完播率 79%，显著高于均值' },
  { type:'down',dir:'实验电子风',   desc:'「晨雾之境」数据垫底，负面打分，建议降低权重' },
];

const scoreColor: Record<string, string> = {
  '这就是我会写的': C.success, '有点接近，但不太对': C.warning, '完全不是我': C.error,
};
const typeColor: Record<string, string> = { good: C.success, medium: C.warning, bad: C.error };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom:28 }}>
      <h2 style={{ ...T.subheading, color:C.t0, marginBottom:12, paddingBottom:8, borderBottom:`1px solid rgba(255,255,255,0.05)` }}>{title}</h2>
      {children}
    </div>
  );
}

export function EvolutionReportPage({ navigate }: { navigate: (p: Page) => void }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', background:C.bg0 }}>
      <div style={{ flex:1, overflowY:'auto', padding:'24px 0' }}>
        <div style={{ maxWidth:800, margin:'0 auto', padding:'0 32px' }}>

          {/* Breadcrumb */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:24 }}>
            <button onClick={()=>navigate('avatarManage')} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:C.t2, ...T.caption }}><ArrowLeft size={13}/>分身管理</button>
            <ChevronRight size={12} color={C.t3}/>
            <span style={{ ...T.caption, color:C.t1 }}>进化报告</span>
          </div>

          {/* Header */}
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28 }}>
            <div>
              <h1 style={{ ...T.display, color:C.t0, marginBottom:4 }}>进化报告</h1>
              <p style={{ ...T.caption, color:C.t2 }}>林间小调 · Lv4 · 2026-05-25 ~ 2026-06-25</p>
            </div>
            <GlassCard glow="warning" style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'12px 16px' }}>
              <AlertCircle size={14} color={C.warning} style={{ marginTop:1, flexShrink:0 }}/>
              <div>
                <p style={{ ...T.caption, color:C.warning, fontWeight:500, marginBottom:2 }}>触发原因：累计 100 次召唤</p>
                <p style={{ ...T.label, color:C.t2 }}>人格保真评分下降 4 分，建议校准</p>
              </div>
            </GlassCard>
          </div>

          {/* Market performance */}
          <Section title="市场表现">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:10 }}>
              {MARKET.map(m=>{
                const delta = m.v - m.prev;
                const good = m.neg ? delta<0 : delta>0;
                const bad  = m.neg ? delta>0 : delta<0;
                return (
                  <GlassCard key={m.label} pad={14}>
                    <p style={{ fontSize:16, marginBottom:6 }}>{m.icon}</p>
                    <p style={{ color:C.t0, fontSize:18, fontWeight:700, fontFamily:"'Inter',monospace" }}>{m.v}{m.unit}</p>
                    <p style={{ ...T.label, color:C.t3, marginTop:2 }}>{m.label}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:6 }}>
                      {good?<TrendingUp size={10} color={C.success}/>:bad?<TrendingDown size={10} color={C.error}/>:<Minus size={10} color={C.t3}/>}
                      <span style={{ fontSize:10, color:good?C.success:bad?C.error:C.t3 }}>{delta>0?'+':''}{delta}{m.unit}</span>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </Section>

          {/* Persona fidelity */}
          <Section title="人格保真">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[
                { label:'像本人评分',   v:82, prev:86, unit:'%', bad:true  },
                { label:'风格重复度',   v:38, prev:31, unit:'%', bad:true  },
                { label:'人格保真评分', v:82, prev:86, unit:'分',bad:true  },
              ].map(m=>{
                const delta = m.v - m.prev;
                return (
                  <GlassCard key={m.label} pad={14} glow={m.bad&&delta<0?'warning':'none'}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <p style={{ ...T.caption, color:C.t1 }}>{m.label}</p>
                      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <TrendingDown size={10} color={delta<0?C.error:C.t3}/>
                        <span style={{ fontSize:10, color:delta<0?C.error:C.t3 }}>{delta>0?'+':''}{delta}{m.unit}</span>
                      </div>
                    </div>
                    <p style={{ color:delta<0?C.error:C.t0, fontSize:22, fontWeight:700, fontFamily:"'Inter',monospace" }}>{m.v}{m.unit}</p>
                    <div style={{ height:4, borderRadius:999, background:'rgba(255,255,255,0.08)', marginTop:8 }}>
                      <div style={{ height:'100%', width:`${m.v}%`, borderRadius:999, background:delta<0?C.error:C.accent }}/>
                    </div>
                  </GlassCard>
                );
              })}
              <GlassCard pad={14}>
                <p style={{ ...T.caption, color:C.t1, marginBottom:8 }}>负面反馈关键词</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {['意象重复','节奏平淡','缺乏层次','不够画面感'].map(kw=>(
                    <span key={kw} style={{ padding:'2px 8px', borderRadius:5, background:C.errorDim, border:`1px solid rgba(239,68,68,0.2)`, color:'#F87171', fontSize:11 }}>{kw}</span>
                  ))}
                </div>
              </GlassCard>
            </div>
          </Section>

          {/* Directions */}
          <Section title="方向分析">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {DIRECTIONS.map(d=>(
                <GlassCard key={d.dir} glow={d.type==='up'?'success':'none'} pad={16}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                    {d.type==='up'?<TrendingUp size={14} color={C.success}/>:<TrendingDown size={14} color={C.error}/>}
                    <p style={{ ...T.caption, color:d.type==='up'?'#34D399':C.error, fontWeight:500 }}>{d.type==='up'?'表现最好方向':'需要关注方向'}</p>
                  </div>
                  <p style={{ ...T.heading, color:C.t0, marginBottom:5 }}>{d.dir}</p>
                  <p style={{ ...T.caption, color:C.t2, lineHeight:1.6 }}>{d.desc}</p>
                </GlassCard>
              ))}
            </div>
          </Section>

          {/* Sample works */}
          <Section title="代表作品打分（校准预览）">
            <p style={{ ...T.caption, color:C.t2, marginBottom:14 }}>正式校准时需逐一评价「像不像你本人会写的」</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {SAMPLES.map((work)=>{
                const sc = scoreColor[work.score];
                const tc = typeColor[work.type];
                return (
                  <GlassCard key={work.id} style={{ overflow:'hidden' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', borderBottom:`1px solid rgba(255,255,255,0.05)` }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <p style={{ ...T.caption, color:C.t0, fontWeight:600 }}>{work.title}</p>
                        <span style={{ padding:'1px 6px', borderRadius:4, background:`${tc}18`, color:tc, fontSize:9 }}>{work.typeLabel}</span>
                      </div>
                      <button style={{ width:24, height:24, borderRadius:'50%', background:'rgba(255,255,255,0.06)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                        <Play size={9} color={C.t2} fill={C.t2}/>
                      </button>
                    </div>
                    <div style={{ padding:'12px 14px' }}>
                      <Waveform bars={36} progress={0} height={20} seed={work.seed} inactiveColor="rgba(255,255,255,0.08)"/>
                      <p style={{ ...T.caption, color:C.t2, lineHeight:1.6, margin:'8px 0 10px' }}>{work.desc}</p>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <span style={{ ...T.label, color:C.t3 }}>▶ {work.plays}</span>
                        <span style={{ padding:'3px 10px', borderRadius:6, background:`${sc}14`, border:`1px solid ${sc}40`, color:sc, fontSize:11, fontWeight:500 }}>{work.score}</span>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </Section>

          {/* CTA */}
          <GlassCard glow="accent" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px' }}>
            <div>
              <p style={{ ...T.heading, color:C.t0, marginBottom:5 }}>准备好开始校准了吗？</p>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <Clock size={13} color={C.t3}/>
                <p style={{ ...T.caption, color:C.t2 }}>预计 3 分钟 · 3 步完成 · 随时可保存进度</p>
              </div>
            </div>
            <button onClick={()=>navigate('calibration')} style={{ ...S.btnPrimary, display:'flex', alignItems:'center', gap:8, padding:'11px 24px', borderRadius:12, fontSize:14, fontWeight:700, whiteSpace:'nowrap' }}>
              开始 3 分钟校准<ChevronRight size={16}/>
            </button>
          </GlassCard>

          <div style={{ height:32 }}/>
        </div>
      </div>
    </div>
  );
}
