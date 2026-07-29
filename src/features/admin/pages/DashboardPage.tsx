import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/context/useAuth'
import { dashboardClient } from '@/features/admin/api/dashboardClient'
import { DateRangeFilter } from '@/features/admin/components/DateRangeFilter'
import { DashboardMetrics } from '@/features/admin/components/DashboardMetrics'
import type { DashboardMetricSnapshot } from '@/features/admin/api/dashboardClient.types'

export function DashboardPage() {
  const { session } = useAuth()
  const [range, setRange] = useState({ from: '', to: '' })
  const [stats, setStats] = useState<DashboardMetricSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await dashboardClient.getStats(session!.token, {
        from: range.from || undefined,
        to: range.to || undefined,
      })
      setStats(data)
    } catch {
      setError('Không thể tải dữ liệu thống kê, vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [session, range])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <main className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-5 pb-16 pt-2 sm:px-[clamp(1.25rem,4vw,3rem)]">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-[#3652E0] dark:text-[#8493FF]">
          quản trị · thống kê
        </span>
        <h1 className="m-0 text-[clamp(1.4rem,2.4vw,1.7rem)] leading-[1.2] tracking-[-0.015em]">
          Bảng điều khiển phân tích
        </h1>
        <p className="m-0 max-w-[62ch] text-[0.94rem] leading-[1.6] text-[#5B5F58] dark:text-[#A2A79C]">
          Theo dõi người dùng hoạt động, số prompt được tạo và các template/model phổ
          biến nhất.
        </p>
      </div>

      <DateRangeFilter from={range.from} to={range.to} onChange={setRange} />

      {error && (
        <p role="alert" className="m-0 text-[0.88rem] text-[#C23A2A] dark:text-[#FF7A6B]">
          {error}
        </p>
      )}

      {loading || !stats ? (
        <p className="m-0 text-[0.86rem] text-[#5B5F58] dark:text-[#A2A79C]">Đang tải...</p>
      ) : (
        <DashboardMetrics stats={stats} />
      )}
    </main>
  )
}
