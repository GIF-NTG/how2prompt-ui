import { useEffect, useState } from 'react'
import type { AdminTemplate, TemplateUpsert } from '../api/templatesAdminClient.types'
import { useAdminData } from '../context/useAdminData'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { AdminPanel } from '../components/AdminPanel'
import { TemplateEditorForm } from '../components/TemplateEditorForm'
import { Modal } from '../components/Modal'
import { ConfirmDialog } from '../components/ConfirmDialog'

export function TemplatesAdminPage() {
  // Categories/tags/AI models/templates are shared, lazily-fetched, cross-page
  // state (see AdminDataProvider) — `ensureX()` only fetches the first time
  // any admin page actually needs it, and is cached afterwards so navigating
  // away from and back to Templates (or between Templates/Taxonomy) doesn't
  // re-fetch.
  const {
    categories,
    tags,
    models,
    templates,
    templatesLoaded,
    templatesHasMore,
    error,
    templatesAdminClient,
    ensureCategories,
    ensureTags,
    ensureModels,
    ensureTemplates,
    refetchTemplates,
    loadMoreTemplates,
    deleteTemplate,
  } = useAdminData()

  useEffect(() => {
    void ensureCategories()
    void ensureTags()
    void ensureModels()
    void ensureTemplates()
  }, [ensureCategories, ensureTags, ensureModels, ensureTemplates])

  const [editingTemplate, setEditingTemplate] = useState<AdminTemplate | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminTemplate | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleLoadMore() {
    setLoadingMore(true)
    try {
      await loadMoreTemplates()
    } finally {
      setLoadingMore(false)
    }
  }

  function openCreateForm() {
    setEditingTemplate(null)
    setFormOpen(true)
  }

  function openEditForm(template: AdminTemplate) {
    setEditingTemplate(template)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingTemplate(null)
  }

  async function handleSaveDraft(input: TemplateUpsert) {
    if (editingTemplate) {
      await templatesAdminClient.update(editingTemplate.id, input)
    } else {
      const created = await templatesAdminClient.create(input)
      setEditingTemplate(created)
    }
    await refetchTemplates()
  }

  async function handlePublish(input: TemplateUpsert) {
    const target = editingTemplate ?? (await templatesAdminClient.create(input))
    if (editingTemplate) {
      await templatesAdminClient.update(target.id, input)
    }
    await templatesAdminClient.publish(target.id)
    closeForm()
    await refetchTemplates()
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    try {
      await deleteTemplate(deleteTarget.id)
      setDeleteTarget(null)
      setDeleteError(null)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Unable to delete template.')
    }
  }

  return (
    <>
      <AdminPageHeader eyebrow="admin / content" title="Templates" />

      <AdminPanel
        title="Templates"
        hint={`${templates.length} items`}
        action={
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-[#3652E0] px-4 py-2 text-sm font-bold text-white transition hover:brightness-110 dark:bg-[#8493FF] dark:text-[#14171A]"
          >
            + Create new template
          </button>
        }
      >
        {!templatesLoaded ? (
          <p className="text-sm text-[#5B5F58] dark:text-[#A2A79C]">Loading...</p>
        ) : error ? (
          <p role="alert" className="text-sm text-[#C23A2E] dark:text-[#FF7A6B]">
            {error}
          </p>
        ) : templates.length === 0 ? (
          <p className="text-sm text-[#5B5F58] dark:text-[#A2A79C]">No templates yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#DBDFD3] dark:border-[#2C3130]">
                  <th className="px-3 pb-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.05em] text-[#8B8F86] dark:text-[#6D726A]">
                    Name
                  </th>
                  <th className="px-3 pb-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.05em] text-[#8B8F86] dark:text-[#6D726A]">
                    Version
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
                {templates.map((template) => (
                  <tr
                    key={template.id}
                    className="border-b border-[#DBDFD3] last:border-0 dark:border-[#2C3130]"
                  >
                    <td className="px-3 py-2.5">{template.title.en}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-[#5B5F58] dark:text-[#A2A79C]">
                      v{template.currentVersion.versionNumber}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={
                            template.status === 'published'
                              ? 'rounded-full bg-[#E4F3EA] px-2 py-0.5 text-xs text-[#2E7D4F] dark:bg-[#1E3327] dark:text-[#6FCF9A]'
                              : 'rounded-full bg-[#F7ECD7] px-2 py-0.5 text-xs text-[#C98A1F] dark:bg-[#362C1A] dark:text-[#E0B25C]'
                          }
                        >
                          {template.status === 'published' ? 'published' : 'draft'}
                        </span>
                        {template.isFeatured && (
                          <span className="rounded-full bg-[#E7EAFC] px-2 py-0.5 text-xs text-[#3652E0] dark:bg-[#262C4A] dark:text-[#8493FF]">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => openEditForm(template)}
                          className="text-xs text-[#3652E0] underline underline-offset-2 dark:text-[#8493FF]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTarget(template)
                            setDeleteError(null)
                          }}
                          className="text-xs text-[#C23A2E] underline underline-offset-2 dark:text-[#FF7A6B]"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {templatesHasMore && (
              <div className="flex justify-center pt-3">
                <button
                  type="button"
                  onClick={() => void handleLoadMore()}
                  disabled={loadingMore}
                  className="rounded-lg border border-[#DBDFD3] px-4 py-2 text-sm font-semibold disabled:opacity-60 dark:border-[#2C3130]"
                >
                  {loadingMore ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </div>
        )}
      </AdminPanel>

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete template "${deleteTarget.title.en}"? This action cannot be undone.`}
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

      {formOpen && (
        <Modal
          title={editingTemplate ? `Edit: ${editingTemplate.title.en}` : 'Create new template'}
          onClose={closeForm}
          wide
        >
          <TemplateEditorForm
            editingTemplate={editingTemplate}
            categories={categories}
            tags={tags}
            models={models}
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
          />
        </Modal>
      )}
    </>
  )
}
