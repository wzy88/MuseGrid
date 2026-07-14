import { useState } from 'react';
import { Sparkles, Music, Users, UserPlus, Bot, Link2, CreditCard, HelpCircle, Grid3X3, ChevronUp, Library, Cloud, HardDrive } from 'lucide-react';
import { C, T } from '../../design/tokens';
import type { MuseGridUser } from '../../data/musegridStore';

export type Page =
  | 'home' | 'production' | 'avatarNetwork' | 'createAvatar'
  | 'myWorks' | 'workEdit' | 'avatarManage' | 'contribution' | 'billing'
  | 'evolutionReport' | 'calibration';

interface SidebarProps {
  currentPage: Page;
  navigate: (page: Page) => void;
  user?: MuseGridUser | null;
  storeMode?: 'local' | 'supabase';
  credits?: number;
  worksCount?: number;
  avatarsCount?: number;
}

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
  workEdit:        'myWorks',
};

export function Sidebar({ currentPage, navigate, user, storeMode = 'local', credits = 0, worksCount = 0, avatarsCount = 0 }: SidebarProps) {
  const effective = SUB_PARENT[currentPage] ?? currentPage;
  const [accountOpen, setAccountOpen] = useState(false);
  const name = user?.name || '张浩';
  const avatar = name.slice(0, 1);
  const saveLabel = storeMode === 'supabase' ? '云端保存' : '本地保存';
  const SaveIcon = storeMode === 'supabase' ? Cloud : HardDrive;

  const go = (page: Page) => {
    setAccountOpen(false);
    navigate(page);
  };

  return (
    <aside
      style={{
        width: 196,
        flexShrink: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: C.shell,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: `1px solid ${C.lineSubtle}`,
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
          { icon: CreditCard, label: '额度管理', page: 'billing' as Page },
          { icon: HelpCircle, label: '帮助中心' },
        ].map(item => (
          <button key={item.label} onClick={() => item.page && go(item.page)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 10px', borderRadius: 8, marginBottom: 2,
            background: effective === item.page ? 'rgba(99,102,241,0.14)' : 'transparent',
            border: effective === item.page ? '1px solid rgba(99,102,241,0.26)' : '1px solid transparent',
            color: effective === item.page ? C.accentLight : C.t3,
            cursor: 'pointer',
          }}>
            <item.icon size={13} />
            <span style={{ ...T.caption, fontSize: 11 }}>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Account */}
      <div style={{ position: 'relative', margin: '8px 10px 12px' }}>
        {accountOpen && (
          <div
            role="dialog"
            aria-label="账户概览"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 58,
              padding: 12,
              borderRadius: 14,
              background: C.bgRaised,
              border: `1px solid ${C.bdr1}`,
              boxShadow: C.shadowCard,
              backdropFilter: 'blur(24px) saturate(1.3)',
              WebkitBackdropFilter: 'blur(24px) saturate(1.3)',
              zIndex: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <p style={{ ...T.caption, color: C.t0, fontWeight: 700 }}>账户概览</p>
                <p style={{ ...T.label, color: C.t3, fontSize: 9 }}>{saveLabel}</p>
              </div>
              <div style={{ width: 26, height: 26, borderRadius: 9, background: C.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SaveIcon size={13} color={storeMode === 'supabase' ? C.success : C.accentLight} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
              {[
                { label: '可用额度', value: credits.toLocaleString('zh-CN') },
                { label: '作品', value: worksCount.toString() },
                { label: '分身', value: avatarsCount.toString() },
                { label: '等级', value: 'Lv2' },
              ].map(item => (
                <div key={item.label} style={{ padding: '8px 8px', borderRadius: 10, background: C.bgCard, border: `1px solid ${C.bdr0}` }}>
                  <p style={{ ...T.label, color: C.t3, fontSize: 8 }}>{item.label}</p>
                  <p style={{ ...T.caption, color: C.t0, fontWeight: 700, marginTop: 2 }}>{item.value}</p>
                </div>
              ))}
            </div>

            {[
              { icon: CreditCard, label: '额度管理', page: 'billing' as Page },
              { icon: Library, label: '我的作品', page: 'myWorks' as Page },
              { icon: Bot, label: '分身管理', page: 'avatarManage' as Page },
            ].map(item => (
              <button
                key={item.label}
                type="button"
                onClick={() => go(item.page)}
                style={{
                  width: '100%',
                  height: 30,
                  borderRadius: 9,
                  border: '1px solid transparent',
                  background: 'transparent',
                  color: C.t1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '0 8px',
                  cursor: 'pointer',
                  marginTop: 2,
                }}
              >
                <item.icon size={13} />
                <span style={{ ...T.caption, fontWeight: 600 }}>{item.label}</span>
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          aria-expanded={accountOpen}
          onClick={() => setAccountOpen((open) => !open)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 12,
            background: accountOpen ? C.bgRaised : C.bgCard,
            border: `1px solid ${accountOpen ? C.bdrAccent : C.bdr0}`,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            boxShadow: accountOpen ? '0 0 18px rgba(99,102,241,0.18)' : 'none',
          }}
        >
          <div style={{
            width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #6366F1, #C084FC)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>{avatar}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <p style={{ ...T.caption, color: C.t0, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
            <p style={{ ...T.label, color: C.t3, fontSize: 9 }}>普通用户</p>
          </div>
          <span style={{
            padding: '2px 6px', borderRadius: 6,
            background: 'rgba(99,102,241,0.2)', color: C.accentLight,
            fontSize: 9, fontWeight: 700,
          }}>Lv2</span>
          <ChevronUp size={12} color={C.t3} style={{ transform: accountOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
        </button>
      </div>
    </aside>
  );
}
