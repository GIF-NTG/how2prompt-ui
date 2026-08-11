import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/useAuth'
import { EmailVerificationBanner } from '@/features/auth/components/EmailVerificationBanner'
import { HomeDataProvider } from '@/features/home/context/HomeDataProvider'
import { HistoryDataProvider } from '@/features/history/context/HistoryDataProvider'
import { TopBar } from '@/shared/components/TopBar'
import { Footer } from '@/shared/components/Footer'
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
          {/* flex-col + the routed page wrapped in flex-1 is the sticky-footer
           *  pattern — Footer sits at the bottom of the viewport on short
           *  pages instead of floating up under the content. */}
          <div className="relative z-10 flex min-h-screen flex-col">
            <TopBar />
            {session && !session.emailVerified && <EmailVerificationBanner />}
            {/* Scoped to just the routed page so a not-yet-loaded lazy chunk
             *  (see `App.tsx`) only swaps this area, not the whole shell —
             *  a Suspense boundary above TopBar would unmount it too, which
             *  reads as a full page reload on every first-time navigation. */}
            <div className="flex-1">
              <Suspense fallback={<PageFallback />}>
                <Outlet />
              </Suspense>
            </div>
            <Footer />
          </div>
        </div>
      </HistoryDataProvider>
    </HomeDataProvider>
  )
}
