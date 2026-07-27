import type { TemplateListItem } from '../types'
import { TemplateCard } from './TemplateCard'

interface TemplateRailProps {
  title: string
  subtitle?: string
  templates: TemplateListItem[]
  isSignedIn?: boolean
  onTemplateClick?: (id: string) => void
}

export function TemplateRail({ title, subtitle, templates, isSignedIn, onTemplateClick }: TemplateRailProps) {
  return (
    <section className="flex flex-col gap-[0.75rem]">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="m-0 text-[0.95rem] font-bold tracking-[-0.005em]">{title}</h2>
        {subtitle && (
          <span className="font-mono text-[0.72rem] text-[#8B8F86] dark:text-[#6D726A]">{subtitle}</span>
        )}
      </div>
      <div className="group flex gap-[0.9rem] overflow-x-auto pb-[0.35rem] scrollbar-thin [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-[3px] [&::-webkit-scrollbar-thumb]:bg-[#DBDFD3] dark:[&::-webkit-scrollbar-thumb]:bg-[#2C3130]">
        {templates.map((t) => (
          <div key={t.id} className="min-w-[240px] flex-[0_0_auto]">
            <TemplateCard template={t} isSignedIn={!!isSignedIn} onClick={onTemplateClick} />
          </div>
        ))}
      </div>
    </section>
  )
}
