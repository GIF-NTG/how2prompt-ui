import { useEffect, useState } from 'react'
import { TemplateVariableEditor } from './TemplateVariableEditor'
import { findMissingPlaceholders } from '@/features/admin/utils/validatePlaceholders'
import { aiModelsClient } from '@/features/admin/api/aiModelsClient'
import { taxonomyClient } from '@/features/admin/api/taxonomyClient'
import type {
  Template,
  TemplateUpsert,
  TemplateVariable,
} from '@/features/admin/api/templatesAdminClient.types'
import type { AiModel } from '@/features/admin/api/aiModelsClient.types'
import type { Category, Tag } from '@/features/admin/api/taxonomyClient.types'

interface TemplateEditorFormProps {
  accessToken: string
  initial: Template | null
  submitting: boolean
  onSaveDraft: (input: TemplateUpsert) => void
  onPublish: (input: TemplateUpsert) => void
  onCancel: () => void
}

const inputBase =
  'w-full rounded-xl border border-[#DBDFD3] bg-white px-[0.9rem] py-[0.62rem] text-[0.86rem] text-[#1B1D1B] transition-colors duration-150 focus:border-[#3652E0] focus:outline-none dark:border-[#2C3130] dark:bg-[#1C2024] dark:text-[#ECEEE8]'
const labelBase = 'text-[0.82rem] font-medium text-[#4A4F4A] dark:text-[#A8ADA7]'

function toggleInArray(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export function TemplateEditorForm({
  accessToken,
  initial,
  submitting,
  onSaveDraft,
  onPublish,
  onCancel,
}: TemplateEditorFormProps) {
  const [titleEn, setTitleEn] = useState(initial?.title.en ?? '')
  const [titleVi, setTitleVi] = useState(initial?.title.vi ?? '')
  const [descriptionEn, setDescriptionEn] = useState(initial?.description.en ?? '')
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? '')
  const [categoryIds, setCategoryIds] = useState<string[]>(initial?.categoryIds ?? [])
  const [tagSlugs, setTagSlugs] = useState<string[]>(initial?.tagSlugs ?? [])
  const [modelCodes, setModelCodes] = useState<string[]>(initial?.modelCodes ?? [])
  const [promptBody, setPromptBody] = useState(initial?.promptBody ?? '')
  const [guideEn, setGuideEn] = useState(initial?.guide.en ?? '')
  const [exampleOutput, setExampleOutput] = useState(initial?.exampleOutput ?? '')
  const [variables, setVariables] = useState<TemplateVariable[]>(initial?.variables ?? [])
  const [publishError, setPublishError] = useState<string[] | null>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [models, setModels] = useState<AiModel[]>([])

  useEffect(() => {
    void taxonomyClient.listCategories().then(setCategories)
    void taxonomyClient.listTags().then(setTags)
    void aiModelsClient.listAll(accessToken).then(setModels)
  }, [accessToken])

  function buildInput(): TemplateUpsert {
    return {
      title: { en: titleEn.trim(), vi: titleVi.trim() || undefined },
      description: { en: descriptionEn.trim() },
      coverImage: coverImage.trim() || undefined,
      categoryIds,
      tagSlugs,
      modelCodes,
      promptBody,
      guide: { en: guideEn.trim() },
      exampleOutput: exampleOutput.trim() || undefined,
      variables,
    }
  }

  function handleSaveDraft() {
    setPublishError(null)
    onSaveDraft(buildInput())
  }

  function handlePublish() {
    const missing = findMissingPlaceholders(promptBody, variables)
    if (missing.length > 0) {
      setPublishError(missing)
      return
    }
    setPublishError(null)
    onPublish(buildInput())
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-[0.35rem]">
          <label className={labelBase} htmlFor="tpl-title-en">
            Tiêu đề (EN)<span className="ml-0.5 text-[#C23A2A] dark:text-[#FF7A6B]">*</span>
          </label>
          <input
            id="tpl-title-en"
            className={inputBase}
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-[0.35rem]">
          <label className={labelBase} htmlFor="tpl-title-vi">
            Tiêu đề (VI)
          </label>
          <input
            id="tpl-title-vi"
            className={inputBase}
            value={titleVi}
            onChange={(e) => setTitleVi(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-[0.35rem]">
        <label className={labelBase} htmlFor="tpl-description">
          Mô tả
        </label>
        <textarea
          id="tpl-description"
          className={`${inputBase} min-h-[4rem] resize-y`}
          value={descriptionEn}
          onChange={(e) => setDescriptionEn(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-[0.35rem]">
        <label className={labelBase} htmlFor="tpl-cover-image">
          Ảnh bìa (URL)
        </label>
        <input
          id="tpl-cover-image"
          className={inputBase}
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className={labelBase}>Danh mục</legend>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#DBDFD3] px-3 py-1 text-[0.78rem] dark:border-[#2C3130]"
            >
              <input
                type="checkbox"
                checked={categoryIds.includes(category.id)}
                onChange={() => setCategoryIds((prev) => toggleInArray(prev, category.id))}
              />
              {category.name.vi || category.name.en}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className={labelBase}>Tag</legend>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <label
              key={tag.id}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#DBDFD3] px-3 py-1 text-[0.78rem] dark:border-[#2C3130]"
            >
              <input
                type="checkbox"
                checked={tagSlugs.includes(tag.slug)}
                onChange={() => setTagSlugs((prev) => toggleInArray(prev, tag.slug))}
              />
              {tag.name}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className={labelBase}>Model AI hỗ trợ</legend>
        <div className="flex flex-wrap gap-2">
          {models.map((model) => (
            <label
              key={model.id}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#DBDFD3] px-3 py-1 text-[0.78rem] dark:border-[#2C3130]"
            >
              <input
                type="checkbox"
                checked={modelCodes.includes(model.code)}
                onChange={() => setModelCodes((prev) => toggleInArray(prev, model.code))}
              />
              {model.name}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-[0.35rem]">
        <label className={labelBase} htmlFor="tpl-prompt-body">
          Nội dung prompt ({'{{placeholder}}'})
          <span className="ml-0.5 text-[#C23A2A] dark:text-[#FF7A6B]">*</span>
        </label>
        <textarea
          id="tpl-prompt-body"
          className={`${inputBase} min-h-[8rem] resize-y font-mono text-[0.82rem]`}
          value={promptBody}
          onChange={(e) => setPromptBody(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-[0.35rem]">
        <span className={labelBase}>Biến (variables)</span>
        <TemplateVariableEditor variables={variables} onChange={setVariables} />
      </div>

      <div className="flex flex-col gap-[0.35rem]">
        <label className={labelBase} htmlFor="tpl-guide">
          Hướng dẫn sử dụng
        </label>
        <textarea
          id="tpl-guide"
          className={`${inputBase} min-h-[3.5rem] resize-y`}
          value={guideEn}
          onChange={(e) => setGuideEn(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-[0.35rem]">
        <label className={labelBase} htmlFor="tpl-example-output">
          Ví dụ đầu ra
        </label>
        <textarea
          id="tpl-example-output"
          className={`${inputBase} min-h-[3.5rem] resize-y`}
          value={exampleOutput}
          onChange={(e) => setExampleOutput(e.target.value)}
        />
      </div>

      {publishError && (
        <p role="alert" className="m-0 text-[0.86rem] text-[#C23A2A] dark:text-[#FF7A6B]">
          Không thể publish: các placeholder sau chưa có biến tương ứng:{' '}
          {publishError.map((p) => `{{${p}}}`).join(', ')}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={submitting}
          className="cursor-pointer rounded-xl border border-[#DBDFD3] px-4 py-2 text-[0.86rem] font-semibold text-[#1B1D1B] transition-colors duration-150 hover:border-[#3652E0] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#2C3130] dark:text-[#ECEEE8] dark:hover:border-[#8493FF]"
        >
          Lưu nháp
        </button>
        <button
          type="button"
          onClick={handlePublish}
          disabled={submitting}
          className="cursor-pointer rounded-xl bg-[#3652E0] px-4 py-2 text-[0.86rem] font-semibold text-white transition-colors duration-150 hover:bg-[#2E46C4] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#8493FF] dark:text-[#14171A] dark:hover:bg-[#9AA8FF]"
        >
          Publish
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer rounded-xl px-4 py-2 text-[0.86rem] text-[#5B5F58] dark:text-[#A2A79C]"
        >
          Hủy
        </button>
      </div>
    </div>
  )
}
