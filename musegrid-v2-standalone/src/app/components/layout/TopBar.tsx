import { Zap, ChevronDown, Moon, Sun } from 'lucide-react';
import { C, T, type ThemeMode } from '../../design/tokens';
import type { MuseGridUser } from '../../data/musegridStore';

type TopBarProps = {
  user?: MuseGridUser | null;
  storeMode?: 'local' | 'supabase';
  booting?: boolean;
  credits?: number;
  onOpenBilling?: () => void;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
};

export function TopBar({ storeMode = 'local', booting = false, credits = 0, onOpenBilling, themeMode, onToggleTheme }: TopBarProps) {
  const syncLabel = booting ? '读取中' : storeMode === 'supabase' ? '云端保存' : '本地保存';
  const syncColor = storeMode === 'supabase' ? C.success : C.accentLight;
  const nextThemeLabel = themeMode === 'deep' ? '浅灰' : '深色';
  const currentThemeLabel = themeMode === 'deep' ? '深色' : '浅灰';
  const ThemeIcon = themeMode === 'deep' ? Moon : Sun;

  return (
    <header style={{
      height: 52, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
      gap: 10, padding: '0 20px',
      background: C.topbar,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${C.lineSubtle}`,
    }}>
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

      <button
        type="button"
        aria-label={`切换到${nextThemeLabel}主题`}
        onClick={onToggleTheme}
        style={{
          height: 32,
          minWidth: 92,
          padding: '0 10px',
          borderRadius: 10,
          background: C.bgCard,
          border: `1px solid ${C.bdr0}`,
          color: C.t1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          cursor: 'pointer',
        }}
      >
        <ThemeIcon size={13} color={themeMode === 'deep' ? C.accentLight : C.warning} />
        <span style={{ ...T.caption, color: C.t1, fontWeight: 600 }}>{currentThemeLabel}</span>
        <span style={{ width: 18, height: 18, borderRadius: 999, background: C.bgHover, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronDown size={10} color={C.t3} style={{ transform: 'rotate(90deg)' }} />
        </span>
      </button>
    </header>
  );
}
