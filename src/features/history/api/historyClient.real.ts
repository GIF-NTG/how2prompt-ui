import { apiFetch } from '@/shared/utils/httpClient'
import {
  mapTemplateListItem,
  type RawTemplateListItem,
} from '@/features/home/api/templateClient.real'
import { templateClient } from '@/features/home/api/templateClient'
import type { AiModel } from '@/features/home/types'
import type { HistoryClient } from './historyClient.types'
import type { HistoryDetail, HistoryListItem } from '../types'
import { toRangeEndIso, toRangeStartIso } from '../utils/dateRange'

/** The real backend's history rows reference the AI model by `aiModelId`
 *  (a uuid) — everywhere else in the app (the model filter dropdown,
 *  `getModelLabel`, `getTagColorClasses`) identifies a model by its `code`
 *  (e.g. `"gpt-4o"`) instead. Resolves the id<->code mapping via
 *  `/ai-models` (same catalog `ModelFilter` already fetches), cached
 *  module-wide since it doesn't change within a session, so both the
 *  outgoing filter param and the incoming rows' display code are correct. */
let modelsPromise: Promise<AiModel[]> | null = null
function getModels(): Promise<AiModel[]> {
  if (!modelsPromise) {
    modelsPromise = templateClient.getModels().catch((err: unknown) => {
      modelsPromise = null
      throw err
    })
  }
  return modelsPromise
}

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

function mapHistoryListItem(raw: RawHistoryListItem, codeById: Map<string, string>): HistoryListItem {
  return {
    id: raw.id,
    title: raw.title,
    templateId: raw.templateId,
    templateTitle: raw.templateId
      ? { en: 'Generated prompt', vi: 'Prompt đã tạo' }
      : { en: 'Removed template', vi: 'Mẫu đã bị xoá' },
    aiModelCode: (raw.aiModelId ? codeById.get(raw.aiModelId) : undefined) ?? raw.aiModelId ?? '',
    promptSnippet: raw.finalPromptPreview,
    createdAt: raw.createdAt,
  }
}

function mapHistoryDetail(raw: RawHistoryDetail, codeById: Map<string, string>): HistoryDetail {
  return {
    ...mapHistoryListItem(raw, codeById),
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
    // same as `/templates`'s param names — see templateClient.real.ts). That
    // same live spec confirms `/generated-prompts` recognizes only
    // `templateId`, `aiModelId`, `search`, `cursor`, `limit` — there is no
    // `from`/`to` (or any date-range) param at all, so the backend silently
    // ignores them and returns entries outside the requested range. `from`/
    // `to` are still sent in case the backend adds support later, but the
    // date range is enforced client-side below as the actual fix.
    async list(filters, cursor, size) {
      const models = await getModels()
      const idByCode = new Map(models.map((m) => [m.code, m.id]))
      const codeById = new Map(models.map((m) => [m.id, m.code]))

      const searchParams = new URLSearchParams()
      if (filters.templateId) searchParams.set('templateId', filters.templateId)
      if (filters.model) {
        const aiModelId = idByCode.get(filters.model)
        if (aiModelId) searchParams.set('aiModelId', aiModelId)
      }
      if (filters.from) searchParams.set('from', toRangeStartIso(filters.from))
      if (filters.to) searchParams.set('to', toRangeEndIso(filters.to))
      if (cursor) searchParams.set('cursor', cursor)
      searchParams.set('limit', String(size))
      const page = await apiFetch<CursorPage<RawHistoryListItem>>(
        `/generated-prompts?${searchParams.toString()}`,
        { accessToken },
      )
      let items = page.items.map((raw) => mapHistoryListItem(raw, codeById))
      // `nextCursor`/`hasMore` still reflect the backend's *unfiltered* page,
      // so a "Load more" click can legitimately fetch a page that filters
      // down to zero new visible items if that page happened to fall outside
      // the range — the caller just needs to click again to reach the next
      // backend page.
      if (filters.from) {
        const startIso = toRangeStartIso(filters.from)
        items = items.filter((item) => item.createdAt >= startIso)
      }
      if (filters.to) {
        const endIso = toRangeEndIso(filters.to)
        items = items.filter((item) => item.createdAt <= endIso)
      }
      return { ...page, items }
    },

    async get(id) {
      const [raw, models] = await Promise.all([
        apiFetch<RawHistoryDetail>(`/generated-prompts/${id}`, { accessToken }),
        getModels(),
      ])
      const codeById = new Map(models.map((m) => [m.id, m.code]))
      return mapHistoryDetail(raw, codeById)
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
