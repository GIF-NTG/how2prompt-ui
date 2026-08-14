import { useMemo } from 'react'
import type { AiModel } from '../api/aiModelsClient.types'
import { usePagedItems } from '../hooks/usePagedItems'
import { Pagination } from './Pagination'

const PAGE_SIZE = 8

interface AiModelTableProps {
  models: AiModel[]
  onEdit: (model: AiModel) => void
  onToggleActive: (model: AiModel) => void
}

/** Lists every model including inactive ones. Deliberately has no delete
 *  action — deactivation (via onToggleActive) is the only removal affordance,
 *  per FR-004a / research.md Decision 3. */
export function AiModelTable({ models, onEdit, onToggleActive }: AiModelTableProps) {
  const sortedModels = useMemo(
    () => [...models].sort((a, b) => a.sortOrder - b.sortOrder),
    [models],
  )
  const { page, pageCount, setPage, pageItems } = usePagedItems(sortedModels, PAGE_SIZE)

  if (models.length === 0) {
    return <p className="text-sm text-[#5B5F58] dark:text-[#A2A79C]">No AI models yet.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[#DBDFD3] dark:border-[#2C3130]">
            <th className="px-3 pb-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.05em] text-[#8B8F86] dark:text-[#6D726A]">
              Code
            </th>
            <th className="px-3 pb-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.05em] text-[#8B8F86] dark:text-[#6D726A]">
              Name
            </th>
            <th className="px-3 pb-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.05em] text-[#8B8F86] dark:text-[#6D726A]">
              Provider
            </th>
            <th className="px-3 pb-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.05em] text-[#8B8F86] dark:text-[#6D726A]">
              Type
            </th>
            <th className="px-3 pb-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.05em] text-[#8B8F86] dark:text-[#6D726A]">
              Status
            </th>
            <th className="px-3 pb-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.05em] text-[#8B8F86] dark:text-[#6D726A]">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {pageItems.map((model) => (
            <tr
              key={model.id}
              className="border-b border-[#DBDFD3] last:border-0 dark:border-[#2C3130]"
            >
              <td className="px-3 py-2.5 font-mono text-xs">{model.code}</td>
              <td className="px-3 py-2.5 font-semibold">{model.name}</td>
              <td className="px-3 py-2.5">{model.provider}</td>
              <td className="px-3 py-2.5">{model.modelType}</td>
              <td className="px-3 py-2.5">
                <span
                  className={
                    model.isActive
                      ? 'rounded-full bg-[#E4F3EA] px-2 py-0.5 text-xs text-[#2E7D4F] dark:bg-[#1E3327] dark:text-[#6FCF9A]'
                      : 'rounded-full bg-[#F7ECD7] px-2 py-0.5 text-xs text-[#C98A1F] dark:bg-[#362C1A] dark:text-[#E0B25C]'
                  }
                >
                  {model.isActive ? 'Active' : 'Disabled'}
                </span>
              </td>
              <td className="px-3 py-2.5">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(model)}
                    className="text-xs text-[#3652E0] underline underline-offset-2 hover:text-[#26399E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] dark:text-[#8493FF] dark:hover:text-[#AEBBFF]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleActive(model)}
                    className="text-xs text-[#5B5F58] underline underline-offset-2 hover:text-[#1B1D1B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] dark:text-[#A2A79C] dark:hover:text-[#ECEEE8]"
                  >
                    {model.isActive ? 'Disable' : 'Reactivate'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
    </div>
  )
}
