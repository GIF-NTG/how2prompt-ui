import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { GuestContinueLink } from './GuestContinueLink'
import { BraceField } from './BraceField'

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
            <section className="flex flex-col gap-7 border-b border-[#DBDFD3] bg-[#EAEDE6] p-7 dark:border-[#2C3130] dark:bg-[#23282C] md:border-r md:border-b-0">
              <span className="inline-flex items-center gap-1.5 font-mono text-[0.7rem] tracking-wider text-[#3652E0] uppercase dark:text-[#8493FF]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3652E0] dark:bg-[#8493FF]" />
                api/auth
              </span>

              <h1 className="text-2xl leading-tight font-bold text-balance tracking-tight text-[#1B1D1B] dark:text-[#ECEEE8]">
                Đừng viết prompt từ đầu. Điền vào chỗ trống.
              </h1>

              <p className="max-w-[40ch] text-sm leading-relaxed text-[#5B5F58] dark:text-[#A2A79C]">
                Tài khoản Member lưu lại mọi prompt bạn đã ghép — Vai trò, Bối cảnh, Ràng
                buộc — để dùng lại bất cứ lúc nào.
              </p>

              <div
                aria-hidden
                className="rounded-[14px] border border-[#DBDFD3] bg-white p-5 text-sm leading-relaxed text-[#1B1D1B] dark:border-[#2C3130] dark:bg-[#1C2024] dark:text-[#ECEEE8]"
              >
                <span className="mb-2 block font-mono text-[0.68rem] tracking-wider text-[#8B8F86] uppercase dark:text-[#6D726A]">
                  raw_template preview
                </span>
                Với vai trò <span className={BLANK_TAG}>{'{role}'}</span>, hãy debug đoạn
                log sau trong bối cảnh <span className={BLANK_TAG}>{'{context}'}</span>,
                tuân thủ ràng buộc <span className={BLANK_TAG}>{'{constraints}'}</span>.
              </div>

              <ul className="flex flex-col gap-3 text-sm text-[#5B5F58] dark:text-[#A2A79C]">
                <li className="flex items-start gap-2.5">
                  <span className="w-4 shrink-0 font-mono font-bold text-[#3652E0] dark:text-[#8493FF]">＋</span>
                  Tự động lưu lịch sử prompt vào tài khoản của bạn
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 shrink-0 font-mono font-bold text-[#3652E0] dark:text-[#8493FF]">↻</span>
                  Copy nhanh một prompt cũ, không cần điền lại
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 shrink-0 font-mono font-bold text-[#3652E0] dark:text-[#8493FF]">✓</span>
                  Mật khẩu băm BCrypt, phiên đăng nhập qua JWT
                </li>
              </ul>

              <div className="mt-auto flex items-center gap-2 border-t border-dashed border-[#DBDFD3] pt-5 font-mono text-[0.7rem] text-[#8B8F86] dark:border-[#2C3130] dark:text-[#6D726A]">
                <span className="rounded-full bg-[#1B1D1B] px-2 py-0.5 font-semibold text-[#F3F5F0] dark:bg-[#ECEEE8] dark:text-[#14171A]">
                  JWT
                </span>
                phiên đăng nhập được giữ trong 7 ngày trên trình duyệt này
              </div>
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
