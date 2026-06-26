// MuseGrid Design System — "Deep Space" Token Set
// All components import from here for consistency

export const C = {
  // ─── Backgrounds ───────────────────────────────────────
  bg0:      '#06070F',                         // page root (deepest)
  bg1:      '#090B16',                         // sidebar
  bgCard:   'rgba(255,255,255,0.038)',          // glass card fill
  bgRaised: 'rgba(255,255,255,0.06)',           // elevated card
  bgHover:  'rgba(255,255,255,0.08)',           // hover state
  bgActive: 'rgba(99,102,241,0.12)',            // accent active fill

  // ─── Borders ───────────────────────────────────────────
  bdr0:     'rgba(255,255,255,0.05)',           // hairline
  bdr1:     'rgba(255,255,255,0.09)',           // card default border
  bdrAccent:'rgba(99,102,241,0.45)',            // accent border
  bdrCyan:  'rgba(6,182,212,0.4)',              // cyan border

  // ─── Primary Accent (Indigo-Violet) ────────────────────
  accent:      '#6366F1',
  accentLight: '#818CF8',
  accentDark:  '#4F46E5',
  accentDim:   'rgba(99,102,241,0.14)',
  accentGlow:  '0 0 24px rgba(99,102,241,0.35)',

  // ─── Secondary Accent (Electric Cyan — tech/sci-fi) ────
  cyan:    '#06B6D4',
  cyanDim: 'rgba(6,182,212,0.12)',

  // ─── Status ────────────────────────────────────────────
  success:     '#10B981',
  successDim:  'rgba(16,185,129,0.12)',
  warning:     '#F59E0B',
  warningDim:  'rgba(245,158,11,0.12)',
  error:       '#EF4444',
  errorDim:    'rgba(239,68,68,0.1)',
  gold:        '#F59E0B',

  // ─── Text ──────────────────────────────────────────────
  t0: 'rgba(255,255,255,0.92)',   // primary
  t1: 'rgba(255,255,255,0.55)',   // secondary
  t2: 'rgba(255,255,255,0.30)',   // muted
  t3: 'rgba(255,255,255,0.16)',   // disabled/placeholder
} as const;

// ─── Typography scale (6 levels only) ─────────────────────
export const T = {
  display:    { fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.25 },
  heading:    { fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.4  },
  subheading: { fontSize: 13, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.5  },
  body:       { fontSize: 13, fontWeight: 400, letterSpacing:  '0em',    lineHeight: 1.6  },
  caption:    { fontSize: 11, fontWeight: 400, letterSpacing:  '0.01em', lineHeight: 1.5  },
  label:      { fontSize: 10, fontWeight: 500, letterSpacing:  '0.06em', lineHeight: 1.4, textTransform: 'uppercase' as const },
} as const;

// ─── Spacing (4 px grid — only these values) ──────────────
// 4 8 12 16 20 24 32 40 48 64

// ─── Shared component style presets ────────────────────────
export const S = {
  card: {
    background: C.bgCard,
    backdropFilter: 'blur(24px) saturate(1.4)',
    WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
    border: `1px solid ${C.bdr1}`,
    borderRadius: 16,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
  },
  cardActive: {
    background: C.bgActive,
    backdropFilter: 'blur(24px) saturate(1.4)',
    WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
    border: `1px solid ${C.bdrAccent}`,
    borderRadius: 16,
    boxShadow: `0 0 24px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.1)`,
  },
  cardSm: {
    background: C.bgCard,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${C.bdr0}`,
    borderRadius: 12,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
  },
  btnPrimary: {
    background: `linear-gradient(135deg, ${C.accent} 0%, ${C.accentDark} 100%)`,
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
    border: 'none',
    cursor: 'pointer',
  },
  btnGhost: {
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${C.bdr1}`,
    color: C.t1,
    fontSize: 13,
    fontWeight: 400,
    cursor: 'pointer',
  },
  btnAccentOutline: {
    background: C.accentDim,
    border: `1px solid rgba(99,102,241,0.35)`,
    color: C.accentLight,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  },
  btnSuccess: {
    background: `linear-gradient(135deg, ${C.success}, #059669)`,
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    boxShadow: '0 4px 16px rgba(16,185,129,0.35)',
    border: 'none',
    cursor: 'pointer',
  },
} as const;
