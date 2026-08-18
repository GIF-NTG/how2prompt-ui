import { afterEach, describe, expect, it, vi } from 'vitest'
import { createRealHistoryClient } from './historyClient.real'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('createRealHistoryClient().get', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // Regression test: the real backend's GET /generated-prompts/{id} omits
  // `finalPromptPreview` entirely (only the list endpoint sends it) — this
  // used to leave `promptSnippet` `undefined`, which crashed
  // `getHistoryDisplayTitle`'s `.trim()` call and blanked the Regenerate page.
  it('derives promptSnippet from finalPrompt when the backend omits finalPromptPreview', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/ai-models')) {
        return Promise.resolve(jsonResponse([]))
      }
      return Promise.resolve(
        jsonResponse({
          data: {
            id: 'gp1',
            title: null,
            templateId: 't1',
            templateVersionId: 'v1',
            aiModelId: null,
            inputValues: { role: 'Backend Developer' },
            extraInstructions: null,
            finalPrompt: 'A very long final prompt that should be truncated into a snippet.',
            createdAt: '2026-08-18T15:03:53.034668Z',
          },
        }),
      )
    })
    vi.stubGlobal('fetch', fetchMock)

    const client = createRealHistoryClient(undefined)
    const detail = await client.get('gp1')

    expect(detail.promptSnippet).toBe(
      'A very long final prompt that should be truncated into a snippet.',
    )
    expect(() => detail.promptSnippet.trim()).not.toThrow()
  })
})
