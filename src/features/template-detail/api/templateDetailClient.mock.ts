import type { TemplateDetailClient } from './templateDetailClient.types'
import type { TemplateDetail } from '../types'

const MOCK_TEMPLATE: TemplateDetail = {
  id: 't1',
  slug: 'debug-loi-hieu-qua',
  title: { en: 'Debug Errors Effectively', vi: 'Debug lỗi hiệu quả' },
  description: {
    en: 'Describe bug + log, get debugging guidance matching your role and context.',
    vi: 'Mô tả lỗi + log, nhận hướng dẫn debug theo đúng vai trò và bối cảnh kỹ thuật của bạn.',
  },
  coverImage: null,
  isOfficial: true,
  author: { id: null, fullName: 'Admin', username: 'admin', avatarUrl: null, type: 'admin' },
  categories: [
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
  ],
  supportedModels: ['gpt-4o', 'claude'],
  usageCount: 482,
  favoriteCount: 12,
  isFavorited: false,
  viewCount: 1523,
  createdAt: '2026-07-20T10:00:00Z',
  currentVersion: {
    version: 1,
    promptBody:
      'Với vai trò {{role}}, hãy debug đoạn log sau:\n\n{{log}}\n\nYêu cầu:\n1. Chỉ ra nguyên nhân gốc\n2. Gợi ý fix cụ thể\n3. Kiểm tra edge case liên quan',
    guide: {
      en: 'Fill in your role (e.g., "Backend Developer") and paste the error log. The template will generate a structured debugging analysis with root cause identification and fix suggestions.',
      vi: 'Điền vai trò của bạn (ví dụ: "Backend Developer") và dán log lỗi. Mô hình sẽ tạo ra phân tích debug có cấu trúc với xác định nguyên nhân gốc và gợi ý sửa lỗi.',
    },
    exampleOutput: {
      en: '## Root Cause Analysis\n\nThe error `TypeError: Cannot read property "id" of undefined` at line 42 indicates...\n\n## Suggested Fix\n\nAdd optional chaining: `user?.id`\n\n## Edge Cases\n- Handle null user in auth middleware',
      vi: '## Phân tích nguyên nhân gốc\n\nLỗi `TypeError: Cannot read property "id" of undefined` tại dòng 42 cho thấy...\n\n## Gợi ý sửa lỗi\n\nThêm optional chaining: `user?.id`\n\n## Edge Case\n- Xử lý user null trong auth middleware',
    },
  },
}

let mockTemplate = { ...MOCK_TEMPLATE }
const favorites = new Set<string>()

export function createMockTemplateDetailClient(): TemplateDetailClient {
  return {
    async getDetail(slug) {
      if (slug !== MOCK_TEMPLATE.slug) {
        throw new Error('TEMPLATE_NOT_FOUND')
      }
      return { ...mockTemplate, isFavorited: favorites.has(mockTemplate.id) }
    },

    async toggleFavorite(templateId) {
      if (favorites.has(templateId)) {
        favorites.delete(templateId)
      } else {
        favorites.add(templateId)
      }
      return { isFavorited: favorites.has(templateId) }
    },

    async incrementViewCount() {
      mockTemplate = { ...mockTemplate, viewCount: mockTemplate.viewCount + 1 }
    },
  }
}
