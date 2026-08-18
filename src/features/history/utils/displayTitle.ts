import { getI18nValue } from '@/shared/utils/i18n'
import type { HistoryListItem } from '../types'

const MAX_LENGTH = 60

/** The real backend sends neither a per-entry `title` nor a real
 *  `templateTitle` (see project memory `project_templates_pagination_contract_drift`),
 *  so every row falls back to the same generic label and becomes
 *  indistinguishable in the list and in the template filter dropdown. Prefer
 *  the actual per-entry title when the backend does send one, then fall back
 *  to a snippet of the generated prompt instead of the generic placeholder. */
export function getHistoryDisplayTitle(item: HistoryListItem): string {
  if (item.title) return item.title
  if (!item.templateId) return getI18nValue(item.templateTitle)
  const snippet = (item.promptSnippet ?? '')
    .replace(/[*_`#]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!snippet) return getI18nValue(item.templateTitle)
  return snippet.length > MAX_LENGTH ? `${snippet.slice(0, MAX_LENGTH)}…` : snippet
}
