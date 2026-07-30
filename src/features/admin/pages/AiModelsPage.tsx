import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/context/useAuth'
import { aiModelsClient } from '@/features/admin/api/aiModelsClient'
import { AiModelForm } from '@/features/admin/components/AiModelForm'
import { AiModelTable } from '@/features/admin/components/AiModelTable'
import type { AiModel, AiModelUpsert } from '@/features/admin/api/aiModelsClient.types'

export function AiModelsPage() {
  const { session } = useAuth()
  const [models, setModels] = useState<AiModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<AiModel | null>(null)
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await aiModelsClient.listAll(session!.token)
      setModels(data)
    } catch {
      setError('Không thể tải danh sách model, vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    void load()
  }, [load])

  async function handleSubmit(input: AiModelUpsert) {
    setSubmitting(true)
    try {
      if (editing) {
        await aiModelsClient.update(session!.token, editing.id, input)
      } else {
        await aiModelsClient.create(session!.token, input)
      }
      setShowForm(false)
      setEditing(null)
      await load()
    } catch {
      setError('Không thể lưu model, vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggleActive(model: AiModel) {
    try {
      await aiModelsClient.update(session!.token, model.id, {
        code: model.code,
        name: model.name,
        provider: model.provider,
        modelType: model.modelType,
        description: model.description ?? undefined,
        capabilities: model.capabilities,
        iconUrl: model.iconUrl ?? undefined,
        isActive: !model.isActive,
        sortOrder: model.sortOrder,
      })
      await load()
    } catch {
      setError('Không thể cập nhật trạng thái model, vui lòng thử lại.')
    }
  }

  function handleEdit(model: AiModel) {
    setEditing(model)
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
          quản trị · ai models
        </span>
        <h1 className="m-0 text-[clamp(1.4rem,2.4vw,1.7rem)] leading-[1.2] tracking-[-0.015em]">
          Quản lý model AI
        </h1>
        <p className="m-0 max-w-[62ch] text-[0.94rem] leading-[1.6] text-[#5B5F58] dark:text-[#A2A79C]">
          Thêm, chỉnh sửa hoặc vô hiệu hóa các model AI mà hệ thống hỗ trợ.
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
          + Tạo model mới
        </button>
      )}

      {showForm && (
        <div className="rounded-xl border border-[#DBDFD3] p-5 dark:border-[#2C3130]">
          <AiModelForm
            initial={editing}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false)
              setEditing(null)
            }}
          />
        </div>
      )}

      {loading ? (
        <p className="m-0 text-[0.86rem] text-[#5B5F58] dark:text-[#A2A79C]">Đang tải...</p>
      ) : (
        <AiModelTable
          models={models}
          onEdit={handleEdit}
          onToggleActive={(m) => void handleToggleActive(m)}
        />
      )}
    </main>
  )
}
