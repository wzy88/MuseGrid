import { Check, FileText, Code2, Layers, GitBranch, Zap } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { Tag } from '../common/Tag';
import { C, T, S } from '../../design/tokens';
import type { Page } from '../layout/Sidebar';

const PAGES = [
  { id:'home',           name:'创作台首页',     status:'done', desc:'灵感输入、最近项目、分身网络预览' },
  { id:'production',     name:'项目制作页',     status:'done', desc:'4步状态机、分身召唤、贡献预写入、Demo生成' },
  { id:'avatarNetwork',  name:'创作人分身网络', status:'done', desc:'方向筛选、风格多选、详情面板、雷达图' },
  { id:'createAvatar',   name:'创建分身',       status:'done', desc:'4步引导表单、实时预览、完成后跳转' },
  { id:'myWorks',        name:'我的作品',       status:'done', desc:'列表+详情子页、播放器、贡献链路、协议选择' },
  { id:'avatarManage',   name:'分身管理',       status:'done', desc:'统计、维护队列、风格参数、成长路径、校准记录' },
  { id:'evolutionReport',name:'进化报告',       status:'done', desc:'市场数据、人格保真、方向分析、代表作预览' },
  { id:'calibration',    name:'3分钟校准会话',  status:'done', desc:'3步流程、打分、问答、参数摘要、确认/回滚' },
  { id:'contribution',   name:'贡献链路',       status:'done', desc:'作品接力链可视化、收益分配、协议与权属' },
];

const INTERACTIONS = [
  { page:'制作页', item:'4步推进', fixed:true },
  { page:'制作页', item:'确认成果→写入贡献链路', fixed:true },
  { page:'制作页', item:'Demo 生成流程', fixed:true },
  { page:'制作页', item:'继续修改（需先填意见）', fixed:true },
  { page:'制作页', item:'换分身对比', fixed:true },
  { page:'分身网络', item:'收藏/取消收藏', fixed:true },
  { page:'我的作品', item:'分享（复制链接）', fixed:true },
  { page:'我的作品', item:'导出（loading→完成）', fixed:true },
  { page:'我的作品', item:'协议确认（显示成功条）', fixed:true },
  { page:'我的作品', item:'召唤推广/发行分身', fixed:true },
  { page:'校准会话', item:'暂不应用（返回分身管理）', fixed:true },
  { page:'校准会话', item:'回滚上一轮（loading反馈）', fixed:true },
  { page:'分身管理', item:'暂停/恢复召唤（真实toggle）', fixed:true },
  { page:'分身管理', item:'回滚参数（loading反馈）', fixed:true },
  { page:'分身管理', item:'3个通知开关（真实切换）', fixed:true },
  { page:'创建分身', item:'完成创建（Toast+延迟跳转）', fixed:true },
];

const TOKENS = [
  { token:'bg0',        value:'#06070F',                  usage:'根背景' },
  { token:'bgCard',     value:'rgba(255,255,255,0.038)',   usage:'玻璃卡片' },
  { token:'accent',     value:'#6366F1',                  usage:'主色' },
  { token:'accentLight',value:'#818CF8',                  usage:'强调文字' },
  { token:'cyan',       value:'#06B6D4',                  usage:'科技感点缀' },
  { token:'success',    value:'#10B981',                  usage:'完成/确认' },
  { token:'warning',    value:'#F59E0B',                  usage:'进行中/等级' },
  { token:'error',      value:'#EF4444',                  usage:'错误/删除' },
  { token:'t0',         value:'rgba(255,255,255,0.92)',    usage:'主文字' },
  { token:'t1',         value:'rgba(255,255,255,0.55)',    usage:'次文字' },
  { token:'t2',         value:'rgba(255,255,255,0.30)',    usage:'辅助文字' },
  { token:'t3',         value:'rgba(255,255,255,0.16)',    usage:'占位/禁用' },
];

export function HandoffPage({ navigate }: { navigate: (p: Page) => void }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', background:C.bg0 }}>
      <div style={{ flex:1, overflowY:'auto', padding:'32px 40px' }}>

        {/* Header */}
        <div style={{ marginBottom:36 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${C.accent},${C.accentDark})`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 20px rgba(99,102,241,0.4)' }}>
              <FileText size={18} color="#fff"/>
            </div>
            <h1 style={{ ...T.display, color:C.t0 }}>研发交付清单</h1>
          </div>
          <p style={{ ...T.caption, color:C.t2 }}>MuseGrid v2 · 2026-06-25 · Phase 1 + Phase 2 完整交付</p>
          <div style={{ display:'flex', gap:6, marginTop:10 }}>
            <Tag variant="success">Path A：代码可直接使用</Tag>
            <Tag variant="accent">Path B：设计规范文档已生成</Tag>
            <Tag variant="cyan">9个页面全部完成</Tag>
            <Tag variant="default">16项交互死胡同全部修复</Tag>
          </div>
        </div>

        {/* Section 1: Files */}
        <Sec icon={Code2} title="交付文件清单">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[
              { file:'DESIGN_SPEC.md',              desc:'完整设计规范文档（本文档来源）',        type:'doc' },
              { file:'src/app/design/tokens.ts',    desc:'设计 Token 单一来源，所有颜色/字体/样式', type:'code' },
              { file:'src/app/components/common/',  desc:'GlassCard / Tag / Waveform / RadarChart', type:'code' },
              { file:'src/app/components/layout/',  desc:'Sidebar / TopBar / BottomPlayer',         type:'code' },
              { file:'src/app/components/pages/',   desc:'9个业务页面完整实现',                   type:'code' },
              { file:'src/styles/theme.css',         desc:'全局背景效果（点阵网格 + 辉光）',        type:'css' },
              { file:'src/styles/fonts.css',         desc:'字体引用（Noto Sans SC + Inter）',       type:'css' },
              { file:'src/app/App.tsx',              desc:'路由入口 + Toaster 全局配置',            type:'code' },
            ].map(f=>(
              <GlassCard key={f.file} style={{ display:'flex', gap:12, padding:14 }}>
                <div style={{ width:28, height:28, borderRadius:6, background: f.type==='doc'?'rgba(6,182,212,0.15)':f.type==='css'?'rgba(245,158,11,0.15)':'rgba(99,102,241,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontSize:12 }}>{f.type==='doc'?'📄':f.type==='css'?'🎨':'💻'}</span>
                </div>
                <div>
                  <p style={{ ...T.caption, color:C.accentLight, fontFamily:"'Inter',monospace", marginBottom:3 }}>{f.file}</p>
                  <p style={{ ...T.label, color:C.t2, lineHeight:1.5 }}>{f.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </Sec>

        {/* Section 2: Pages */}
        <Sec icon={Layers} title="页面完成情况">
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {PAGES.map((pg,idx)=>(
              <div key={pg.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'10px 16px', borderRadius:10, background:C.bgCard, border:`1px solid ${C.bdr0}` }}>
                <span style={{ color:C.t3, fontSize:12, fontWeight:700, fontFamily:"'Inter',monospace", width:20, textAlign:'right' }}>{String(idx+1).padStart(2,'0')}</span>
                <div style={{ width:6, height:6, borderRadius:'50%', background:C.success, flexShrink:0 }}/>
                <p style={{ ...T.caption, color:C.t0, fontWeight:500, width:160, flexShrink:0 }}>{pg.name}</p>
                <code style={{ ...T.label, color:C.accentLight, background:C.accentDim, padding:'1px 8px', borderRadius:4, flexShrink:0 }}>{pg.id}</code>
                <p style={{ ...T.caption, color:C.t2, flex:1 }}>{pg.desc}</p>
                <Tag variant="success">完成</Tag>
              </div>
            ))}
          </div>
        </Sec>

        {/* Section 3: Interaction fixes */}
        <Sec icon={Zap} title="交互闭环修复清单">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
            {INTERACTIONS.map(item=>(
              <div key={item.item} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:8, background:C.bgCard, border:`1px solid ${C.bdr0}` }}>
                <Check size={13} color={C.success}/>
                <span style={{ ...T.label, color:C.t3, width:64, flexShrink:0 }}>{item.page}</span>
                <span style={{ ...T.caption, color:C.t1, flex:1 }}>{item.item}</span>
              </div>
            ))}
          </div>
        </Sec>

        {/* Section 4: Token table */}
        <Sec icon={GitBranch} title="核心 Token 速查">
          <GlassCard pad={16}>
            <p style={{ ...T.label, color:C.t3, marginBottom:12 }}>引用方式：<code style={{ color:C.accentLight, background:C.accentDim, padding:'1px 6px', borderRadius:4 }}>import {'{ C, T, S }'} from '../../design/tokens'</code></p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
              {TOKENS.map(tk=>(
                <div key={tk.token} style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <div style={{ width:20, height:20, borderRadius:4, background:tk.value, border:'1px solid rgba(255,255,255,0.1)', flexShrink:0 }}/>
                  <div>
                    <p style={{ color:C.accentLight, fontSize:10, fontFamily:"'Inter',monospace" }}>C.{tk.token}</p>
                    <p style={{ ...T.label, color:C.t3, fontSize:9 }}>{tk.usage}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </Sec>

        {/* Section 5: Key rules */}
        <Sec icon={FileText} title="研发对接关键规则">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[
              { title:'颜色单一来源', rule:'所有颜色从 tokens.ts 引用，禁止在组件内硬编码 hex 值' },
              { title:'字体严格6级', rule:'只用 T.display/heading/subheading/body/caption/label，不自定义尺寸' },
              { title:'间距4px网格', rule:'只用 4/8/12/16/20/24/32/40/48/64px，不使用奇数或非4倍数' },
              { title:'GlassCard统一', rule:'所有卡片用 GlassCard 组件，不自行写 backdrop-filter + background' },
              { title:'Toast反馈', rule:'所有按钮点击必须有 Toast 或视觉反馈，不允许静默无反应' },
              { title:'Backdrop注意', rule:'父容器不能设 overflow:hidden，否则 blur 效果失效' },
              { title:'中文行高', rule:'中文段落 lineHeight ≥ 1.6，多行段落用 1.7-1.8' },
              { title:'图标统一', rule:'只用 lucide-react，尺寸见图标规范表' },
            ].map(r=>(
              <GlassCard key={r.title} pad={14}>
                <p style={{ ...T.caption, color:C.accentLight, fontWeight:500, marginBottom:4 }}>{r.title}</p>
                <p style={{ ...T.caption, color:C.t2, lineHeight:1.6 }}>{r.rule}</p>
              </GlassCard>
            ))}
          </div>
        </Sec>

        {/* Navigate buttons */}
        <div style={{ display:'flex', gap:10, marginTop:16, paddingTop:24, borderTop:`1px solid rgba(255,255,255,0.05)` }}>
          <p style={{ ...T.caption, color:C.t2, flex:1, alignSelf:'center' }}>点击左侧导航切换页面，顶栏「设计系统」查看完整 Token 规范</p>
          {[
            { label:'查看首页', page:'home' as Page },
            { label:'查看制作页', page:'production' as Page },
            { label:'查看分身网络', page:'avatarNetwork' as Page },
          ].map(btn=>(
            <button key={btn.label} onClick={()=>navigate(btn.page)} style={{ ...S.btnAccentOutline, padding:'8px 16px', borderRadius:10, fontSize:12 }}>
              {btn.label}
            </button>
          ))}
          <button onClick={()=>navigate('home')} style={{ ...S.btnPrimary, padding:'8px 20px', borderRadius:10 }}>
            进入原型预览
          </button>
        </div>

        <div style={{ height:40 }}/>
      </div>
    </div>
  );
}

function Sec({ icon: Icon, title, children }: { icon: React.ElementType; title:string; children:React.ReactNode }) {
  return (
    <div style={{ marginBottom:32 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, paddingBottom:8, borderBottom:`1px solid rgba(255,255,255,0.05)` }}>
        <Icon size={15} color={C.accentLight}/>
        <h2 style={{ ...T.subheading, color:C.t0 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}
