import { Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/useAuth'

export function RootLayout() {
  const { session, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-[#F3F5F0] text-[#1B1D1B] dark:bg-[#14171A] dark:text-[#ECEEE8]">
      {session && (
        <div className="flex items-center justify-end gap-3 border-b border-[#DBDFD3] px-4 py-2 text-sm dark:border-[#2C3130]">
          <span>{session.displayName}</span>
          <button
            type="button"
            onClick={() => void signOut()}
            className="font-mono text-xs text-[#3652E0] underline underline-offset-2 dark:text-[#8493FF]"
          >
            Đăng xuất
          </button>
        </div>
      )}
      <Outlet />
    </div>
  )
}
