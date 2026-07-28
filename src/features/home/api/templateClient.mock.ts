import type { TemplateClient } from './templateClient.types'
import type { TemplateListItem, AiModel, Category, Tag } from '../types'

const MOCK_MODELS: AiModel[] = [
  {
    id: 'm1',
    code: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    modelType: 'text',
    description: null,
    capabilities: {},
    iconUrl: null,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'm2',
    code: 'claude',
    name: 'Claude',
    provider: 'anthropic',
    modelType: 'text',
    description: null,
    capabilities: {},
    iconUrl: null,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'm3',
    code: 'gemini',
    name: 'Gemini',
    provider: 'google',
    modelType: 'text',
    description: null,
    capabilities: {},
    iconUrl: null,
    isActive: true,
    sortOrder: 3,
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
    parentId: null,
    sortOrder: 1,
    templateCount: 1,
  },
  {
    id: 'c2',
    slug: 'coding',
    name: { en: 'Coding', vi: '#coding' },
    description: { en: '', vi: '' },
    icon: null,
    color: null,
    parentId: null,
    sortOrder: 2,
    templateCount: 1,
  },
  {
    id: 'c3',
    slug: 'writing',
    name: { en: 'Writing', vi: '#writing' },
    description: { en: '', vi: '' },
    icon: null,
    color: null,
    parentId: null,
    sortOrder: 3,
    templateCount: 1,
  },
  {
    id: 'c4',
    slug: 'marketing',
    name: { en: 'Marketing', vi: '#marketing' },
    description: { en: '', vi: '' },
    icon: null,
    color: null,
    parentId: null,
    sortOrder: 4,
    templateCount: 1,
  },
]

const MOCK_TAGS: Tag[] = [
  { id: 'tg1', slug: 'chi-tiet', name: 'Chi tiết', usageCount: 20 },
  { id: 'tg2', slug: 'nhanh', name: 'Nhanh gọn', usageCount: 15 },
  { id: 'tg3', slug: 'chuyen-nghiep', name: 'Chuyên nghiệp', usageCount: 18 },
  { id: 'tg4', slug: 'sang-tao', name: 'Sáng tạo', usageCount: 10 },
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
    coverImage: null,
    isOfficial: true,
    author: { id: null, fullName: 'Admin', username: 'admin', avatarUrl: null, type: 'admin' },
    categories: [MOCK_CATEGORIES[0]],
    tags: [MOCK_TAGS[0], MOCK_TAGS[1]],
    supportedModels: ['gpt-4o', 'claude'],
    usageCount: 482,
    favoriteCount: 12,
    isFavorited: false,
    createdAt: '2026-07-20T00:00:00Z',
  },
  {
    id: 't2',
    slug: 'sua-van-phong-noi-dung',
    title: { en: 'Rewrite content style', vi: 'Sửa văn phong nội dung' },
    description: {
      en: 'Put a paragraph into the right tone and length.',
      vi: 'Đưa một đoạn văn về đúng giọng điệu và độ dài mong muốn.',
    },
    coverImage: null,
    isOfficial: true,
    author: { id: null, fullName: 'Admin', username: 'admin', avatarUrl: null, type: 'admin' },
    categories: [MOCK_CATEGORIES[2]],
    tags: [MOCK_TAGS[2]],
    supportedModels: ['gpt-4o', 'claude', 'gemini'],
    usageCount: 311,
    favoriteCount: 8,
    isFavorited: false,
    createdAt: '2026-07-19T00:00:00Z',
  },
  {
    id: 't3',
    slug: 'mo-ta-san-pham-marketing',
    title: { en: 'Marketing product description', vi: 'Mô tả sản phẩm marketing' },
    description: {
      en: 'Write a product description following features and competitive advantages.',
      vi: 'Viết mô tả sản phẩm bám theo tính năng và điểm khác biệt cạnh tranh.',
    },
    coverImage: null,
    isOfficial: true,
    author: { id: null, fullName: 'Admin', username: 'admin', avatarUrl: null, type: 'admin' },
    categories: [MOCK_CATEGORIES[3]],
    tags: [MOCK_TAGS[3], MOCK_TAGS[2]],
    supportedModels: ['gpt-4o', 'gemini'],
    usageCount: 205,
    favoriteCount: 5,
    isFavorited: false,
    createdAt: '2026-07-18T00:00:00Z',
  },
  {
    id: 't4',
    slug: 'kiem-tra-code-review',
    title: { en: 'Code review checklist', vi: 'Kiểm tra code review' },
    description: {
      en: 'Review a pull request against security and performance checklist.',
      vi: 'Rà soát pull request theo checklist bảo mật và hiệu năng.',
    },
    coverImage: null,
    isOfficial: true,
    author: { id: null, fullName: 'Admin', username: 'admin', avatarUrl: null, type: 'admin' },
    categories: [MOCK_CATEGORIES[1]],
    tags: [MOCK_TAGS[0]],
    supportedModels: ['claude'],
    usageCount: 158,
    favoriteCount: 3,
    isFavorited: false,
    createdAt: '2026-07-22T00:00:00Z',
  },
  {
    id: 't5',
    slug: 'tom-tat-cuoc-hop',
    title: { en: 'Summarize meeting notes', vi: 'Tóm tắt cuộc họp' },
    description: {
      en: 'Turn raw meeting notes into a structured summary with action items.',
      vi: 'Biến ghi chú cuộc họp thô thành bản tóm tắt có cấu trúc kèm việc cần làm.',
    },
    coverImage: null,
    isOfficial: false,
    author: {
      id: 'u1',
      fullName: 'Nguyễn Văn A',
      username: 'nguyenvana',
      avatarUrl: null,
      type: 'user',
    },
    categories: [MOCK_CATEGORIES[2]],
    tags: [MOCK_TAGS[1]],
    supportedModels: ['gpt-4o'],
    usageCount: 600,
    favoriteCount: 2,
    isFavorited: false,
    createdAt: '2026-07-21T00:00:00Z',
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
        filtered = filtered.filter((t) => t.supportedModels.includes(params.model!))
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
        filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      } else {
        filtered.sort((a, b) => b.usageCount - a.usageCount)
      }
      filtered = [
        ...filtered.filter((t) => t.isOfficial),
        ...filtered.filter((t) => !t.isOfficial),
      ]

      filtered = filtered.map((t) => ({ ...t, isFavorited: favorites.has(t.id) }))

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
      return MOCK_TEMPLATES.filter((t) => t.isOfficial).map((t) => ({
        ...t,
        isFavorited: favorites.has(t.id),
      }))
    },

    async getTrending() {
      return [...MOCK_TEMPLATES]
        .sort((a, b) => b.usageCount - a.usageCount)
        .map((t) => ({ ...t, isFavorited: favorites.has(t.id) }))
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
      return { isFavorited: favorites.has(templateId) }
    },
  }
}
