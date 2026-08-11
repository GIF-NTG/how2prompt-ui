import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { GuestContinueLink } from './GuestContinueLink'
import { BraceField } from '@/shared/components/BraceField'

interface AuthLayoutProps {
  children: ReactNode
}

/**
 * Shared shell for the Login/Register views: top bar with brand +
 * guest-continue, a single centered form panel (via `children`), and
 * Login/Register tabs that navigate between the two real routes
 * (client-side, no full reload — FR-001).
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  const location = useLocation()
  const isLogin = location.pathname !== '/register'

  return (
    <div className="relative min-h-screen bg-[#F3F5F0] dark:bg-[#14171A]">
      <BraceField />

      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="flex items-center justify-between px-4 py-6 sm:px-8">
          <div className="flex items-center gap-2 text-base font-bold text-[#1B1D1B] dark:text-[#ECEEE8]">
            <span className="rounded-md bg-[#1B1D1B] px-1.5 py-0.5 font-mono text-sm text-[#F3F5F0] dark:bg-[#ECEEE8] dark:text-[#14171A]">
              {'{ }'}
            </span>
            How2Prompt
          </div>
          <GuestContinueLink />
        </div>

        <main className="flex flex-1 items-center justify-center px-4 pb-12">
          <div className="grid w-full max-w-[460px] overflow-hidden rounded-[20px] border border-[#DBDFD3] bg-white shadow-xl dark:border-[#2C3130] dark:bg-[#1C2024]">
            <section className="flex flex-col gap-6 p-7">
              <div
                role="tablist"
                aria-label="Switch between login and register"
                className="flex gap-1 rounded-xl border border-[#DBDFD3] bg-[#EAEDE6] p-1 dark:border-[#2C3130] dark:bg-[#23282C]"
              >
                <Link
                  to="/login"
                  role="tab"
                  aria-selected={isLogin}
                  className={[
                    'flex-1 rounded-lg px-3 py-2 text-center text-sm font-semibold transition',
                    isLogin
                      ? 'bg-white text-[#1B1D1B] shadow-sm dark:bg-[#1C2024] dark:text-[#ECEEE8]'
                      : 'text-[#5B5F58] dark:text-[#A2A79C]',
                  ].join(' ')}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  role="tab"
                  aria-selected={!isLogin}
                  className={[
                    'flex-1 rounded-lg px-3 py-2 text-center text-sm font-semibold transition',
                    !isLogin
                      ? 'bg-white text-[#1B1D1B] shadow-sm dark:bg-[#1C2024] dark:text-[#ECEEE8]'
                      : 'text-[#5B5F58] dark:text-[#A2A79C]',
                  ].join(' ')}
                >
                  Sign up
                </Link>
              </div>

              {children}
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
