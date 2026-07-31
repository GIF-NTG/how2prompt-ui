import type { TemplateVariable } from '@/features/template-generate/types'

const PLACEHOLDER_PATTERN = /\{\{(\w+)\}\}/g

export interface PlaceholderValidationResult {
  isValid: boolean
  /** `{{varKey}}` tokens in `promptBody` with no matching declared variable. */
  missingVarKeys: string[]
}

/** FR-011: every `{{varKey}}` in `promptBody` must have a matching declared
 *  variable before publish is allowed. Mirrors the placeholder-parsing regex
 *  already used by `src/features/template-generate/utils/renderTemplate.ts`. */
export function validatePlaceholders(
  promptBody: string,
  variables: Pick<TemplateVariable, 'varKey'>[],
): PlaceholderValidationResult {
  const declaredKeys = new Set(variables.map((v) => v.varKey))
  const foundKeys = new Set<string>()
  const regex = PLACEHOLDER_PATTERN
  regex.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = regex.exec(promptBody)) !== null) {
    foundKeys.add(match[1])
  }

  const missingVarKeys = [...foundKeys].filter((key) => !declaredKeys.has(key))
  return { isValid: missingVarKeys.length === 0, missingVarKeys }
}
