import { useState } from 'react'
import type { Category, CategoryUpsert } from '@/features/admin/api/taxonomyClient.types'

interface CategoryTreeProps {
  categories: Category[]
  submitting: boolean
  onCreate: (input: CategoryUpsert) => void
  onUpdate: (id: string, input: CategoryUpsert) => void
}

const inputBase =
  'w-full rounded-lg border border-[#DBDFD3] bg-white px-3 py-1.5 text-[0.82rem] text-[#1B1D1B] transition-colors duration-150 focus:border-[#3652E0] focus:outline-none dark:border-[#2C3130] dark:bg-[#1C2024] dark:text-[#ECEEE8]'

function localizedName(category: Category): string {
  return category.name.vi || category.name.en
}

/** Every id that is `category` itself or a descendant of it — used to keep the
 *  parent picker from offering a cycle (data-model.md's Category relationship note). */
function descendantIds(categoryId: string, all: Category[]): Set<string> {
  const ids = new Set<string>([categoryId])
  let grew = true
  while (grew) {
    grew = false
    for (const category of all) {
      if (category.parentId && ids.has(category.parentId) && !ids.has(category.id)) {
        ids.add(category.id)
        grew = true
      }
    }
  }
  return ids
}

interface CategoryFormProps {
  categories: Category[]
  initial: Category | null
  defaultParentId: string | null
  submitting: boolean
  onSubmit: (input: CategoryUpsert) => void
  onCancel: () => void
}

function CategoryForm({
  categories,
  initial,
  defaultParentId,
  submitting,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [nameEn, setNameEn] = useState(initial?.name.en ?? '')
  const [nameVi, setNameVi] = useState(initial?.name.vi ?? '')
  const [parentId, setParentId] = useState<string>(initial?.parentId ?? defaultParentId ?? '')

  const excluded = initial ? descendantIds(initial.id, categories) : new Set<string>()
  const parentOptions = categories.filter((c) => !excluded.has(c.id))

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({
          slug: slug.trim(),
          name: { en: nameEn.trim(), vi: nameVi.trim() || undefined },
          parentId: parentId || null,
        })
      }}
      className="flex flex-col gap-3 rounded-lg border border-[#DBDFD3] bg-[#F9FAF6] p-3 dark:border-[#2C3130] dark:bg-[#1A1D20]"
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <input
          className={inputBase}
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="slug"
          required
        />
        <input
          className={inputBase}
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          placeholder="Tên (EN)"
          required
        />
        <input
          className={inputBase}
          value={nameVi}
          onChange={(e) => setNameVi(e.target.value)}
          placeholder="Tên (VI)"
        />
      </div>
      <select
        className={`${inputBase} cursor-pointer`}
        value={parentId}
        onChange={(e) => setParentId(e.target.value)}
      >
        <option value="">-- Danh mục gốc --</option>
        {parentOptions.map((c) => (
          <option key={c.id} value={c.id}>
            {localizedName(c)}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="cursor-pointer rounded-lg bg-[#3652E0] px-3 py-1.5 text-[0.8rem] font-semibold text-white transition-colors duration-150 hover:bg-[#2E46C4] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#8493FF] dark:text-[#14171A]"
        >
          {initial ? 'Lưu' : 'Tạo'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer rounded-lg border border-[#DBDFD3] px-3 py-1.5 text-[0.8rem] text-[#4A4F4A] dark:border-[#2C3130] dark:text-[#A8ADA7]"
        >
          Hủy
        </button>
      </div>
    </form>
  )
}

interface CategoryNodeProps {
  category: Category
  categories: Category[]
  submitting: boolean
  activeFormFor: string | null
  onStartEdit: (id: string) => void
  onStartAddChild: (id: string) => void
  onCancelForm: () => void
  onCreate: (input: CategoryUpsert) => void
  onUpdate: (id: string, input: CategoryUpsert) => void
}

function CategoryNode({
  category,
  categories,
  submitting,
  activeFormFor,
  onStartEdit,
  onStartAddChild,
  onCancelForm,
  onCreate,
  onUpdate,
}: CategoryNodeProps) {
  const [collapsed, setCollapsed] = useState(false)
  const children = categories
    .filter((c) => c.parentId === category.id)
    .sort((a, b) => a.sortOrder - b.sortOrder)
  const isEditing = activeFormFor === `edit:${category.id}`
  const isAddingChild = activeFormFor === `add-child:${category.id}`

  return (
    <li className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        {children.length > 0 && (
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? 'Mở rộng' : 'Thu gọn'}
            className="cursor-pointer text-[0.8rem] text-[#5B5F58] dark:text-[#A2A79C]"
          >
            {collapsed ? '▸' : '▾'}
          </button>
        )}
        <span className="text-[0.9rem] font-medium">{localizedName(category)}</span>
        <span className="text-[0.76rem] text-[#8A8F8A] dark:text-[#6B706B]">
          {category.templateCount} mẫu
        </span>
        <button
          type="button"
          onClick={() => onStartEdit(category.id)}
          className="cursor-pointer text-[0.78rem] text-[#3652E0] underline underline-offset-2 dark:text-[#8493FF]"
        >
          Sửa
        </button>
        <button
          type="button"
          onClick={() => onStartAddChild(category.id)}
          className="cursor-pointer text-[0.78rem] text-[#5B5F58] underline underline-offset-2 dark:text-[#A2A79C]"
        >
          + Danh mục con
        </button>
      </div>

      {isEditing && (
        <CategoryForm
          categories={categories}
          initial={category}
          defaultParentId={category.parentId}
          submitting={submitting}
          onSubmit={(input) => onUpdate(category.id, input)}
          onCancel={onCancelForm}
        />
      )}
      {isAddingChild && (
        <CategoryForm
          categories={categories}
          initial={null}
          defaultParentId={category.id}
          submitting={submitting}
          onSubmit={onCreate}
          onCancel={onCancelForm}
        />
      )}

      {!collapsed && children.length > 0 && (
        <ul className="flex flex-col gap-2 border-l border-[#DBDFD3] pl-5 dark:border-[#2C3130]">
          {children.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              categories={categories}
              submitting={submitting}
              activeFormFor={activeFormFor}
              onStartEdit={onStartEdit}
              onStartAddChild={onStartAddChild}
              onCancelForm={onCancelForm}
              onCreate={onCreate}
              onUpdate={onUpdate}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export function CategoryTree({ categories, submitting, onCreate, onUpdate }: CategoryTreeProps) {
  const [activeFormFor, setActiveFormFor] = useState<string | null>(null)
  const roots = categories
    .filter((c) => c.parentId === null)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  function handleCreate(input: CategoryUpsert) {
    onCreate(input)
    setActiveFormFor(null)
  }

  function handleUpdate(id: string, input: CategoryUpsert) {
    onUpdate(id, input)
    setActiveFormFor(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setActiveFormFor(activeFormFor === 'add-root' ? null : 'add-root')}
        className="w-fit cursor-pointer rounded-xl bg-[#3652E0] px-4 py-2 text-[0.86rem] font-semibold text-white transition-colors duration-150 hover:bg-[#2E46C4] dark:bg-[#8493FF] dark:text-[#14171A]"
      >
        + Danh mục gốc
      </button>
      {activeFormFor === 'add-root' && (
        <CategoryForm
          categories={categories}
          initial={null}
          defaultParentId={null}
          submitting={submitting}
          onSubmit={handleCreate}
          onCancel={() => setActiveFormFor(null)}
        />
      )}

      {roots.length === 0 ? (
        <p className="m-0 text-[0.86rem] text-[#5B5F58] dark:text-[#A2A79C]">
          Chưa có danh mục nào.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {roots.map((category) => (
            <CategoryNode
              key={category.id}
              category={category}
              categories={categories}
              submitting={submitting}
              activeFormFor={activeFormFor}
              onStartEdit={(id) =>
                setActiveFormFor((current) => (current === `edit:${id}` ? null : `edit:${id}`))
              }
              onStartAddChild={(id) =>
                setActiveFormFor((current) =>
                  current === `add-child:${id}` ? null : `add-child:${id}`,
                )
              }
              onCancelForm={() => setActiveFormFor(null)}
              onCreate={handleCreate}
              onUpdate={handleUpdate}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
