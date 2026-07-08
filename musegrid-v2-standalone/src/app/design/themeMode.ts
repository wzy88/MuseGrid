import type { ThemeMode } from './tokens';

export const THEME_MODE_STORAGE_KEY = 'musegrid.v2.themeMode';

export function getInitialThemeMode(storage: Pick<Storage, 'getItem'> | null | undefined): ThemeMode {
  const saved = storage?.getItem(THEME_MODE_STORAGE_KEY);
  if (saved === 'deep' || saved === 'light') return saved;
  return 'deep';
}
