import { Search, Bell, Zap, ChevronDown } from 'lucide-react';
import { C, T } from '../../design/tokens';
import type { MuseGridUser } from '../../data/musegridStore';

type TopBarProps = {
  user?: MuseGridUser | null;
  storeMode?: 'local' | 'supabase';
  booting?: boolean;
  hideSearch?: boolean;
  credits?: number;
  onOpenBilling?: () => void;
};

export function TopBar({ user, storeMode = 'local', booting = false, hideSearch = false, credits = 0, onOpenBilling }: TopBarProps) {
  const name = user?.name || '梦之主';
  const avatar = name.slice(0, 1);
  const syncLabel = booting ? '读取中' : storeMode === 'supabase' ? '云端保存' : '本地保存';
  const syncColor = storeMode === 'supabase' ? C.success : C.accentLight;

  return (
    <header style={{
      height: 52, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
      gap: 10, padding: '0 20px',
      background: 'rgba(6,7,15,0.7)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      {!hideSearch && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '0 12px', height: 32, width: 200, borderRadius: 10,
          background: C.bgCard, border: `1px solid ${C.bdr0}`,
        }}>
          <Search size={12} color={C.t3} />
          <input placeholder="搜索项目、分身…" style={{
            background: 'transparent', border: 'none', outline: 'none',
            color: C.t2, width: '100%',
            ...T.caption,
          }} />
        </div>
      )}

      {/* Credits */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '0 10px', height: 32, borderRadius: 10,
        background: C.bgCard, border: `1px solid ${C.bdr0}`, cursor: 'pointer',
      }} onClick={onOpenBilling}>
        <Zap size={12} color={C.warning} />
        <span style={{ ...T.caption, color: C.warning, fontWeight: 600 }}>额度 {credits.toLocaleString('zh-CN')}</span>
        <ChevronDown size={10} color={C.t3} />
      </div>

      <div style={{
        height: 32, padding: '0 10px', borderRadius: 10,
        background: storeMode === 'supabase' ? C.successDim : C.accentDim,
        border: `1px solid ${storeMode === 'supabase' ? 'rgba(52,211,153,0.3)' : 'rgba(129,140,248,0.32)'}`,
        display: 'flex', alignItems: 'center',
      }}>
        <span style={{ ...T.caption, color: syncColor, fontWeight: 600 }}>{syncLabel}</span>
      </div>

      {/* Bell */}
      <button style={{
        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
        background: C.bgCard, border: `1px solid ${C.bdr0}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', position: 'relative',
      }}>
        <Bell size={13} color={C.t2} />
        <span style={{
          position: 'absolute', top: 7, right: 7,
          width: 5, height: 5, borderRadius: '50%',
          background: C.accent, border: `1px solid ${C.bg0}`,
        }} />
      </button>

      {/* User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366F1, #C084FC)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{avatar}</span>
        </div>
        <span style={{ ...T.caption, color: C.t1 }}>{name}</span>
        <ChevronDown size={10} color={C.t3} />
      </div>
    </header>
  );
}
