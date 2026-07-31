import { Users, TrendingUp, CalendarDays, FileText, LayoutTemplate } from 'lucide-react'
import { getI18nValue } from '@/shared/utils/i18n'
import type { DashboardMetricSnapshot } from '../api/dashboardClient.types'
import { KpiCard } from './KpiCard'
import { AdminPanel } from './AdminPanel'

interface DashboardMetricsProps {
  stats: DashboardMetricSnapshot
}

function formatNumber(value: number): string {
  return value.toLocaleString('vi-VN')
}

/** Dashboard tiles/panels (FR-015, FR-016), styled per the mockup's KPI grid +
 *  panel layout. No conversion-funnel widget is rendered — the contract
 *  doesn't expose that metric (FR-015a). */
export function DashboardMetrics({ stats }: DashboardMetricsProps) {
  const maxModelUsage = Math.max(...stats.topModels.map((m) => m.usageCount), 1)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="DAU" value={formatNumber(stats.dau)} icon={<Users size={16} />} />
        <KpiCard label="WAU" value={formatNumber(stats.wau)} icon={<TrendingUp size={16} />} />
        <KpiCard label="MAU" value={formatNumber(stats.mau)} icon={<CalendarDays size={16} />} />
        <KpiCard
          label="Prompt hôm nay"
          value={formatNumber(stats.promptsToday)}
          icon={<FileText size={16} />}
        />
        <KpiCard
          label="Tổng template"
          value={formatNumber(stats.totalTemplates)}
          icon={<LayoutTemplate size={16} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.65fr_1fr]">
        <AdminPanel title="Template phổ biến nhất" hint={`${stats.topTemplates.length} mục`}>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#DBDFD3] dark:border-[#2C3130]">
                <th className="w-6 pb-2 text-left font-mono text-[0.68rem] uppercase tracking-[0.05em] text-[#8B8F86] dark:text-[#6D726A]" />
                <th className="pb-2 text-left font-mono text-[0.68rem] uppercase tracking-[0.05em] text-[#8B8F86] dark:text-[#6D726A]">
                  Template
                </th>
                <th className="pb-2 text-left font-mono text-[0.68rem] uppercase tracking-[0.05em] text-[#8B8F86] dark:text-[#6D726A]">
                  Lượt dùng
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.topTemplates.map((item, index) => (
                <tr
                  key={item.templateId}
                  className="border-b border-[#DBDFD3] last:border-0 dark:border-[#2C3130]"
                >
                  <td className="py-2.5 font-mono text-[#8B8F86] dark:text-[#6D726A]">
                    {index + 1}
                  </td>
                  <td className="py-2.5 font-semibold">{getI18nValue(item.title)}</td>
                  <td className="py-2.5 font-mono font-semibold">
                    {formatNumber(item.usageCount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminPanel>

        <AdminPanel title="Model AI được dùng nhiều nhất">
          <div className="flex flex-col gap-3">
            {stats.topModels.map((model) => (
              <div key={model.modelCode} className="flex flex-col gap-1">
                <div className="flex justify-between text-sm">
                  <span className="font-mono font-semibold">{model.modelCode}</span>
                  <span className="font-mono text-xs text-[#8B8F86] dark:text-[#6D726A]">
                    {Math.round((model.usageCount / maxModelUsage) * 100)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#EAEDE6] dark:bg-[#23282C]">
                  <div
                    className="h-full rounded-full bg-[#3652E0] dark:bg-[#8493FF]"
                    style={{ width: `${(model.usageCount / maxModelUsage) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>

      <p className="m-0 flex items-center gap-2 font-mono text-[0.72rem] text-[#8B8F86] dark:text-[#6D726A]">
        <span className="rounded-full bg-[#1B1D1B] px-2 py-0.5 font-bold text-[#F3F5F0] dark:bg-[#ECEEE8] dark:text-[#14171A]">
          CACHE
        </span>
        Số liệu có thể trễ tối đa vài phút (FR-017).
      </p>
    </div>
  )
}
