import type { I18nString } from '@/shared/types/api'

export interface HistoryListItem {
  id: string
  title: string | null
  templateId: string | null
  templateTitle: I18nString
  aiModelCode: string
  promptSnippet: string
  createdAt: string
}

export interface HistoryDetail extends HistoryListItem {
  templateVersionId: string | null
  inputValues: Record<string, unknown>
  extraInstructions: string | null
  finalPrompt: string
}

export interface HistoryFilters {
  templateId: string
  model: string
  from: string
  to: string
}
