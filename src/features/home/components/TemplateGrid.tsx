import type { TemplateListItem } from '../types'
import { TemplateCard } from './TemplateCard'

interface TemplateGridProps {
  templates: TemplateListItem[]
  totalCount: number
  isSignedIn?: boolean
  onTemplateClick?: (slug: string) => void
}

export function TemplateGrid({
  templates,
  totalCount,
  isSignedIn,
  onTemplateClick,
}: TemplateGridProps) {
  return (
    <section className="flex flex-col gap-[0.75rem]">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="m-0 text-[0.95rem] font-bold tracking-[-0.005em]">Toàn bộ thư viện</h2>
        <span className="font-mono text-[0.72rem] text-[#8B8F86] dark:text-[#6D726A]">
          {templates.length} / {totalCount} mẫu
        </span>
      </div>
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
        {templates.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            isSignedIn={!!isSignedIn}
            onClick={onTemplateClick}
          />
        ))}
      </div>
    </section>
  )
}
