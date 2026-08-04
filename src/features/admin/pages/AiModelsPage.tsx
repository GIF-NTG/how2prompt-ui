import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/features/auth/context/useAuth'
import { ApiError } from '@/shared/utils/httpClient'
import { createAiModelsClient } from '../api/aiModelsClient'
import type { AiModel, AiModelUpsert } from '../api/aiModelsClient.types'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { AdminPanel } from '../components/AdminPanel'
import { AiModelForm } from '../components/AiModelForm'
import { AiModelTable } from '../components/AiModelTable'
import { Modal } from '../components/Modal'

export function AiModelsPage() {
  const { session } = useAuth()
  const client = useMemo(() => createAiModelsClient(session?.token), [session?.token])

  const [models, setModels] = useState<AiModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formTarget, setFormTarget] = useState<AiModel | 'new' | null>(null)

  const loadModels = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setModels(await client.list())
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Không thể tải danh sách AI model, vui lòng thử lại.',
      )
    } finally {
      setLoading(false)
    }
  }, [client])

  useEffect(() => {
    void loadModels()
  }, [loadModels])

  async function handleSubmit(input: AiModelUpsert) {
    if (formTarget && formTarget !== 'new') {
      await client.update(formTarget.id, input)
    } else {
      await client.create(input)
    }
    setFormTarget(null)
    await loadModels()
  }

  async function handleToggleActive(model: AiModel) {
    await client.update(model.id, {
      code: model.code,
      name: model.name,
      provider: model.provider,
      modelType: model.modelType,
      description: model.description,
      capabilities: model.capabilities,
      defaultConfig: {},
      iconUrl: model.iconUrl,
      isActive: !model.isActive,
      sortOrder: model.sortOrder,
    })
    await loadModels()
  }

  return (
    <>
      <AdminPageHeader eyebrow="admin / nội dung" title="AI Models" />

      <AdminPanel
        title="Danh sách model"
        hint={`${models.length} model`}
        action={
          <button
            type="button"
            onClick={() => setFormTarget('new')}
            className="rounded-lg bg-[#3652E0] px-4 py-2 text-sm font-bold text-white transition hover:brightness-110 dark:bg-[#8493FF] dark:text-[#14171A]"
          >
            + Thêm model
          </button>
        }
      >
        {loading ? (
          <p className="text-sm text-[#5B5F58] dark:text-[#A2A79C]">Đang tải...</p>
        ) : error ? (
          <p role="alert" className="text-sm text-[#C23A2E] dark:text-[#FF7A6B]">
            {error}
          </p>
        ) : (
          <AiModelTable
            models={models}
            onEdit={setFormTarget}
            onToggleActive={(model) => void handleToggleActive(model)}
          />
        )}
      </AdminPanel>

      {formTarget && (
        <Modal
          title={formTarget === 'new' ? 'Thêm model mới' : 'Chỉnh sửa model'}
          onClose={() => setFormTarget(null)}
        >
          <AiModelForm
            editingModel={formTarget === 'new' ? null : formTarget}
            onSubmit={handleSubmit}
            onCancelEdit={() => setFormTarget(null)}
          />
        </Modal>
      )}
    </>
  )
}
