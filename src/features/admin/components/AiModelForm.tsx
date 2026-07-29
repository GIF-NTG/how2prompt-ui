import { useState, type FormEvent } from 'react'
import type { AiModel, AiModelUpsert } from '@/features/admin/api/aiModelsClient.types'

interface AiModelFormProps {
  initial: AiModel | null
  submitting: boolean
  onSubmit: (input: AiModelUpsert) => void
  onCancel: () => void
}

const MODEL_TYPES: AiModelUpsert['modelType'][] = ['text', 'image', 'video', 'audio', 'multimodal']

const inputBase =
  'w-full rounded-xl border border-[#DBDFD3] bg-white px-[0.9rem] py-[0.62rem] text-[0.86rem] text-[#1B1D1B] transition-colors duration-150 focus:border-[#3652E0] focus:outline-none dark:border-[#2C3130] dark:bg-[#1C2024] dark:text-[#ECEEE8]'
const labelBase = 'text-[0.82rem] font-medium text-[#4A4F4A] dark:text-[#A8ADA7]'

export function AiModelForm({ initial, submitting, onSubmit, onCancel }: AiModelFormProps) {
  const [code, setCode] = useState(initial?.code ?? '')
  const [name, setName] = useState(initial?.name ?? '')
  const [provider, setProvider] = useState(initial?.provider ?? '')
  const [modelType, setModelType] = useState<AiModelUpsert['modelType']>(initial?.modelType ?? 'text')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [iconUrl, setIconUrl] = useState(initial?.iconUrl ?? '')
  const [isActive, setIsActive] = useState(initial?.isActive ?? true)
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0)
  const [capabilitiesJson, setCapabilitiesJson] = useState(
    JSON.stringify(initial?.capabilities ?? {}, null, 2),
  )
  const [capabilitiesError, setCapabilitiesError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    let capabilities: Record<string, unknown>
    try {
      capabilities = capabilitiesJson.trim() ? JSON.parse(capabilitiesJson) : {}
    } catch {
      setCapabilitiesError('Capabilities phải là JSON hợp lệ.')
      return
    }
    setCapabilitiesError(null)

    onSubmit({
      code: code.trim(),
      name: name.trim(),
      provider: provider.trim(),
      modelType,
      description: description.trim() || undefined,
      capabilities,
      iconUrl: iconUrl.trim() || undefined,
      isActive,
      sortOrder,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-[0.35rem]">
          <label className={labelBase} htmlFor="ai-model-code">
            Mã model (code)<span className="ml-0.5 text-[#C23A2A] dark:text-[#FF7A6B]">*</span>
          </label>
          <input
            id="ai-model-code"
            className={inputBase}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="claude-opus-4"
            required
          />
        </div>
        <div className="flex flex-col gap-[0.35rem]">
          <label className={labelBase} htmlFor="ai-model-name">
            Tên hiển thị<span className="ml-0.5 text-[#C23A2A] dark:text-[#FF7A6B]">*</span>
          </label>
          <input
            id="ai-model-name"
            className={inputBase}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Claude Opus 4"
            required
          />
        </div>
        <div className="flex flex-col gap-[0.35rem]">
          <label className={labelBase} htmlFor="ai-model-provider">
            Nhà cung cấp<span className="ml-0.5 text-[#C23A2A] dark:text-[#FF7A6B]">*</span>
          </label>
          <input
            id="ai-model-provider"
            className={inputBase}
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            placeholder="anthropic"
            required
          />
        </div>
        <div className="flex flex-col gap-[0.35rem]">
          <label className={labelBase} htmlFor="ai-model-type">
            Loại model<span className="ml-0.5 text-[#C23A2A] dark:text-[#FF7A6B]">*</span>
          </label>
          <select
            id="ai-model-type"
            className={`${inputBase} cursor-pointer`}
            value={modelType}
            onChange={(e) => setModelType(e.target.value as AiModelUpsert['modelType'])}
          >
            {MODEL_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-[0.35rem]">
          <label className={labelBase} htmlFor="ai-model-icon">
            Icon URL
          </label>
          <input
            id="ai-model-icon"
            className={inputBase}
            value={iconUrl}
            onChange={(e) => setIconUrl(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-[0.35rem]">
          <label className={labelBase} htmlFor="ai-model-sort-order">
            Thứ tự hiển thị
          </label>
          <input
            id="ai-model-sort-order"
            type="number"
            className={inputBase}
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="flex flex-col gap-[0.35rem]">
        <label className={labelBase} htmlFor="ai-model-description">
          Mô tả
        </label>
        <textarea
          id="ai-model-description"
          className={`${inputBase} min-h-[4.5rem] resize-y`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-[0.35rem]">
        <label className={labelBase} htmlFor="ai-model-capabilities">
          Capabilities (JSON)
        </label>
        <textarea
          id="ai-model-capabilities"
          className={`${inputBase} min-h-[5rem] resize-y font-mono text-[0.8rem]`}
          value={capabilitiesJson}
          onChange={(e) => setCapabilitiesJson(e.target.value)}
        />
        {capabilitiesError && (
          <p className="m-0 text-[0.75rem] text-[#C23A2A] dark:text-[#FF7A6B]">{capabilitiesError}</p>
        )}
      </div>

      <label htmlFor="ai-model-is-active" className="flex w-fit cursor-pointer items-center gap-3">
        <button
          id="ai-model-is-active"
          type="button"
          role="switch"
          aria-checked={isActive}
          onClick={() => setIsActive((v) => !v)}
          className={`relative inline-flex h-[1.35rem] w-[2.4rem] shrink-0 cursor-pointer items-center rounded-full transition-colors duration-150 ${
            isActive ? 'bg-[#3652E0] dark:bg-[#8493FF]' : 'bg-[#DBDFD3] dark:bg-[#2C3130]'
          }`}
        >
          <span
            className={`inline-block h-[1rem] w-[1rem] rounded-full bg-white shadow transition-transform duration-150 ${
              isActive ? 'translate-x-[1.1rem]' : 'translate-x-[0.2rem]'
            }`}
          />
        </button>
        <span className="text-[0.86rem] text-[#1B1D1B] dark:text-[#ECEEE8]">
          {isActive ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
        </span>
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="cursor-pointer rounded-xl bg-[#3652E0] px-4 py-2 text-[0.86rem] font-semibold text-white transition-colors duration-150 hover:bg-[#2E46C4] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#8493FF] dark:text-[#14171A] dark:hover:bg-[#9AA8FF]"
        >
          {initial ? 'Lưu thay đổi' : 'Tạo model'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer rounded-xl border border-[#DBDFD3] px-4 py-2 text-[0.86rem] text-[#4A4F4A] transition-colors duration-150 hover:border-[#3652E0] dark:border-[#2C3130] dark:text-[#A8ADA7] dark:hover:border-[#8493FF]"
        >
          Hủy
        </button>
      </div>
    </form>
  )
}
