import { useEffect, useState } from 'react'
import type { AiModel, AiModelUpsert } from '../api/aiModelsClient.types'
import { useAdminData } from '../context/useAdminData'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { AdminPanel } from '../components/AdminPanel'
import { AiModelForm } from '../components/AiModelForm'
import { AiModelTable } from '../components/AiModelTable'
import { Modal } from '../components/Modal'

export function AiModelsPage() {
  const { models, modelsLoaded, error, aiModelsClient, ensureModels, refetchModels } =
    useAdminData()
  const [formTarget, setFormTarget] = useState<AiModel | 'new' | null>(null)

  useEffect(() => {
    void ensureModels()
  }, [ensureModels])

  async function handleSubmit(input: AiModelUpsert) {
    if (formTarget && formTarget !== 'new') {
      await aiModelsClient.update(formTarget.id, input)
    } else {
      await aiModelsClient.create(input)
    }
    setFormTarget(null)
    await refetchModels()
  }

  async function handleToggleActive(model: AiModel) {
    await aiModelsClient.update(model.id, {
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
    await refetchModels()
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
        {!modelsLoaded && !error ? (
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
