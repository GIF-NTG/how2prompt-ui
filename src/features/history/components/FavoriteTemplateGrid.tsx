import { useNavigate } from 'react-router-dom'
import { TemplateCard } from '@/features/home/components/TemplateCard'
import type { TemplateListItem } from '@/features/home/types'

interface FavoriteTemplateGridProps {
  templates: TemplateListItem[]
  onUnfavorited: (templateId: string) => void
  hasNext: boolean
  isLoadingMore: boolean
  onLoadMore: () => void
}

export function FavoriteTemplateGrid({
  templates,
  onUnfavorited,
  hasNext,
  isLoadingMore,
  onLoadMore,
}: FavoriteTemplateGridProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
        {templates.map((t, index) => (
          <TemplateCard
            key={t.id}
            template={t}
            isSignedIn
            index={index}
            onClick={(slug) => navigate(`/templates/${slug}`)}
            onFavoriteChange={(templateId, isFavorited) => {
              if (!isFavorited) onUnfavorited(templateId)
            }}
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
          {isLoadingMore ? 'Đang tải...' : 'Xem thêm'}
        </button>
      )}
    </div>
  )
}
