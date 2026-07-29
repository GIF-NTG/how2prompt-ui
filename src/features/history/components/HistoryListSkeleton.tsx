function RowSkeleton() {
  return (
    <div className="flex flex-col gap-1.5 rounded-card border border-[#DBDFD3] bg-white p-4 dark:border-[#2C3130] dark:bg-[#1C2024]">
      <div className="flex items-center justify-between gap-3">
        <div className="h-[1rem] w-[45%] animate-pulse rounded bg-[#E2E5DC] dark:bg-[#2C3130]" />
        <div className="h-[0.85rem] w-[4rem] animate-pulse rounded bg-[#E2E5DC] dark:bg-[#2C3130]" />
      </div>
      <div className="h-[1.2rem] w-[3.5rem] animate-pulse rounded-full bg-[#E2E5DC] dark:bg-[#2C3130]" />
      <div className="h-[0.85rem] w-full animate-pulse rounded bg-[#E2E5DC] dark:bg-[#2C3130]" />
      <div className="mt-1 flex gap-2">
        <div className="h-[1.9rem] w-[1.9rem] animate-pulse rounded-md bg-[#E2E5DC] dark:bg-[#2C3130]" />
        <div className="h-[1.9rem] w-[1.9rem] animate-pulse rounded-md bg-[#E2E5DC] dark:bg-[#2C3130]" />
      </div>
    </div>
  )
}

export function HistoryListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div aria-hidden className="flex flex-col gap-3">
      {Array.from({ length: count }, (_, i) => (
        <RowSkeleton key={i} />
      ))}
    </div>
  )
}
