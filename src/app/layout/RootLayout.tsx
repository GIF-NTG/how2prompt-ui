import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/useAuth'
import { EmailVerificationBanner } from '@/features/auth/components/EmailVerificationBanner'
import { HomeDataProvider } from '@/features/home/context/HomeDataProvider'
import { HistoryDataProvider } from '@/features/history/context/HistoryDataProvider'
import { TopBar } from '@/shared/components/TopBar'
import { BraceField } from '@/shared/components/BraceField'
import { PageFallback } from '../PageFallback'

export function RootLayout() {
  const { session } = useAuth()

  return (
    // Above the Outlet below (whose page swaps on every nested route change)
    // so categories/tags/AI models/history survive navigating away from and
    // back to Home or History instead of being re-fetched every time — see
    // HomeDataProvider/HistoryDataProvider.
    <HomeDataProvider>
      <HistoryDataProvider>
        <div className="relative min-h-screen bg-[#F3F5F0] text-[#1B1D1B] dark:bg-[#14171A] dark:text-[#ECEEE8]">
          <BraceField />
          <div className="relative z-10">
            <TopBar />
            {session && !session.emailVerified && <EmailVerificationBanner />}
            {/* Scoped to just the routed page so a not-yet-loaded lazy chunk
             *  (see `App.tsx`) only swaps this area, not the whole shell —
             *  a Suspense boundary above TopBar would unmount it too, which
             *  reads as a full page reload on every first-time navigation. */}
            <Suspense fallback={<PageFallback />}>
              <Outlet />
            </Suspense>
          </div>
        </div>
      </HistoryDataProvider>
    </HomeDataProvider>
  )
}
