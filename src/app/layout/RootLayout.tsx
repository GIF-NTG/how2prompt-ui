import { Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/useAuth'
import { EmailVerificationBanner } from '@/features/auth/components/EmailVerificationBanner'
import { TopBar } from '@/shared/components/TopBar'
import { BraceField } from '@/shared/components/BraceField'

export function RootLayout() {
  const { session } = useAuth()

  return (
    <div className="relative min-h-screen bg-[#F3F5F0] text-[#1B1D1B] dark:bg-[#14171A] dark:text-[#ECEEE8]">
      <BraceField />
      <div className="relative z-10">
        <TopBar />
        {session && !session.emailVerified && <EmailVerificationBanner />}
        <Outlet />
      </div>
    </div>
  )
}
