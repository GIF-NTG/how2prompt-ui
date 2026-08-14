import { useEffect } from 'react'
import type { TagUpsert } from '../api/taxonomyClient.types'
import { useAdminData } from '../context/useAdminData'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { AdminPanel } from '../components/AdminPanel'
import { CategoryTree } from '../components/CategoryTree'
import { TagTable } from '../components/TagTable'

export function TaxonomyPage() {
  const {
    categories,
    categoriesLoaded,
    tags,
    tagsLoaded,
    error,
    taxonomyClient,
    ensureCategories,
    ensureTags,
    refetchCategories,
    refetchTags,
  } = useAdminData()

  useEffect(() => {
    void ensureCategories()
    void ensureTags()
  }, [ensureCategories, ensureTags])

  const loading = !categoriesLoaded || !tagsLoaded

  async function handleCreateCategory(name: string, parentId: string | null) {
    await taxonomyClient.createCategory({
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      name: { en: name },
      description: { en: '' },
      icon: null,
      color: null,
      parentId,
      sortOrder: categories.length,
    })
    await refetchCategories()
  }

  async function handleUpdateCategory(id: string, name: string, parentId: string | null) {
    const existing = categories.find((c) => c.id === id)
    if (!existing) return
    await taxonomyClient.updateCategory(id, {
      slug: existing.slug,
      name: { ...existing.name, en: name },
      description: existing.description,
      icon: existing.icon,
      color: existing.color,
      parentId,
      sortOrder: existing.sortOrder,
    })
    await refetchCategories()
  }

  async function handleDeleteCategory(id: string) {
    await taxonomyClient.deleteCategory(id)
    await refetchCategories()
  }

  async function handleCreateTag(input: TagUpsert) {
    await taxonomyClient.createTag(input)
    await refetchTags()
  }

  async function handleUpdateTag(id: string, input: TagUpsert) {
    await taxonomyClient.updateTag(id, input)
    await refetchTags()
  }

  async function handleDeleteTag(id: string) {
    await taxonomyClient.deleteTag(id)
    await refetchTags()
  }

  return (
    <>
      <AdminPageHeader eyebrow="admin / content" title="Categories & Tags" />

      {loading && !error ? (
        <p className="text-sm text-[#5B5F58] dark:text-[#A2A79C]">Loading…</p>
      ) : error ? (
        <p role="alert" className="text-sm text-[#C23A2E] dark:text-[#FF7A6B]">
          {error}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.65fr_1fr]">
          <AdminPanel title="Categories" hint={`${categories.length} categories`}>
            <CategoryTree
              categories={categories}
              onCreate={handleCreateCategory}
              onUpdate={handleUpdateCategory}
              onDelete={handleDeleteCategory}
            />
          </AdminPanel>
          <AdminPanel title="Tags" hint={`${tags.length} tags`}>
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
