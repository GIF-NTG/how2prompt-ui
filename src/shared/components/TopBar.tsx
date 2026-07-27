import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/useAuth'

export function TopBar() {
  const { session, signOut } = useAuth()
  const location = useLocation()

  return (
    <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-[clamp(1.25rem,4vw,3rem)]">
      <Link to="/" className="flex items-center gap-2.5 text-[1.05rem] font-bold tracking-[-0.01em]">
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
                ? 'text-[#1B1D1B] border-b-[#8B8F86] dark:text-[#ECEEE8]'
                : 'text-[#5B5F58] hover:text-[#1B1D1B] dark:text-[#A2A79C] dark:hover:text-[#ECEEE8]'
            }`}
          >
            Thư viện
          </Link>
          <Link
            to="/history"
            className={`text-[0.88rem] border-b border-transparent transition-colors duration-150 ${
              location.pathname === '/history'
                ? 'text-[#1B1D1B] border-b-[#8B8F86] dark:text-[#ECEEE8]'
                : 'text-[#5B5F58] hover:text-[#1B1D1B] dark:text-[#A2A79C] dark:hover:text-[#ECEEE8]'
            }`}
          >
            Lịch sử
          </Link>
        </nav>

        {session && (
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#E7EAFC] font-mono text-[0.85rem] font-bold text-[#3652E0] dark:bg-[#262C4A] dark:text-[#8493FF]">
              {session.displayName.charAt(0).toUpperCase()}
            </span>
            <span className="text-[0.9rem] font-semibold">{session.displayName}</span>
            <Link
              to="/profile"
              className="font-mono text-[0.78rem] text-[#5B5F58] underline underline-offset-2 hover:text-[#1B1D1B] dark:text-[#A2A79C] dark:hover:text-[#ECEEE8]"
            >
              Hồ sơ
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              className="font-mono text-[0.78rem] text-[#5B5F58] underline underline-offset-2 hover:text-[#1B1D1B] dark:text-[#A2A79C] dark:hover:text-[#ECEEE8]"
            >
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
