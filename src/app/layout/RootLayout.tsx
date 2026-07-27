import { Outlet } from 'react-router-dom'
import { TopBar } from '@/shared/components/TopBar'

export function RootLayout() {
  return (
    <div className="min-h-screen bg-[#F3F5F0] text-[#1B1D1B] dark:bg-[#14171A] dark:text-[#ECEEE8]">
      <TopBar />
      <Outlet />
    </div>
  )
}
