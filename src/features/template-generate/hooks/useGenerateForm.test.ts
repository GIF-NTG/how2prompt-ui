import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useGenerateForm } from './useGenerateForm'
import type { TemplateDetail } from '@/features/template-detail/types'

const TEMPLATE: TemplateDetail = {
  id: 't1',
  slug: 'demo',
  title: { en: 'Demo' },
  description: { en: 'Demo' },
  coverImage: null,
  isOfficial: true,
  author: { id: null, fullName: null, username: null, avatarUrl: null, type: 'admin' },
  categories: [],
  supportedModels: ['gpt-4o', 'claude'],
  usageCount: 0,
  favoriteCount: 0,
  isFavorited: false,
  viewCount: 0,
  createdAt: '2026-01-01T00:00:00Z',
  currentVersion: {
    id: 'ver-1',
    version: 1,
    promptBody: '{{role}}',
    guide: { en: '' },
    exampleOutput: { en: '' },
    variables: [
      {
        id: 'v1',
        varKey: 'role',
        label: { en: 'Role' },
        description: { en: '' },
        placeholder: { en: '' },
        helpText: { en: '' },
        inputType: 'text',
        isRequired: true,
        defaultValue: 'Default role',
        options: [],
        validation: {},
        sortOrder: 1,
      },
    ],
    variants: [],
  },
}

describe('useGenerateForm', () => {
  it('seeds from the template defaults when no override is given', () => {
    const { result } = renderHook(() => useGenerateForm(TEMPLATE))
    expect(result.current.state.selectedModelCode).toBe('gpt-4o')
    expect(result.current.state.inputValues.role).toBe('Default role')
    expect(result.current.state.extraInstructions).toBe('')
  })

  it('seeds from the override when one is given (US3 reload)', () => {
    const { result } = renderHook(() =>
      useGenerateForm(TEMPLATE, {
        modelCode: 'claude',
        inputValues: { role: 'Backend Developer' },
        extraInstructions: 'Prioritize security',
      }),
    )
    expect(result.current.state.selectedModelCode).toBe('claude')
    expect(result.current.state.inputValues.role).toBe('Backend Developer')
    expect(result.current.state.extraInstructions).toBe('Prioritize security')
  })
})
