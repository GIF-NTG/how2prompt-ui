import { useState } from 'react'
import { Heart } from 'lucide-react'
import type { TemplateListItem } from '../types'
import { templateClient } from '@/features/home/api/templateClient'
import { useAuth } from '@/features/auth/context/useAuth'
import { getI18nValue } from '@/shared/utils/i18n'
import { getModelLabel } from '@/shared/utils/modelLabel'
import { getTagColorClasses } from '@/shared/utils/colorTag'

interface TemplateCardProps {
  template: TemplateListItem
  isSignedIn: boolean
  onClick?: (id: string) => void
  index?: number
  /** Called after a favorite toggle succeeds — lets a list (e.g.
   *  FavoriteTemplateGrid, FR-013) react to the new state, such as removing
   *  the card once unfavorited. */
  onFavoriteChange?: (templateId: string, isFavorited: boolean) => void
}

export function TemplateCard({
  template,
  isSignedIn,
  onClick,
  index = 0,
  onFavoriteChange,
}: TemplateCardProps) {
  const [isFavorited, setIsFavorited] = useState(template.isFavorited)
  const { session } = useAuth()

  async function handleFavorite(e: React.MouseEvent) {
    e.stopPropagation()
    // Optimistic: flip immediately (SC-004's <500ms-perceived requirement),
    // revert if the request fails.
    const previous = isFavorited
    setIsFavorited(!previous)
    try {
      const result = await templateClient.toggleFavorite(template.id, previous, session?.token)
      setIsFavorited(result.isFavorited)
      onFavoriteChange?.(template.id, result.isFavorited)
    } catch {
      setIsFavorited(previous)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      style={{ animationDelay: `${Math.min(index, 14) * 35}ms` }}
      className="group relative flex h-full w-full animate-[fade-slide-up_400ms_ease_backwards] cursor-pointer flex-col gap-[0.55rem] rounded-card border border-[#DBDFD3] bg-white p-[1.1rem_1.2rem] text-left transition-[border-color,transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:border-[#3652E0] hover:shadow-[0_12px_24px_-18px_rgba(27,29,27,0.4)] active:scale-[0.98] active:duration-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] dark:border-[#2C3130] dark:bg-[#1C2024] dark:hover:border-[#8493FF] dark:hover:shadow-[0_12px_24px_-18px_rgba(0,0,0,0.6)]"
      onClick={() => onClick?.(template.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.(template.id)
        }
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {template.isOfficial && (
            <span className="rounded-md bg-[#E7EAFC] px-1.5 py-[0.12rem] font-mono text-[0.65rem] font-bold tracking-[0.03em] text-[#3652E0] dark:bg-[#262C4A] dark:text-[#8493FF]">
              Chính thức
            </span>
          )}
        </div>
        {isSignedIn && (
          <button
            type="button"
            onClick={handleFavorite}
            aria-label={isFavorited ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
            aria-pressed={isFavorited}
            className={`flex h-[1.7rem] w-[1.7rem] flex-shrink-0 cursor-pointer items-center justify-center rounded-lg border transition-colors duration-150 active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] ${
              isFavorited
                ? 'border-[#C23A2E] bg-[#FBE7E4] text-[#C23A2E] dark:border-[#FF7A6B] dark:bg-[#3A2224] dark:text-[#FF7A6B]'
                : 'border-[#DBDFD3] bg-white text-[#8B8F86] hover:border-[#C23A2E] hover:text-[#C23A2E] dark:border-[#2C3130] dark:bg-[#1C2024] dark:text-[#6D726A] dark:hover:border-[#FF7A6B] dark:hover:text-[#FF7A6B]'
            }`}
          >
            <Heart
              key={String(isFavorited)}
              size={15}
              fill={isFavorited ? 'currentColor' : 'none'}
              className="animate-[pop_300ms_ease]"
            />
          </button>
        )}
      </div>

      <h3 className="m-0 shrink-0 truncate text-[1rem] font-bold tracking-[-0.005em]">
        {getI18nValue(template.title)}
      </h3>
      <p className="m-0 line-clamp-2 shrink-0 text-[0.85rem] leading-[1.55] text-[#5B5F58] dark:text-[#A2A79C]">
        {getI18nValue(template.description)}
      </p>

      <div className="mt-auto flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {template.supportedModels.map((m) => (
            <span
              key={m}
              className={`rounded-full border bg-[#EAEDE6] px-2 py-[0.14rem] font-mono text-[0.68rem] dark:bg-[#23282C] ${getTagColorClasses(m)}`}
            >
              {getModelLabel(m)}
            </span>
          ))}
        </div>
        <span className="whitespace-nowrap font-mono text-[0.7rem] text-[#8B8F86] dark:text-[#6D726A]">
          {template.usageCount.toLocaleString()} lượt dùng
        </span>
      </div>
    </div>
  )
}
