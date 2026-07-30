import type { TemplateVariable } from '@/features/admin/api/templatesAdminClient.types'

// Mirrors the placeholder syntax already parsed client-side by
// src/features/template-generate/utils/renderTemplate.ts, so authoring-time
// validation matches what the generation-time renderer actually recognizes.
const PLACEHOLDER_PATTERN = /\{\{(\w+)\}\}/g

function extractPlaceholders(promptBody: string): string[] {
  const keys = new Set<string>()
  const regex = new RegExp(PLACEHOLDER_PATTERN)
  let match: RegExpExecArray | null
  while ((match = regex.exec(promptBody)) !== null) {
    keys.add(match[1])
  }
  return [...keys]
}

/** Every `{{varKey}}` in `promptBody` that has no matching declared variable
 *  (FR-011) — mirrors the backend's authoritative publish-time check
 *  (contracts/admin-api.md's 422 response); this is a client-side pre-check for
 *  immediate feedback, not a replacement for it. */
export function findMissingPlaceholders(
  promptBody: string,
  variables: TemplateVariable[],
): string[] {
  const declaredKeys = new Set(variables.map((v) => v.varKey))
  return extractPlaceholders(promptBody).filter((key) => !declaredKeys.has(key))
}

/** Declared variables with no matching `{{placeholder}}` in the prompt body — not a
 *  publish blocker, but useful to surface as an authoring hint. */
export function findUnusedVariables(promptBody: string, variables: TemplateVariable[]): string[] {
  const usedKeys = new Set(extractPlaceholders(promptBody))
  return variables.map((v) => v.varKey).filter((key) => !usedKeys.has(key))
}
