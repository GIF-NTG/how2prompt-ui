import { ApiError } from '@/shared/utils/httpClient'
import type { HistoryClient } from './historyClient.types'
import type { HistoryDetail, HistoryListItem } from '../types'
import { MOCK_TEMPLATES, favorites } from '@/features/home/api/templateClient.mock'

function toListItem(entry: HistoryDetail): HistoryListItem {
  return {
    id: entry.id,
    title: entry.title,
    templateId: entry.templateId,
    templateTitle: entry.templateTitle,
    aiModelCode: entry.aiModelCode,
    promptSnippet: entry.promptSnippet,
    createdAt: entry.createdAt,
  }
}

/** Mock `templateId`s are the *slugs* already used by
 *  `templateDetailClient.mock.ts`'s slug-keyed map, not the numeric-looking
 *  `t1`/`t2` ids from `templateClient.mock.ts` — this mirrors how "Re-run"
 *  navigates to `/templates/:slug` in this app (the real backend's
 *  `/templates/{id}` contract takes a real uuid instead; the mock and real
 *  clients each stay internally consistent with their own template store). */
const TEMPLATE_SLUGS = {
  debug: 'debug-loi-hieu-qua',
  rewrite: 'sua-van-phong-noi-dung',
  marketing: 'mo-ta-san-pham-marketing',
  codeReview: 'kiem-tra-code-review',
  meeting: 'tom-tat-cuoc-hop',
} as const

function daysAgo(days: number): string {
  const d = new Date('2026-07-29T09:00:00Z')
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString()
}

const store: HistoryDetail[] = [
  {
    id: 'h1',
    title: null,
    templateId: TEMPLATE_SLUGS.debug,
    templateTitle: { en: 'Debug effectively', vi: 'Debug lỗi hiệu quả' },
    aiModelCode: 'gpt-4o',
    promptSnippet: 'As a Backend Developer, debug the following log...',
    createdAt: daysAgo(0),
    templateVersionId: 'ver-t1-1',
    inputValues: { role: 'Backend Developer', log: 'TypeError: Cannot read property...' },
    extraInstructions: null,
    finalPrompt:
      'As a Backend Developer, debug the following log:\n\nTypeError: Cannot read property...',
  },
  {
    id: 'h2',
    title: null,
    // Deleted template — FR-009: reload must be blocked, prompt text must
    // still be viewable.
    templateId: null,
    templateTitle: { en: 'Removed template', vi: 'Mẫu đã bị xoá' },
    aiModelCode: 'claude',
    promptSnippet: 'This is a prompt generated from a template that no longer exists...',
    createdAt: daysAgo(1),
    templateVersionId: null,
    inputValues: { role: 'QA Engineer', log: '500 Internal Server Error' },
    extraInstructions: 'Prioritize race condition analysis',
    finalPrompt:
      'This is a prompt generated from a template that no longer exists, but the content is still saved for you to view/copy.',
  },
  {
    id: 'h3',
    title: null,
    // References an older version than the template's current one
    // ('ver-t1-1') — FR-010: must show a "newer version available" badge.
    templateId: TEMPLATE_SLUGS.debug,
    templateTitle: { en: 'Debug effectively', vi: 'Debug lỗi hiệu quả' },
    aiModelCode: 'claude',
    promptSnippet: 'Role: Frontend Developer\n\nDebug the following log...',
    createdAt: daysAgo(2),
    templateVersionId: 'ver-t1-0',
    inputValues: { role: 'Frontend Developer', log: 'Uncaught ReferenceError' },
    extraInstructions: null,
    finalPrompt: 'Role: Frontend Developer\n\nDebug the following log:\n\nUncaught ReferenceError',
  },
  {
    id: 'h4',
    title: null,
    templateId: TEMPLATE_SLUGS.rewrite,
    templateTitle: { en: 'Rewrite content style', vi: 'Sửa văn phong nội dung' },
    aiModelCode: 'gpt-4o',
    promptSnippet: 'Rewrite the following paragraph in a professional tone...',
    createdAt: daysAgo(3),
    templateVersionId: 'ver-t2-1',
    inputValues: { content: 'This product is pretty good.', tone: 'chuyen-nghiep', length: 150 },
    extraInstructions: null,
    finalPrompt: 'Rewrite the following paragraph in a professional tone, about 150 words long...',
  },
  {
    id: 'h5',
    title: null,
    templateId: TEMPLATE_SLUGS.marketing,
    templateTitle: { en: 'Marketing product description', vi: 'Mô tả sản phẩm marketing' },
    aiModelCode: 'gemini',
    promptSnippet: 'Write a product description for SmartWatch X1...',
    createdAt: daysAgo(4),
    templateVersionId: 'ver-t3-1',
    inputValues: {
      productName: 'SmartWatch X1',
      features: 'GPS, heart rate monitor',
      audience: 'Young professionals',
    },
    extraInstructions: null,
    finalPrompt:
      'Write a product description for SmartWatch X1, highlighting these features: GPS, heart rate monitor...',
  },
  {
    id: 'h6',
    title: null,
    templateId: TEMPLATE_SLUGS.codeReview,
    templateTitle: { en: 'Code review checklist', vi: 'Kiểm tra code review' },
    aiModelCode: 'claude',
    promptSnippet: 'Review the following diff against a security and performance checklist...',
    createdAt: daysAgo(5),
    templateVersionId: 'ver-t4-1',
    inputValues: { diff: '+ const user = req.user;', strictness: 'strict' },
    extraInstructions: null,
    finalPrompt:
      'Review the following diff against a security and performance checklist:\n\n+ const user = req.user;',
  },
  {
    id: 'h7',
    title: null,
    templateId: TEMPLATE_SLUGS.meeting,
    templateTitle: { en: 'Summarize meeting notes', vi: 'Tóm tắt cuộc họp' },
    aiModelCode: 'gpt-4o',
    promptSnippet: 'Summarize the following meeting notes into key points...',
    createdAt: daysAgo(6),
    templateVersionId: 'ver-t5-1',
    inputValues: { notes: "Sprint planning meeting, finalize this week's scope." },
    extraInstructions: null,
    finalPrompt: 'Summarize the following meeting notes into key points and action items...',
  },
]

// Fill out to 20+ entries (FR-006/SC-001 pagination) by cycling the above
// templates/models across further days.
const CYCLE_TEMPLATES = [
  TEMPLATE_SLUGS.debug,
  TEMPLATE_SLUGS.rewrite,
  TEMPLATE_SLUGS.marketing,
  TEMPLATE_SLUGS.codeReview,
  TEMPLATE_SLUGS.meeting,
]
const CYCLE_TITLES: Record<string, HistoryDetail['templateTitle']> = {
  [TEMPLATE_SLUGS.debug]: { en: 'Debug effectively', vi: 'Debug lỗi hiệu quả' },
  [TEMPLATE_SLUGS.rewrite]: { en: 'Rewrite content style', vi: 'Sửa văn phong nội dung' },
  [TEMPLATE_SLUGS.marketing]: {
    en: 'Marketing product description',
    vi: 'Mô tả sản phẩm marketing',
  },
  [TEMPLATE_SLUGS.codeReview]: { en: 'Code review checklist', vi: 'Kiểm tra code review' },
  [TEMPLATE_SLUGS.meeting]: { en: 'Summarize meeting notes', vi: 'Tóm tắt cuộc họp' },
}
const CYCLE_VERSION_IDS: Record<string, string> = {
  [TEMPLATE_SLUGS.debug]: 'ver-t1-1',
  [TEMPLATE_SLUGS.rewrite]: 'ver-t2-1',
  [TEMPLATE_SLUGS.marketing]: 'ver-t3-1',
  [TEMPLATE_SLUGS.codeReview]: 'ver-t4-1',
  [TEMPLATE_SLUGS.meeting]: 'ver-t5-1',
}
const CYCLE_MODELS = ['gpt-4o', 'claude', 'gemini']

for (let i = 0; i < 15; i++) {
  const slug = CYCLE_TEMPLATES[i % CYCLE_TEMPLATES.length]
  store.push({
    id: `h${8 + i}`,
    title: null,
    templateId: slug,
    templateTitle: CYCLE_TITLES[slug],
    aiModelCode: CYCLE_MODELS[i % CYCLE_MODELS.length],
    promptSnippet: `Generated prompt #${8 + i}...`,
    createdAt: daysAgo(7 + i),
    templateVersionId: CYCLE_VERSION_IDS[slug],
    inputValues: { note: `filler #${i}` },
    extraInstructions: null,
    finalPrompt: `Full prompt content for history item #${8 + i}.`,
  })
}

/** Called by `generateClient.mock.ts` (US2) right after a successful
 *  logged-in generation so the mock environment demonstrates the same
 *  auto-save behavior the real backend already provides. */
export function recordGeneratedPrompt(entry: HistoryDetail): void {
  store.unshift(entry)
}

function matchesFilters(
  entry: HistoryDetail,
  filters: { templateId?: string; model?: string; from?: string; to?: string },
): boolean {
  if (filters.templateId && entry.templateId !== filters.templateId) return false
  if (filters.model && entry.aiModelCode !== filters.model) return false
  if (filters.from && entry.createdAt < filters.from) return false
  if (filters.to && entry.createdAt > filters.to) return false
  return true
}

export function createMockHistoryClient(): HistoryClient {
  return {
    async list(filters, cursor, size) {
      const filtered = store
        .filter((entry) => matchesFilters(entry, filters))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

      const offset = cursor ? Number(cursor) : 0
      const pageData = filtered.slice(offset, offset + size)
      const nextOffset = offset + pageData.length
      const hasMore = nextOffset < filtered.length

      return {
        items: pageData.map(toListItem),
        nextCursor: hasMore ? String(nextOffset) : null,
        hasMore,
      }
    },

    async get(id) {
      const entry = store.find((e) => e.id === id)
      if (!entry) {
        throw new ApiError('NOT_FOUND', 'Prompt not found in history.', 404)
      }
      return entry
    },

    async remove(id) {
      const index = store.findIndex((e) => e.id === id)
      if (index !== -1) {
        store.splice(index, 1)
      }
    },

    async listFavorites(cursor, size) {
      const favorited = MOCK_TEMPLATES.filter((t) => favorites.has(t.id)).map((t) => ({
        ...t,
        isFavorited: true,
      }))
      const offset = cursor ? Number(cursor) : 0
      const pageData = favorited.slice(offset, offset + size)
      const nextOffset = offset + pageData.length
      const hasMore = nextOffset < favorited.length

      return {
        items: pageData,
        nextCursor: hasMore ? String(nextOffset) : null,
        hasMore,
      }
    },
  }
}
