import { useMemo, useState, type FormEvent } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Category } from '../api/taxonomyClient.types'
import { checkCategoryNameUnique } from '../utils/checkCategoryNameUnique'

const FIELD_CLASSES =
  'rounded-lg border border-[#DBDFD3] bg-transparent px-3 py-2 text-sm text-[#1B1D1B] focus:border-[#3652E0] focus:outline-none dark:border-[#2C3130] dark:text-[#ECEEE8] dark:focus:border-[#8493FF]'

interface CategoryTreeProps {
  categories: Category[]
  onCreate: (name: string, parentId: string | null) => Promise<void>
  onUpdate: (id: string, name: string, parentId: string | null) => Promise<void>
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

function CategoryNode({
  category,
  categories,
  depth,
  editingId,
  onStartEdit,
  onCancelEdit,
  onUpdate,
}: {
  category: Category
  categories: Category[]
  depth: number
  editingId: string | null
  onStartEdit: (id: string) => void
  onCancelEdit: () => void
  onUpdate: (id: string, name: string, parentId: string | null) => Promise<void>
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [name, setName] = useState(category.name.en)
  const [parentId, setParentId] = useState<string | null>(category.parentId)
  const [error, setError] = useState<string | null>(null)

  const children = categories.filter((c) => c.parentId === category.id)
  const isEditing = editingId === category.id
  const excludedIds = useMemo(() => collectDescendantIds(category.id, categories), [
    category.id,
    categories,
  ])
  const parentOptions = categories.filter((c) => !excludedIds.has(c.id))

  async function handleSave(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (!checkCategoryNameUnique(name, parentId, categories, category.id)) {
      setError('Đã tồn tại category cùng tên trong cùng nhóm cha.')
      return
    }
    await onUpdate(category.id, name, parentId)
    onCancelEdit()
  }

  return (
    <li>
      <div className="flex items-center gap-2 py-1">
        {children.length > 0 ? (
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Mở rộng' : 'Thu gọn'}
            className="text-[#5B5F58] dark:text-[#A2A79C]"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
          </button>
        ) : (
          <span className="w-[14px]" />
        )}

        {isEditing ? (
          <form onSubmit={handleSave} className="flex flex-wrap items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={FIELD_CLASSES}
            />
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
            <button
              type="submit"
              className="rounded-lg bg-[#3652E0] px-3 py-1.5 text-xs font-bold text-white dark:bg-[#8493FF] dark:text-[#14171A]"
            >
              Lưu
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-lg border border-[#DBDFD3] px-3 py-1.5 text-xs dark:border-[#2C3130]"
            >
              Huỷ
            </button>
            {error && (
              <span role="alert" className="text-xs text-[#C23A2E] dark:text-[#FF7A6B]">
                {error}
              </span>
            )}
          </form>
        ) : (
          <>
            <span className="text-sm">{category.name.en}</span>
            <button
              type="button"
              onClick={() => onStartEdit(category.id)}
              className="text-xs text-[#3652E0] underline underline-offset-2 dark:text-[#8493FF]"
            >
              Sửa
            </button>
          </>
        )}
      </div>

      {!collapsed && children.length > 0 && (
        <ul className="ml-5 border-l border-[#DBDFD3] pl-4 dark:border-[#2C3130]">
          {children.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              categories={categories}
              depth={depth + 1}
              editingId={editingId}
              onStartEdit={onStartEdit}
              onCancelEdit={onCancelEdit}
              onUpdate={onUpdate}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

/** Nested category tree (FR-006): create/edit incl. re-parenting, with a
 *  client-side sibling-name uniqueness guard (research.md Decision 6) and a
 *  guard against selecting a category as its own ancestor. */
export function CategoryTree({ categories, onCreate, onUpdate }: CategoryTreeProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newParentId, setNewParentId] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)

  const roots = categories.filter((c) => c.parentId === null)

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    setCreateError(null)
    if (!newName.trim()) {
      setCreateError('Vui lòng nhập tên category.')
      return
    }
    if (!checkCategoryNameUnique(newName, newParentId, categories)) {
      setCreateError('Đã tồn tại category cùng tên trong cùng nhóm cha.')
      return
    }
    await onCreate(newName.trim(), newParentId)
    setNewName('')
    setNewParentId(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleCreate} className="flex flex-wrap items-center gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Tên category mới"
          className={FIELD_CLASSES}
        />
        <select
          value={newParentId ?? ''}
          onChange={(e) => setNewParentId(e.target.value || null)}
          className={FIELD_CLASSES}
        >
          <option value="">(Không có — cấp cao nhất)</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name.en}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-[#3652E0] px-4 py-2 text-sm font-bold text-white dark:bg-[#8493FF] dark:text-[#14171A]"
        >
          Thêm category
        </button>
        {createError && (
          <span role="alert" className="text-xs text-[#C23A2E] dark:text-[#FF7A6B]">
            {createError}
          </span>
        )}
      </form>

      {roots.length === 0 ? (
        <p className="text-sm text-[#5B5F58] dark:text-[#A2A79C]">Chưa có category nào.</p>
      ) : (
        <ul>
          {roots.map((category) => (
            <CategoryNode
              key={category.id}
              category={category}
              categories={categories}
              depth={0}
              editingId={editingId}
              onStartEdit={setEditingId}
              onCancelEdit={() => setEditingId(null)}
              onUpdate={onUpdate}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
