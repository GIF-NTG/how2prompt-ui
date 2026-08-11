/**
 * The "From"/"To" filter inputs are plain `YYYY-MM-DD` values (from
 * `<input type="date">`), but `createdAt` on a history entry is a full ISO
 * timestamp (e.g. `2026-07-29T09:00:00Z`). Comparing those two shapes
 * directly as strings is lexicographically wrong for the "To" boundary: any
 * timestamp *on* that day sorts after the bare date (it has extra
 * characters), so it gets excluded even though the user picked that day to
 * be included. Expanding both bounds to full-day ISO instants first makes
 * the comparison correct on either end.
 */
export function toRangeStartIso(date: string): string {
  return `${date}T00:00:00.000Z`
}

export function toRangeEndIso(date: string): string {
  return `${date}T23:59:59.999Z`
}
