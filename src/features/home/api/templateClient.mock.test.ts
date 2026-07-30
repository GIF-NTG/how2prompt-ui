import { describe, expect, it } from 'vitest'
import { createMockTemplateClient } from './templateClient.mock'

describe('createMockTemplateClient().getTemplates', () => {
  it('lists official templates ahead of non-official ones', async () => {
    const client = createMockTemplateClient()
    const { items } = await client.getTemplates({ size: 50 })

    const firstNonOfficialIndex = items.findIndex((t) => !t.isOfficial)
    const lastOfficialIndex = items.map((t) => t.isOfficial).lastIndexOf(true)

    expect(firstNonOfficialIndex).toBeGreaterThan(-1)
    expect(lastOfficialIndex).toBeGreaterThan(-1)
    expect(lastOfficialIndex).toBeLessThan(firstNonOfficialIndex)
  })

  it('paginates by cursor/size and reports hasMore correctly, with no duplicates across pages', async () => {
    const client = createMockTemplateClient()
    const page0 = await client.getTemplates({ size: 2 })
    expect(page0.items).toHaveLength(2)
    expect(page0.hasMore).toBe(true)
    expect(page0.nextCursor).not.toBeNull()

    const page1 = await client.getTemplates({ cursor: page0.nextCursor!, size: 2 })

    const page0Ids = page0.items.map((t) => t.id)
    const page1Ids = page1.items.map((t) => t.id)
    expect(page0Ids.some((id) => page1Ids.includes(id))).toBe(false)
  })

  it('reports hasMore: false and nextCursor: null once every template has been paged through', async () => {
    const client = createMockTemplateClient()
    const lastPage = await client.getTemplates({ size: 50 })
    expect(lastPage.hasMore).toBe(false)
    expect(lastPage.nextCursor).toBeNull()
  })

  it('toggleFavorite flips both directions (US4 — fixes the old POST-only bug)', async () => {
    const client = createMockTemplateClient()
    const { items } = await client.getTemplates({ size: 1 })
    const templateId = items[0].id

    const favorited = await client.toggleFavorite(templateId, false)
    expect(favorited.isFavorited).toBe(true)

    const unfavorited = await client.toggleFavorite(templateId, true)
    expect(unfavorited.isFavorited).toBe(false)
  })

  it('orders differently for "popular" vs "newest", both still official-first', async () => {
    const client = createMockTemplateClient()
    const popular = await client.getTemplates({ sort: 'popular', size: 50 })
    const newest = await client.getTemplates({ sort: 'newest', size: 50 })

    expect(popular.items.map((t) => t.id)).not.toEqual(newest.items.map((t) => t.id))

    for (const { items } of [popular, newest]) {
      const firstNonOfficialIndex = items.findIndex((t) => !t.isOfficial)
      const lastOfficialIndex = items.map((t) => t.isOfficial).lastIndexOf(true)
      expect(lastOfficialIndex).toBeLessThan(firstNonOfficialIndex)
    }
  })
})
