import { Tag } from '../common/Tag';
import { Waveform } from '../common/Waveform';
import { RadarChart } from '../common/RadarChart';
import { GlassCard } from '../common/GlassCard';
import { C, T, S } from '../../design/tokens';
import { Sparkles, Play, Check, Bell, Search, Zap, Star, Music, Users, Bot } from 'lucide-react';

const COLORS = [
  { name:'bg0 — 最深背景',   hex:C.bg0,      role:'页面根背景、侧边栏' },
  { name:'bgCard — 卡片',    hex:C.bgCard,   role:'玻璃卡片填充层' },
  { name:'bgRaised — 高亮',  hex:C.bgRaised, role:'悬浮/激活卡片' },
  { name:'bdr1 — 边框',      hex:C.bdr1,     role:'卡片默认边框' },
  { name:'accent — 主色',    hex:C.accent,   role:'主按钮、激活状态、焦点' },
  { name:'accentLight',       hex:C.accentLight, role:'浅色强调文字' },
  { name:'cyan — 科技感',    hex:C.cyan,     role:'数字、技术类强调' },
  { name:'success',           hex:C.success,  role:'完成、正向指标' },
  { name:'warning',           hex:C.warning,  role:'进行中、需关注' },
  { name:'error',             hex:C.error,    role:'错误、删除' },
  { name:'t0 — 主要文字',    hex:C.t0,       role:'标题、重要内容' },
  { name:'t1 — 次要文字',    hex:C.t1,       role:'描述、正文' },
  { name:'t2 — 辅助文字',    hex:C.t2,       role:'标注、次要说明' },
  { name:'t3 — 禁用文字',    hex:C.t3,       role:'占位符、图例' },
];

const TYPE_SCALE = [
  { name:'display', ...T.display,  sample:'MuseGrid 创作台',       usage:'页面主标题' },
  { name:'heading',  ...T.heading, sample:'创作人分身网络',          usage:'区块标题' },
  { name:'subheading',...T.subheading,sample:'最近项目',             usage:'子标题' },
  { name:'body',    ...T.body,     sample:'召唤你的创作班底，开始下一首作品', usage:'正文' },
  { name:'caption', ...T.caption,  sample:'被召唤 560 次 · 采纳率 84%', usage:'卡片标注' },
  { name:'label',   ...T.label,    sample:'UPPERCASE LABEL · 10PX', usage:'区块标签（全大写）' },
];

export function DesignSystemPage() {
  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden', background:C.bg0 }}>
      <div style={{ flex:1, overflowY:'auto', padding:'32px 40px' }}>

        {/* Title */}
        <div style={{ marginBottom:40 }}>
          <h1 style={{ ...T.display, color:C.t0, marginBottom:4 }}>MuseGrid 设计系统</h1>
          <p style={{ ...T.caption, color:C.t2 }}>Deep Space Theme · Design Tokens · v2.1 · 2026-06-25</p>
          <div style={{ display:'flex', gap:6, marginTop:12 }}>
            <Tag variant="accent">Dark Only</Tag>
            <Tag variant="cyan">Glassmorphism</Tag>
            <Tag variant="default">Tailwind CSS v4</Tag>
            <Tag variant="default">React 18</Tag>
            <Tag variant="default">Inter + Noto Sans SC</Tag>
          </div>
        </div>

        <Sec title="1. 设计原则">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            {[
              { t:'深空电影质感', d:'极深蓝黑背景 + 玻璃态卡片 + 辉光激活态。视觉上有层次感和深度，不是平面暗色。' },
              { t:'信息密度平衡', d:'高密度数据区域用紧凑排版；创作输入区域保持充分留白。密度跟随内容性质变化。' },
              { t:'贡献链路可见', d:'每个关键动作都有明确的视觉反馈。贡献、确认、参数变化全程可追踪。' },
            ].map(p=>(
              <GlassCard key={p.t} pad={16}>
                <p style={{ ...T.caption, color:C.accentLight, fontWeight:500, marginBottom:6 }}>{p.t}</p>
                <p style={{ ...T.caption, color:C.t2, lineHeight:1.7 }}>{p.d}</p>
              </GlassCard>
            ))}
          </div>
        </Sec>

        <Sec title="2. 色彩 Token">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
            {COLORS.map(c=>(
              <div key={c.name} style={{ display:'flex', gap:10, padding:12, borderRadius:12, background:C.bgCard, border:`1px solid ${C.bdr0}` }}>
                <div style={{ width:36, height:36, borderRadius:8, background:c.hex, border:'1px solid rgba(255,255,255,0.08)', flexShrink:0 }}/>
                <div style={{ minWidth:0 }}>
                  <p style={{ color:C.t1, fontSize:11, fontWeight:500 }}>{c.name}</p>
                  <p style={{ color:C.t3, fontSize:9, fontFamily:"'Inter',monospace", margin:'1px 0 3px' }}>{c.hex}</p>
                  <p style={{ color:C.t3, fontSize:9 }}>{c.role}</p>
                </div>
              </div>
            ))}
          </div>
        </Sec>

        <Sec title="3. 字体体系（6级制）">
          <GlassCard pad={16} style={{ marginBottom:12 }}>
            <p style={{ ...T.label, color:C.t3, marginBottom:8 }}>字体栈</p>
            <div style={{ display:'flex', gap:32 }}>
              <div>
                <p style={{ color:C.accentLight, fontSize:11, fontWeight:500, marginBottom:2 }}>中文</p>
                <p style={{ color:C.t2, fontSize:11, fontFamily:"'Inter',monospace" }}>'Noto Sans SC', 'PingFang SC', sans-serif</p>
              </div>
              <div>
                <p style={{ color:C.accentLight, fontSize:11, fontWeight:500, marginBottom:2 }}>英文 / 数字</p>
                <p style={{ color:C.t2, fontSize:11, fontFamily:"'Inter',monospace" }}>'Inter', -apple-system, sans-serif</p>
              </div>
            </div>
          </GlassCard>
          {TYPE_SCALE.map(t=>(
            <div key={t.name} style={{ display:'flex', alignItems:'baseline', gap:20, padding:'12px 16px', borderRadius:10, background:C.bgCard, border:`1px solid ${C.bdr0}`, marginBottom:4 }}>
              <div style={{ width:100, flexShrink:0 }}>
                <p style={{ color:C.t3, fontSize:9, fontFamily:"'Inter',monospace" }}>{t.name}</p>
                <p style={{ color:C.t3, fontSize:9 }}>{t.fontSize}px · {t.fontWeight}</p>
              </div>
              <p style={{ color:C.t0, fontSize:t.fontSize, fontWeight:t.fontWeight, flex:1 }}>{t.sample}</p>
              <p style={{ color:C.t3, fontSize:10, flexShrink:0 }}>{t.usage}</p>
            </div>
          ))}
        </Sec>

        <Sec title="4. 间距与圆角">
          <div style={{ display:'flex', gap:32 }}>
            <div>
              <p style={{ ...T.label, color:C.t3, marginBottom:10 }}>间距基准（4px 网格）</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:12, alignItems:'flex-end' }}>
                {[4,8,12,16,20,24,32,40,48,64].map(s=>(
                  <div key={s} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <div style={{ width:s, height:s, background:C.accent, borderRadius:2, opacity:0.7 }}/>
                    <span style={{ color:C.t3, fontSize:9 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p style={{ ...T.label, color:C.t3, marginBottom:10 }}>圆角系统</p>
              <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                {[{n:'sm',r:6},{n:'md',r:8},{n:'lg',r:10},{n:'xl',r:12},{n:'2xl',r:16},{n:'full',r:999}].map(ri=>(
                  <div key={ri.n} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <div style={{ width:40, height:40, background:C.bgRaised, border:`1px solid ${C.accent}`, borderRadius:Math.min(ri.r,20) }}/>
                    <span style={{ color:C.t3, fontSize:9 }}>{ri.n}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Sec>

        <Sec title="5. 按钮规范">
          <div style={{ display:'flex', flexWrap:'wrap', gap:20, alignItems:'center' }}>
            {[
              { label:'Primary', el:<button style={{ ...S.btnPrimary, display:'flex', alignItems:'center', gap:8, padding:'9px 18px', borderRadius:10 }}><Sparkles size={14}/>开始制作</button> },
              { label:'Ghost',   el:<button style={{ ...S.btnGhost,   display:'flex', alignItems:'center', gap:8, padding:'9px 18px', borderRadius:10 }}><Play size={13}/>继续修改</button> },
              { label:'Accent Outline', el:<button style={{ ...S.btnAccentOutline, display:'flex', alignItems:'center', gap:8, padding:'9px 18px', borderRadius:10 }}><Star size={13}/>收藏分身</button> },
              { label:'Success', el:<button style={{ ...S.btnSuccess, display:'flex', alignItems:'center', gap:8, padding:'9px 18px', borderRadius:10 }}><Check size={14}/>确认完成</button> },
              { label:'Chip / Toggle', el:(
                <div style={{ display:'flex', gap:5 }}>
                  {['古风','流行','电子'].map((t,i)=><button key={t} style={{ padding:'5px 12px', borderRadius:8, border:`1px solid ${i===0?'rgba(99,102,241,0.4)':'rgba(255,255,255,0.07)'}`, background:i===0?C.accentDim:'rgba(255,255,255,0.03)', color:i===0?C.accentLight:C.t2, cursor:'pointer', fontSize:12 }}>{t}</button>)}
                </div>
              )},
            ].map(b=>(
              <div key={b.label}>
                <p style={{ ...T.label, color:C.t3, marginBottom:6 }}>{b.label}</p>
                {b.el}
              </div>
            ))}
          </div>
        </Sec>

        <Sec title="6. 标签（Tag）">
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, alignItems:'center' }}>
            {(['accent','success','warning','error','default','dim','cyan','outline'] as const).map(v=>(
              <div key={v} style={{ display:'flex', flexDirection:'column', gap:4, alignItems:'center' }}>
                <Tag variant={v}>示例标签</Tag>
                <span style={{ ...T.label, color:C.t3 }}>{v}</span>
              </div>
            ))}
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'3px 10px', borderRadius:6, background:C.successDim, border:`1px solid rgba(16,185,129,0.2)` }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:C.success }}/>
              <span style={{ fontSize:10, color:'#34D399' }}>状态良好</span>
            </div>
          </div>
        </Sec>

        <Sec title="7. 卡片模式">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            <div>
              <p style={{ ...T.label, color:C.t3, marginBottom:8 }}>默认玻璃卡片</p>
              <GlassCard pad={16}><p style={{ ...T.caption, color:C.t0 }}>backdrop-filter: blur(24px)</p><p style={{ ...T.label, color:C.t2, marginTop:4 }}>rgba(255,255,255,0.058) fill</p></GlassCard>
            </div>
            <div>
              <p style={{ ...T.label, color:C.t3, marginBottom:8 }}>激活态（accent glow）</p>
              <GlassCard active pad={16}><p style={{ ...T.caption, color:C.t0 }}>活跃状态卡片</p><p style={{ ...T.label, color:C.accentLight, marginTop:4 }}>box-shadow + accent border</p></GlassCard>
            </div>
            <div>
              <p style={{ ...T.label, color:C.t3, marginBottom:8 }}>成功态（glow="success"）</p>
              <GlassCard glow="success" pad={16}><p style={{ ...T.caption, color:C.t0 }}>成功/完成状态</p><p style={{ ...T.label, color:'#34D399', marginTop:4 }}>绿色辉光边框</p></GlassCard>
            </div>
          </div>
        </Sec>

        <Sec title="8. 数据可视化">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            <GlassCard pad={16}>
              <p style={{ ...T.label, color:C.t3, marginBottom:8 }}>波形（Waveform）</p>
              <Waveform bars={48} progress={0.38} height={40} seed={5} activeColor={C.accent} inactiveColor="rgba(255,255,255,0.08)"/>
              <div style={{ marginTop:8 }}><Waveform bars={48} progress={0} height={28} seed={5} inactiveColor="rgba(255,255,255,0.06)"/></div>
            </GlassCard>
            <GlassCard pad={16} style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
              <p style={{ ...T.label, color:C.t3, marginBottom:8, alignSelf:'flex-start' }}>雷达图（RadarChart）</p>
              <RadarChart values={[0.85,0.70,0.90,0.75,0.80]} labels={['旋律感','节奏感','画面感','情感力','风格性']} size={150}/>
            </GlassCard>
            <GlassCard pad={16}>
              <p style={{ ...T.label, color:C.t3, marginBottom:10 }}>进度条</p>
              {[{l:'创建进度',p:75,c:C.accent},{l:'分身完整度',p:60,c:C.success},{l:'采纳率',p:84,c:C.warning}].map(bar=>(
                <div key={bar.l} style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ ...T.caption, color:C.t2 }}>{bar.l}</span>
                    <span style={{ ...T.caption, color:C.t0, fontWeight:600 }}>{bar.p}%</span>
                  </div>
                  <div style={{ height:4, borderRadius:999, background:'rgba(255,255,255,0.07)' }}>
                    <div style={{ height:'100%', width:`${bar.p}%`, borderRadius:999, background:bar.c }}/>
                  </div>
                </div>
              ))}
            </GlassCard>
          </div>
        </Sec>

        <Sec title="9. 布局规范">
          <GlassCard pad={20}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
              {[
                ['侧边栏宽度','196px（固定）'],['顶栏高度','52px（固定）'],['底部播放器','60px（固定）'],
                ['页面内边距','水平 28-32px，垂直 24-32px'],['右侧面板宽度','252–290px（固定）'],['左侧子面板','204–216px（固定）'],
                ['卡片圆角','12–16px'],['卡片内边距','12–20px'],['间距基准','4px 倍数'],
                ['图标规格','11–16px（lucide-react）'],['过渡动画','150ms ease'],['Backdrop blur','24px saturate(1.4)'],
              ].map(([k,v])=>(
                <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ ...T.caption, color:C.t2 }}>{k}</span>
                  <span style={{ ...T.caption, color:C.accentLight, fontFamily:"'Inter',monospace" }}>{v}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </Sec>

        <Sec title="10. 关键页面">
          {[
            { title:'创作台首页',       path:'home',           layout:'左主区（flex-1）+ 右侧面板（272px）' },
            { title:'项目制作页',       path:'production',     layout:'左链路（204px）+ 主工作区（flex-1）+ 右分身（252px）' },
            { title:'创作人分身网络',   path:'avatarNetwork',  layout:'列表主区（flex-1）+ 右详情（280px）' },
            { title:'创建分身',         path:'createAvatar',   layout:'左步骤（216px）+ 表单（flex-1）+ 右预览（252px）' },
            { title:'我的作品',         path:'myWorks',        layout:'列表页 / 作品详情页（子路由）' },
            { title:'分身管理',         path:'avatarManage',   layout:'左总览（216px）+ 主面板（flex-1）+ 右操作（248px）' },
            { title:'进化报告',         path:'evolutionReport',layout:'单列滚动，maxWidth 800px' },
            { title:'3分钟校准',        path:'calibration',    layout:'单列滚动，maxWidth 680px' },
            { title:'贡献链路',         path:'contribution',   layout:'左列表（290px）+ 主链路（flex-1）+ 右收益（252px）' },
          ].map(p=>(
            <GlassCard key={p.title} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', marginBottom:6 }}>
              <p style={{ ...T.caption, color:C.t0, fontWeight:500 }}>{p.title}</p>
              <code style={{ color:C.accentLight, fontSize:11, background:C.accentDim, padding:'2px 8px', borderRadius:5 }}>{p.path}</code>
              <p style={{ ...T.caption, color:C.t2, textAlign:'right', maxWidth:300 }}>{p.layout}</p>
            </GlassCard>
          ))}
        </Sec>

        <div style={{ height:40 }}/>
      </div>
    </div>
  );
}

function Sec({ title, children }: { title:string; children:React.ReactNode }) {
  return (
    <div style={{ marginBottom:36 }}>
      <h2 style={{ ...T.subheading, color:C.t0, marginBottom:14, paddingBottom:8, borderBottom:`1px solid rgba(255,255,255,0.05)` }}>{title}</h2>
      {children}
    </div>
  );
}
