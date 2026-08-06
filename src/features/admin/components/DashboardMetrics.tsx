import { Users, TrendingUp, CalendarDays, FileText, Layers, ArrowRight } from 'lucide-react'
import { getI18nValue } from '@/shared/utils/i18n'
import type { DashboardDateRange, DashboardMetricSnapshot } from '../api/dashboardClient.types'
import { entriesInRange } from '../utils/dateRange'
import { KpiCard } from './KpiCard'
import { AdminPanel } from './AdminPanel'
import { PromptsTrendChart } from './PromptsTrendChart'

interface DashboardMetricsProps {
  stats: DashboardMetricSnapshot
  range: DashboardDateRange
}

function formatNumber(value: number): string {
  return value.toLocaleString('vi-VN')
}

function EmptyState({ children }: { children: string }) {
  return <p className="m-0 text-sm text-[#8B8F86] dark:text-[#6D726A]">{children}</p>
}

/** Dashboard tiles/panels (FR-015, FR-016), styled per the mockup's KPI grid +
 *  panel layout. Sized to fit within `DashboardPage`'s single-screen height
 *  budget: KPI row + a fixed-height chart/table/bars row + a compact
 *  horizontal funnel row, each panel scrolling internally rather than
 *  growing the page if its data set is unusually large.
 *  `promptsGeneratedPerDay` has no server-side date filter, so the "Prompts
 *  in range" tile and trend chart are both derived client-side via
 *  `range`. */
export function DashboardMetrics({ stats, range }: DashboardMetricsProps) {
  const trendEntries = entriesInRange(stats.promptsGeneratedPerDay, range)
  const promptsInRange = trendEntries.reduce((total, [, count]) => total + count, 0)
  const promptsTotal = Object.values(stats.promptsGeneratedPerDay).reduce((a, b) => a + b, 0)
  const maxModelUsage = Math.max(...stats.mostUsedModels.map((m) => m.usageCount), 1)
  const { signups, verifiedEmails, promptGenerations } = stats.conversionFunnel

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="DAU" value={formatNumber(stats.dau)} icon={<Users size={16} />} />
        <KpiCard label="WAU" value={formatNumber(stats.wau)} icon={<TrendingUp size={16} />} />
        <KpiCard label="MAU" value={formatNumber(stats.mau)} icon={<CalendarDays size={16} />} />
        <KpiCard
          label="Prompts in range"
          value={formatNumber(promptsInRange)}
          icon={<FileText size={16} />}
        />
        <KpiCard
          label="Total prompts"
          value={formatNumber(promptsTotal)}
          icon={<Layers size={16} />}
        />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-12">
        <AdminPanel
          title="Prompts per day"
          hint="In selected range"
          className="min-h-0 lg:col-span-5"
        >
          <div className="min-h-24 flex-1">
            <PromptsTrendChart entries={trendEntries} />
          </div>
        </AdminPanel>

        <AdminPanel
          title="Most popular templates"
          hint={`${stats.popularTemplates.length} items`}
          className="min-h-0 overflow-y-auto lg:col-span-4"
        >
          {stats.popularTemplates.length === 0 ? (
            <EmptyState>No template usage data yet.</EmptyState>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#DBDFD3] dark:border-[#2C3130]">
                  <th className="w-6 pb-2 text-left font-mono text-[0.68rem] uppercase tracking-[0.05em] text-[#8B8F86] dark:text-[#6D726A]" />
                  <th className="pb-2 text-left font-mono text-[0.68rem] uppercase tracking-[0.05em] text-[#8B8F86] dark:text-[#6D726A]">
                    Template
                  </th>
                  <th className="pb-2 text-left font-mono text-[0.68rem] uppercase tracking-[0.05em] text-[#8B8F86] dark:text-[#6D726A]">
                    Uses
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.popularTemplates.map((item, index) => (
                  <tr
                    key={item.templateId}
                    className="border-b border-[#DBDFD3] last:border-0 dark:border-[#2C3130]"
                  >
                    <td className="py-2 font-mono text-[#8B8F86] dark:text-[#6D726A]">
                      {index + 1}
                    </td>
                    <td className="py-2 font-semibold">{getI18nValue(item.titleI18n)}</td>
                    <td className="py-2 font-mono font-semibold">
                      {formatNumber(item.usageCount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </AdminPanel>

        <AdminPanel
          title="Most used AI models"
          className="min-h-0 overflow-y-auto lg:col-span-3"
        >
          {stats.mostUsedModels.length === 0 ? (
            <EmptyState>No model usage data yet.</EmptyState>
          ) : (
            <div className="flex flex-col gap-3">
              {stats.mostUsedModels.map((model) => (
                <div key={model.modelId} className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-mono font-semibold">{model.name}</span>
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
          )}
        </AdminPanel>
      </div>

      <AdminPanel title="Conversion funnel" hint="Signup → verify email → generate prompt">
        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-3">
          {(
            [
              { label: 'Signups', value: signups },
              { label: 'Verified emails', value: verifiedEmails },
              { label: 'Prompt generations', value: promptGenerations },
            ] as const
          ).flatMap((step, index, steps) => {
            const pct = signups > 0 ? Math.round((step.value / signups) * 100) : 0
            const card = (
              <div
                key={step.label}
                className="flex flex-col gap-0.5 rounded-xl border border-[#DBDFD3] bg-[#F7F8F5] px-4 py-2.5 dark:border-[#2C3130] dark:bg-[#171A1D]"
              >
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.05em] text-[#8B8F86] dark:text-[#6D726A]">
                  {step.label}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold tracking-[-0.02em]">
                    {formatNumber(step.value)}
                  </span>
                  <span className="font-mono text-xs text-[#8B8F86] dark:text-[#6D726A]">
                    {pct}%
                  </span>
                </div>
              </div>
            )
            if (index === steps.length - 1) return [card]
            return [
              card,
              <ArrowRight
                key={`${step.label}-arrow`}
                size={18}
                className="flex-shrink-0 text-[#8B8F86] dark:text-[#6D726A]"
              />,
            ]
          })}
        </div>
      </AdminPanel>
    </div>
  )
}
