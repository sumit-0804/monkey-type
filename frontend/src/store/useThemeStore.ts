import { create } from 'zustand'

export type ThemeName = 'light' | 'dark' | 'monokai' | 'dracula' | 'terminal'

export interface ThemeConfig {
  name: ThemeName
  label: string
  isDark: boolean
}

export const THEMES: ThemeConfig[] = [
  { name: 'light',    label: 'Light',    isDark: false },
  { name: 'dark',     label: 'Dark',     isDark: true  },
  { name: 'monokai',  label: 'Monokai',  isDark: true  },
  { name: 'dracula',  label: 'Dracula',  isDark: true  },
  { name: 'terminal', label: 'Terminal', isDark: true  },
]

const CUSTOM_THEME_CLASSES: ThemeName[] = ['monokai', 'dracula', 'terminal']
const STORAGE_KEY = 'campus-type-theme'

function getInitialTheme(): ThemeName {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeName | null
    if (stored && THEMES.some(t => t.name === stored)) return stored
  } catch {}
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: ThemeName) {
  const root = document.documentElement

  // 1. Strip all custom theme classes
  root.classList.remove(...CUSTOM_THEME_CLASSES)

  if (theme === 'light') {
    // Light = no dark, no custom classes
    root.classList.remove('dark')
  } else if (theme === 'dark') {
    // Built-in dark — just 'dark' class
    root.classList.add('dark')
  } else {
    // Custom dark theme — apply 'dark' so Shadcn dark: utilities work,
    // then layer the theme-specific class on top (it overrides .dark vars)
    root.classList.add('dark', theme)
  }
}

interface ThemeState {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme: ThemeName) => {
    applyTheme(theme)
    try { localStorage.setItem(STORAGE_KEY, theme) } catch {}
    set({ theme })
  },
}))

// Apply immediately on module load (before React renders)
applyTheme(getInitialTheme())
