import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/features/auth/context/useAuth'
import { ApiError } from '@/shared/utils/httpClient'
import { createTaxonomyClient } from '../api/taxonomyClient'
import type { Category, Tag, TagUpsert } from '../api/taxonomyClient.types'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { AdminPanel } from '../components/AdminPanel'
import { CategoryTree } from '../components/CategoryTree'
import { TagTable } from '../components/TagTable'

export function TaxonomyPage() {
  const { session } = useAuth()
  const client = useMemo(() => createTaxonomyClient(session?.token), [session?.token])

  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [categoriesResult, tagsResult] = await Promise.all([
        client.listCategories(),
        client.listTags(),
      ])
      setCategories(categoriesResult)
      setTags(tagsResult)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Không thể tải taxonomy, vui lòng thử lại.',
      )
    } finally {
      setLoading(false)
    }
  }, [client])

  useEffect(() => {
    void loadData()
  }, [loadData])

  async function handleCreateCategory(name: string, parentId: string | null) {
    await client.createCategory({
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      name: { en: name },
      description: { en: '' },
      icon: null,
      color: null,
      parentId,
      sortOrder: categories.length,
    })
    await loadData()
  }

  async function handleUpdateCategory(id: string, name: string, parentId: string | null) {
    const existing = categories.find((c) => c.id === id)
    if (!existing) return
    await client.updateCategory(id, {
      slug: existing.slug,
      name: { ...existing.name, en: name },
      description: existing.description,
      icon: existing.icon,
      color: existing.color,
      parentId,
      sortOrder: existing.sortOrder,
    })
    await loadData()
  }

  async function handleDeleteCategory(id: string) {
    await client.deleteCategory(id)
    await loadData()
  }

  async function handleCreateTag(input: TagUpsert) {
    await client.createTag(input)
    await loadData()
  }

  async function handleUpdateTag(id: string, input: TagUpsert) {
    await client.updateTag(id, input)
    await loadData()
  }

  async function handleDeleteTag(id: string) {
    await client.deleteTag(id)
    await loadData()
  }

  return (
    <>
      <AdminPageHeader eyebrow="admin / nội dung" title="Danh mục & Tag" />

      {loading ? (
        <p className="text-sm text-[#5B5F58] dark:text-[#A2A79C]">Đang tải...</p>
      ) : error ? (
        <p role="alert" className="text-sm text-[#C23A2E] dark:text-[#FF7A6B]">
          {error}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.65fr_1fr]">
          <AdminPanel title="Categories" hint={`${categories.length} category`}>
            <CategoryTree
              categories={categories}
              onCreate={handleCreateCategory}
              onUpdate={handleUpdateCategory}
              onDelete={handleDeleteCategory}
            />
          </AdminPanel>
          <AdminPanel title="Tags" hint={`${tags.length} tag`}>
            <TagTable
              tags={tags}
              onCreate={handleCreateTag}
              onUpdate={handleUpdateTag}
              onDelete={handleDeleteTag}
            />
          </AdminPanel>
        </div>
      )}
    </>
  )
}
