import type { DashboardDateRange } from '../api/dashboardClient.types'

export function daysAgoIso(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

/** `/admin/analytics/dashboard` returns the full `promptsGeneratedPerDay` series
 *  with no server-side date filtering, so the range picker filters it client-side. */
export function entriesInRange(
  promptsGeneratedPerDay: Record<string, number>,
  range: DashboardDateRange,
): [string, number][] {
  const to = range.to ?? daysAgoIso(0)
  const from = range.from ?? to
  return Object.entries(promptsGeneratedPerDay)
    .filter(([date]) => date >= from && date <= to)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
}

export function sumPromptsInRange(
  promptsGeneratedPerDay: Record<string, number>,
  range: DashboardDateRange,
): number {
  return entriesInRange(promptsGeneratedPerDay, range).reduce((total, [, count]) => total + count, 0)
}
