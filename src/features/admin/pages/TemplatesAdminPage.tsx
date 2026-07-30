import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/context/useAuth'
import { templatesAdminClient } from '@/features/admin/api/templatesAdminClient'
import { TemplateEditorForm } from '@/features/admin/components/TemplateEditorForm'
import { PublishValidationError } from '@/features/admin/api/templatesAdminClient.types'
import type { Template, TemplateUpsert } from '@/features/admin/api/templatesAdminClient.types'

export function TemplatesAdminPage() {
  const { session } = useAuth()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Template | null>(null)
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setTemplates(await templatesAdminClient.list())
    } catch {
      setError('Không thể tải danh sách template, vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function persist(input: TemplateUpsert): Promise<Template> {
    if (editing) {
      return templatesAdminClient.update(session!.token, editing.id, input)
    }
    return templatesAdminClient.create(session!.token, input)
  }

  async function handleSaveDraft(input: TemplateUpsert) {
    setSubmitting(true)
    setError(null)
    try {
      const saved = await persist(input)
      setEditing(saved)
      await load()
    } catch {
      setError('Không thể lưu nháp, vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePublish(input: TemplateUpsert) {
    setSubmitting(true)
    setError(null)
    try {
      const saved = await persist(input)
      await templatesAdminClient.publish(session!.token, saved.id)
      setShowForm(false)
      setEditing(null)
      await load()
    } catch (err) {
      if (err instanceof PublishValidationError) {
        setError(
          `Không thể publish: các placeholder sau chưa có biến tương ứng: ${err.missingPlaceholders
            .map((p) => `{{${p}}}`)
            .join(', ')}`,
        )
      } else {
        setError('Không thể publish template, vui lòng thử lại.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  function handleEdit(template: Template) {
    setEditing(template)
    setShowForm(true)
  }

  function handleCreateNew() {
    setEditing(null)
    setShowForm(true)
  }

  return (
    <main className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-5 pb-16 pt-2 sm:px-[clamp(1.25rem,4vw,3rem)]">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-[#3652E0] dark:text-[#8493FF]">
          quản trị · templates
        </span>
        <h1 className="m-0 text-[clamp(1.4rem,2.4vw,1.7rem)] leading-[1.2] tracking-[-0.015em]">
          Tạo &amp; publish template chính chủ
        </h1>
        <p className="m-0 max-w-[62ch] text-[0.94rem] leading-[1.6] text-[#5B5F58] dark:text-[#A2A79C]">
          Soạn template, khai báo biến cho từng placeholder, lưu nháp hoặc publish để hiển thị cho
          toàn bộ người dùng.
        </p>
      </div>

      {error && (
        <p role="alert" className="m-0 text-[0.88rem] text-[#C23A2A] dark:text-[#FF7A6B]">
          {error}
        </p>
      )}

      {!showForm && (
        <button
          type="button"
          onClick={handleCreateNew}
          className="w-fit cursor-pointer rounded-xl bg-[#3652E0] px-4 py-2 text-[0.86rem] font-semibold text-white transition-colors duration-150 hover:bg-[#2E46C4] dark:bg-[#8493FF] dark:text-[#14171A] dark:hover:bg-[#9AA8FF]"
        >
          + Tạo template mới
        </button>
      )}

      {showForm && (
        <div className="rounded-xl border border-[#DBDFD3] p-5 dark:border-[#2C3130]">
          <TemplateEditorForm
            accessToken={session!.token}
            initial={editing}
            submitting={submitting}
            onSaveDraft={(input) => void handleSaveDraft(input)}
            onPublish={(input) => void handlePublish(input)}
            onCancel={() => {
              setShowForm(false)
              setEditing(null)
            }}
          />
        </div>
      )}

      {loading ? (
        <p className="m-0 text-[0.86rem] text-[#5B5F58] dark:text-[#A2A79C]">Đang tải...</p>
      ) : templates.length === 0 ? (
        <p className="m-0 text-[0.86rem] text-[#5B5F58] dark:text-[#A2A79C]">
          Chưa có template nào. Tạo template đầu tiên bên trên.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {templates.map((template) => (
            <li
              key={template.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[#DBDFD3] px-4 py-3 dark:border-[#2C3130]"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.9rem] font-medium">
                  {template.title.vi || template.title.en}
                </span>
                <span className="text-[0.76rem] text-[#8A8F8A] dark:text-[#6B706B]">
                  v{template.versionNumber} ·{' '}
                  {template.status === 'published' ? 'Đã publish' : 'Nháp'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleEdit(template)}
                className="cursor-pointer text-[0.8rem] text-[#3652E0] underline underline-offset-2 dark:text-[#8493FF]"
              >
                Sửa
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
