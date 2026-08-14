/** Suspense fallback for lazy-loaded route pages (see `App.tsx`) — kept
 *  minimal since it's only visible for the duration of a chunk fetch. */
export function PageFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-sm text-[#5B5F58] dark:text-[#A2A79C]">Loading…</p>
    </div>
  )
}
