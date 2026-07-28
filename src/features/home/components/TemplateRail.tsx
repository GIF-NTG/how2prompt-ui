import type { TemplateListItem } from '../types'
import { useDragScroll } from '@/shared/hooks/useDragScroll'
import { TemplateCard } from './TemplateCard'

interface TemplateRailProps {
  title: string
  subtitle?: string
  templates: TemplateListItem[]
  isSignedIn?: boolean
  onTemplateClick?: (slug: string) => void
}

export function TemplateRail({
  title,
  subtitle,
  templates,
  isSignedIn,
  onTemplateClick,
}: TemplateRailProps) {
  const drag = useDragScroll<HTMLDivElement>()

  return (
    <section className="flex flex-col gap-[0.75rem]">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="m-0 text-[0.95rem] font-bold tracking-[-0.005em]">{title}</h2>
        {subtitle && (
          <span className="font-mono text-[0.72rem] text-[#8B8F86] dark:text-[#6D726A]">
            {subtitle}
          </span>
        )}
      </div>
      <div
        ref={drag.ref}
        onPointerDown={drag.onPointerDown}
        onPointerMove={drag.onPointerMove}
        onPointerUp={drag.onPointerUp}
        onPointerLeave={drag.onPointerLeave}
        onPointerCancel={drag.onPointerCancel}
        onClickCapture={drag.onClickCapture}
        className="flex cursor-grab gap-[0.9rem] overflow-x-auto pb-[0.35rem] select-none [scrollbar-width:none] active:cursor-grabbing [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {templates.map((t, index) => (
          <div key={t.id} className="min-w-[240px] flex-[0_0_auto]">
            <TemplateCard
              template={t}
              isSignedIn={!!isSignedIn}
              onClick={onTemplateClick}
              index={index}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
