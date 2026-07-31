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

export function TemplatesAdminPage() {
  const { session } = useAuth()
  const templatesClient = useMemo(
    () => createTemplatesAdminClient(session?.token),
    [session?.token],
  )
  const taxonomyClient = useMemo(() => createTaxonomyClient(session?.token), [session?.token])
  const aiModelsClient = useMemo(() => createAiModelsClient(session?.token), [session?.token])

  const [templates, setTemplates] = useState<AdminTemplate[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [models, setModels] = useState<AiModel[]>([])
  const [editingTemplate, setEditingTemplate] = useState<AdminTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [templatesResult, categoriesResult, tagsResult, modelsResult] = await Promise.all([
        templatesClient.list(),
        taxonomyClient.listCategories(),
        taxonomyClient.listTags(),
        aiModelsClient.list(),
      ])
      setTemplates(templatesResult)
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

  useEffect(() => {
    void loadData()
  }, [loadData])

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
    setEditingTemplate(null)
    await loadData()
  }

  return (
    <>
      <AdminPageHeader eyebrow="admin / nội dung" title="Templates" />

      {loading ? (
        <p className="text-sm text-[#5B5F58] dark:text-[#A2A79C]">Đang tải...</p>
      ) : error ? (
        <p role="alert" className="text-sm text-[#C23A2E] dark:text-[#FF7A6B]">
          {error}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
          <AdminPanel title={editingTemplate ? `Chỉnh sửa: ${editingTemplate.title.en}` : 'Tạo template mới'}>
            <TemplateEditorForm
              editingTemplate={editingTemplate}
              categories={categories}
              tags={tags}
              models={models}
              onSaveDraft={handleSaveDraft}
              onPublish={handlePublish}
            />
          </AdminPanel>

          <AdminPanel title="Templates" hint={`${templates.length} mục`}>
            {templates.length === 0 ? (
              <p className="text-sm text-[#5B5F58] dark:text-[#A2A79C]">Chưa có template nào.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {templates.map((template) => (
                  <li
                    key={template.id}
                    className="flex items-center justify-between rounded-lg border border-[#DBDFD3] p-3 text-sm dark:border-[#2C3130]"
                  >
                    <span>
                      {template.title.en}{' '}
                      <span className="text-xs text-[#5B5F58] dark:text-[#A2A79C]">
                        (v{template.currentVersion.versionNumber} —{' '}
                        {template.status === 'published' ? 'đã publish' : 'draft'})
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingTemplate(template)}
                      className="text-xs text-[#3652E0] underline underline-offset-2 dark:text-[#8493FF]"
                    >
                      Sửa
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </AdminPanel>
        </div>
      )}
    </>
  )
}
