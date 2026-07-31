import { Info } from 'lucide-react'
import type { Tag } from '../api/taxonomyClient.types'

interface TagManagementNoticeProps {
  tags: Tag[]
}

/** Tags are read-only in this feature — `docs/api/openapi.yaml` has no admin
 *  tag create/edit/delete/merge endpoint at all (FR-007a / research.md
 *  Decision 3). Displays the existing tags for reference without offering any
 *  mutation control. */
export function TagManagementNotice({ tags }: TagManagementNoticeProps) {
  return (
    <div className="flex flex-col gap-3">
      <div
        role="status"
        className="flex items-center gap-2 rounded-lg border border-[#3652E0]/30 bg-[#E7EAFC] px-4 py-2.5 text-sm text-[#3652E0] dark:border-[#8493FF]/30 dark:bg-[#262C4A] dark:text-[#8493FF]"
      >
        <Info size={16} className="flex-shrink-0" aria-hidden="true" />
        Quản lý tag (tạo/sửa/xoá/gộp) chưa khả dụng — backend chưa cung cấp API
        tương ứng.
      </div>

      {tags.length === 0 ? (
        <p className="text-sm text-[#5B5F58] dark:text-[#A2A79C]">Chưa có tag nào.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li
              key={tag.id}
              className="rounded-full bg-[#EAEDE6] px-3 py-1 text-xs text-[#5B5F58] dark:bg-[#23282C] dark:text-[#A2A79C]"
            >
              {tag.name} ({tag.usageCount})
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
