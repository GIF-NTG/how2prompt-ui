function CardSkeleton() {
  return (
    <div className="flex flex-col gap-[0.55rem] rounded-card border border-[#DBDFD3] bg-white p-[1.1rem_1.2rem] dark:border-[#2C3130] dark:bg-[#1C2024]">
      <div className="h-[1rem] w-[4rem] animate-pulse rounded-md bg-[#E2E5DC] dark:bg-[#2C3130]" />
      <div className="h-[1.1rem] w-[70%] animate-pulse rounded bg-[#E2E5DC] dark:bg-[#2C3130]" />
      <div className="h-[0.85rem] w-full animate-pulse rounded bg-[#E2E5DC] dark:bg-[#2C3130]" />
      <div className="h-[0.85rem] w-[80%] animate-pulse rounded bg-[#E2E5DC] dark:bg-[#2C3130]" />
      <div className="mt-1 flex gap-1.5">
        <div className="h-[1.3rem] w-[3.5rem] animate-pulse rounded-full bg-[#E2E5DC] dark:bg-[#2C3130]" />
        <div className="h-[1.3rem] w-[3.5rem] animate-pulse rounded-full bg-[#E2E5DC] dark:bg-[#2C3130]" />
      </div>
    </div>
  )
}

export function TemplateGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      aria-hidden
      className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]"
    >
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
