import type { DashboardMetricSnapshot } from '@/features/admin/api/dashboardClient.types'

interface DashboardMetricsProps {
  stats: DashboardMetricSnapshot
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-[#DBDFD3] p-4 dark:border-[#2C3130]">
      <span className="text-[0.76rem] uppercase tracking-[0.04em] text-[#8A8F8A] dark:text-[#6B706B]">
        {label}
      </span>
      <span className="text-[1.4rem] font-semibold tracking-[-0.01em]">
        {value.toLocaleString('vi-VN')}
      </span>
    </div>
  )
}

function TopList({
  title,
  items,
}: {
  title: string
  items: { key: string; label: string; usageCount: number }[]
}) {
  const maxCount = Math.max(1, ...items.map((i) => i.usageCount))
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#DBDFD3] p-4 dark:border-[#2C3130]">
      <h3 className="m-0 text-[0.9rem] font-semibold">{title}</h3>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.key} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[0.8rem]">
              <span>{item.label}</span>
              <span className="text-[#5B5F58] dark:text-[#A2A79C]">{item.usageCount}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#EEF0E9] dark:bg-[#1C2024]">
              <div
                className="h-1.5 rounded-full bg-[#3652E0] dark:bg-[#8493FF]"
                style={{ width: `${(item.usageCount / maxCount) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function DashboardMetrics({ stats }: DashboardMetricsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatTile label="Người dùng hoạt động (ngày)" value={stats.dau} />
        <StatTile label="Người dùng hoạt động (tuần)" value={stats.wau} />
        <StatTile label="Người dùng hoạt động (tháng)" value={stats.mau} />
        <StatTile label="Tổng người dùng" value={stats.totalUsers} />
        <StatTile label="Prompt đã tạo (tổng)" value={stats.totalPromptsGenerated} />
        <StatTile label="Prompt tạo hôm nay" value={stats.promptsToday} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TopList
          title="Template phổ biến nhất"
          items={stats.topTemplates.map((t) => ({
            key: t.templateId,
            label: t.title.vi || t.title.en,
            usageCount: t.usageCount,
          }))}
        />
        <TopList
          title="Model được dùng nhiều nhất"
          items={stats.topModels.map((m) => ({
            key: m.modelCode,
            label: m.modelCode,
            usageCount: m.usageCount,
          }))}
        />
      </div>
    </div>
  )
}
