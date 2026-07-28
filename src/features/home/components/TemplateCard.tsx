import { useState } from 'react'
import type { TemplateListItem } from '../types'
import { templateClient } from '@/features/home/api/templateClient'
import { getI18nValue } from '@/shared/utils/i18n'

const MODEL_LABEL: Record<string, string> = {
  'gpt-4o': 'GPT-4o',
  claude: 'Claude',
  gemini: 'Gemini',
}

interface TemplateCardProps {
  template: TemplateListItem
  isSignedIn: boolean
  onClick?: (slug: string) => void
}

export function TemplateCard({ template, isSignedIn, onClick }: TemplateCardProps) {
  const [isFavorited, setIsFavorited] = useState(template.is_favorited)

  async function handleFavorite(e: React.MouseEvent) {
    e.stopPropagation()
    try {
      const result = await templateClient.toggleFavorite(template.id)
      setIsFavorited(result.is_favorited)
    } catch {
      // silently fail
    }
  }

  return (
    <button
      type="button"
      className="group relative flex w-full flex-col gap-[0.55rem] rounded-[14px] border border-[#DBDFD3] bg-white p-[1.1rem_1.2rem] text-left transition-[border-color,transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:border-[#3652E0] hover:shadow-[0_12px_24px_-18px_rgba(27,29,27,0.4)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] dark:border-[#2C3130] dark:bg-[#1C2024] dark:hover:border-[#8493FF] dark:hover:shadow-[0_12px_24px_-18px_rgba(0,0,0,0.6)]"
      onClick={() => onClick?.(template.slug)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {template.is_official && (
            <span className="rounded-[5px] bg-[#E7EAFC] px-1.5 py-[0.12rem] font-mono text-[0.65rem] font-bold tracking-[0.03em] text-[#3652E0] dark:bg-[#262C4A] dark:text-[#8493FF]">
              Chính thức
            </span>
          )}
        </div>
        {isSignedIn && (
          <button
            type="button"
            onClick={handleFavorite}
            className={`flex h-[1.7rem] w-[1.7rem] flex-shrink-0 items-center justify-center rounded-lg border text-[0.85rem] leading-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] ${
              isFavorited
                ? 'border-[#C23A2E] bg-[#FBE7E4] text-[#C23A2E] dark:border-[#FF7A6B] dark:bg-[#3A2224] dark:text-[#FF7A6B]'
                : 'border-[#DBDFD3] bg-white text-[#8B8F86] hover:border-[#C23A2E] hover:text-[#C23A2E] dark:border-[#2C3130] dark:bg-[#1C2024] dark:text-[#6D726A] dark:hover:border-[#FF7A6B] dark:hover:text-[#FF7A6B]'
            }`}
          >
            {isFavorited ? '♥' : '♡'}
          </button>
        )}
      </div>

      <h3 className="m-0 text-[1rem] font-bold tracking-[-0.005em]">
        {getI18nValue(template.title)}
      </h3>
      <p className="m-0 text-[0.85rem] leading-[1.55] text-[#5B5F58] dark:text-[#A2A79C]">
        {getI18nValue(template.description)}
      </p>

      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {template.supported_models.map((m) => (
            <span
              key={m}
              className="rounded-full bg-[#EAEDE6] px-2 py-[0.14rem] font-mono text-[0.68rem] text-[#8B8F86] dark:bg-[#23282C] dark:text-[#6D726A]"
            >
              {MODEL_LABEL[m] ?? m}
            </span>
          ))}
        </div>
        <span className="whitespace-nowrap font-mono text-[0.7rem] text-[#8B8F86] dark:text-[#6D726A]">
          {template.usage_count.toLocaleString()} lượt dùng
        </span>
      </div>
    </button>
  )
}
