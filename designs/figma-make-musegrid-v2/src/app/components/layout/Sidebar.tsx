import { Sparkles, Music, Users, UserPlus, Bot, Link2, CreditCard, HelpCircle, Grid3X3 } from 'lucide-react';
import { C, T } from '../../design/tokens';

export type Page =
  | 'home' | 'production' | 'avatarNetwork' | 'createAvatar'
  | 'myWorks' | 'avatarManage' | 'contribution'
  | 'evolutionReport' | 'calibration';

interface SidebarProps { currentPage: Page; navigate: (page: Page) => void; }

const NAV = [
  {
    label: '主功能',
    items: [
      { id: 'home'          as Page, icon: Sparkles, label: '创作台' },
      { id: 'myWorks'       as Page, icon: Music,    label: '我的作品' },
      { id: 'avatarNetwork' as Page, icon: Users,    label: '分身网络' },
    ],
  },
  {
    label: '创作人',
    items: [
      { id: 'createAvatar' as Page, icon: UserPlus, label: '申请入驻', accent: true },
      { id: 'avatarManage' as Page, icon: Bot,      label: '分身管理', badge: '1' },
      { id: 'contribution' as Page, icon: Link2,    label: '贡献链路' },
    ],
  },
];

const SUB_PARENT: Partial<Record<Page, Page>> = {
  evolutionReport: 'avatarManage',
  calibration:     'avatarManage',
  production:      'home',
};

export function Sidebar({ currentPage, navigate }: SidebarProps) {
  const effective = SUB_PARENT[currentPage] ?? currentPage;

  return (
    <aside
      style={{
        width: 196,
        flexShrink: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(6,7,15,0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(99,102,241,0.5)',
        }}>
          <Grid3X3 size={15} color="#fff" />
        </div>
        <span style={{ ...T.subheading, color: C.t0, letterSpacing: '-0.04em', fontSize: 15, fontWeight: 700 }}>
          MuseGrid
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {NAV.map(group => (
          <div key={group.label}>
            <p style={{ ...T.label, color: C.t3, padding: '0 8px', marginBottom: 4 }}>{group.label}</p>
            {group.items.map(item => {
              const active = effective === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 10px', borderRadius: 10, marginBottom: 2,
                    background:  active ? 'rgba(99,102,241,0.14)' : 'transparent',
                    border:      active ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                    color:  active ? C.accentLight : (item.accent ? '#34D399' : C.t2),
                    cursor: 'pointer',
                    boxShadow: active ? '0 0 12px rgba(99,102,241,0.15)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <item.icon size={14} />
                  <span style={{ ...T.caption, fontWeight: active ? 500 : 400, flex: 1, textAlign: 'left' }}>
                    {item.label}
                  </span>
                  {item.accent && (
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#34D399', flexShrink: 0 }} />
                  )}
                  {item.badge && (
                    <span style={{
                      width: 15, height: 15, borderRadius: '50%', flexShrink: 0,
                      background: C.warning, color: '#fff',
                      fontSize: 9, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{item.badge}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom utils */}
      <div style={{ padding: '8px 10px 4px' }}>
        {[
          { icon: CreditCard, label: '额度管理' },
          { icon: HelpCircle, label: '帮助中心' },
        ].map(item => (
          <button key={item.label} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 10px', borderRadius: 8, marginBottom: 2,
            background: 'transparent', border: 'none', color: C.t3, cursor: 'pointer',
          }}>
            <item.icon size={13} />
            <span style={{ ...T.caption, fontSize: 11 }}>{item.label}</span>
          </button>
        ))}
      </div>

      {/* User chip */}
      <div style={{
        margin: '8px 10px 12px',
        padding: '10px 12px',
        borderRadius: 12,
        background: C.bgCard,
        border: `1px solid ${C.bdr0}`,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{
          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #6366F1, #C084FC)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>梦</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ ...T.caption, color: C.t0, fontWeight: 500 }}>梦之主</p>
          <p style={{ ...T.label, color: C.t3, fontSize: 9 }}>普通用户</p>
        </div>
        <span style={{
          padding: '2px 6px', borderRadius: 6,
          background: 'rgba(99,102,241,0.2)', color: C.accentLight,
          fontSize: 9, fontWeight: 700,
        }}>Lv2</span>
      </div>
    </aside>
  );
}
