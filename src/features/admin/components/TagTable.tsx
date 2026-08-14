import { useState, type FormEvent } from 'react'
import type { Tag, TagUpsert } from '../api/taxonomyClient.types'
import { usePagedItems } from '../hooks/usePagedItems'
import { Modal } from './Modal'
import { ConfirmDialog } from './ConfirmDialog'
import { Pagination } from './Pagination'

const PAGE_SIZE = 8

const FIELD_CLASSES =
  'rounded-lg border border-[#DBDFD3] bg-transparent px-3 py-2 text-sm text-[#1B1D1B] focus:border-[#3652E0] focus:outline-none dark:border-[#2C3130] dark:text-[#ECEEE8] dark:focus:border-[#8493FF]'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

interface TagFormModalProps {
  editingTag: Tag | null
  existingTags: Tag[]
  onClose: () => void
  onCreate: (input: TagUpsert) => Promise<void>
  onUpdate: (id: string, input: TagUpsert) => Promise<void>
}

function TagFormModal({
  editingTag,
  existingTags,
  onClose,
  onCreate,
  onUpdate,
}: TagFormModalProps) {
  const [name, setName] = useState(editingTag?.name ?? '')
  const [slug, setSlug] = useState(editingTag?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(Boolean(editingTag))
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function handleNameChange(value: string) {
    setName(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (!name.trim() || !slug.trim()) {
      setError('Please enter a name and slug.')
      return
    }
    const duplicate = existingTags.some(
      (t) => t.id !== editingTag?.id && t.slug.toLowerCase() === slug.trim().toLowerCase(),
    )
    if (duplicate) {
      setError('A tag with this slug already exists.')
      return
    }
    setSubmitting(true)
    try {
      if (editingTag) {
        await onUpdate(editingTag.id, { name: name.trim(), slug: slug.trim() })
      } else {
        await onCreate({ name: name.trim(), slug: slug.trim() })
      }
      onClose()
    } catch {
      setError('Unable to save tag, please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={editingTag ? 'Edit tag' : 'Add new tag'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-[#5B5F58] dark:text-[#A2A79C]">Tag name</span>
          <input
            name="tagName"
            autoComplete="off"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={FIELD_CLASSES}
            autoFocus
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-[#5B5F58] dark:text-[#A2A79C]">Slug</span>
          <input
            name="tagSlug"
            autoComplete="off"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true)
              setSlug(e.target.value)
            }}
            className={`${FIELD_CLASSES} font-mono`}
          />
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
            className="rounded-lg border border-[#DBDFD3] px-4 py-2 text-sm transition-colors duration-150 hover:border-[#8B8F86] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] dark:border-[#2C3130] dark:hover:border-[#6D726A]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-[#3652E0] px-4 py-2 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] disabled:opacity-60 dark:bg-[#8493FF] dark:text-[#14171A]"
          >
            {editingTag ? 'Save' : 'Create tag'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

interface TagTableProps {
  tags: Tag[]
  onCreate: (input: TagUpsert) => Promise<void>
  onUpdate: (id: string, input: TagUpsert) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

/** Full tag CRUD (create/edit/delete) against the real backend's
 *  `taxonomy-admin-controller` (`POST/PATCH/DELETE /admin/tags`) — tags used
 *  to be read-only here because those endpoints didn't exist yet; they now
 *  do (verified against the backend's live `/v3/api-docs`). */
export function TagTable({ tags, onCreate, onUpdate, onDelete }: TagTableProps) {
  const [formTarget, setFormTarget] = useState<Tag | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const { page, pageCount, setPage, pageItems } = usePagedItems(tags, PAGE_SIZE)

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleteError(null)
    try {
      await onDelete(deleteTarget.id)
      setDeleteTarget(null)
    } catch {
      setDeleteError('Unable to delete tag, please try again.')
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
          + Add tag
        </button>
      </div>

      {tags.length === 0 ? (
        <p className="text-sm text-[#5B5F58] dark:text-[#A2A79C]">No tags yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#DBDFD3] dark:border-[#2C3130]">
                <th className="px-3 pb-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.05em] text-[#8B8F86] dark:text-[#6D726A]">
                  Name
                </th>
                <th className="px-3 pb-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.05em] text-[#8B8F86] dark:text-[#6D726A]">
                  Slug
                </th>
                <th className="px-3 pb-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.05em] text-[#8B8F86] dark:text-[#6D726A]">
                  Usage count
                </th>
                <th className="px-3 pb-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.05em] text-[#8B8F86] dark:text-[#6D726A]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((tag) => (
                <tr
                  key={tag.id}
                  className="border-b border-[#DBDFD3] last:border-0 dark:border-[#2C3130]"
                >
                  <td className="px-3 py-2.5">{tag.name}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-[#5B5F58] dark:text-[#A2A79C]">
                    {tag.slug}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-[#5B5F58] dark:text-[#A2A79C]">
                    {tag.usageCount}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setFormTarget(tag)}
                        className="text-xs text-[#3652E0] underline underline-offset-2 hover:text-[#26399E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] dark:text-[#8493FF] dark:hover:text-[#AEBBFF]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(tag)}
                        className="text-xs text-[#C23A2E] underline underline-offset-2 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] dark:text-[#FF7A6B]"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
        </div>
      )}

      {formTarget && (
        <TagFormModal
          editingTag={formTarget === 'new' ? null : formTarget}
          existingTags={tags}
          onClose={() => setFormTarget(null)}
          onCreate={onCreate}
          onUpdate={onUpdate}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete tag "${deleteTarget.name}"? This action cannot be undone.`}
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
