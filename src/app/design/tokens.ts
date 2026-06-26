// MuseGrid Design System — "Deep Space" Token Set
// All components import from here for consistency

export const C = {
  // ─── Backgrounds ───────────────────────────────────────
  bg0:      '#06070F',                         // page root (deepest)
  bg1:      '#090B16',                         // sidebar
  bgCard:   'rgba(255,255,255,0.058)',          // glass card fill
  bgRaised: 'rgba(255,255,255,0.085)',          // elevated card
  bgHover:  'rgba(255,255,255,0.11)',           // hover state
  bgActive: 'rgba(99,102,241,0.18)',            // accent active fill

  // ─── Borders ───────────────────────────────────────────
  bdr0:     'rgba(255,255,255,0.09)',           // hairline
  bdr1:     'rgba(255,255,255,0.14)',           // card default border
  bdrAccent:'rgba(129,140,248,0.55)',           // accent border
  bdrCyan:  'rgba(34,211,238,0.5)',             // cyan border

  // ─── Primary Accent (Indigo-Violet) ────────────────────
  accent:      '#6366F1',
  accentLight: '#A5B4FC',
  accentDark:  '#4F46E5',
  accentDim:   'rgba(99,102,241,0.20)',
  accentGlow:  '0 0 24px rgba(99,102,241,0.42)',

  // ─── Secondary Accent (Electric Cyan — tech/sci-fi) ────
  cyan:    '#22D3EE',
  cyanDim: 'rgba(6,182,212,0.18)',

  // ─── Status ────────────────────────────────────────────
  success:     '#34D399',
  successDim:  'rgba(16,185,129,0.18)',
  warning:     '#FBBF24',
  warningDim:  'rgba(245,158,11,0.18)',
  error:       '#F87171',
  errorDim:    'rgba(239,68,68,0.16)',
  gold:        '#FBBF24',

  // ─── Text ──────────────────────────────────────────────
  t0: 'rgba(255,255,255,0.96)',   // primary
  t1: 'rgba(255,255,255,0.76)',   // secondary/body
  t2: 'rgba(255,255,255,0.58)',   // muted/helper
  t3: 'rgba(255,255,255,0.38)',   // disabled/placeholder
} as const;

// ─── Typography scale (6 levels only) ─────────────────────
export const T = {
  display:    { fontSize: 22, fontWeight: 700, letterSpacing:  '0em',    lineHeight: 1.25 },
  heading:    { fontSize: 16, fontWeight: 600, letterSpacing:  '0em',    lineHeight: 1.4  },
  subheading: { fontSize: 13, fontWeight: 500, letterSpacing:  '0em',    lineHeight: 1.5  },
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
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10), 0 10px 32px rgba(0,0,0,0.18)',
  },
  cardActive: {
    background: C.bgActive,
    backdropFilter: 'blur(24px) saturate(1.4)',
    WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
    border: `1px solid ${C.bdrAccent}`,
    borderRadius: 16,
    boxShadow: `0 0 28px rgba(99,102,241,0.28), inset 0 1px 0 rgba(255,255,255,0.12)`,
  },
  cardSm: {
    background: C.bgCard,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${C.bdr1}`,
    borderRadius: 12,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.09)',
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
    background: 'rgba(255,255,255,0.075)',
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
