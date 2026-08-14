import { useEffect, useState } from 'react'
import { useAdminData } from '../context/useAdminData'
import type { DashboardDateRange } from '../api/dashboardClient.types'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { DateRangeFilter } from '../components/DateRangeFilter'
import { DashboardMetrics } from '../components/DashboardMetrics'
import { daysAgoIso } from '../utils/dateRange'

/** Bounded to the viewport (minus AdminLayout's own pt-6/pb-16 padding, ~5.5rem)
 *  so the dashboard reads as a single-screen overview instead of a scrolling
 *  page — individual panels below fall back to their own internal scroll if a
 *  data set is unexpectedly large, rather than growing the page. */
export function DashboardPage() {
  const { dashboardStats, dashboardStatsLoaded, error, ensureDashboardStats } = useAdminData()
  const [range, setRange] = useState<DashboardDateRange>({ from: daysAgoIso(30), to: null })

  useEffect(() => {
    void ensureDashboardStats()
  }, [ensureDashboardStats])

  return (
    <div className="flex h-[calc(100vh-5.5rem)] min-h-[32rem] flex-col gap-4">
      <AdminPageHeader
        eyebrow="admin / overview"
        title="Dashboard"
        actions={<DateRangeFilter range={range} onChange={setRange} />}
      />

      {!dashboardStatsLoaded && !error ? (
        <p className="text-sm text-[#5B5F58] dark:text-[#A2A79C]">Loading…</p>
      ) : error ? (
        <p role="alert" className="text-sm text-[#C23A2E] dark:text-[#FF7A6B]">
          {error}
        </p>
      ) : dashboardStats ? (
        <DashboardMetrics stats={dashboardStats} range={range} />
      ) : null}
    </div>
  )
}
