import { apiFetch } from '@/shared/utils/httpClient'
import {
  mapTemplateListItem,
  type RawTemplateListItem,
} from '@/features/home/api/templateClient.real'
import type { HistoryClient } from './historyClient.types'
import type { HistoryDetail, HistoryListItem } from '../types'

/** Same cursor-based pagination drift as `/templates` (see project memory
 *  `project_templates_pagination_contract_drift`) — the real backend returns
 *  `{ items, nextCursor, hasMore }` here too, not the page-based `{ data, meta }`
 *  envelope `docs/api/openapi.yaml` documents. */
interface CursorPage<T> {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
}

/** The real backend's `GeneratedPromptListItem` diverges from
 *  `docs/api/openapi.yaml` far more than a field rename: it doesn't send a
 *  denormalized `templateTitle` at all, uses `aiModelId` (a uuid) instead of
 *  `aiModelCode`, and `finalPromptPreview` instead of `promptSnippet` — see
 *  project memory `project_templates_pagination_contract_drift`. There's no
 *  template title to fall back on short of an extra `GET /templates/{id}`
 *  call per row, so `mapHistoryListItem` below substitutes a generic label
 *  instead of fabricating one. */
interface RawHistoryListItem {
  id: string
  title: string | null
  templateId: string | null
  aiModelId: string | null
  finalPromptPreview: string
  createdAt: string
}

interface RawHistoryDetail extends RawHistoryListItem {
  templateVersionId: string | null
  inputValues: Record<string, unknown>
  extraInstructions: string | null
  finalPrompt: string
}

function mapHistoryListItem(raw: RawHistoryListItem): HistoryListItem {
  return {
    id: raw.id,
    title: raw.title,
    templateId: raw.templateId,
    templateTitle: raw.templateId
      ? { en: 'Generated prompt', vi: 'Prompt đã tạo' }
      : { en: 'Removed template', vi: 'Mẫu đã bị xoá' },
    aiModelCode: raw.aiModelId ?? '',
    promptSnippet: raw.finalPromptPreview,
    createdAt: raw.createdAt,
  }
}

function mapHistoryDetail(raw: RawHistoryDetail): HistoryDetail {
  return {
    ...mapHistoryListItem(raw),
    templateVersionId: raw.templateVersionId,
    inputValues: raw.inputValues,
    extraInstructions: raw.extraInstructions,
    finalPrompt: raw.finalPrompt,
  }
}

export function createRealHistoryClient(accessToken?: string): HistoryClient {
  return {
    // `limit`, not `size` — verified against the real backend's live
    // `/v3/api-docs` (`docs/api/openapi.yaml` in this repo is stale here,
    // same as `/templates`'s param names — see templateClient.real.ts).
    async list(filters, cursor, size) {
      const searchParams = new URLSearchParams()
      if (filters.templateId) searchParams.set('templateId', filters.templateId)
      if (filters.model) searchParams.set('model', filters.model)
      if (filters.from) searchParams.set('from', filters.from)
      if (filters.to) searchParams.set('to', filters.to)
      if (cursor) searchParams.set('cursor', cursor)
      searchParams.set('limit', String(size))
      const page = await apiFetch<CursorPage<RawHistoryListItem>>(
        `/generated-prompts?${searchParams.toString()}`,
        { accessToken },
      )
      return { ...page, items: page.items.map(mapHistoryListItem) }
    },

    async get(id) {
      const raw = await apiFetch<RawHistoryDetail>(`/generated-prompts/${id}`, { accessToken })
      return mapHistoryDetail(raw)
    },

    async remove(id) {
      await apiFetch<void>(`/generated-prompts/${id}`, { method: 'DELETE', accessToken })
    },

    async listFavorites(cursor, size) {
      const searchParams = new URLSearchParams()
      if (cursor) searchParams.set('cursor', cursor)
      searchParams.set('size', String(size))
      const page = await apiFetch<CursorPage<RawTemplateListItem>>(
        `/favorites?${searchParams.toString()}`,
        { accessToken },
      )
      return { ...page, items: page.items.map(mapTemplateListItem) }
    },
  }
}
