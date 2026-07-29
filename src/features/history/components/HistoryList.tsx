import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { getI18nValue } from '@/shared/utils/i18n'
import { getModelLabel } from '@/shared/utils/modelLabel'
import { ReloadUnavailableBanner } from '@/features/template-detail/components/ReloadUnavailableBanner'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'
import type { HistoryDetail, HistoryListItem } from '../types'

interface HistoryListProps {
  items: HistoryListItem[]
  hasNext: boolean
  isLoadingMore: boolean
  onLoadMore: () => void
  getDetail: (id: string) => Promise<HistoryDetail>
  onConfirmDelete: (ids: string[]) => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function HistoryList({
  items,
  hasNext,
  isLoadingMore,
  onLoadMore,
  getDetail,
  onConfirmDelete,
}: HistoryListProps) {
  const navigate = useNavigate()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null)
  const [expandLoading, setExpandLoading] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null)

  async function handleViewUnavailable(id: string) {
    if (expandedId === id) {
      setExpandedId(null)
      setExpandedPrompt(null)
      return
    }
    setExpandedId(id)
    setExpandLoading(true)
    try {
      const detail = await getDetail(id)
      setExpandedPrompt(detail.finalPrompt)
    } finally {
      setExpandLoading(false)
    }
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function handleConfirm() {
    if (!pendingDelete) return
    onConfirmDelete(pendingDelete)
    setSelected((prev) => {
      const next = new Set(prev)
      for (const id of pendingDelete) next.delete(id)
      return next
    })
    setPendingDelete(null)
  }

  return (
    <div className="flex flex-col gap-3">
      {selected.size > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-card border border-[#DBDFD3] bg-[#EAEDE6] px-4 py-2.5 dark:border-[#2C3130] dark:bg-[#23282C]">
          <span className="text-[0.82rem] text-[#5B5F58] dark:text-[#A2A79C]">
            Đã chọn {selected.size} mục
          </span>
          <button
            type="button"
            onClick={() => setPendingDelete([...selected])}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#C23A2E] px-3 py-1.5 text-[0.8rem] font-semibold text-[#C23A2E] transition-colors duration-150 hover:bg-[#FBE7E4] dark:border-[#FF7A6B] dark:text-[#FF7A6B] dark:hover:bg-[#3A2224]"
          >
            <Trash2 size={14} aria-hidden="true" />
            Xoá đã chọn
          </button>
        </div>
      )}

      {items.map((item) => (
        <article
          key={item.id}
          className="flex flex-col gap-1.5 rounded-card border border-[#DBDFD3] bg-white p-4 dark:border-[#2C3130] dark:bg-[#1C2024]"
        >
          <div className="flex items-start justify-between gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                aria-label={`Chọn mục ${getI18nValue(item.templateTitle)}`}
                checked={selected.has(item.id)}
                onChange={() => toggleSelected(item.id)}
              />
              <h3 className="m-0 text-[0.95rem] font-bold tracking-[-0.005em]">
                {getI18nValue(item.templateTitle)}
              </h3>
            </label>
            <span className="font-mono text-[0.72rem] text-[#8B8F86] dark:text-[#6D726A]">
              {formatDate(item.createdAt)}
            </span>
          </div>
          <span className="w-fit rounded-full bg-[#EAEDE6] px-2 py-[0.14rem] font-mono text-[0.68rem] text-[#8B8F86] dark:bg-[#23282C] dark:text-[#6D726A]">
            {getModelLabel(item.aiModelCode)}
          </span>
          <p className="m-0 line-clamp-2 text-[0.85rem] leading-[1.55] text-[#5B5F58] dark:text-[#A2A79C]">
            {item.promptSnippet}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            {item.templateId ? (
              <button
                type="button"
                onClick={() => navigate(`/templates/${item.templateId}?reload=${item.id}`)}
                className="w-fit cursor-pointer rounded-md border border-[#DBDFD3] px-3 py-1.5 text-[0.8rem] font-semibold text-[#1B1D1B] transition-colors duration-150 hover:border-[#3652E0] hover:text-[#3652E0] dark:border-[#2C3130] dark:text-[#ECEEE8] dark:hover:border-[#8493FF] dark:hover:text-[#8493FF]"
              >
                Tạo lại (Re-run)
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleViewUnavailable(item.id)}
                className="w-fit cursor-pointer rounded-md border border-[#DBDFD3] px-3 py-1.5 text-[0.8rem] font-semibold text-[#8B8F86] transition-colors duration-150 hover:border-[#8B8F86] dark:border-[#2C3130] dark:text-[#6D726A]"
              >
                Template đã bị xoá · Xem prompt
              </button>
            )}

            <button
              type="button"
              aria-label={`Xoá mục ${getI18nValue(item.templateTitle)}`}
              onClick={() => setPendingDelete([item.id])}
              className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md border border-[#DBDFD3] px-3 py-1.5 text-[0.8rem] font-semibold text-[#8B8F86] transition-colors duration-150 hover:border-[#C23A2E] hover:text-[#C23A2E] dark:border-[#2C3130] dark:text-[#6D726A] dark:hover:border-[#FF7A6B] dark:hover:text-[#FF7A6B]"
            >
              <Trash2 size={14} aria-hidden="true" />
              Xoá
            </button>
          </div>

          {expandedId === item.id &&
            (expandLoading ? (
              <p className="m-0 text-[0.8rem] text-[#8B8F86] dark:text-[#6D726A]">Đang tải...</p>
            ) : (
              expandedPrompt && <ReloadUnavailableBanner finalPrompt={expandedPrompt} />
            ))}
        </article>
      ))}

      {pendingDelete && (
        <DeleteConfirmDialog
          count={pendingDelete.length}
          onConfirm={handleConfirm}
          onCancel={() => setPendingDelete(null)}
        />
      )}

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
