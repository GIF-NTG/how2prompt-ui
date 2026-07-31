import { describe, expect, it } from 'vitest'
import { validatePlaceholders } from './validatePlaceholders'

describe('validatePlaceholders', () => {
  it('is valid when every placeholder has a matching declared variable', () => {
    const result = validatePlaceholders('Hello {{name}}, welcome to {{place}}.', [
      { varKey: 'name' },
      { varKey: 'place' },
    ])
    expect(result).toEqual({ isValid: true, missingVarKeys: [] })
  })

  it('flags a placeholder with no matching declared variable', () => {
    const result = validatePlaceholders('Hello {{name}}, welcome to {{place}}.', [
      { varKey: 'name' },
    ])
    expect(result.isValid).toBe(false)
    expect(result.missingVarKeys).toEqual(['place'])
  })

  it('is valid when a declared variable is unused in the prompt body', () => {
    const result = validatePlaceholders('Hello {{name}}.', [
      { varKey: 'name' },
      { varKey: 'unused' },
    ])
    expect(result).toEqual({ isValid: true, missingVarKeys: [] })
  })

  it('is valid for a prompt body with no placeholders at all', () => {
    const result = validatePlaceholders('No placeholders here.', [])
    expect(result).toEqual({ isValid: true, missingVarKeys: [] })
  })
})
