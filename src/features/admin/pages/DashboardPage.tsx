import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/features/auth/context/useAuth'
import { ApiError } from '@/shared/utils/httpClient'
import { createDashboardClient } from '../api/dashboardClient'
import type { DashboardDateRange, DashboardMetricSnapshot } from '../api/dashboardClient.types'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { DateRangeFilter } from '../components/DateRangeFilter'
import { DashboardMetrics } from '../components/DashboardMetrics'
import { daysAgoIso } from '../utils/dateRange'

export function DashboardPage() {
  const { session } = useAuth()
  const client = useMemo(() => createDashboardClient(session?.token), [session?.token])

  const [range, setRange] = useState<DashboardDateRange>({ from: daysAgoIso(30), to: null })
  const [stats, setStats] = useState<DashboardMetricSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setStats(await client.getStats(range))
    } catch (err) {
      setStats(null)
      setError(
        err instanceof ApiError
          ? err.message
          : 'Không thể tải số liệu dashboard, vui lòng thử lại.',
      )
    } finally {
      setLoading(false)
    }
  }, [client, range])

  useEffect(() => {
    void loadStats()
  }, [loadStats])

  return (
    <>
      <AdminPageHeader
        eyebrow="admin / analytics"
        title="Dashboard"
        actions={<DateRangeFilter range={range} onChange={setRange} />}
      />

      {loading ? (
        <p className="text-sm text-[#5B5F58] dark:text-[#A2A79C]">Đang tải...</p>
      ) : error ? (
        <p role="alert" className="text-sm text-[#C23A2E] dark:text-[#FF7A6B]">
          {error}
        </p>
      ) : stats ? (
        <DashboardMetrics stats={stats} />
      ) : null}
    </>
  )
}
