import { useState } from 'react';
import { Check, ChevronRight, Plus, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Tag } from '../common/Tag';
import { RadarChart } from '../common/RadarChart';
import { GlassCard } from '../common/GlassCard';
import { C, T, S } from '../../design/tokens';
import type { Page } from '../layout/Sidebar';
import { createCloudAvatar, createLocalAvatar, getCreatorId } from '../../data/avatarClient';
import type { AvatarProfile } from '../../state/mockProject';

const STEPS = [
  { num:1, label:'创作人基础信息', sub:'名称、方向、代表作' },
  { num:2, label:'风格与专业定位', sub:'标签、擅长、边界' },
  { num:3, label:'初始校准设置',   sub:'创作方法与案例' },
  { num:4, label:'创作格言与简介', sub:'最终确认与发布' },
];
const DIRS    = ['作词','作曲','编曲','制作'];
const STYLES  = ['古风','流行','电子','R&B','说唱','民谣','摇滚','爵士','治愈','实验','电影配乐','游戏音乐'];
const STRENGTHS = ['情感叙事','画面感歌词','钩子设计','氛围营造','节奏律动','和弦走向','人声处理','混音平衡','母带修复'];
const MOTTOS = [
  '「我喜欢先找到情绪转折点，再让一句 Hook 把故事收回来。」',
  '「歌词要有画面，但不能把话说满。留白是给听众的空间。」',
  '「副歌不是喊出来的，是被听众记住的。」',
];

const input = (extra?: React.CSSProperties): React.CSSProperties => ({
  width:'100%', background:'rgba(255,255,255,0.04)', border:`1px solid rgba(255,255,255,0.08)`,
  borderRadius:10, padding:'9px 13px', color:C.t0, fontSize:13, outline:'none', ...extra,
});

export function CreateAvatarPage({ navigate, onAvatarCreated }: { navigate: (p: Page) => void; onAvatarCreated?: (avatar: AvatarProfile) => void }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name:'林间之声', dir:'作词', repWorks:['夏末告别','山海之旅'], newWork:'',
    styleTags:['古风','情感叙事'], strengths:['情感叙事','画面感歌词','钩子设计'],
    avoid:'极端电子风格、重金属、纯说唱',
    method:'我通常先从情绪入手，找到核心意象，然后从意象展开故事线。Hook 一定要先写，其余围绕 Hook 展开。',
    motto:MOTTOS[0], intro:'',
  });

  const pct = Math.round((step/STEPS.length)*100);
  const toggleStyle = (s:string) => setForm(p=>({ ...p, styleTags: p.styleTags.includes(s)?p.styleTags.filter(x=>x!==s):[...p.styleTags,s] }));
  const toggleStr   = (s:string) => setForm(p=>({ ...p, strengths: p.strengths.includes(s)?p.strengths.filter(x=>x!==s):[...p.strengths,s] }));
  const addWork = () => { if(form.newWork.trim()) { setForm(p=>({...p,repWorks:[...p.repWorks,p.newWork.trim()],newWork:''})); } };

  async function handleCreate() {
    if (!form.name.trim()) {
      toast.info('请先填写分身名称');
      return;
    }
    setSaving(true);
    const creatorId = getCreatorId();
    const payload = {
      creatorId,
      name: form.name.trim(),
      dir: form.dir,
      tags: form.styleTags,
      strengths: form.strengths,
      motto: form.motto,
      intro: form.intro,
      method: form.method,
      avoid: form.avoid,
      representativeWorks: form.repWorks,
    };
    try {
      const avatar = await createCloudAvatar(payload);
      onAvatarCreated?.(avatar);
      toast.success('分身已自动发布，可被召唤，正在跳转到分身管理页…');
    } catch (error) {
      const avatar = createLocalAvatar(payload);
      onAvatarCreated?.(avatar);
      console.info(error);
      toast.success('分身已自动发布，可被召唤；D1 开通后会切换为云端资产');
    } finally {
      setSaving(false);
      setTimeout(()=>navigate('avatarManage'),800);
    }
  }

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden', background:C.bg0 }}>

      {/* Left: steps */}
      <div style={{ width:216, flexShrink:0, borderRight:`1px solid rgba(255,255,255,0.05)`, padding:'24px 12px', display:'flex', flexDirection:'column', gap:6, overflowY:'auto' }}>
        <p style={{ ...T.label, color:C.t3, marginBottom:8 }}>创建流程</p>
        {STEPS.map((s,idx)=>{
          const done = s.num<step; const active = s.num===step;
          return (
            <button key={s.num} onClick={()=>done&&setStep(s.num)} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 10px', borderRadius:10, textAlign:'left', width:'100%', background:active?C.accentDim:'transparent', border:active?`1px solid rgba(99,102,241,0.25)`:'1px solid transparent', cursor:done?'pointer':active?'default':'not-allowed' }}>
              <div style={{ width:22, height:22, borderRadius:'50%', border:`2px solid ${done?C.success:active?C.accent:'rgba(255,255,255,0.1)'}`, background:done?C.successDim:active?C.accentDim:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                {done?<Check size={11} color={C.success}/>:<span style={{ fontSize:9, fontWeight:700, color:active?C.accentLight:C.t3 }}>{s.num}</span>}
              </div>
              <div>
                <p style={{ ...T.caption, color:done?'#34D399':active?C.t0:C.t3, fontWeight:active?500:400 }}>{s.label}</p>
                <p style={{ ...T.label, color:C.t3, marginTop:2 }}>{s.sub}</p>
              </div>
            </button>
          );
        })}
        <div style={{ marginTop:16, padding:12, borderRadius:10, background:'rgba(99,102,241,0.06)', border:`1px solid rgba(99,102,241,0.15)` }}>
          <div style={{ display:'flex', gap:8 }}>
            <AlertCircle size={13} color={C.accentLight} style={{ flexShrink:0, marginTop:1 }}/>
            <p style={{ ...T.caption, color:C.t2, lineHeight:1.7 }}>创建分身后，平台将生成初始风格参数，你可以随时维护和进化它。</p>
          </div>
        </div>
      </div>

      {/* Center: form */}
      <div style={{ flex:1, overflowY:'auto', padding:'24px 32px' }}>
        <div style={{ marginBottom:24 }}>
          <h1 style={{ ...T.display, color:C.t0, marginBottom:4 }}>创建你的 Level 1 创作人分身</h1>
          <p style={{ ...T.caption, color:C.t2 }}>当前步骤：{STEPS[step-1].label} · {STEPS[step-1].sub} · 创建成功后默认自动发布</p>
          <div style={{ height:4, borderRadius:999, background:'rgba(255,255,255,0.07)', marginTop:12 }}>
            <div style={{ height:'100%', width:`${pct}%`, borderRadius:999, background:`linear-gradient(90deg,${C.accent},${C.accentLight})`, transition:'width 0.5s' }}/>
          </div>
        </div>

        {/* STEP 1 */}
        {step===1 && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div>
                <label style={{ ...T.caption, color:C.t1, fontWeight:500, display:'block', marginBottom:6 }}>分身名称 <span style={{ color:C.accent }}>*</span></label>
                <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="为你的分身起一个名字" style={input()}/>
                <p style={{ ...T.label, color:C.t3, marginTop:4 }}>建议使用有辨识度的名称，将出现在分身档案页</p>
              </div>
              <div>
                <label style={{ ...T.caption, color:C.t1, fontWeight:500, display:'block', marginBottom:6 }}>创作方向 <span style={{ color:C.accent }}>*</span></label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {DIRS.map(d=>{
                    const act=form.dir===d;
                    return <button key={d} onClick={()=>setForm(p=>({...p,dir:d}))} style={{ padding:'5px 12px', borderRadius:8, border:`1px solid ${act?'rgba(99,102,241,0.4)':'rgba(255,255,255,0.07)'}`, background:act?C.accentDim:'rgba(255,255,255,0.03)', color:act?C.accentLight:C.t2, cursor:'pointer', fontSize:12 }}>{d}</button>;
                  })}
                </div>
              </div>
            </div>
            <div>
              <label style={{ ...T.caption, color:C.t1, fontWeight:500, display:'block', marginBottom:6 }}>代表作品</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {form.repWorks.map(w=>(
                  <div key={w} style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 10px', borderRadius:8, background:'rgba(255,255,255,0.05)', border:`1px solid rgba(255,255,255,0.08)` }}>
                    <span style={{ ...T.caption, color:C.t1 }}>{w}</span>
                    <button onClick={()=>setForm(p=>({...p,repWorks:p.repWorks.filter(x=>x!==w)}))} style={{ background:'none', border:'none', cursor:'pointer', display:'flex' }}><X size={11} color={C.t3}/></button>
                  </div>
                ))}
                <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 10px', borderRadius:8, background:'rgba(255,255,255,0.03)', border:`1px dashed rgba(255,255,255,0.1)` }}>
                  <input value={form.newWork} onChange={e=>setForm(p=>({...p,newWork:e.target.value}))} placeholder="输入作品名…" onKeyDown={e=>e.key==='Enter'&&addWork()} style={{ background:'transparent', border:'none', outline:'none', color:C.t2, fontSize:12, width:100 }}/>
                  <button onClick={addWork} style={{ background:'none', border:'none', cursor:'pointer', display:'flex' }}><Plus size={13} color={C.accentLight}/></button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step===2 && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div>
              <label style={{ ...T.caption, color:C.t1, fontWeight:500, display:'block', marginBottom:6 }}>风格标签 <span style={{ ...T.caption, color:C.t3, fontWeight:400 }}>（选 2-5 个）</span></label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {STYLES.map(s=>{const a=form.styleTags.includes(s);return <button key={s} onClick={()=>toggleStyle(s)} style={{ padding:'5px 12px', borderRadius:8, border:`1px solid ${a?'rgba(99,102,241,0.4)':'rgba(255,255,255,0.07)'}`, background:a?C.accentDim:'rgba(255,255,255,0.03)', color:a?C.accentLight:C.t2, cursor:'pointer', fontSize:12 }}>{s}</button>;}) }
              </div>
            </div>
            <div>
              <label style={{ ...T.caption, color:C.t1, fontWeight:500, display:'block', marginBottom:6 }}>擅长类型</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {STRENGTHS.map(s=>{const a=form.strengths.includes(s);return <button key={s} onClick={()=>toggleStr(s)} style={{ padding:'5px 12px', borderRadius:8, border:`1px solid ${a?'rgba(16,185,129,0.3)':'rgba(255,255,255,0.07)'}`, background:a?C.successDim:'rgba(255,255,255,0.03)', color:a?'#34D399':C.t2, cursor:'pointer', fontSize:12 }}>{s}</button>;}) }
              </div>
            </div>
            <div>
              <label style={{ ...T.caption, color:C.t1, fontWeight:500, display:'block', marginBottom:6 }}>不擅长 / 不接受的场景</label>
              <textarea value={form.avoid} onChange={e=>setForm(p=>({...p,avoid:e.target.value}))} rows={3} style={{ ...input(), resize:'none', lineHeight:1.7 }}/>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step===3 && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div>
              <label style={{ ...T.caption, color:C.t1, fontWeight:500, display:'block', marginBottom:6 }}>你的创作方法 / 习惯</label>
              <textarea value={form.method} onChange={e=>setForm(p=>({...p,method:e.target.value}))} rows={5} style={{ ...input(), resize:'none', lineHeight:1.8 }}/>
              <p style={{ ...T.label, color:C.t3, marginTop:4 }}>这些描述将用于初始化分身的创作风格参数</p>
            </div>
            <GlassCard glow="warning" pad={16}>
              <p style={{ ...T.caption, color:C.warning, fontWeight:500, marginBottom:10 }}>风格校准问卷</p>
              {[
                { q:'你通常先构思旋律还是歌词？', opts:['先旋律','先歌词','同步构思'] },
                { q:'你倾向于写口语化还是文学化的歌词？', opts:['口语化','偏文学','两者结合'] },
              ].map((item,i)=>(
                <div key={i} style={{ marginBottom:12 }}>
                  <p style={{ ...T.caption, color:C.t1, marginBottom:6 }}>{item.q}</p>
                  <div style={{ display:'flex', gap:6 }}>
                    {item.opts.map((opt,j)=>(
                      <button key={opt} style={{ flex:1, padding:'6px 0', borderRadius:8, border:`1px solid ${j===2?'rgba(245,158,11,0.3)':'rgba(255,255,255,0.07)'}`, background:j===2?C.warningDim:'rgba(255,255,255,0.03)', color:j===2?C.warning:C.t2, cursor:'pointer', fontSize:11 }}>{opt}</button>
                    ))}
                  </div>
                </div>
              ))}
            </GlassCard>
          </div>
        )}

        {/* STEP 4 */}
        {step===4 && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div>
              <label style={{ ...T.caption, color:C.t1, fontWeight:500, display:'block', marginBottom:6 }}>创作格言（选择一条或编辑）</label>
              {MOTTOS.map(m=>(
                <button key={m} onClick={()=>setForm(p=>({...p,motto:m}))} style={{ width:'100%', display:'block', padding:'12px 14px', borderRadius:10, textAlign:'left', marginBottom:6, border:`1px solid ${form.motto===m?'rgba(99,102,241,0.4)':'rgba(255,255,255,0.07)'}`, background:form.motto===m?C.accentDim:'rgba(255,255,255,0.03)', cursor:'pointer' }}>
                  <span style={{ ...T.caption, color:form.motto===m?C.t0:C.t2, fontStyle:'italic' }}>{m}</span>
                </button>
              ))}
            </div>
            <div>
              <label style={{ ...T.caption, color:C.t1, fontWeight:500, display:'block', marginBottom:6 }}>分身简介（可选）</label>
              <textarea value={form.intro} onChange={e=>setForm(p=>({...p,intro:e.target.value}))} rows={3} placeholder="简单介绍分身风格、擅长方向和创作理念…" style={{ ...input(), resize:'none', lineHeight:1.7 }}/>
            </div>
            <GlassCard glow="success" pad={14}>
              <p style={{ ...T.caption, color:'#34D399', fontWeight:500, marginBottom:8 }}>创建后你将获得</p>
              {['Level 1 分身档案','初始风格参数 JSON','自动发布 · 可被召唤','首个校准邀请（3天后）'].map(item=>(
                <div key={item} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
                  <Check size={11} color={C.success}/><span style={{ ...T.caption, color:C.t1 }}>{item}</span>
                </div>
              ))}
            </GlassCard>
          </div>
        )}

        {/* Nav */}
        <div style={{ display:'flex', gap:10, marginTop:28 }}>
          {step>1 && <button onClick={()=>setStep(s=>s-1)} style={{ ...S.btnGhost, padding:'8px 18px', borderRadius:10 }}>上一步</button>}
          <div style={{ flex:1 }}/>
          {step<STEPS.length
            ?<button onClick={()=>setStep(s=>s+1)} style={{ ...S.btnPrimary, display:'flex', alignItems:'center', gap:8, padding:'9px 22px', borderRadius:10 }}>下一步<ChevronRight size={14}/></button>
            :<button onClick={handleCreate} disabled={saving} style={{ ...S.btnSuccess, display:'flex', alignItems:'center', gap:8, padding:'9px 22px', borderRadius:10, opacity:saving?0.7:1 }}><Check size={14}/>{saving?'保存中…':'完成创建'}</button>
          }
        </div>
      </div>

      {/* Right: preview */}
      <div style={{ width:252, flexShrink:0, borderLeft:`1px solid rgba(255,255,255,0.05)`, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:12 }}>
        <p style={{ ...T.label, color:C.t3 }}>分身预览</p>
        <GlassCard style={{ overflow:'hidden' }}>
          <div style={{ height:96, background:'linear-gradient(135deg,#2D1B6988,#1A3A4A88)', position:'relative', display:'flex', alignItems:'flex-end', padding:'0 12px 10px' }}>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,transparent,rgba(16,19,29,0.42))' }}/>
            <div style={{ position:'relative', display:'flex', alignItems:'flex-end', gap:8 }}>
              <div style={{ width:44, height:44, borderRadius:10, background:'rgba(99,102,241,0.5)', border:'2px solid rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>✍️</div>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                  <span style={{ ...T.caption, color:C.t0, fontWeight:700 }}>{form.name||'分身名称'}</span>
                  <span style={{ padding:'1px 5px', borderRadius:4, background:'rgba(99,102,241,0.4)', color:'#C8BBFF', fontSize:9, fontWeight:700 }}>Lv1</span>
                </div>
                <Tag variant="accent">{form.dir}方向</Tag>
              </div>
            </div>
          </div>
          <div style={{ padding:'12px 14px' }}>
            {form.motto && <p style={{ ...T.label, color:C.t2, fontStyle:'italic', lineHeight:1.7, marginBottom:8 }}>{form.motto}</p>}
            <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:10 }}>
              {form.styleTags.map(t=><Tag key={t} variant="dim">{t}</Tag>)}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
              {[{l:'被召唤',v:'0'},{l:'采纳率',v:'—'},{l:'代表作',v:`${form.repWorks.length}`}].map(s=>(
                <div key={s.l} style={{ textAlign:'center', padding:'6px', borderRadius:8, background:'rgba(255,255,255,0.03)' }}>
                  <p style={{ color:C.t0, fontSize:13, fontWeight:700 }}>{s.v}</p>
                  <p style={{ ...T.label, color:C.t3 }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        <GlassCard pad={14} style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
          <p style={{ ...T.label, color:C.t3, marginBottom:8, alignSelf:'flex-start' }}>初始能力评估</p>
          <RadarChart values={[0.65,0.50,0.70,0.60,0.55]} labels={['旋律感','节奏感','画面感','情感力','风格性']} size={140}/>
          <p style={{ ...T.label, color:C.t3, marginTop:6 }}>将随维护成长</p>
        </GlassCard>

        <GlassCard pad={14}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <p style={{ ...T.caption, color:C.t1, fontWeight:500 }}>创建进度</p>
            <p style={{ color:C.accentLight, fontSize:18, fontWeight:800 }}>{pct}%</p>
          </div>
          <div style={{ height:5, borderRadius:999, background:'rgba(255,255,255,0.07)' }}>
            <div style={{ height:'100%', width:`${pct}%`, borderRadius:999, background:`linear-gradient(90deg,${C.accent},${C.accentLight})`, transition:'width 0.5s' }}/>
          </div>
          <p style={{ ...T.label, color:C.t3, marginTop:8 }}>{step<STEPS.length?`还剩 ${STEPS.length-step} 步`:'所有步骤已完成 ✓'}</p>
        </GlassCard>
      </div>
    </div>
  );
}
