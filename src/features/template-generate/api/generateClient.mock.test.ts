import { describe, expect, it } from 'vitest'
import { createMockGenerateClient } from './generateClient.mock'
import { createMockHistoryClient } from '@/features/history/api/historyClient.mock'

describe('createMockGenerateClient().generate — history auto-save (US2)', () => {
  it('adds a new history entry for a logged-in generate call', async () => {
    const client = createMockGenerateClient('demo-token')
    const historyClient = createMockHistoryClient()
    const before = await historyClient.list({}, 0, 100)

    const result = await client.generate('debug-loi-hieu-qua', {
      aiModelCode: 'gpt-4o',
      inputValues: { role: 'Backend Developer', log: 'boom' },
      extraInstructions: null,
    })

    expect(result.generatedPromptId).toBeTruthy()
    const after = await historyClient.list({}, 0, 100)
    expect(after.meta.totalElements).toBe(before.meta.totalElements + 1)

    const created = await historyClient.get(result.generatedPromptId!)
    expect(created.templateId).toBe('debug-loi-hieu-qua')
    expect(created.aiModelCode).toBe('gpt-4o')
    expect(created.finalPrompt).toBe(result.finalPrompt)
  })

  it('reloading a history entry and generating again creates a new, distinct entry — the original is left unchanged (US3 AC2 / FR-008)', async () => {
    const client = createMockGenerateClient('demo-token')
    const historyClient = createMockHistoryClient()

    // "h1" is a seeded fixture — reload it, then simulate the User editing
    // one field and clicking Generate again.
    const original = await historyClient.get('h1')

    const result = await client.generate(original.templateId!, {
      aiModelCode: original.aiModelCode,
      inputValues: { ...original.inputValues, role: 'Edited role' },
      extraInstructions: original.extraInstructions,
    })

    expect(result.generatedPromptId).toBeTruthy()
    expect(result.generatedPromptId).not.toBe(original.id)

    const stillOriginal = await historyClient.get('h1')
    expect(stillOriginal.inputValues).toEqual(original.inputValues)
    expect(stillOriginal.finalPrompt).toBe(original.finalPrompt)

    const newEntry = await historyClient.get(result.generatedPromptId!)
    expect(newEntry.inputValues.role).toBe('Edited role')
    expect(newEntry.finalPrompt).toBe(result.finalPrompt)
    expect(newEntry.finalPrompt).not.toBe(original.finalPrompt)
  })

  it('adds nothing for a Guest (no accessToken) generate call', async () => {
    const client = createMockGenerateClient(undefined)
    const historyClient = createMockHistoryClient()
    const before = await historyClient.list({}, 0, 100)

    const result = await client.generate('debug-loi-hieu-qua', {
      aiModelCode: 'gpt-4o',
      inputValues: { role: 'Backend Developer', log: 'boom' },
      extraInstructions: null,
    })

    expect(result.generatedPromptId).toBeNull()
    const after = await historyClient.list({}, 0, 100)
    expect(after.meta.totalElements).toBe(before.meta.totalElements)
  })
})
