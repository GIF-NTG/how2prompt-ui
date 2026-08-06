import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/shared/context/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light theme' : 'Dark theme'}
      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[#DBDFD3] bg-white text-[#5B5F58] transition-colors duration-150 hover:border-[#8B8F86] hover:text-[#1B1D1B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] dark:border-[#2C3130] dark:bg-[#1C2024] dark:text-[#A2A79C] dark:hover:border-[#6D726A] dark:hover:text-[#ECEEE8]"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
