import type { TemplateListItem } from '../types'
import { TemplateCard } from './TemplateCard'

interface TemplateGridProps {
  templates: TemplateListItem[]
  isSignedIn?: boolean
  onTemplateClick?: (id: string) => void
  hasNext?: boolean
  isLoadingMore?: boolean
  onLoadMore?: () => void
}

export function TemplateGrid({
  templates,
  isSignedIn,
  onTemplateClick,
  hasNext,
  isLoadingMore,
  onLoadMore,
}: TemplateGridProps) {
  return (
    <section className="flex flex-col gap-[0.75rem]">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="m-0 text-[0.95rem] font-bold tracking-[-0.005em]">All templates</h2>
        <span className="font-mono text-[0.72rem] text-[#8B8F86] dark:text-[#6D726A]">
          {templates.length} templates
        </span>
      </div>
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
        {templates.map((t, index) => (
          <TemplateCard
            key={t.id}
            template={t}
            isSignedIn={!!isSignedIn}
            onClick={onTemplateClick}
            index={index}
          />
        ))}
      </div>
      {hasNext && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={isLoadingMore}
          className="mt-1 self-center rounded-panel border border-[#DBDFD3] bg-transparent px-[1.3rem] py-[0.7rem] text-[0.92rem] font-semibold text-[#1B1D1B] transition-colors duration-150 hover:border-[#8B8F86] hover:bg-[#EAEDE6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] disabled:cursor-not-allowed disabled:opacity-55 dark:border-[#2C3130] dark:text-[#ECEEE8] dark:hover:border-[#6D726A] dark:hover:bg-[#23282C]"
        >
          {isLoadingMore ? 'Loading…' : 'Load more'}
        </button>
      )}
    </section>
  )
}
