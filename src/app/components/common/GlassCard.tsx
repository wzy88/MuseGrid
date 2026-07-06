import { S, C } from '../../design/tokens';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  raised?: boolean;
  pad?: number;
  radius?: number;
  glow?: 'accent' | 'success' | 'warning' | 'cyan' | 'none';
}

const glowMap = {
  accent:  `0 0 24px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.1)`,
  success: `0 0 20px rgba(16,185,129,0.2),  inset 0 1px 0 rgba(255,255,255,0.08)`,
  warning: `0 0 20px rgba(245,158,11,0.2),  inset 0 1px 0 rgba(255,255,255,0.08)`,
  cyan:    `0 0 20px rgba(6,182,212,0.2),   inset 0 1px 0 rgba(255,255,255,0.08)`,
  none:    'inset 0 1px 0 rgba(255,255,255,0.06)',
};

const borderMap = {
  accent:  `1px solid rgba(99,102,241,0.45)`,
  success: `1px solid rgba(16,185,129,0.35)`,
  warning: `1px solid rgba(245,158,11,0.35)`,
  cyan:    `1px solid rgba(6,182,212,0.35)`,
  none:    `1px solid ${C.bdr1}`,
};

export function GlassCard({
  children, active = false, raised = false, pad, radius = 16,
  glow = 'none', style, className, ...rest
}: GlassCardProps) {
  const resolvedGlow = active ? 'accent' : glow;
  return (
    <div
      style={{
        background:       raised ? C.bgRaised : C.bgCard,
        backdropFilter:   'blur(24px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
        border:           active ? borderMap.accent : borderMap[resolvedGlow],
        borderRadius:     radius,
        boxShadow:        active ? glowMap.accent : glowMap[resolvedGlow],
        padding:          pad,
        ...style,
      }}
      className={className}
      {...rest}
    >
      {children}
    </div>
  );
}
