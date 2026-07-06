// MuseGrid Design System - token set with runtime theme variables
// All components import from here for consistency

export type ThemeMode = 'deep' | 'light';

export const THEME_VALUES = {
  deep: {
    '--mg-bg0': '#151927',
    '--mg-bg1': '#1A2030',
    '--mg-bg-card': 'rgba(255,255,255,0.084)',
    '--mg-bg-raised': 'rgba(255,255,255,0.118)',
    '--mg-bg-hover': 'rgba(255,255,255,0.15)',
    '--mg-border-0': 'rgba(255,255,255,0.12)',
    '--mg-border-1': 'rgba(255,255,255,0.18)',
    '--mg-text-0': 'rgba(255,255,255,0.98)',
    '--mg-text-1': 'rgba(255,255,255,0.82)',
    '--mg-text-2': 'rgba(255,255,255,0.66)',
    '--mg-text-3': 'rgba(255,255,255,0.48)',
    '--mg-shell': 'rgba(21,25,39,0.9)',
    '--mg-topbar': 'rgba(21,25,39,0.76)',
    '--mg-line-subtle': 'rgba(255,255,255,0.06)',
    '--mg-shadow-card': 'inset 0 1px 0 rgba(255,255,255,0.12), 0 10px 32px rgba(0,0,0,0.14)',
  },
  light: {
    '--mg-bg0': '#EEF2F7',
    '--mg-bg1': '#F7F9FC',
    '--mg-bg-card': 'rgba(255,255,255,0.78)',
    '--mg-bg-raised': 'rgba(255,255,255,0.94)',
    '--mg-bg-hover': 'rgba(99,102,241,0.08)',
    '--mg-border-0': 'rgba(23,32,51,0.10)',
    '--mg-border-1': 'rgba(23,32,51,0.14)',
    '--mg-text-0': 'rgba(23,32,51,0.96)',
    '--mg-text-1': 'rgba(23,32,51,0.76)',
    '--mg-text-2': 'rgba(23,32,51,0.58)',
    '--mg-text-3': 'rgba(23,32,51,0.40)',
    '--mg-shell': 'rgba(247,249,252,0.9)',
    '--mg-topbar': 'rgba(247,249,252,0.78)',
    '--mg-line-subtle': 'rgba(23,32,51,0.10)',
    '--mg-shadow-card': 'inset 0 1px 0 rgba(255,255,255,0.86), 0 12px 32px rgba(31,41,55,0.08)',
  },
} as const;

export function getThemeVariables(mode: ThemeMode) {
  return THEME_VALUES[mode];
}

export const C = {
  // ─── Backgrounds ───────────────────────────────────────
  bg0:      'var(--mg-bg0)',                    // page root
  bg1:      'var(--mg-bg1)',                    // sidebar
  bgCard:   'var(--mg-bg-card)',                // glass card fill
  bgRaised: 'var(--mg-bg-raised)',              // elevated card
  bgHover:  'var(--mg-bg-hover)',               // hover state
  bgActive: 'rgba(99,102,241,0.22)',            // accent active fill

  // ─── Borders ───────────────────────────────────────────
  bdr0:     'var(--mg-border-0)',               // hairline
  bdr1:     'var(--mg-border-1)',               // card default border
  bdrAccent:'rgba(129,140,248,0.62)',           // accent border
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
  t0: 'var(--mg-text-0)',   // primary
  t1: 'var(--mg-text-1)',   // secondary/body
  t2: 'var(--mg-text-2)',   // muted/helper
  t3: 'var(--mg-text-3)',   // disabled/placeholder

  // ─── Shell surfaces ────────────────────────────────────
  shell: 'var(--mg-shell)',
  topbar: 'var(--mg-topbar)',
  lineSubtle: 'var(--mg-line-subtle)',
  shadowCard: 'var(--mg-shadow-card)',
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
    boxShadow: C.shadowCard,
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
