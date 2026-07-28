import { useCallback, useState, type ReactNode } from 'react'
import { ThemeContext, type Theme } from './ThemeContext'

const STORAGE_KEY = 'how2prompt-theme'

function getInitialTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      document.documentElement.classList.toggle('dark', next === 'dark')
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }, [])

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}
