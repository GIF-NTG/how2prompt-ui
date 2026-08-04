import { useEffect, useState, type FormEvent } from 'react'
import type { AiModel, AiModelUpsert } from '../api/aiModelsClient.types'

const FIELD_CLASSES =
  'rounded-lg border border-[#DBDFD3] bg-transparent px-3 py-2 text-sm text-[#1B1D1B] focus:border-[#3652E0] focus:outline-none dark:border-[#2C3130] dark:text-[#ECEEE8] dark:focus:border-[#8493FF]'

const MODEL_TYPES: AiModel['modelType'][] = ['text', 'image', 'video', 'audio', 'multimodal']

function emptyForm(): AiModelUpsert {
  return {
    code: '',
    name: '',
    provider: '',
    modelType: 'text',
    description: null,
    capabilities: {},
    defaultConfig: {},
    iconUrl: null,
    isActive: true,
    sortOrder: 0,
  }
}

interface AiModelFormProps {
  editingModel: AiModel | null
  onSubmit: (input: AiModelUpsert) => Promise<void>
  onCancelEdit: () => void
}

/** Create/edit form for User Story 1 (FR-002). No delete action lives here —
 *  per FR-004a, removal is deactivation only, handled by AiModelTable. */
export function AiModelForm({ editingModel, onSubmit, onCancelEdit }: AiModelFormProps) {
  const [form, setForm] = useState<AiModelUpsert>(emptyForm())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (editingModel) {
      setForm({
        code: String(editingModel.code || ''),
        name: String(editingModel.name || ''),
        provider: String(editingModel.provider || ''),
        modelType: editingModel.modelType,
        description: editingModel.description,
        capabilities: editingModel.capabilities,
        defaultConfig: {},
        iconUrl: editingModel.iconUrl,
        isActive: editingModel.isActive,
        sortOrder: editingModel.sortOrder,
      })
    } else {
      setForm(emptyForm())
    }
    setError(null)
  }, [editingModel])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const code = String(form.code || '').trim()
    const name = String(form.name || '').trim()
    const provider = String(form.provider || '').trim()
    if (!code || !name || !provider) {
      setError('Vui lòng nhập đầy đủ code, name và provider.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit(form)
      if (!editingModel) setForm(emptyForm())
    } catch {
      setError('Không thể lưu model, vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      {editingModel && (
        <p className="m-0 text-xs text-[#5B5F58] dark:text-[#A2A79C]">
          Đang sửa: <span className="font-semibold">{editingModel.name}</span>
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-[#5B5F58] dark:text-[#A2A79C]">Code</span>
          <input
            type="text"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            className={FIELD_CLASSES}
            placeholder="claude-opus-4"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-[#5B5F58] dark:text-[#A2A79C]">Tên hiển thị</span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={FIELD_CLASSES}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-[#5B5F58] dark:text-[#A2A79C]">Provider</span>
          <input
            type="text"
            value={form.provider}
            onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
            className={FIELD_CLASSES}
            placeholder="anthropic"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-[#5B5F58] dark:text-[#A2A79C]">Loại model</span>
          <select
            value={form.modelType}
            onChange={(e) =>
              setForm((f) => ({ ...f, modelType: e.target.value as AiModel['modelType'] }))
            }
            className={FIELD_CLASSES}
          >
            {MODEL_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-[#5B5F58] dark:text-[#A2A79C]">Icon URL (tuỳ chọn)</span>
          <input
            type="text"
            value={form.iconUrl ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, iconUrl: e.target.value || null }))}
            className={FIELD_CLASSES}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-[#5B5F58] dark:text-[#A2A79C]">Thứ tự hiển thị</span>
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
            className={FIELD_CLASSES}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-xs">
        <span className="text-[#5B5F58] dark:text-[#A2A79C]">Mô tả (tuỳ chọn)</span>
        <textarea
          value={form.description ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value || null }))}
          rows={2}
          className={FIELD_CLASSES}
        />
      </label>

      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
        />
        <span className="text-[#5B5F58] dark:text-[#A2A79C]">Đang hoạt động (isActive)</span>
      </label>

      {error && (
        <p role="alert" className="text-xs text-[#C23A2E] dark:text-[#FF7A6B]">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-[#3652E0] px-4 py-2 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60 dark:bg-[#8493FF] dark:text-[#14171A]"
        >
          {editingModel ? 'Lưu thay đổi' : 'Tạo model'}
        </button>
        {editingModel && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-lg border border-[#DBDFD3] px-4 py-2 text-sm dark:border-[#2C3130]"
          >
            Huỷ
          </button>
        )}
      </div>
    </form>
  )
}
