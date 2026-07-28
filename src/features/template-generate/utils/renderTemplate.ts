export type PromptSegment =
  | { type: 'text'; value: string }
  | { type: 'placeholder'; varKey: string; value: string; filled: boolean }

function formatValue(value: string | number | boolean | string[]): string {
  if (Array.isArray(value)) {
    return value.join(', ')
  }
  return String(value)
}

function isEmpty(value: string | number | boolean | string[] | undefined): boolean {
  if (value === undefined || value === null || value === '') {
    return true
  }
  return Array.isArray(value) && value.length === 0
}

const PLACEHOLDER_PATTERN = /\{\{(\w+)\}\}/g

/** Substitutes `{{varKey}}` in `promptBody` with `inputValues`, pure and React-free
 *  so it can drive both the live preview and its unit tests without rendering. */
export function renderTemplate(
  promptBody: string,
  inputValues: Record<string, string | number | boolean | string[]>,
): PromptSegment[] {
  const segments: PromptSegment[] = []
  const regex = PLACEHOLDER_PATTERN
  regex.lastIndex = 0
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(promptBody)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: promptBody.slice(lastIndex, match.index) })
    }
    const varKey = match[1]
    const raw = inputValues[varKey]
    const filled = !isEmpty(raw)
    segments.push({
      type: 'placeholder',
      varKey,
      value: filled ? formatValue(raw) : match[0],
      filled,
    })
    lastIndex = regex.lastIndex
  }

  if (lastIndex < promptBody.length) {
    segments.push({ type: 'text', value: promptBody.slice(lastIndex) })
  }

  return segments
}

export function renderTemplateText(segments: PromptSegment[]): string {
  return segments.map((segment) => segment.value).join('')
}

export function estimateTokens(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean)
  return Math.ceil(words.length * 1.3)
}
