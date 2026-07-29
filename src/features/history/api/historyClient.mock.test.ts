import { describe, expect, it } from 'vitest'
import { createMockHistoryClient } from './historyClient.mock'

describe('createMockHistoryClient().list', () => {
  it('sorts by createdAt descending', async () => {
    const client = createMockHistoryClient()
    const { data } = await client.list({}, 0, 50)
    const dates = data.map((d) => d.createdAt)
    const sorted = [...dates].sort().reverse()
    expect(dates).toEqual(sorted)
  })

  it('paginates by page/size and reports hasNext correctly', async () => {
    const client = createMockHistoryClient()
    const page0 = await client.list({}, 0, 5)
    expect(page0.data).toHaveLength(5)
    expect(page0.meta).toMatchObject({ page: 0, size: 5, hasPrevious: false })
    expect(page0.meta.hasNext).toBe(true)

    const page1 = await client.list({}, 1, 5)
    const page0Ids = page0.data.map((d) => d.id)
    const page1Ids = page1.data.map((d) => d.id)
    expect(page0Ids.some((id) => page1Ids.includes(id))).toBe(false)
  })

  it('filters by templateId', async () => {
    const client = createMockHistoryClient()
    const all = await client.list({}, 0, 50)
    const target = all.data.find((d) => d.templateId)!.templateId!

    const filtered = await client.list({ templateId: target }, 0, 50)
    expect(filtered.data.length).toBeGreaterThan(0)
    for (const item of filtered.data) {
      expect(item.templateId).toBe(target)
    }
  })

  it('filters by model', async () => {
    const client = createMockHistoryClient()
    const filtered = await client.list({ model: 'gpt-4o' }, 0, 50)
    expect(filtered.data.length).toBeGreaterThan(0)
    for (const item of filtered.data) {
      expect(item.aiModelCode).toBe('gpt-4o')
    }
  })

  it('filters by date range', async () => {
    const client = createMockHistoryClient()
    const all = await client.list({}, 0, 50)
    const midpoint = [...all.data].sort((a, b) => a.createdAt.localeCompare(b.createdAt))[
      Math.floor(all.data.length / 2)
    ].createdAt

    const filtered = await client.list({ from: midpoint }, 0, 50)
    for (const item of filtered.data) {
      expect(item.createdAt >= midpoint).toBe(true)
    }
  })

  it('returns an empty-filtered result distinct from empty history when nothing matches', async () => {
    const client = createMockHistoryClient()
    const filtered = await client.list({ model: 'no-such-model' }, 0, 50)
    expect(filtered.data).toHaveLength(0)
    expect(filtered.meta.totalElements).toBe(0)
  })
})

describe('createMockHistoryClient().get', () => {
  it('returns full detail including inputValues and finalPrompt', async () => {
    const client = createMockHistoryClient()
    const { data } = await client.list({}, 0, 1)
    const detail = await client.get(data[0].id)
    expect(detail.id).toBe(data[0].id)
    expect(detail.finalPrompt).toBeTruthy()
    expect(detail.inputValues).toBeTruthy()
  })

  it('exposes at least one entry with a deleted template (templateId: null)', async () => {
    const client = createMockHistoryClient()
    const { data } = await client.list({}, 0, 50)
    expect(data.some((d) => d.templateId === null)).toBe(true)
  })

  it('throws NOT_FOUND for an unknown id', async () => {
    const client = createMockHistoryClient()
    await expect(client.get('does-not-exist')).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })
})

describe('createMockHistoryClient().remove', () => {
  it('soft-deletes an entry — it no longer appears in a subsequent list() call', async () => {
    const client = createMockHistoryClient()
    const before = await client.list({}, 0, 50)
    expect(before.data.some((d) => d.id === 'h4')).toBe(true)

    await client.remove('h4')

    const after = await client.list({}, 0, 50)
    expect(after.data.some((d) => d.id === 'h4')).toBe(false)
    expect(after.meta.totalElements).toBe(before.meta.totalElements - 1)
    await expect(client.get('h4')).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('is a no-op for an already-removed id (treated as already-deleted, not an error)', async () => {
    const client = createMockHistoryClient()
    await expect(client.remove('does-not-exist')).resolves.toBeUndefined()
  })
})
