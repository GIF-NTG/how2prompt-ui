import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowsClockwise, Bookmark, ShieldCheck } from '@phosphor-icons/react'
import { GuestContinueLink } from './GuestContinueLink'
import { BraceField } from '@/shared/components/BraceField'

const BLANK_TAG =
  'rounded bg-[#E7EAFC] px-1.5 py-0.5 font-mono text-[0.88em] text-[#3652E0] dark:bg-[#262B4A] dark:text-[#8493FF]'

interface AuthLayoutProps {
  children: ReactNode
}

/**
 * Shared shell for the Login/Register views, matching the approved auth
 * mockup 1:1: top bar with brand + guest-continue, a two-column panel
 * (product context on the left, the actual form on the right via
 * `children`), and Login/Register tabs that navigate between the two real
 * routes (client-side, no full reload — FR-001) while looking like the
 * mockup's in-place tabs.
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
          <div className="grid w-full max-w-[1000px] overflow-hidden rounded-[20px] border border-[#DBDFD3] bg-white shadow-xl dark:border-[#2C3130] dark:bg-[#1C2024] md:grid-cols-[0.92fr_1fr]">
            <section className="flex flex-col justify-center gap-7 border-b border-[#DBDFD3] bg-[#EAEDE6] p-7 dark:border-[#2C3130] dark:bg-[#23282C] md:border-r md:border-b-0">
              <span className="inline-flex items-center gap-1.5 font-mono text-[0.7rem] tracking-wider text-[#3652E0] uppercase dark:text-[#8493FF]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3652E0] dark:bg-[#8493FF]" />
                api/auth
              </span>

              <h1 className="text-2xl leading-tight font-bold text-balance tracking-tight text-[#1B1D1B] dark:text-[#ECEEE8]">
                Đừng viết prompt từ đầu. Điền vào chỗ trống.
              </h1>

              <div
                aria-hidden
                className="rounded-card border border-[#DBDFD3] bg-white p-5 text-sm leading-relaxed text-[#1B1D1B] dark:border-[#2C3130] dark:bg-[#1C2024] dark:text-[#ECEEE8]"
              >
                <span className="mb-2 block font-mono text-[0.68rem] tracking-wider text-[#8B8F86] uppercase dark:text-[#6D726A]">
                  raw_template preview
                </span>
                Với vai trò <span className={BLANK_TAG}>{'{role}'}</span>, hãy debug đoạn log sau
                trong bối cảnh <span className={BLANK_TAG}>{'{context}'}</span>, tuân thủ ràng buộc{' '}
                <span className={BLANK_TAG}>{'{constraints}'}</span>.
              </div>

              <ul className="flex flex-col gap-3 text-sm text-[#5B5F58] dark:text-[#A2A79C]">
                <li className="flex items-start gap-2.5">
                  <Bookmark
                    size={18}
                    weight="duotone"
                    color="#0F9B8E"
                    className="mt-0.5 shrink-0"
                  />
                  Tự động lưu lịch sử prompt vào tài khoản của bạn
                </li>
                <li className="flex items-start gap-2.5">
                  <ArrowsClockwise
                    size={18}
                    weight="duotone"
                    color="#C98A1F"
                    className="mt-0.5 shrink-0"
                  />
                  Copy nhanh một prompt cũ, không cần điền lại
                </li>
                <li className="flex items-start gap-2.5">
                  <ShieldCheck
                    size={18}
                    weight="duotone"
                    color="#1F7FC9"
                    className="mt-0.5 shrink-0"
                  />
                  Mật khẩu băm BCrypt, phiên đăng nhập qua access/refresh token
                </li>
              </ul>
            </section>

            <section className="flex flex-col gap-6 p-7">
              <div
                role="tablist"
                aria-label="Chuyển đổi đăng nhập / đăng ký"
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
                  Đăng nhập
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
                  Đăng ký
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
