import type { Category } from '../api/taxonomyClient.types'

/** Case-insensitive uniqueness check for a category name among siblings
 *  sharing the same `parentId` (spec.md Clarifications; research.md
 *  Decision 6) — the contract documents no dedicated conflict error code for
 *  this, so it's enforced client-side before submit. `excludeId` lets an edit
 *  compare against every sibling except itself. */
export function checkCategoryNameUnique(
  candidateNameEn: string,
  parentId: string | null,
  existingCategories: Category[],
  excludeId?: string,
): boolean {
  const normalized = candidateNameEn.trim().toLowerCase()
  return !existingCategories.some(
    (category) =>
      category.id !== excludeId &&
      category.parentId === parentId &&
      category.name.en.trim().toLowerCase() === normalized,
  )
}
