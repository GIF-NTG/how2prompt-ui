import type { AiModel } from '@/features/admin/api/aiModelsClient.types'

interface AiModelTableProps {
  models: AiModel[]
  onEdit: (model: AiModel) => void
  onToggleActive: (model: AiModel) => void
}

/** No delete action is rendered here — the contract exposes no
 *  DELETE /admin/ai-models/{id} endpoint (research.md Decision 3). Deactivating
 *  (isActive: false) is the only removal affordance. */
export function AiModelTable({ models, onEdit, onToggleActive }: AiModelTableProps) {
  if (models.length === 0) {
    return (
      <p className="m-0 text-[0.86rem] text-[#5B5F58] dark:text-[#A2A79C]">
        Chưa có model nào. Tạo model đầu tiên bên dưới.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#DBDFD3] dark:border-[#2C3130]">
      <table className="w-full min-w-[640px] border-collapse text-left text-[0.86rem]">
        <thead>
          <tr className="border-b border-[#DBDFD3] text-[0.76rem] uppercase tracking-[0.04em] text-[#8A8F8A] dark:border-[#2C3130] dark:text-[#6B706B]">
            <th className="px-4 py-3 font-medium">Tên</th>
            <th className="px-4 py-3 font-medium">Mã (code)</th>
            <th className="px-4 py-3 font-medium">Nhà cung cấp</th>
            <th className="px-4 py-3 font-medium">Loại</th>
            <th className="px-4 py-3 font-medium">Trạng thái</th>
            <th className="px-4 py-3 font-medium">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {models.map((model) => (
            <tr
              key={model.id}
              className="border-b border-[#EEF0E9] last:border-b-0 dark:border-[#1C2024]"
            >
              <td className="px-4 py-3 font-medium">{model.name}</td>
              <td className="px-4 py-3 font-mono text-[0.8rem] text-[#5B5F58] dark:text-[#A2A79C]">
                {model.code}
              </td>
              <td className="px-4 py-3">{model.provider}</td>
              <td className="px-4 py-3">{model.modelType}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-[0.74rem] font-medium ${
                    model.isActive
                      ? 'bg-[#E3F4EA] text-[#2E7D4F] dark:bg-[#1C3327] dark:text-[#6FCF9A]'
                      : 'bg-[#F1F0EC] text-[#6B706B] dark:bg-[#22262A] dark:text-[#8A8F8A]'
                  }`}
                >
                  {model.isActive ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => onEdit(model)}
                    className="cursor-pointer text-[0.8rem] text-[#3652E0] underline underline-offset-2 dark:text-[#8493FF]"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleActive(model)}
                    className="cursor-pointer text-[0.8rem] text-[#5B5F58] underline underline-offset-2 dark:text-[#A2A79C]"
                  >
                    {model.isActive ? 'Vô hiệu hóa' : 'Kích hoạt lại'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
