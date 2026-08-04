import { useMemo, useState, type FormEvent } from 'react'
import type { Category } from '../api/taxonomyClient.types'
import { checkCategoryNameUnique } from '../utils/checkCategoryNameUnique'
import { usePagedItems } from '../hooks/usePagedItems'
import { Modal } from './Modal'
import { ConfirmDialog } from './ConfirmDialog'
import { Pagination } from './Pagination'

const PAGE_SIZE = 8

const FIELD_CLASSES =
  'rounded-lg border border-[#DBDFD3] bg-transparent px-3 py-2 text-sm text-[#1B1D1B] focus:border-[#3652E0] focus:outline-none dark:border-[#2C3130] dark:text-[#ECEEE8] dark:focus:border-[#8493FF]'

interface CategoryTreeProps {
  categories: Category[]
  onCreate: (name: string, parentId: string | null) => Promise<void>
  onUpdate: (id: string, name: string, parentId: string | null) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

interface FlatCategory {
  category: Category
  depth: number
}

/** Collects `categoryId` and every descendant id, so a category can never be
 *  offered as its own ancestor in the parent picker (data-model.md). */
function collectDescendantIds(categoryId: string, all: Category[]): Set<string> {
  const ids = new Set<string>([categoryId])
  let added = true
  while (added) {
    added = false
    for (const category of all) {
      if (category.parentId && ids.has(category.parentId) && !ids.has(category.id)) {
        ids.add(category.id)
        added = true
      }
    }
  }
  return ids
}

/** Depth-first flatten so nested categories render as adjacent table rows,
 *  indented by depth, instead of needing a separate tree widget. */
function flattenCategories(
  categories: Category[],
  parentId: string | null,
  depth: number,
): FlatCategory[] {
  return categories
    .filter((c) => c.parentId === parentId)
    .flatMap((category) => [
      { category, depth },
      ...flattenCategories(categories, category.id, depth + 1),
    ])
}

interface CategoryFormModalProps {
  editingCategory: Category | null
  categories: Category[]
  onClose: () => void
  onCreate: (name: string, parentId: string | null) => Promise<void>
  onUpdate: (id: string, name: string, parentId: string | null) => Promise<void>
}

function CategoryFormModal({
  editingCategory,
  categories,
  onClose,
  onCreate,
  onUpdate,
}: CategoryFormModalProps) {
  const [name, setName] = useState(editingCategory?.name.en ?? '')
  const [parentId, setParentId] = useState<string | null>(editingCategory?.parentId ?? null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const excludedIds = useMemo(
    () => (editingCategory ? collectDescendantIds(editingCategory.id, categories) : new Set<string>()),
    [editingCategory, categories],
  )
  const parentOptions = categories.filter((c) => !excludedIds.has(c.id))

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError('Vui lòng nhập tên category.')
      return
    }
    if (!checkCategoryNameUnique(name, parentId, categories, editingCategory?.id)) {
      setError('Đã tồn tại category cùng tên trong cùng nhóm cha.')
      return
    }
    setSubmitting(true)
    try {
      if (editingCategory) {
        await onUpdate(editingCategory.id, name.trim(), parentId)
      } else {
        await onCreate(name.trim(), parentId)
      }
      onClose()
    } catch {
      setError('Không thể lưu category, vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={editingCategory ? 'Sửa category' : 'Thêm category mới'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-[#5B5F58] dark:text-[#A2A79C]">Tên category</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={FIELD_CLASSES}
            autoFocus
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-[#5B5F58] dark:text-[#A2A79C]">Danh mục cha</span>
          <select
            value={parentId ?? ''}
            onChange={(e) => setParentId(e.target.value || null)}
            className={FIELD_CLASSES}
          >
            <option value="">(Không có — cấp cao nhất)</option>
            {parentOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name.en}
              </option>
            ))}
          </select>
        </label>
        {error && (
          <p role="alert" className="text-xs text-[#C23A2E] dark:text-[#FF7A6B]">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#DBDFD3] px-4 py-2 text-sm dark:border-[#2C3130]"
          >
            Huỷ
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-[#3652E0] px-4 py-2 text-sm font-bold text-white disabled:opacity-60 dark:bg-[#8493FF] dark:text-[#14171A]"
          >
            {editingCategory ? 'Lưu' : 'Tạo category'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

/** Nested category list (FR-006): create/edit incl. re-parenting (via a
 *  modal form), delete, with a client-side sibling-name uniqueness guard
 *  (research.md Decision 6) and a guard against selecting a category as its
 *  own ancestor. Rendered as a table (name/slug/parent/action columns) with
 *  depth-indented rows instead of a collapsible tree widget. */
export function CategoryTree({ categories, onCreate, onUpdate, onDelete }: CategoryTreeProps) {
  const [formTarget, setFormTarget] = useState<Category | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const flatCategories = useMemo(() => flattenCategories(categories, null, 0), [categories])
  const { page, pageCount, setPage, pageItems } = usePagedItems(flatCategories, PAGE_SIZE)

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleteError(null)
    try {
      await onDelete(deleteTarget.id)
      setDeleteTarget(null)
    } catch {
      setDeleteError('Không thể xoá category, vui lòng thử lại.')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setFormTarget('new')}
          className="rounded-lg bg-[#3652E0] px-4 py-2 text-sm font-bold text-white transition hover:brightness-110 dark:bg-[#8493FF] dark:text-[#14171A]"
        >
          + Thêm category
        </button>
      </div>

      {flatCategories.length === 0 ? (
        <p className="text-sm text-[#5B5F58] dark:text-[#A2A79C]">Chưa có category nào.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#DBDFD3] dark:border-[#2C3130]">
                <th className="px-3 pb-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.05em] text-[#8B8F86] dark:text-[#6D726A]">
                  Tên
                </th>
                <th className="px-3 pb-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.05em] text-[#8B8F86] dark:text-[#6D726A]">
                  Slug
                </th>
                <th className="px-3 pb-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.05em] text-[#8B8F86] dark:text-[#6D726A]">
                  Danh mục cha
                </th>
                <th className="px-3 pb-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.05em] text-[#8B8F86] dark:text-[#6D726A]">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map(({ category, depth }) => {
                const parentCategory = categories.find((c) => c.id === category.parentId)
                return (
                  <tr
                    key={category.id}
                    className="border-b border-[#DBDFD3] last:border-0 dark:border-[#2C3130]"
                  >
                    <td className="px-3 py-2.5" style={{ paddingLeft: `${12 + depth * 20}px` }}>
                      <span className="text-sm">{category.name.en}</span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-[#5B5F58] dark:text-[#A2A79C]">
                      {category.slug}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-[#5B5F58] dark:text-[#A2A79C]">
                      {parentCategory ? parentCategory.name.en : '—'}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setFormTarget(category)}
                          className="text-xs text-[#3652E0] underline underline-offset-2 dark:text-[#8493FF]"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(category)}
                          className="text-xs text-[#C23A2E] underline underline-offset-2 dark:text-[#FF7A6B]"
                        >
                          Xoá
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
        </div>
      )}

      {formTarget && (
        <CategoryFormModal
          editingCategory={formTarget === 'new' ? null : formTarget}
          categories={categories}
          onClose={() => setFormTarget(null)}
          onCreate={onCreate}
          onUpdate={onUpdate}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Xoá category "${deleteTarget.name.en}"? Hành động này không thể hoàn tác.`}
          onConfirm={() => void handleConfirmDelete()}
          onCancel={() => {
            setDeleteTarget(null)
            setDeleteError(null)
          }}
        />
      )}
      {deleteError && (
        <p role="alert" className="text-xs text-[#C23A2E] dark:text-[#FF7A6B]">
          {deleteError}
        </p>
      )}
    </div>
  )
}
