import { describe, expect, it } from 'vitest'
import { createMockHistoryClient } from './historyClient.mock'

describe('createMockHistoryClient().list', () => {
  it('sorts by createdAt descending', async () => {
    const client = createMockHistoryClient()
    const { items } = await client.list({}, null, 50)
    const dates = items.map((d) => d.createdAt)
    const sorted = [...dates].sort().reverse()
    expect(dates).toEqual(sorted)
  })

  it('paginates by cursor/size and reports hasMore correctly, with no duplicates across pages', async () => {
    const client = createMockHistoryClient()
    const page0 = await client.list({}, null, 5)
    expect(page0.items).toHaveLength(5)
    expect(page0.hasMore).toBe(true)
    expect(page0.nextCursor).not.toBeNull()

    const page1 = await client.list({}, page0.nextCursor, 5)
    const page0Ids = page0.items.map((d) => d.id)
    const page1Ids = page1.items.map((d) => d.id)
    expect(page0Ids.some((id) => page1Ids.includes(id))).toBe(false)
  })

  it('reports hasMore: false and nextCursor: null once every entry has been paged through', async () => {
    const client = createMockHistoryClient()
    const lastPage = await client.list({}, null, 50)
    expect(lastPage.hasMore).toBe(false)
    expect(lastPage.nextCursor).toBeNull()
  })

  it('filters by templateId', async () => {
    const client = createMockHistoryClient()
    const all = await client.list({}, null, 50)
    const target = all.items.find((d) => d.templateId)!.templateId!

    const filtered = await client.list({ templateId: target }, null, 50)
    expect(filtered.items.length).toBeGreaterThan(0)
    for (const item of filtered.items) {
      expect(item.templateId).toBe(target)
    }
  })

  it('filters by model', async () => {
    const client = createMockHistoryClient()
    const filtered = await client.list({ model: 'gpt-4o' }, null, 50)
    expect(filtered.items.length).toBeGreaterThan(0)
    for (const item of filtered.items) {
      expect(item.aiModelCode).toBe('gpt-4o')
    }
  })

  it('filters by date range', async () => {
    const client = createMockHistoryClient()
    const all = await client.list({}, null, 50)
    const midpoint = [...all.items].sort((a, b) => a.createdAt.localeCompare(b.createdAt))[
      Math.floor(all.items.length / 2)
    ].createdAt

    const filtered = await client.list({ from: midpoint }, null, 50)
    for (const item of filtered.items) {
      expect(item.createdAt >= midpoint).toBe(true)
    }
  })

  it('returns an empty-filtered result distinct from empty history when nothing matches', async () => {
    const client = createMockHistoryClient()
    const filtered = await client.list({ model: 'no-such-model' }, null, 50)
    expect(filtered.items).toHaveLength(0)
    expect(filtered.hasMore).toBe(false)
  })
})

describe('createMockHistoryClient().get', () => {
  it('returns full detail including inputValues and finalPrompt', async () => {
    const client = createMockHistoryClient()
    const { items } = await client.list({}, null, 1)
    const detail = await client.get(items[0].id)
    expect(detail.id).toBe(items[0].id)
    expect(detail.finalPrompt).toBeTruthy()
    expect(detail.inputValues).toBeTruthy()
  })

  it('exposes at least one entry with a deleted template (templateId: null)', async () => {
    const client = createMockHistoryClient()
    const { items } = await client.list({}, null, 50)
    expect(items.some((d) => d.templateId === null)).toBe(true)
  })

  it('throws NOT_FOUND for an unknown id', async () => {
    const client = createMockHistoryClient()
    await expect(client.get('does-not-exist')).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })
})

describe('createMockHistoryClient().remove', () => {
  it('soft-deletes an entry — it no longer appears in a subsequent list() call', async () => {
    const client = createMockHistoryClient()
    const before = await client.list({}, null, 50)
    expect(before.items.some((d) => d.id === 'h4')).toBe(true)

    await client.remove('h4')

    const after = await client.list({}, null, 50)
    expect(after.items.some((d) => d.id === 'h4')).toBe(false)
    expect(after.items.length).toBe(before.items.length - 1)
    await expect(client.get('h4')).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('is a no-op for an already-removed id (treated as already-deleted, not an error)', async () => {
    const client = createMockHistoryClient()
    await expect(client.remove('does-not-exist')).resolves.toBeUndefined()
  })
})
