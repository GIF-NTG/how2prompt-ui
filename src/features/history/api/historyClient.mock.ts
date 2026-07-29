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
    promptSnippet: 'Với vai trò Backend Developer, hãy debug đoạn log sau...',
    createdAt: daysAgo(0),
    templateVersionId: 'ver-t1-1',
    inputValues: { role: 'Backend Developer', log: 'TypeError: Cannot read property...' },
    extraInstructions: null,
    finalPrompt:
      'Với vai trò Backend Developer, hãy debug đoạn log sau:\n\nTypeError: Cannot read property...',
  },
  {
    id: 'h2',
    title: null,
    // Deleted template — FR-009: reload must be blocked, prompt text must
    // still be viewable.
    templateId: null,
    templateTitle: { en: 'Removed template', vi: 'Mẫu đã bị xoá' },
    aiModelCode: 'claude',
    promptSnippet: 'Đây là prompt đã tạo từ một template hiện không còn tồn tại...',
    createdAt: daysAgo(1),
    templateVersionId: null,
    inputValues: { role: 'QA Engineer', log: '500 Internal Server Error' },
    extraInstructions: 'Ưu tiên phân tích race condition',
    finalPrompt:
      'Đây là prompt đã tạo từ một template hiện không còn tồn tại, nhưng nội dung vẫn được lưu lại để bạn xem/copy.',
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
    promptSnippet: 'Viết lại đoạn văn sau theo giọng điệu chuyên nghiệp...',
    createdAt: daysAgo(3),
    templateVersionId: 'ver-t2-1',
    inputValues: { content: 'Sản phẩm này khá ổn.', tone: 'chuyen-nghiep', length: 150 },
    extraInstructions: null,
    finalPrompt: 'Viết lại đoạn văn sau theo giọng điệu chuyên nghiệp, độ dài khoảng 150 từ...',
  },
  {
    id: 'h5',
    title: null,
    templateId: TEMPLATE_SLUGS.marketing,
    templateTitle: { en: 'Marketing product description', vi: 'Mô tả sản phẩm marketing' },
    aiModelCode: 'gemini',
    promptSnippet: 'Viết mô tả sản phẩm cho SmartWatch X1...',
    createdAt: daysAgo(4),
    templateVersionId: 'ver-t3-1',
    inputValues: { productName: 'SmartWatch X1', features: 'GPS, đo nhịp tim', audience: 'Người đi làm trẻ' },
    extraInstructions: null,
    finalPrompt: 'Viết mô tả sản phẩm cho SmartWatch X1, nhấn mạnh các tính năng: GPS, đo nhịp tim...',
  },
  {
    id: 'h6',
    title: null,
    templateId: TEMPLATE_SLUGS.codeReview,
    templateTitle: { en: 'Code review checklist', vi: 'Kiểm tra code review' },
    aiModelCode: 'claude',
    promptSnippet: 'Rà soát đoạn diff sau theo checklist bảo mật và hiệu năng...',
    createdAt: daysAgo(5),
    templateVersionId: 'ver-t4-1',
    inputValues: { diff: '+ const user = req.user;', strictness: 'strict' },
    extraInstructions: null,
    finalPrompt: 'Rà soát đoạn diff sau theo checklist bảo mật và hiệu năng:\n\n+ const user = req.user;',
  },
  {
    id: 'h7',
    title: null,
    templateId: TEMPLATE_SLUGS.meeting,
    templateTitle: { en: 'Summarize meeting notes', vi: 'Tóm tắt cuộc họp' },
    aiModelCode: 'gpt-4o',
    promptSnippet: 'Tóm tắt ghi chú cuộc họp sau thành các mục chính...',
    createdAt: daysAgo(6),
    templateVersionId: 'ver-t5-1',
    inputValues: { notes: 'Họp sprint planning, chốt scope tuần này.' },
    extraInstructions: null,
    finalPrompt: 'Tóm tắt ghi chú cuộc họp sau thành các mục chính và việc cần làm...',
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
  [TEMPLATE_SLUGS.marketing]: { en: 'Marketing product description', vi: 'Mô tả sản phẩm marketing' },
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
    promptSnippet: `Prompt đã tạo lần ${8 + i}...`,
    createdAt: daysAgo(7 + i),
    templateVersionId: CYCLE_VERSION_IDS[slug],
    inputValues: { note: `filler #${i}` },
    extraInstructions: null,
    finalPrompt: `Nội dung prompt đầy đủ cho mục lịch sử #${8 + i}.`,
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
    async list(filters, page, size) {
      const filtered = store
        .filter((entry) => matchesFilters(entry, filters))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

      const totalElements = filtered.length
      const totalPages = Math.max(1, Math.ceil(totalElements / size))
      const pageData = filtered.slice(page * size, page * size + size)

      return {
        data: pageData.map(toListItem),
        meta: {
          page,
          size,
          totalElements,
          totalPages,
          hasNext: (page + 1) * size < totalElements,
          hasPrevious: page > 0,
        },
      }
    },

    async get(id) {
      const entry = store.find((e) => e.id === id)
      if (!entry) {
        throw new ApiError('NOT_FOUND', 'Không tìm thấy prompt trong lịch sử.', 404)
      }
      return entry
    },

    async remove(id) {
      const index = store.findIndex((e) => e.id === id)
      if (index !== -1) {
        store.splice(index, 1)
      }
    },

    async listFavorites(page, size) {
      const favorited = MOCK_TEMPLATES.filter((t) => favorites.has(t.id)).map((t) => ({
        ...t,
        isFavorited: true,
      }))
      const totalElements = favorited.length
      const totalPages = Math.max(1, Math.ceil(totalElements / size))
      const pageData = favorited.slice(page * size, page * size + size)

      return {
        data: pageData,
        meta: {
          page,
          size,
          totalElements,
          totalPages,
          hasNext: (page + 1) * size < totalElements,
          hasPrevious: page > 0,
        },
      }
    },
  }
}
