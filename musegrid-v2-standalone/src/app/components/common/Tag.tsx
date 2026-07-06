import { C } from '../../design/tokens';

interface TagProps { children: React.ReactNode; variant?: string; size?: 'sm' | 'md'; }

const V: Record<string, React.CSSProperties> = {
  default: { background: 'rgba(255,255,255,0.075)', color: C.t1,      border: `1px solid rgba(255,255,255,0.13)` },
  accent:  { background: C.accentDim,             color: C.accentLight, border: `1px solid rgba(129,140,248,0.4)` },
  success: { background: C.successDim,            color: C.success,  border: `1px solid rgba(52,211,153,0.35)` },
  warning: { background: C.warningDim,            color: '#FCD34D',  border: `1px solid rgba(245,158,11,0.25)` },
  error:   { background: C.errorDim,             color: '#F87171',  border: `1px solid rgba(239,68,68,0.2)` },
  dim:     { background: 'rgba(255,255,255,0.055)', color: C.t2,      border: `1px solid rgba(255,255,255,0.10)` },
  cyan:    { background: C.cyanDim,               color: C.cyan,     border: `1px solid rgba(34,211,238,0.35)` },
  outline: { background: 'transparent',           color: C.t1,      border: `1px solid rgba(255,255,255,0.16)` },
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
