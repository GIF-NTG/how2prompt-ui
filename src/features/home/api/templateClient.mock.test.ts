import { describe, expect, it } from 'vitest'
import { createMockTemplateClient } from './templateClient.mock'

describe('createMockTemplateClient().getTemplates', () => {
  it('lists official templates ahead of non-official ones', async () => {
    const client = createMockTemplateClient()
    const { data } = await client.getTemplates({ size: 50 })

    const firstNonOfficialIndex = data.findIndex((t) => !t.is_official)
    const lastOfficialIndex = data.map((t) => t.is_official).lastIndexOf(true)

    expect(firstNonOfficialIndex).toBeGreaterThan(-1)
    expect(lastOfficialIndex).toBeGreaterThan(-1)
    expect(lastOfficialIndex).toBeLessThan(firstNonOfficialIndex)
  })

  it('paginates by page/size and reports hasNext correctly, with no duplicates across pages', async () => {
    const client = createMockTemplateClient()
    const page0 = await client.getTemplates({ page: 0, size: 2 })
    expect(page0.data).toHaveLength(2)
    expect(page0.meta).toMatchObject({ page: 0, size: 2, hasPrevious: false })
    expect(page0.meta.hasNext).toBe(true)

    const page1 = await client.getTemplates({ page: 1, size: 2 })
    expect(page1.meta).toMatchObject({ page: 1, size: 2, hasPrevious: true })

    const page0Ids = page0.data.map((t) => t.id)
    const page1Ids = page1.data.map((t) => t.id)
    expect(page0Ids.some((id) => page1Ids.includes(id))).toBe(false)
  })

  it('reports hasNext: false once every template has been paged through', async () => {
    const client = createMockTemplateClient()
    const { meta } = await client.getTemplates({ size: 50 })
    const lastPage = await client.getTemplates({ page: meta.totalPages - 1, size: 50 })
    expect(lastPage.meta.hasNext).toBe(false)
  })

  it('orders differently for "popular" vs "newest", both still official-first', async () => {
    const client = createMockTemplateClient()
    const popular = await client.getTemplates({ sort: 'popular', size: 50 })
    const newest = await client.getTemplates({ sort: 'newest', size: 50 })

    expect(popular.data.map((t) => t.id)).not.toEqual(newest.data.map((t) => t.id))

    for (const { data } of [popular, newest]) {
      const firstNonOfficialIndex = data.findIndex((t) => !t.is_official)
      const lastOfficialIndex = data.map((t) => t.is_official).lastIndexOf(true)
      expect(lastOfficialIndex).toBeLessThan(firstNonOfficialIndex)
    }
  })
})
