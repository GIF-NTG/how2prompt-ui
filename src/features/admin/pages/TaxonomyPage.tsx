import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/context/useAuth'
import { taxonomyClient } from '@/features/admin/api/taxonomyClient'
import { CategoryTree } from '@/features/admin/components/CategoryTree'
import { TagManagementNotice } from '@/features/admin/components/TagManagementNotice'
import type { Category, CategoryUpsert, Tag } from '@/features/admin/api/taxonomyClient.types'

export function TaxonomyPage() {
  const { session } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [categoriesData, tagsData] = await Promise.all([
        taxonomyClient.listCategories(),
        taxonomyClient.listTags(),
      ])
      setCategories(categoriesData)
      setTags(tagsData)
    } catch {
      setError('Không thể tải phân loại, vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleCreateCategory(input: CategoryUpsert) {
    setSubmitting(true)
    try {
      await taxonomyClient.createCategory(session!.token, input)
      await load()
    } catch {
      setError('Không thể tạo danh mục, vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdateCategory(id: string, input: CategoryUpsert) {
    setSubmitting(true)
    try {
      await taxonomyClient.updateCategory(session!.token, id, input)
      await load()
    } catch {
      setError('Không thể cập nhật danh mục, vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-5 pb-16 pt-2 sm:px-[clamp(1.25rem,4vw,3rem)]">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-[#3652E0] dark:text-[#8493FF]">
          quản trị · phân loại
        </span>
        <h1 className="m-0 text-[clamp(1.4rem,2.4vw,1.7rem)] leading-[1.2] tracking-[-0.015em]">
          Quản lý danh mục &amp; tag
        </h1>
        <p className="m-0 max-w-[62ch] text-[0.94rem] leading-[1.6] text-[#5B5F58] dark:text-[#A2A79C]">
          Tổ chức danh mục theo cây phân cấp để mẫu prompt dễ tìm và dễ lọc hơn.
        </p>
      </div>

      {error && (
        <p role="alert" className="m-0 text-[0.88rem] text-[#C23A2A] dark:text-[#FF7A6B]">
          {error}
        </p>
      )}

      {loading ? (
        <p className="m-0 text-[0.86rem] text-[#5B5F58] dark:text-[#A2A79C]">Đang tải...</p>
      ) : (
        <>
          <section className="flex flex-col gap-4">
            <h2 className="m-0 text-[1.05rem] font-semibold">Danh mục</h2>
            <CategoryTree
              categories={categories}
              submitting={submitting}
              onCreate={(input) => void handleCreateCategory(input)}
              onUpdate={(id, input) => void handleUpdateCategory(id, input)}
            />
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="m-0 text-[1.05rem] font-semibold">Tag</h2>
            <TagManagementNotice tags={tags} />
          </section>
        </>
      )}
    </main>
  )
}
