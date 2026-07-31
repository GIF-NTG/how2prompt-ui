import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/features/auth/context/useAuth'
import { ApiError } from '@/shared/utils/httpClient'
import { createAiModelsClient } from '../api/aiModelsClient'
import type { AiModel, AiModelUpsert } from '../api/aiModelsClient.types'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { AdminPanel } from '../components/AdminPanel'
import { AiModelForm } from '../components/AiModelForm'
import { AiModelTable } from '../components/AiModelTable'

export function AiModelsPage() {
  const { session } = useAuth()
  const client = useMemo(() => createAiModelsClient(session?.token), [session?.token])

  const [models, setModels] = useState<AiModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingModel, setEditingModel] = useState<AiModel | null>(null)

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
    if (editingModel) {
      await client.update(editingModel.id, input)
      setEditingModel(null)
    } else {
      await client.create(input)
    }
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.4fr]">
        <AdminPanel title={editingModel ? 'Chỉnh sửa model' : 'Thêm model mới'}>
          <AiModelForm
            editingModel={editingModel}
            onSubmit={handleSubmit}
            onCancelEdit={() => setEditingModel(null)}
          />
        </AdminPanel>

        <AdminPanel title="Danh sách model" hint={`${models.length} model`}>
          {loading ? (
            <p className="text-sm text-[#5B5F58] dark:text-[#A2A79C]">Đang tải...</p>
          ) : error ? (
            <p role="alert" className="text-sm text-[#C23A2E] dark:text-[#FF7A6B]">
              {error}
            </p>
          ) : (
            <AiModelTable
              models={models}
              onEdit={setEditingModel}
              onToggleActive={(model) => void handleToggleActive(model)}
            />
          )}
        </AdminPanel>
      </div>
    </>
  )
}
