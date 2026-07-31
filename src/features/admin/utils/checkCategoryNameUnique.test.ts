import { describe, expect, it } from 'vitest'
import { checkCategoryNameUnique } from './checkCategoryNameUnique'
import type { Category } from '../api/taxonomyClient.types'

function makeCategory(overrides: Partial<Category>): Category {
  return {
    id: 'c1',
    slug: 'slug',
    name: { en: 'Name' },
    description: { en: '' },
    icon: null,
    color: null,
    parentId: null,
    sortOrder: 0,
    templateCount: 0,
    ...overrides,
  }
}

describe('checkCategoryNameUnique', () => {
  it('passes for a name with no existing sibling', () => {
    expect(checkCategoryNameUnique('Marketing', null, [])).toBe(true)
  })

  it('rejects a case-insensitive duplicate under the same parent', () => {
    const existing = [makeCategory({ id: 'c1', name: { en: 'Marketing' }, parentId: null })]
    expect(checkCategoryNameUnique('marketing', null, existing)).toBe(false)
    expect(checkCategoryNameUnique('MARKETING', null, existing)).toBe(false)
  })

  it('passes for the same name under a different parent', () => {
    const existing = [makeCategory({ id: 'c1', name: { en: 'Marketing' }, parentId: 'p1' })]
    expect(checkCategoryNameUnique('Marketing', 'p2', existing)).toBe(true)
    expect(checkCategoryNameUnique('Marketing', null, existing)).toBe(true)
  })

  it('excludes the category being edited from the comparison', () => {
    const existing = [makeCategory({ id: 'c1', name: { en: 'Marketing' }, parentId: null })]
    expect(checkCategoryNameUnique('Marketing', null, existing, 'c1')).toBe(true)
  })
})
