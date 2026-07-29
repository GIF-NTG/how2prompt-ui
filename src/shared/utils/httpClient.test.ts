import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiFetch, ApiError } from './httpClient'

function mockFetchOnce(status: number, body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      status,
      ok: status >= 200 && status < 300,
      text: async () => (body === undefined ? '' : JSON.stringify(body)),
    }),
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('apiFetch response unwrapping', () => {
  it('returns a bare array as-is (list endpoints per openapi.yaml are not envelope-wrapped)', async () => {
    mockFetchOnce(200, [{ id: '1' }, { id: '2' }])
    const result = await apiFetch<{ id: string }[]>('/ai-models')
    expect(result).toEqual([{ id: '1' }, { id: '2' }])
  })

  it('returns an empty bare array as an empty array, not undefined', async () => {
    mockFetchOnce(200, [])
    const result = await apiFetch<unknown[]>('/ai-models')
    expect(result).toEqual([])
  })

  it('unwraps the { data, meta } envelope for wrapped endpoints', async () => {
    mockFetchOnce(200, { data: [{ id: '1' }], meta: { page: 0 } })
    const result = await apiFetch<{ id: string }[]>('/templates')
    expect(result).toEqual([{ id: '1' }])
  })

  it('unwraps a single-object envelope', async () => {
    mockFetchOnce(200, { data: { id: 'u1', email: 'a@b.com' } })
    const result = await apiFetch<{ id: string; email: string }>('/users/me')
    expect(result).toEqual({ id: 'u1', email: 'a@b.com' })
  })

  it('returns undefined for a 204 No Content response', async () => {
    mockFetchOnce(204, undefined)
    const result = await apiFetch<void>('/auth/logout', { method: 'POST' })
    expect(result).toBeUndefined()
  })

  it('throws ApiError with the backend error envelope on a non-ok response', async () => {
    mockFetchOnce(401, { error: { code: 'UNAUTHORIZED', message: 'no token' } })
    await expect(apiFetch('/users/me')).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      status: 401,
    })
    await expect(apiFetch('/users/me')).rejects.toBeInstanceOf(ApiError)
  })
})
