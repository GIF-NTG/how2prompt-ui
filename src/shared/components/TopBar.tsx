import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/useAuth'
import { ThemeToggle } from './ThemeToggle'
import { getTagAvatarClasses } from '@/shared/utils/colorTag'
import { adminAiModelsChunk, historyChunk, profileChunk } from '@/app/routeChunks'

export function TopBar() {
  const { session, signOut } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-[clamp(1.25rem,4vw,3rem)]">
      <Link
        to="/"
        className="flex items-center gap-2.5 text-[1.05rem] font-bold tracking-[-0.01em]"
      >
        <span className="font-mono rounded-md bg-[#1B1D1B] px-2 py-0.5 text-[0.95rem] font-bold text-[#F3F5F0] dark:bg-[#ECEEE8] dark:text-[#14171A]">
          {'{ }'}
        </span>
        How2Prompt
      </Link>

      <div className="flex flex-wrap items-center gap-7">
        <nav className="flex gap-5">
          <Link
            to="/"
            className={`text-[0.88rem] border-b border-transparent transition-colors duration-150 ${
              location.pathname === '/'
                ? 'text-[#1B1D1B] border-b-[#8B8F86] dark:text-[#ECEEE8] dark:border-b-[#6D726A]'
                : 'text-[#5B5F58] hover:text-[#1B1D1B] hover:border-b-[#8B8F86] dark:text-[#A2A79C] dark:hover:text-[#ECEEE8] dark:hover:border-b-[#6D726A]'
            }`}
          >
            Library
          </Link>
          <Link
            to="/history"
            onMouseEnter={() => void historyChunk()}
            onFocus={() => void historyChunk()}
            className={`text-[0.88rem] border-b border-transparent transition-colors duration-150 ${
              location.pathname === '/history'
                ? 'text-[#1B1D1B] border-b-[#8B8F86] dark:text-[#ECEEE8] dark:border-b-[#6D726A]'
                : 'text-[#5B5F58] hover:text-[#1B1D1B] hover:border-b-[#8B8F86] dark:text-[#A2A79C] dark:hover:text-[#ECEEE8] dark:hover:border-b-[#6D726A]'
            }`}
          >
            History
          </Link>
          {session?.isAdmin && (
            <Link
              to="/admin/ai-models"
              onMouseEnter={() => void adminAiModelsChunk()}
              onFocus={() => void adminAiModelsChunk()}
              className={`text-[0.88rem] border-b border-transparent transition-colors duration-150 ${
                location.pathname.startsWith('/admin')
                  ? 'text-[#1B1D1B] border-b-[#8B8F86] dark:text-[#ECEEE8] dark:border-b-[#6D726A]'
                  : 'text-[#5B5F58] hover:text-[#1B1D1B] hover:border-b-[#8B8F86] dark:text-[#A2A79C] dark:hover:text-[#ECEEE8] dark:hover:border-b-[#6D726A]'
              }`}
            >
              Admin
            </Link>
          )}
        </nav>

        <ThemeToggle />

        {session ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5 transition-colors duration-150 hover:bg-[#E7E9E2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] dark:hover:bg-[#1C2024]"
            >
              <span
                className={`inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-mono text-[0.85rem] font-bold ${getTagAvatarClasses(session.accountId)}`}
              >
                {session.displayName.charAt(0).toUpperCase()}
              </span>
              <span className="text-[0.9rem] font-semibold">{session.displayName}</span>
            </button>

            {menuOpen && (
              <div role="menu" className="absolute right-0 top-full z-20 w-40 pt-2">
                <div className="flex flex-col gap-0.5 rounded-xl border border-[#DBDFD3] bg-white p-1.5 shadow-lg dark:border-[#2C3130] dark:bg-[#1C2024]">
                  <Link
                    to="/profile"
                    role="menuitem"
                    onMouseEnter={() => void profileChunk()}
                    onFocus={() => void profileChunk()}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-2 text-[0.85rem] text-[#1B1D1B] hover:bg-[#F3F5F0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] dark:text-[#ECEEE8] dark:hover:bg-[#14171A]"
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false)
                      void signOut()
                    }}
                    className="rounded-lg px-3 py-2 text-left text-[0.85rem] text-[#1B1D1B] hover:bg-[#F3F5F0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] dark:text-[#ECEEE8] dark:hover:bg-[#14171A]"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="font-mono text-[0.78rem] text-[#3652E0] underline underline-offset-2 dark:text-[#8493FF]"
          >
            Log in
          </Link>
        )}
      </div>
    </div>
  )
}
