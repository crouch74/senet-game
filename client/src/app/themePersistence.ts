import {
  DEFAULT_THEME,
  isThemeId,
  THEME_STORAGE_KEY,
  type ThemeId,
} from '../theme'

interface ReadableStorage {
  getItem: (key: string) => string | null
}

interface WritableStorage {
  setItem: (key: string, value: string) => void
}

export const getInitialTheme = (
  storage: ReadableStorage | null | undefined = typeof window === 'undefined'
    ? null
    : window.localStorage,
): ThemeId => {
  if (!storage) return DEFAULT_THEME

  try {
    const savedTheme = storage.getItem(THEME_STORAGE_KEY)
    return isThemeId(savedTheme) ? savedTheme : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

export const applyTheme = (
  theme: ThemeId,
  options: {
    root?: HTMLElement
    storage?: WritableStorage | null
  } = {},
) => {
  const root = options.root ?? document.documentElement
  root.dataset.theme = theme

  const storage = options.storage ?? (typeof window === 'undefined' ? null : window.localStorage)
  if (!storage) return

  try {
    storage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Ignore storage failures in restricted environments.
  }
}
