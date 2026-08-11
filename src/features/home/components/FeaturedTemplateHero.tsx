import { Sparkles, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { TemplateListItem } from '../types'
import { getI18nValue } from '@/shared/utils/i18n'

interface FeaturedTemplateHeroProps {
  template: TemplateListItem | null
}

/** Shows the first template an Admin has flagged `isFeatured` (see
 *  specs/013-us6.1-admin-mark-featured) — renders nothing if none is
 *  currently featured, rather than falling back to a hardcoded template. */
export function FeaturedTemplateHero({ template }: FeaturedTemplateHeroProps) {
  const navigate = useNavigate()

  if (!template) return null

  return (
    <div className="relative flex flex-col gap-4 overflow-hidden rounded-card bg-[linear-gradient(135deg,#3652E0_0%,#5B3FE0_100%)] p-[2rem_2.2rem] text-white shadow-[0_20px_45px_-20px_rgba(54,82,224,0.55)] dark:bg-[linear-gradient(135deg,#4557D8_0%,#6B4FE0_100%)]">
      <Sparkles
        size={140}
        strokeWidth={1}
        className="pointer-events-none absolute -top-6 -right-6 text-white/15"
      />

      <div className="relative flex flex-wrap items-center gap-1.5">
        <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 font-mono text-[0.7rem] font-bold tracking-[0.03em] text-white uppercase backdrop-blur-sm">
          <Sparkles size={12} />
          Featured
        </span>
        {template.isOfficial && (
          <span className="rounded-full bg-white/15 px-2.5 py-1 font-mono text-[0.7rem] font-bold tracking-[0.03em] text-white backdrop-blur-sm">
            Official
          </span>
        )}
      </div>

      <h2 className="relative m-0 text-[1.7rem] leading-[1.15] font-bold tracking-[-0.015em]">
        {getI18nValue(template.title)}
      </h2>
      <p className="relative m-0 max-w-[52ch] text-[0.95rem] leading-[1.6] text-white/85">
        {getI18nValue(template.description)}
      </p>

      <button
        type="button"
        onClick={() => navigate(`/templates/${template.id}`, { viewTransition: true })}
        className="relative mt-1 flex w-fit cursor-pointer items-center gap-1.5 rounded-lg bg-white px-5 py-2.5 text-[0.9rem] font-bold text-[#3652E0] transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Use now
        <ArrowRight size={16} />
      </button>
    </div>
  )
}
