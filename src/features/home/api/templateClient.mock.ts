import type { TemplateClient } from './templateClient.types'
import type { TemplateListItem, AiModel, Category, Tag } from '../types'

const MOCK_MODELS: AiModel[] = [
  {
    id: 'm1',
    code: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    model_type: 'text',
    description: null,
    capabilities: {},
    icon_url: null,
    is_active: true,
    sort_order: 1,
  },
  {
    id: 'm2',
    code: 'claude',
    name: 'Claude',
    provider: 'anthropic',
    model_type: 'text',
    description: null,
    capabilities: {},
    icon_url: null,
    is_active: true,
    sort_order: 2,
  },
  {
    id: 'm3',
    code: 'gemini',
    name: 'Gemini',
    provider: 'google',
    model_type: 'text',
    description: null,
    capabilities: {},
    icon_url: null,
    is_active: true,
    sort_order: 3,
  },
]

const MOCK_CATEGORIES: Category[] = [
  {
    id: 'c1',
    slug: 'debugging',
    name: { en: 'Debugging', vi: '#debugging' },
    description: { en: '', vi: '' },
    icon: null,
    color: null,
    parent_id: null,
    sort_order: 1,
    template_count: 1,
  },
  {
    id: 'c2',
    slug: 'coding',
    name: { en: 'Coding', vi: '#coding' },
    description: { en: '', vi: '' },
    icon: null,
    color: null,
    parent_id: null,
    sort_order: 2,
    template_count: 1,
  },
  {
    id: 'c3',
    slug: 'writing',
    name: { en: 'Writing', vi: '#writing' },
    description: { en: '', vi: '' },
    icon: null,
    color: null,
    parent_id: null,
    sort_order: 3,
    template_count: 1,
  },
  {
    id: 'c4',
    slug: 'marketing',
    name: { en: 'Marketing', vi: '#marketing' },
    description: { en: '', vi: '' },
    icon: null,
    color: null,
    parent_id: null,
    sort_order: 4,
    template_count: 1,
  },
]

const MOCK_TAGS: Tag[] = [
  { id: 'tg1', slug: 'chi-tiet', name: 'Chi tiết', usage_count: 20 },
  { id: 'tg2', slug: 'nhanh', name: 'Nhanh gọn', usage_count: 15 },
  { id: 'tg3', slug: 'chuyen-nghiep', name: 'Chuyên nghiệp', usage_count: 18 },
  { id: 'tg4', slug: 'sang-tao', name: 'Sáng tạo', usage_count: 10 },
]

const MOCK_TEMPLATES: TemplateListItem[] = [
  {
    id: 't1',
    slug: 'debug-loi-hieu-qua',
    title: { en: 'Debug effectively', vi: 'Debug lỗi hiệu quả' },
    description: {
      en: 'Describe bug + log, get debugging guidance matching your role and context.',
      vi: 'Mô tả lỗi + log, nhận hướng dẫn debug theo đúng vai trò và bối cảnh kỹ thuật của bạn.',
    },
    cover_image: null,
    is_official: true,
    author: { id: null, full_name: 'Admin', username: 'admin', avatar_url: null, type: 'admin' },
    categories: [MOCK_CATEGORIES[0]],
    tags: [MOCK_TAGS[0], MOCK_TAGS[1]],
    supported_models: ['gpt-4o', 'claude'],
    usage_count: 482,
    favorite_count: 12,
    is_favorited: false,
    created_at: '2026-07-20T00:00:00Z',
  },
  {
    id: 't2',
    slug: 'sua-van-phong-noi-dung',
    title: { en: 'Rewrite content style', vi: 'Sửa văn phong nội dung' },
    description: {
      en: 'Put a paragraph into the right tone and length.',
      vi: 'Đưa một đoạn văn về đúng giọng điệu và độ dài mong muốn.',
    },
    cover_image: null,
    is_official: true,
    author: { id: null, full_name: 'Admin', username: 'admin', avatar_url: null, type: 'admin' },
    categories: [MOCK_CATEGORIES[2]],
    tags: [MOCK_TAGS[2]],
    supported_models: ['gpt-4o', 'claude', 'gemini'],
    usage_count: 311,
    favorite_count: 8,
    is_favorited: false,
    created_at: '2026-07-19T00:00:00Z',
  },
  {
    id: 't3',
    slug: 'mo-ta-san-pham-marketing',
    title: { en: 'Marketing product description', vi: 'Mô tả sản phẩm marketing' },
    description: {
      en: 'Write a product description following features and competitive advantages.',
      vi: 'Viết mô tả sản phẩm bám theo tính năng và điểm khác biệt cạnh tranh.',
    },
    cover_image: null,
    is_official: true,
    author: { id: null, full_name: 'Admin', username: 'admin', avatar_url: null, type: 'admin' },
    categories: [MOCK_CATEGORIES[3]],
    tags: [MOCK_TAGS[3], MOCK_TAGS[2]],
    supported_models: ['gpt-4o', 'gemini'],
    usage_count: 205,
    favorite_count: 5,
    is_favorited: false,
    created_at: '2026-07-18T00:00:00Z',
  },
  {
    id: 't4',
    slug: 'kiem-tra-code-review',
    title: { en: 'Code review checklist', vi: 'Kiểm tra code review' },
    description: {
      en: 'Review a pull request against security and performance checklist.',
      vi: 'Rà soát pull request theo checklist bảo mật và hiệu năng.',
    },
    cover_image: null,
    is_official: true,
    author: { id: null, full_name: 'Admin', username: 'admin', avatar_url: null, type: 'admin' },
    categories: [MOCK_CATEGORIES[1]],
    tags: [MOCK_TAGS[0]],
    supported_models: ['claude'],
    usage_count: 158,
    favorite_count: 3,
    is_favorited: false,
    created_at: '2026-07-22T00:00:00Z',
  },
  {
    id: 't5',
    slug: 'tom-tat-cuoc-hop',
    title: { en: 'Summarize meeting notes', vi: 'Tóm tắt cuộc họp' },
    description: {
      en: 'Turn raw meeting notes into a structured summary with action items.',
      vi: 'Biến ghi chú cuộc họp thô thành bản tóm tắt có cấu trúc kèm việc cần làm.',
    },
    cover_image: null,
    is_official: false,
    author: {
      id: 'u1',
      full_name: 'Nguyễn Văn A',
      username: 'nguyenvana',
      avatar_url: null,
      type: 'user',
    },
    categories: [MOCK_CATEGORIES[2]],
    tags: [MOCK_TAGS[1]],
    supported_models: ['gpt-4o'],
    usage_count: 600,
    favorite_count: 2,
    is_favorited: false,
    created_at: '2026-07-21T00:00:00Z',
  },
]

const favorites = new Set<string>()

export function createMockTemplateClient(): TemplateClient {
  return {
    async getTemplates(params) {
      let filtered = [...MOCK_TEMPLATES]
      if (params.q) {
        const q = params.q.toLowerCase()
        filtered = filtered.filter(
          (t) =>
            t.title.vi?.toLowerCase().includes(q) ||
            t.title.en.toLowerCase().includes(q) ||
            t.description.vi?.toLowerCase().includes(q) ||
            t.description.en.toLowerCase().includes(q),
        )
      }
      if (params.model) {
        filtered = filtered.filter((t) => t.supported_models.includes(params.model!))
      }
      if (params.category) {
        const categorySlugs = params.category.split(',')
        filtered = filtered.filter((t) => t.categories.some((c) => categorySlugs.includes(c.slug)))
      }
      if (params.tags) {
        const tagSlugs = params.tags.split(',')
        filtered = filtered.filter((t) => t.tags.some((tag) => tagSlugs.includes(tag.slug)))
      }

      if (params.sort === 'newest') {
        filtered.sort((a, b) => b.created_at.localeCompare(a.created_at))
      } else {
        filtered.sort((a, b) => b.usage_count - a.usage_count)
      }
      filtered = [
        ...filtered.filter((t) => t.is_official),
        ...filtered.filter((t) => !t.is_official),
      ]

      filtered = filtered.map((t) => ({ ...t, is_favorited: favorites.has(t.id) }))

      const page = params.page ?? 0
      const size = params.size ?? 20
      const totalElements = filtered.length
      const totalPages = Math.max(1, Math.ceil(totalElements / size))
      const pageData = filtered.slice(page * size, page * size + size)

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

    async getFeatured() {
      return MOCK_TEMPLATES.filter((t) => t.is_official).map((t) => ({
        ...t,
        is_favorited: favorites.has(t.id),
      }))
    },

    async getTrending() {
      return [...MOCK_TEMPLATES]
        .sort((a, b) => b.usage_count - a.usage_count)
        .map((t) => ({ ...t, is_favorited: favorites.has(t.id) }))
    },

    async getModels() {
      return MOCK_MODELS
    },

    async getCategories() {
      return MOCK_CATEGORIES
    },

    async getTags(params) {
      if (!params?.q) return MOCK_TAGS
      const q = params.q.toLowerCase()
      return MOCK_TAGS.filter((t) => t.name.toLowerCase().includes(q))
    },

    async toggleFavorite(templateId) {
      if (favorites.has(templateId)) {
        favorites.delete(templateId)
      } else {
        favorites.add(templateId)
      }
      return { is_favorited: favorites.has(templateId) }
    },
  }
}
