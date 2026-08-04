import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/features/auth/context/useAuth'
import { ApiError } from '@/shared/utils/httpClient'
import { createTemplatesAdminClient } from '../api/templatesAdminClient'
import { createTaxonomyClient } from '../api/taxonomyClient'
import { createAiModelsClient } from '../api/aiModelsClient'
import type { AdminTemplate, TemplateUpsert } from '../api/templatesAdminClient.types'
import type { Category, Tag } from '../api/taxonomyClient.types'
import type { AiModel } from '../api/aiModelsClient.types'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { AdminPanel } from '../components/AdminPanel'
import { TemplateEditorForm } from '../components/TemplateEditorForm'
import { Modal } from '../components/Modal'

export function TemplatesAdminPage() {
  const { session } = useAuth()
  const templatesClient = useMemo(
    () => createTemplatesAdminClient(session?.token),
    [session?.token],
  )
  const taxonomyClient = useMemo(() => createTaxonomyClient(session?.token), [session?.token])
  const aiModelsClient = useMemo(() => createAiModelsClient(session?.token), [session?.token])

  const [templates, setTemplates] = useState<AdminTemplate[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [models, setModels] = useState<AiModel[]>([])
  const [editingTemplate, setEditingTemplate] = useState<AdminTemplate | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [templatesPage, categoriesResult, tagsResult, modelsResult] = await Promise.all([
        templatesClient.list(),
        taxonomyClient.listCategories(),
        taxonomyClient.listTags(),
        aiModelsClient.list(),
      ])
      setTemplates(templatesPage.items)
      setCursor(templatesPage.nextCursor)
      setHasMore(templatesPage.hasMore)
      setCategories(categoriesResult)
      setTags(tagsResult)
      setModels(modelsResult)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Không thể tải dữ liệu, vui lòng thử lại.',
      )
    } finally {
      setLoading(false)
    }
  }, [templatesClient, taxonomyClient, aiModelsClient])

  async function handleLoadMore() {
    if (!cursor) return
    setLoadingMore(true)
    try {
      const nextPage = await templatesClient.list(cursor)
      setTemplates((prev) => [...prev, ...nextPage.items])
      setCursor(nextPage.nextCursor)
      setHasMore(nextPage.hasMore)
    } catch {
      setError('Không thể tải thêm template, vui lòng thử lại.')
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [loadData])

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
      await templatesClient.update(editingTemplate.id, input)
    } else {
      const created = await templatesClient.create(input)
      setEditingTemplate(created)
    }
    await loadData()
  }

  async function handlePublish(input: TemplateUpsert) {
    const target = editingTemplate ?? (await templatesClient.create(input))
    if (editingTemplate) {
      await templatesClient.update(target.id, input)
    }
    await templatesClient.publish(target.id)
    closeForm()
    await loadData()
  }

  return (
    <>
      <AdminPageHeader eyebrow="admin / nội dung" title="Templates" />

      <AdminPanel
        title="Templates"
        hint={`${templates.length} mục`}
        action={
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-[#3652E0] px-4 py-2 text-sm font-bold text-white transition hover:brightness-110 dark:bg-[#8493FF] dark:text-[#14171A]"
          >
            + Tạo template mới
          </button>
        }
      >
        {loading ? (
          <p className="text-sm text-[#5B5F58] dark:text-[#A2A79C]">Đang tải...</p>
        ) : error ? (
          <p role="alert" className="text-sm text-[#C23A2E] dark:text-[#FF7A6B]">
            {error}
          </p>
        ) : templates.length === 0 ? (
          <p className="text-sm text-[#5B5F58] dark:text-[#A2A79C]">Chưa có template nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#DBDFD3] dark:border-[#2C3130]">
                  <th className="px-3 pb-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.05em] text-[#8B8F86] dark:text-[#6D726A]">
                    Tên
                  </th>
                  <th className="px-3 pb-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.05em] text-[#8B8F86] dark:text-[#6D726A]">
                    Version
                  </th>
                  <th className="px-3 pb-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.05em] text-[#8B8F86] dark:text-[#6D726A]">
                    Trạng thái
                  </th>
                  <th className="px-3 pb-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.05em] text-[#8B8F86] dark:text-[#6D726A]">
                    Hành động
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
                      <span
                        className={
                          template.status === 'published'
                            ? 'rounded-full bg-[#E4F3EA] px-2 py-0.5 text-xs text-[#2E7D4F] dark:bg-[#1E3327] dark:text-[#6FCF9A]'
                            : 'rounded-full bg-[#F7ECD7] px-2 py-0.5 text-xs text-[#C98A1F] dark:bg-[#362C1A] dark:text-[#E0B25C]'
                        }
                      >
                        {template.status === 'published' ? 'đã publish' : 'draft'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => openEditForm(template)}
                        className="text-xs text-[#3652E0] underline underline-offset-2 dark:text-[#8493FF]"
                      >
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {hasMore && (
              <div className="flex justify-center pt-3">
                <button
                  type="button"
                  onClick={() => void handleLoadMore()}
                  disabled={loadingMore}
                  className="rounded-lg border border-[#DBDFD3] px-4 py-2 text-sm font-semibold disabled:opacity-60 dark:border-[#2C3130]"
                >
                  {loadingMore ? 'Đang tải...' : 'Tải thêm'}
                </button>
              </div>
            )}
          </div>
        )}
      </AdminPanel>

      {formOpen && (
        <Modal
          title={editingTemplate ? `Chỉnh sửa: ${editingTemplate.title.en}` : 'Tạo template mới'}
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
