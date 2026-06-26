import { Search, Bell, Zap, ChevronDown } from 'lucide-react';
import { C, T } from '../../design/tokens';

export function TopBar() {
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
      {/* Search */}
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

      {/* Credits */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '0 10px', height: 32, borderRadius: 10,
        background: C.bgCard, border: `1px solid ${C.bdr0}`, cursor: 'pointer',
      }}>
        <Zap size={12} color={C.warning} />
        <span style={{ ...T.caption, color: C.warning, fontWeight: 600 }}>额度 1,248</span>
        <ChevronDown size={10} color={C.t3} />
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
          <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>梦</span>
        </div>
        <span style={{ ...T.caption, color: C.t1 }}>梦之主</span>
        <ChevronDown size={10} color={C.t3} />
      </div>
    </header>
  );
}
