import type { ReactNode } from 'react'

interface KpiCardProps {
  label: string
  value: string
  icon: ReactNode
}

/** Matches the mockup's `.kpi-card`. No delta/trend text is shown — the
 *  underlying `DashboardMetricSnapshot` (FR-015) has no period-over-period
 *  comparison field to compute one from without inventing data. */
export function KpiCard({ label, value, icon }: KpiCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-[#DBDFD3] bg-white p-4 dark:border-[#2C3130] dark:bg-[#1C2024]">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.06em] text-[#8B8F86] dark:text-[#6D726A]">
          {label}
        </span>
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[#EAEDE6] text-[#8B8F86] dark:bg-[#23282C] dark:text-[#6D726A]">
          {icon}
        </span>
      </div>
      <span className="text-[1.7rem] font-bold tracking-[-0.02em]">{value}</span>
    </div>
  )
}
