import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronRight, Play, TrendingUp, TrendingDown, Clock, Sparkles, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Waveform } from '../common/Waveform';
import { Tag } from '../common/Tag';
import { GlassCard } from '../common/GlassCard';
import { C, T, S } from '../../design/tokens';
import type { Page } from '../layout/Sidebar';
import { createCloudCalibration, getCreatorId } from '../../data/avatarClient';
import { normalizeAvatar, type AvatarCalibration, type AvatarProfile } from '../../state/mockProject';

type Score = '这就是我会写的' | '有点接近，但不太对' | '完全不是我';

const SAMPLES = [
  { id:1, title:'山海之旅', seed:3,  plays:1240, type:'good',   label:'数据最好', desc:'古风情感叙事，画面感强，Hook 简洁有力' },
  { id:2, title:'光年以外', seed:15, plays:843,  type:'good',   label:'数据较好', desc:'流行摇滚风格，旋律记忆点突出' },
  { id:3, title:'繁星如故', seed:11, plays:310,  type:'medium', label:'数据中等', desc:'民谣治愈风，歌词略显平淡，缺少意象层次' },
  { id:4, title:'晨雾之境', seed:19, plays:95,   type:'bad',    label:'数据较差', desc:'尝试实验电子风格，文字感弱，偏差较大' },
];

const QUESTIONS = [
  { id:'interest', q:'最近你的创作兴趣有变化吗？',     opts:['没什么变化','开始对电子国风感兴趣','希望更偏向口语化表达','尝试更抽象的意象风格'] },
  { id:'explore',  q:'哪个实验方向值得继续探索？',     opts:['电子国风','城市民谣','古风流行融合','暂不想探索新方向'] },
  { id:'habit',    q:'你的作词习惯最近有变化吗？',     opts:['没有变化','越来越喜欢先写 Hook','开始注重声韵节奏','倾向更短的歌词行数'] },
  { id:'fidelity', q:'分身目前做到你本人几成水准？',   opts:['8成以上','6~8成','4~6成','不到4成'] },
  { id:'focus',    q:'接下来希望分身更偏向哪个方向？', opts:['稳定出品，量产优先','深化当前风格精度','大胆探索新风格','提升特定风格（古风）质量'] },
];

const PARAM_CHANGES = [
  { key:'古风权重',     delta:+0.10, from:0.72, to:0.82, color:C.success, reason:'本周期古风作品表现最佳，主人确认方向正确' },
  { key:'情感叙事权重', delta:-0.05, from:0.64, to:0.59, color:C.error,   reason:'连续反馈"情绪过满"，适当收敛' },
  { key:'电子国风',     delta:'new', from:0,    to:0.20, color:C.accent,  reason:'主人表示有兴趣，新增探索标签，初始权重 0.20' },
  { key:'重复意象约束', delta:'add', from:null, to:null, color:C.warning, reason:'「月/霜/故城」等意象频率超阈值，加入避免规则' },
];

const scoreColor: Record<Score, string> = {
  '这就是我会写的':    C.success,
  '有点接近，但不太对': C.warning,
  '完全不是我':       C.error,
};
const typeColor: Record<string, string> = { good: C.success, medium: C.warning, bad: C.error };

export function CalibrationPage({ navigate, avatar, onAvatarUpdated }: { navigate: (p: Page) => void; avatar?: AvatarProfile; onAvatarUpdated?: (avatar: AvatarProfile, calibration?: AvatarCalibration) => void }) {
  const [step, setStep] = useState(1);
  const [scores, setScores] = useState<Record<number, Score>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const pct = done ? 100 : step === 1 ? 15 : step === 2 ? 50 : 85;
  const step2ok = SAMPLES.every(s => scores[s.id]);
  const step3ok = QUESTIONS.every(q => answers[q.id]);

  async function handleConfirm() {
    toast.loading('正在应用参数更新…');
    const currentAvatar = normalizeAvatar(avatar ?? {
      id: 'local-avatar',
      name: '林间小调',
      dir: '作词',
      lv: 4,
      calls: 560,
      adopt: 84,
      tags: ['古风'],
      emoji: '✍️',
      color: '#6366F1',
      motto: '先找情绪转折点，再让 Hook 把故事收回来。',
      status: '状态良好',
    });
    try {
      const result = await createCloudCalibration(currentAvatar.id, {
        creatorId: getCreatorId(),
        scores: Object.fromEntries(Object.entries(scores).map(([key, value]) => [key, value])),
        answers,
      });
      onAvatarUpdated?.(result.avatar, result.calibration);
      toast.dismiss();
      toast.success('分身参数已云端更新，进化完成！');
    } catch (error) {
      const localUpdated = normalizeAvatar({
        ...currentAvatar,
        status: '本地校准已应用',
        styleWeights: {
          ...(currentAvatar.styleWeights || {}),
          电子国风: answers.interest?.includes('电子国风') ? 0.2 : (currentAvatar.styleWeights?.电子国风 ?? 0.2),
          古风: answers.focus?.includes('古风') ? Math.min(1, (currentAvatar.styleWeights?.古风 ?? 0.72) + 0.1) : (currentAvatar.styleWeights?.古风 ?? 0.72),
        },
        updatedAt: new Date().toISOString(),
      });
      onAvatarUpdated?.(localUpdated);
      console.info(error);
      toast.dismiss();
      toast.success('分身参数已本地更新，D1 开通后会同步为云端进化');
    }
    navigate('avatarManage');
  }
  function handlePostpone() { toast.info('已标记为稍后处理，可在分身管理页重新触发'); navigate('avatarManage'); }
  function handleRollback() {
    toast.loading('回滚中…');
    setTimeout(() => { toast.dismiss(); toast.success('已回滚至上一轮参数'); navigate('avatarManage'); }, 1200);
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', background:C.bg0 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', height:52, borderBottom:`1px solid rgba(255,255,255,0.05)`, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={() => navigate('evolutionReport')} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:C.t2, ...T.caption }}>
            <ArrowLeft size={13}/>进化报告
          </button>
          <ChevronRight size={12} color={C.t3}/>
          <span style={{ ...T.caption, color:C.t1 }}>3 分钟校准会话</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <Clock size={12} color={C.t3}/>
          <span style={{ ...T.caption, color:C.t3 }}>预计剩余 {step===1?'3:00':step===2?'2:30':'1:00'}</span>
        </div>
      </div>

      {/* Progress */}
      <div style={{ height:3, background:'rgba(255,255,255,0.05)', flexShrink:0 }}>
        <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${C.accent},${C.accentLight})`, transition:'width 0.5s ease' }}/>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'28px 0' }}>
        <div style={{ maxWidth:680, margin:'0 auto', padding:'0 28px', display:'flex', flexDirection:'column', gap:24 }}>

          {/* Step indicator */}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {[{n:1,l:'表现回顾',t:'~30秒'},{n:2,l:'作品打分',t:'~2分钟'},{n:3,l:'方向问答',t:'~1分钟'}].map((s,i)=>{
              const isDone = done || s.n < step;
              const isActive = !done && s.n === step;
              return (
                <div key={s.n} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  {i>0 && <div style={{ width:28, height:1, background: isDone?`rgba(99,102,241,0.4)`:'rgba(255,255,255,0.08)' }}/>}
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:22, height:22, borderRadius:'50%', border:`2px solid ${isDone?C.success:isActive?C.accent:'rgba(255,255,255,0.1)'}`, background:isDone?C.successDim:isActive?C.accentDim:'transparent', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:isActive?`0 0 12px rgba(99,102,241,0.4)`:'' }}>
                      {isDone?<Check size={11} color={C.success}/>:<span style={{ fontSize:10, fontWeight:700, color:isActive?C.accentLight:C.t3 }}>{s.n}</span>}
                    </div>
                    <div>
                      <p style={{ ...T.caption, color:isActive?C.t0:isDone?'#34D399':C.t3, fontWeight:isActive?500:400 }}>{s.l}</p>
                      <p style={{ ...T.label, color:C.t3 }}>{s.t}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── STEP 1 ── */}
          {step===1 && (
            <>
              <div>
                <h2 style={{ ...T.heading, color:C.t0, marginBottom:4 }}>第一步：本周期表现回顾</h2>
                <p style={{ ...T.caption, color:C.t2 }}>快速了解本轮校准背景，约 30 秒</p>
              </div>
              <GlassCard pad={20}>
                <p style={{ ...T.caption, color:C.t2, marginBottom:14 }}>林间小调 · Lv4 · 2026-05-25 ~ 2026-06-25</p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
                  {[
                    { l:'生成作品',v:'8首',  d:'+2',  good:true },
                    { l:'平均播放',v:'920次',d:'+18%',good:true },
                    { l:'采纳率',  v:'84%',  d:'+3%', good:true },
                    { l:'完播率',  v:'73%',  d:'+5%', good:true },
                    { l:'人格保真',v:'82分', d:'-4分',good:false },
                    { l:'分享数',  v:'18次', d:'-4次',good:false },
                  ].map(m=>(
                    <div key={m.l} style={{ padding:'10px 12px', borderRadius:10, background:'rgba(255,255,255,0.03)' }}>
                      <p style={{ color:C.t0, fontSize:16, fontWeight:700, fontFamily:"'Inter',monospace" }}>{m.v}</p>
                      <p style={{ ...T.label, color:C.t3, marginTop:2 }}>{m.l}</p>
                      <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:4 }}>
                        {m.good?<TrendingUp size={10} color={C.success}/>:<TrendingDown size={10} color={C.error}/>}
                        <span style={{ fontSize:10, color:m.good?C.success:C.error }}>{m.d}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding:'12px 14px', borderRadius:10, background:C.warningDim, border:`1px solid rgba(245,158,11,0.2)` }}>
                  <p style={{ ...T.caption, color:C.warning, fontWeight:500, marginBottom:4 }}>本轮校准目的</p>
                  <p style={{ ...T.caption, color:C.t1, lineHeight:1.7 }}>人格保真评分从 86 降至 82，主因是出现了 1 首「完全不是我」的样本（晨雾之境）。古风方向表现显著优于均值，值得加强权重。</p>
                </div>
              </GlassCard>
              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <button onClick={()=>setStep(2)} style={{ ...S.btnPrimary, display:'flex', alignItems:'center', gap:8, padding:'9px 22px', borderRadius:10 }}>
                  进入作品打分<ArrowRight size={14}/>
                </button>
              </div>
            </>
          )}

          {/* ── STEP 2 ── */}
          {step===2 && (
            <>
              <div>
                <h2 style={{ ...T.heading, color:C.t0, marginBottom:4 }}>第二步：代表作品打分</h2>
                <p style={{ ...T.caption, color:C.t2 }}>评价「像不像你本人会写的」，约 2 分钟</p>
              </div>
              {SAMPLES.map((work,idx)=>{
                const sc = scores[work.id];
                const scColor = sc ? scoreColor[sc] : undefined;
                const tc = typeColor[work.type];
                return (
                  <GlassCard key={work.id} style={{ overflow:'hidden' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderBottom:`1px solid rgba(255,255,255,0.05)` }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <span style={{ ...T.label, color:C.t3, fontWeight:700, fontFamily:"'Inter',monospace" }}>0{idx+1}</span>
                        <p style={{ ...T.subheading, color:C.t0 }}>{work.title}</p>
                        <Tag variant={work.type==='good'?'success':work.type==='medium'?'warning':'dim'}>{work.label}</Tag>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ ...T.caption, color:C.t3 }}>▶ {work.plays}</span>
                        <button style={{ width:26, height:26, borderRadius:'50%', background:'rgba(255,255,255,0.06)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                          <Play size={10} color={C.t2} fill={C.t2}/>
                        </button>
                      </div>
                    </div>
                    <div style={{ padding:'12px 16px' }}>
                      <Waveform bars={40} progress={0} height={22} seed={work.seed} inactiveColor="rgba(255,255,255,0.08)"/>
                      <p style={{ ...T.caption, color:C.t2, lineHeight:1.6, margin:'10px 0 12px' }}>{work.desc}</p>
                      <p style={{ ...T.label, color:C.t3, marginBottom:6 }}>这首歌像不像你本人会写的？</p>
                      <div style={{ display:'flex', gap:6 }}>
                        {(['这就是我会写的','有点接近，但不太对','完全不是我'] as Score[]).map(opt=>{
                          const sel = sc===opt;
                          const oc = scoreColor[opt];
                          return (
                            <button key={opt} onClick={()=>setScores(prev=>({...prev,[work.id]:opt}))} style={{ flex:1, padding:'8px 4px', borderRadius:8, border:`1px solid ${sel?`${oc}50`:'rgba(255,255,255,0.07)'}`, background:sel?`${oc}14`:'rgba(255,255,255,0.03)', color:sel?oc:C.t2, cursor:'pointer', fontSize:11, fontWeight:sel?500:400 }}>
                              {sel && <Check size={10} style={{ display:'inline', marginRight:4 }}/>}
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <button onClick={()=>setStep(1)} style={{ ...S.btnGhost, padding:'8px 16px', borderRadius:10 }}>上一步</button>
                <button onClick={()=>step2ok&&setStep(3)} style={{ ...step2ok?S.btnPrimary:{...S.btnGhost,cursor:'not-allowed'}, display:'flex', alignItems:'center', gap:8, padding:'8px 20px', borderRadius:10 }}>
                  {step2ok?'进入方向问答':`还需打分 ${SAMPLES.filter(s=>!scores[s.id]).length} 首`}<ArrowRight size={14}/>
                </button>
              </div>
            </>
          )}

          {/* ── STEP 3 ── */}
          {step===3 && !done && (
            <>
              <div>
                <h2 style={{ ...T.heading, color:C.t0, marginBottom:4 }}>第三步：方向性问答</h2>
                <p style={{ ...T.caption, color:C.t2 }}>帮助分身了解你现在的创作状态，约 1 分钟</p>
              </div>
              {QUESTIONS.map((q,idx)=>(
                <GlassCard key={q.id} pad={16}>
                  <div style={{ display:'flex', gap:10, marginBottom:12 }}>
                    <span style={{ ...T.label, color:C.t3, fontWeight:700, marginTop:2 }}>Q{idx+1}</span>
                    <p style={{ ...T.caption, color:C.t0, fontWeight:500, lineHeight:1.5 }}>{q.q}</p>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {q.opts.map(opt=>{
                      const sel = answers[q.id]===opt;
                      return (
                        <button key={opt} onClick={()=>setAnswers(prev=>({...prev,[q.id]:opt}))} style={{ padding:'9px 14px', borderRadius:8, textAlign:'left', border:`1px solid ${sel?'rgba(99,102,241,0.4)':'rgba(255,255,255,0.06)'}`, background:sel?C.accentDim:'rgba(255,255,255,0.03)', color:sel?C.t0:C.t2, cursor:'pointer', ...T.caption }}>
                          {sel && <Check size={10} color={C.accentLight} style={{ display:'inline', marginRight:6 }}/>}
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </GlassCard>
              ))}
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <button onClick={()=>setStep(2)} style={{ ...S.btnGhost, padding:'8px 16px', borderRadius:10 }}>上一步</button>
                <button onClick={()=>step3ok&&setDone(true)} style={{ ...step3ok?S.btnSuccess:{...S.btnGhost,cursor:'not-allowed'}, display:'flex', alignItems:'center', gap:8, padding:'8px 20px', borderRadius:10 }}>
                  {step3ok?'生成参数更新摘要':`还有 ${QUESTIONS.filter(q=>!answers[q.id]).length} 题未回答`}<Sparkles size={14}/>
                </button>
              </div>
            </>
          )}

          {/* ── RESULT ── */}
          {done && (
            <>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:C.successDim, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Check size={14} color={C.success}/>
                </div>
                <h2 style={{ ...T.heading, color:C.t0 }}>校准完成！参数更新摘要</h2>
              </div>
              <GlassCard pad={20}>
                <p style={{ ...T.caption, color:C.t2, marginBottom:14 }}>第 4 轮校准 · 2026-06-25 · {PARAM_CHANGES.length} 项更新</p>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {PARAM_CHANGES.map(c=>{
                    const isNew = c.delta==='new'||c.delta==='add';
                    const isUp  = typeof c.delta==='number'&&c.delta>0;
                    return (
                      <div key={c.key} style={{ padding:'12px 14px', borderRadius:10, background:`${c.color}0A`, border:`1px solid ${c.color}30` }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                          <span style={{ padding:'1px 7px', borderRadius:5, background:`${c.color}20`, color:c.color, fontSize:10, fontWeight:600 }}>
                            {isNew?(c.delta==='add'?'新增规则':'新增标签'):isUp?`+${c.delta}`:c.delta}
                          </span>
                          <p style={{ ...T.caption, color:C.t0, fontWeight:500 }}>{c.key}</p>
                          {typeof c.delta==='number' && <span style={{ ...T.caption, color:C.t2, fontFamily:"'Inter',monospace" }}>{c.from} → {c.to}</span>}
                        </div>
                        <p style={{ ...T.caption, color:C.t2, lineHeight:1.6 }}>{c.reason}</p>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>

              <GlassCard pad={16} glow="success" style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <p style={{ ...T.caption, color:'#34D399', fontWeight:500, marginBottom:2 }}>预估效果</p>
                  <p style={{ ...T.caption, color:C.t2 }}>人格保真评分 82 → 预计提升至 86~88</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ color:'#34D399', fontSize:22, fontWeight:800 }}>+4~6</p>
                  <p style={{ ...T.label, color:C.t3 }}>预估提升</p>
                </div>
              </GlassCard>

              <div style={{ display:'flex', gap:10 }}>
                <button onClick={handlePostpone} style={{ ...S.btnGhost, display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:10 }}>
                  <Clock size={13}/> 暂不应用
                </button>
                <button onClick={handleRollback} style={{ ...S.btnGhost, display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:10 }}>
                  <RotateCcw size={13}/> 回滚上一轮
                </button>
                <div style={{ flex:1 }}/>
                <button onClick={handleConfirm} style={{ ...S.btnSuccess, display:'flex', alignItems:'center', gap:8, padding:'9px 24px', borderRadius:10 }}>
                  <Check size={14}/> 确认进化，应用更新
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
