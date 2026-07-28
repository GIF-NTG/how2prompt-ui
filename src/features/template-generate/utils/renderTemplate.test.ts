import { describe, it, expect } from 'vitest'
import { renderTemplate, renderTemplateText, estimateTokens } from './renderTemplate'

describe('renderTemplate', () => {
  it('substitutes a filled placeholder with its value', () => {
    const segments = renderTemplate('Role: {{role}}', { role: 'senior backend engineer' })
    expect(renderTemplateText(segments)).toBe('Role: senior backend engineer')
    expect(segments.find((s) => s.type === 'placeholder')).toMatchObject({
      varKey: 'role',
      filled: true,
      value: 'senior backend engineer',
    })
  })

  it('marks an unfilled placeholder distinctly and keeps the raw {{var}} text', () => {
    const segments = renderTemplate('Role: {{role}}', {})
    const placeholder = segments.find((s) => s.type === 'placeholder')
    expect(placeholder).toMatchObject({ varKey: 'role', filled: false, value: '{{role}}' })
    expect(renderTemplateText(segments)).toBe('Role: {{role}}')
  })

  it('formats a multiselect value by joining with commas', () => {
    const segments = renderTemplate('Tags: {{tags}}', { tags: ['bug', 'urgent', 'backend'] })
    expect(renderTemplateText(segments)).toBe('Tags: bug, urgent, backend')
  })

  it('treats an empty multiselect array as unfilled', () => {
    const segments = renderTemplate('Tags: {{tags}}', { tags: [] })
    expect(segments.find((s) => s.type === 'placeholder')).toMatchObject({ filled: false })
  })

  it('formats a boolean value as its string form', () => {
    const segments = renderTemplate('Strict mode: {{strict}}', { strict: true })
    expect(renderTemplateText(segments)).toBe('Strict mode: true')
  })
})

describe('estimateTokens', () => {
  it('estimates roughly 1.3 tokens per word', () => {
    expect(estimateTokens('one two three four')).toBe(Math.ceil(4 * 1.3))
  })

  it('returns 0 for empty text', () => {
    expect(estimateTokens('')).toBe(0)
  })
})
