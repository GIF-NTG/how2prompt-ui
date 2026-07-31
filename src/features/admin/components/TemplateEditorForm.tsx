import { useEffect, useState, type FormEvent } from 'react'
import type { AiModel } from '../api/aiModelsClient.types'
import type { Category, Tag } from '../api/taxonomyClient.types'
import type { TemplateUpsert, AdminTemplate } from '../api/templatesAdminClient.types'
import { TemplateVariableEditor } from './TemplateVariableEditor'
import { validatePlaceholders } from '../utils/validatePlaceholders'

const FIELD_CLASSES =
  'rounded-lg border border-[#DBDFD3] bg-transparent px-3 py-2 text-sm text-[#1B1D1B] focus:border-[#3652E0] focus:outline-none dark:border-[#2C3130] dark:text-[#ECEEE8] dark:focus:border-[#8493FF]'

function emptyForm(): TemplateUpsert {
  return {
    title: { en: '' },
    description: { en: '' },
    coverImage: null,
    categoryIds: [],
    tagSlugs: [],
    modelCodes: [],
    promptBody: '',
    systemPrompt: null,
    exampleOutput: null,
    guide: { en: '' },
    variables: [],
    variants: [],
  }
}

interface TemplateEditorFormProps {
  editingTemplate: AdminTemplate | null
  categories: Category[]
  tags: Tag[]
  models: AiModel[]
  onSaveDraft: (input: TemplateUpsert) => Promise<void>
  onPublish: (input: TemplateUpsert) => Promise<void>
}

/** Authors a template end-to-end (FR-009 through FR-014). Tags are selectable
 *  only from the already-existing list — no free-text tag creation exists,
 *  per FR-007a. Publish runs client-side placeholder validation (FR-011)
 *  before ever calling the backend; the backend's `422` remains the source
 *  of truth (Constitution Principle III). */
export function TemplateEditorForm({
  editingTemplate,
  categories,
  tags,
  models,
  onSaveDraft,
  onPublish,
}: TemplateEditorFormProps) {
  const [form, setForm] = useState<TemplateUpsert>(emptyForm())
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (editingTemplate) {
      setForm({
        title: editingTemplate.title,
        description: editingTemplate.description,
        coverImage: editingTemplate.coverImage,
        categoryIds: editingTemplate.categoryIds,
        tagSlugs: editingTemplate.tagSlugs,
        modelCodes: editingTemplate.modelCodes,
        promptBody: editingTemplate.currentVersion.promptBody,
        systemPrompt: editingTemplate.currentVersion.systemPrompt,
        exampleOutput: editingTemplate.currentVersion.exampleOutput,
        guide: editingTemplate.currentVersion.guide,
        variables: editingTemplate.currentVersion.variables,
        variants: editingTemplate.currentVersion.variants,
      })
    } else {
      setForm(emptyForm())
    }
    setError(null)
  }, [editingTemplate])

  function toggleInList(list: string[], value: string): string[] {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
  }

  async function handleSaveDraft(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (!form.title.en.trim() || !form.promptBody.trim()) {
      setError('Vui lòng nhập tiêu đề và nội dung prompt.')
      return
    }
    setSubmitting(true)
    try {
      await onSaveDraft(form)
    } catch {
      setError('Không thể lưu draft, vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePublish() {
    setError(null)
    if (!form.title.en.trim() || !form.promptBody.trim()) {
      setError('Vui lòng nhập tiêu đề và nội dung prompt.')
      return
    }
    const { isValid, missingVarKeys } = validatePlaceholders(form.promptBody, form.variables)
    if (!isValid) {
      setError(
        `Không thể publish: placeholder {{${missingVarKeys.join('}}, {{')}}} chưa có variable tương ứng.`,
      )
      return
    }
    setSubmitting(true)
    try {
      await onPublish(form)
    } catch {
      setError('Không thể publish, vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSaveDraft}
      noValidate
      className="flex flex-col gap-4"
    >
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-[#5B5F58] dark:text-[#A2A79C]">Tiêu đề (EN)</span>
        <input
          value={form.title.en}
          onChange={(e) => setForm((f) => ({ ...f, title: { ...f.title, en: e.target.value } }))}
          className={FIELD_CLASSES}
        />
      </label>

      <label className="flex flex-col gap-1 text-xs">
        <span className="text-[#5B5F58] dark:text-[#A2A79C]">Mô tả (EN)</span>
        <textarea
          value={form.description.en}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: { ...f.description, en: e.target.value } }))
          }
          rows={2}
          className={FIELD_CLASSES}
        />
      </label>

      <fieldset className="flex flex-col gap-1">
        <legend className="text-xs text-[#5B5F58] dark:text-[#A2A79C]">Categories</legend>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={form.categoryIds.includes(category.id)}
                onChange={() =>
                  setForm((f) => ({ ...f, categoryIds: toggleInList(f.categoryIds, category.id) }))
                }
              />
              {category.name.en}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-1">
        <legend className="text-xs text-[#5B5F58] dark:text-[#A2A79C]">
          Tags (chỉ chọn từ danh sách có sẵn — xem taxonomy)
        </legend>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <label key={tag.id} className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={form.tagSlugs.includes(tag.slug)}
                onChange={() =>
                  setForm((f) => ({ ...f, tagSlugs: toggleInList(f.tagSlugs, tag.slug) }))
                }
              />
              {tag.name}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-1">
        <legend className="text-xs text-[#5B5F58] dark:text-[#A2A79C]">AI Models hỗ trợ</legend>
        <div className="flex flex-wrap gap-2">
          {models.map((model) => (
            <label key={model.code} className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={form.modelCodes.includes(model.code)}
                onChange={() =>
                  setForm((f) => ({ ...f, modelCodes: toggleInList(f.modelCodes, model.code) }))
                }
              />
              {model.name}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1 text-xs">
        <span className="text-[#5B5F58] dark:text-[#A2A79C]">
          Prompt body (dùng {'{{varKey}}'} cho mỗi placeholder)
        </span>
        <textarea
          value={form.promptBody}
          onChange={(e) => setForm((f) => ({ ...f, promptBody: e.target.value }))}
          rows={5}
          className={`${FIELD_CLASSES} font-mono`}
        />
      </label>

      <label className="flex flex-col gap-1 text-xs">
        <span className="text-[#5B5F58] dark:text-[#A2A79C]">Guide (EN, tuỳ chọn)</span>
        <textarea
          value={form.guide.en}
          onChange={(e) => setForm((f) => ({ ...f, guide: { ...f.guide, en: e.target.value } }))}
          rows={2}
          className={FIELD_CLASSES}
        />
      </label>

      <label className="flex flex-col gap-1 text-xs">
        <span className="text-[#5B5F58] dark:text-[#A2A79C]">Example output (tuỳ chọn)</span>
        <textarea
          value={form.exampleOutput ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, exampleOutput: e.target.value || null }))}
          rows={2}
          className={FIELD_CLASSES}
        />
      </label>

      <TemplateVariableEditor
        variables={form.variables}
        onChange={(variables) => setForm((f) => ({ ...f, variables }))}
      />

      {error && (
        <p role="alert" className="text-xs text-[#C23A2E] dark:text-[#FF7A6B]">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg border border-[#DBDFD3] px-4 py-2 text-sm font-bold disabled:opacity-60 dark:border-[#2C3130]"
        >
          Lưu Draft
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => void handlePublish()}
          className="rounded-lg bg-[#3652E0] px-4 py-2 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60 dark:bg-[#8493FF] dark:text-[#14171A]"
        >
          Publish
        </button>
      </div>
    </form>
  )
}
