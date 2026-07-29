import { describe, expect, it } from 'vitest'
import { findMissingPlaceholders, findUnusedVariables } from './validatePlaceholders'
import type { TemplateVariable } from '@/features/admin/api/templatesAdminClient.types'

function makeVariable(varKey: string): TemplateVariable {
  return { varKey, label: { en: varKey }, inputType: 'text' }
}

describe('findMissingPlaceholders', () => {
  it('returns an empty list when every placeholder has a matching variable', () => {
    const result = findMissingPlaceholders('Hello {{name}}, welcome to {{place}}', [
      makeVariable('name'),
      makeVariable('place'),
    ])
    expect(result).toEqual([])
  })

  it('returns the missing placeholder key when no variable is declared for it', () => {
    const result = findMissingPlaceholders('Hello {{name}}, welcome to {{place}}', [makeVariable('name')])
    expect(result).toEqual(['place'])
  })

  it('deduplicates a placeholder repeated multiple times', () => {
    const result = findMissingPlaceholders('{{topic}} ... {{topic}} again', [])
    expect(result).toEqual(['topic'])
  })

  it('returns an empty list when the prompt body has no placeholders', () => {
    expect(findMissingPlaceholders('No placeholders here.', [])).toEqual([])
  })
})

describe('findUnusedVariables', () => {
  it('flags a declared variable with no matching placeholder', () => {
    const result = findUnusedVariables('Hello {{name}}', [makeVariable('name'), makeVariable('unused')])
    expect(result).toEqual(['unused'])
  })

  it('returns an empty list when every variable is used', () => {
    const result = findUnusedVariables('{{a}} {{b}}', [makeVariable('a'), makeVariable('b')])
    expect(result).toEqual([])
  })
})
