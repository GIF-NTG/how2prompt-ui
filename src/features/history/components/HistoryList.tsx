import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, RotateCcw, Trash2 } from 'lucide-react'
import { getModelLabel } from '@/shared/utils/modelLabel'
import { getTagColorClasses } from '@/shared/utils/colorTag'
import { ReloadUnavailableBanner } from '@/features/template-detail/components/ReloadUnavailableBanner'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'
import { HistoryPromptDetail } from './HistoryPromptDetail'
import { getHistoryDisplayTitle } from '../utils/displayTitle'
import type { HistoryDetail, HistoryListItem } from '../types'

interface HistoryListProps {
  items: HistoryListItem[]
  hasNext: boolean
  isLoadingMore: boolean
  onLoadMore: () => void
  getDetail: (id: string) => Promise<HistoryDetail>
  onConfirmDelete: (ids: string[]) => void
}

const ICON_BUTTON_CLASSES =
  'flex h-[1.9rem] w-[1.9rem] flex-shrink-0 cursor-pointer items-center justify-center rounded-md border border-[#DBDFD3] text-[#8B8F86] transition-colors duration-150 hover:border-[#3652E0] hover:text-[#3652E0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] dark:border-[#2C3130] dark:text-[#6D726A] dark:hover:border-[#8493FF] dark:hover:text-[#8493FF]'

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
  const [expandedDetail, setExpandedDetail] = useState<HistoryDetail | null>(null)
  const [expandLoading, setExpandLoading] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null)

  async function handleToggleDetail(id: string) {
    if (expandedId === id) {
      setExpandedId(null)
      setExpandedDetail(null)
      return
    }
    setExpandedId(id)
    setExpandLoading(true)
    try {
      const detail = await getDetail(id)
      setExpandedDetail(detail)
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

      <AnimatePresence>
        {items.map((item, index) => {
          const displayTitle = getHistoryDisplayTitle(item)
          return (
            <motion.article
              key={item.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, delay: Math.min(index, 14) * 0.03 }}
              className="flex flex-col gap-1.5 rounded-card border border-[#DBDFD3] bg-white p-4 dark:border-[#2C3130] dark:bg-[#1C2024]"
            >
              <div className="flex items-start justify-between gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    aria-label={`Chọn mục ${displayTitle}`}
                    checked={selected.has(item.id)}
                    onChange={() => toggleSelected(item.id)}
                  />
                  <h3 className="m-0 text-[0.95rem] font-bold tracking-[-0.005em]">
                    {displayTitle}
                  </h3>
                </label>
                <span className="font-mono text-[0.72rem] text-[#8B8F86] dark:text-[#6D726A]">
                  {formatDate(item.createdAt)}
                </span>
              </div>
              {item.aiModelCode && (
                <span
                  className={`w-fit rounded-full border bg-[#EAEDE6] px-2 py-[0.14rem] font-mono text-[0.68rem] dark:bg-[#23282C] ${getTagColorClasses(item.aiModelCode)}`}
                >
                  {getModelLabel(item.aiModelCode)}
                </span>
              )}
              <p className="m-0 line-clamp-2 text-[0.85rem] leading-[1.55] text-[#5B5F58] dark:text-[#A2A79C]">
                {item.promptSnippet}
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  title={
                    item.templateId
                      ? 'Xem chi tiết prompt'
                      : 'Template đã bị xoá — xem prompt đã lưu'
                  }
                  aria-label={
                    item.templateId
                      ? `Xem chi tiết prompt ${displayTitle}`
                      : `Xem prompt đã lưu (template của ${displayTitle} đã bị xoá)`
                  }
                  aria-expanded={expandedId === item.id}
                  onClick={() => void handleToggleDetail(item.id)}
                  className={ICON_BUTTON_CLASSES}
                >
                  <Eye size={15} aria-hidden="true" />
                </button>

                {item.templateId && (
                  <button
                    type="button"
                    title="Tạo lại"
                    aria-label={`Tạo lại ${displayTitle}`}
                    onClick={() => navigate(`/templates/${item.templateId}?reload=${item.id}`)}
                    className={ICON_BUTTON_CLASSES}
                  >
                    <RotateCcw size={15} aria-hidden="true" />
                  </button>
                )}

                <button
                  type="button"
                  title="Xoá"
                  aria-label={`Xoá mục ${displayTitle}`}
                  onClick={() => setPendingDelete([item.id])}
                  className={`${ICON_BUTTON_CLASSES} hover:border-[#C23A2E] hover:text-[#C23A2E] dark:hover:border-[#FF7A6B] dark:hover:text-[#FF7A6B]`}
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>

              <AnimatePresence>
                {expandedId === item.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {expandLoading ? (
                      <p className="m-0 text-[0.8rem] text-[#8B8F86] dark:text-[#6D726A]">
                        Đang tải...
                      </p>
                    ) : (
                      expandedDetail &&
                      (expandedDetail.templateId ? (
                        <HistoryPromptDetail
                          finalPrompt={expandedDetail.finalPrompt}
                          extraInstructions={expandedDetail.extraInstructions}
                        />
                      ) : (
                        <ReloadUnavailableBanner finalPrompt={expandedDetail.finalPrompt} />
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.article>
          )
        })}
      </AnimatePresence>

      <AnimatePresence>
        {pendingDelete && (
          <DeleteConfirmDialog
            count={pendingDelete.length}
            onConfirm={handleConfirm}
            onCancel={() => setPendingDelete(null)}
          />
        )}
      </AnimatePresence>

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
