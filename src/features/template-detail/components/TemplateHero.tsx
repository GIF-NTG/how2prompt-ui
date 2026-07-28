import type { I18nString } from '@/shared/types/api'
import type { Category } from '../types'
import { getI18nValue } from '@/shared/utils/i18n'

interface TemplateHeroProps {
  title: I18nString
  description: I18nString
  categories: Category[]
  isOfficial: boolean
}

export function TemplateHero({ title, description, categories, isOfficial }: TemplateHeroProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {isOfficial && (
          <span className="rounded-[5px] bg-[#E7EAFC] px-1.5 py-[0.12rem] font-mono text-[0.65rem] font-bold tracking-[0.03em] text-[#3652E0] dark:bg-[#262C4A] dark:text-[#8493FF]">
            Chính thức
          </span>
        )}
        {categories.map((cat) => (
          <span
            key={cat.id}
            className="rounded-full bg-[#EAEDE6] px-2 py-[0.14rem] font-mono text-[0.68rem] text-[#5B5F58] dark:bg-[#23282C] dark:text-[#A2A79C]"
          >
            {getI18nValue(cat.name)}
          </span>
        ))}
      </div>
      <h1 className="m-0 text-[clamp(1.4rem,2.4vw,1.7rem)] leading-[1.2] tracking-[-0.015em]">
        {getI18nValue(title)}
      </h1>
      <p className="m-0 max-w-[62ch] text-[0.94rem] leading-[1.6] text-[#5B5F58] dark:text-[#A2A79C]">
        {getI18nValue(description)}
      </p>
    </div>
  )
}
