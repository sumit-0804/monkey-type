export type Theme = {
  name: string
  label: string
  isDark?: boolean
}

export const THEMES: Theme[] = [
  { name: 'light', label: 'Light', isDark: false },
  { name: 'dark', label: 'Dark', isDark: true },
  { name: 'system', label: 'System' },
  { name: 'monokai', label: 'Monokai', isDark: true },
  { name: 'dracula', label: 'Dracula', isDark: true },
  { name: 'terminal', label: 'Terminal', isDark: true },
]

export const THEME_NAMES = THEMES.map((t) => t.name)

export const DARK_THEMES = new Set(THEMES.filter((t) => t.isDark).map((t) => t.name))
