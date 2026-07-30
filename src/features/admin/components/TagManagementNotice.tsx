import type { Tag } from '@/features/admin/api/taxonomyClient.types'

interface TagManagementNoticeProps {
  tags: Tag[]
}

/** Tags are read-only here — no admin create/edit/delete/merge endpoint exists yet
 *  (research.md Decision 3). This surfaces that as a visible, intentional
 *  limitation rather than a silently missing or broken control. */
export function TagManagementNotice({ tags }: TagManagementNoticeProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-dashed border-[#DBDFD3] p-4 dark:border-[#2C3130]">
      <p className="m-0 text-[0.86rem] text-[#5B5F58] dark:text-[#A2A79C]">
        Quản lý tag (tạo, gộp, xóa) chưa khả dụng — backend chưa cung cấp API quản trị cho tag. Danh
        sách bên dưới chỉ để xem.
      </p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="rounded-full bg-[#F1F0EC] px-3 py-1 text-[0.78rem] text-[#4A4F4A] dark:bg-[#22262A] dark:text-[#A8ADA7]"
          >
            {tag.name} · {tag.usageCount}
          </span>
        ))}
      </div>
    </div>
  )
}
