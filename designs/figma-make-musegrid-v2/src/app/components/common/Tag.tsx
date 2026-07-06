import { C } from '../../design/tokens';

interface TagProps { children: React.ReactNode; variant?: string; size?: 'sm' | 'md'; }

const V: Record<string, React.CSSProperties> = {
  default: { background: 'rgba(255,255,255,0.06)', color: C.t1,      border: `1px solid rgba(255,255,255,0.08)` },
  accent:  { background: C.accentDim,             color: C.accentLight, border: `1px solid rgba(99,102,241,0.3)` },
  success: { background: C.successDim,            color: '#34D399',  border: `1px solid rgba(16,185,129,0.25)` },
  warning: { background: C.warningDim,            color: '#FCD34D',  border: `1px solid rgba(245,158,11,0.25)` },
  error:   { background: C.errorDim,             color: '#F87171',  border: `1px solid rgba(239,68,68,0.2)` },
  dim:     { background: 'rgba(255,255,255,0.03)', color: C.t2,      border: `1px solid rgba(255,255,255,0.05)` },
  cyan:    { background: C.cyanDim,               color: C.cyan,     border: `1px solid rgba(6,182,212,0.25)` },
  outline: { background: 'transparent',           color: C.t2,      border: `1px solid rgba(255,255,255,0.1)` },
};

export function Tag({ children, variant = 'default', size = 'sm' }: TagProps) {
  return (
    <span style={{
      ...V[variant] ?? V.default,
      display: 'inline-flex', alignItems: 'center',
      borderRadius: 6,
      fontSize: size === 'sm' ? 10 : 11,
      fontWeight: 500,
      padding: size === 'sm' ? '2px 7px' : '3px 10px',
      whiteSpace: 'nowrap',
      lineHeight: 1.4,
    }}>
      {children}
    </span>
  );
}
