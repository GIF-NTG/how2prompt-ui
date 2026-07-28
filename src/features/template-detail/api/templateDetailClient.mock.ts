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
    variables: [
      {
        id: 'v1',
        varKey: 'role',
        label: { en: 'Your Role', vi: 'Vai trò của bạn' },
        description: { en: 'Your technical role', vi: 'Vai trò kỹ thuật của bạn' },
        placeholder: { en: 'e.g. Backend Developer', vi: 'ví dụ: Backend Developer' },
        helpText: { en: 'This helps tailor the debugging approach', vi: 'Giúp điều chỉnh cách tiếp cận debug' },
        inputType: 'text',
        isRequired: true,
        defaultValue: null,
        options: [],
        validation: {},
        sortOrder: 1,
      },
      {
        id: 'v2',
        varKey: 'log',
        label: { en: 'Error Log', vi: 'Log lỗi' },
        description: { en: 'Paste the error log here', vi: 'Dán log lỗi vào đây' },
        placeholder: { en: 'Paste your error log...', vi: 'Dán log lỗi của bạn...' },
        helpText: { en: 'Include stack trace if available', vi: 'Bao gồm stack trace nếu có' },
        inputType: 'textarea',
        isRequired: true,
        defaultValue: null,
        options: [],
        validation: {},
        sortOrder: 2,
      },
      {
        id: 'v3',
        varKey: 'severity',
        label: { en: 'Severity Level', vi: 'Mức độ nghiêm trọng' },
        description: { en: 'How critical is this bug?', vi: 'Lỗi này nghiêm trọng đến mức nào?' },
        placeholder: { en: 'Select severity...', vi: 'Chọn mức độ...' },
        helpText: { en: 'Higher severity gets more detailed analysis', vi: 'Mức độ cao hơn sẽ được phân tích chi tiết hơn' },
        inputType: 'select',
        isRequired: false,
        defaultValue: 'medium',
        options: [
          { value: 'low', label: { en: 'Low', vi: 'Thấp' } },
          { value: 'medium', label: { en: 'Medium', vi: 'Trung bình' } },
          { value: 'high', label: { en: 'High', vi: 'Cao' } },
        ],
        validation: {},
        sortOrder: 3,
      },
      {
        id: 'v4',
        varKey: 'includeEdgeCases',
        label: { en: 'Include Edge Cases', vi: 'Bao gồm edge case' },
        description: { en: 'Check related edge cases?', vi: 'Kiểm tra edge case liên quan?' },
        placeholder: { en: '', vi: '' },
        helpText: { en: 'Adds edge case analysis to the output', vi: 'Thêm phân tích edge case vào kết quả' },
        inputType: 'boolean',
        isRequired: false,
        defaultValue: 'true',
        options: [],
        validation: {},
        sortOrder: 4,
      },
      {
        id: 'v5',
        varKey: 'maxTokens',
        label: { en: 'Max Response Length', vi: 'Độ dài phản hồi tối đa' },
        description: { en: 'Approximate max tokens for the response', vi: 'Số token tối đa xấp xỉ cho phản hồi' },
        placeholder: { en: '1000', vi: '1000' },
        helpText: { en: 'Longer responses provide more detail', vi: 'Phản hồi dài hơn sẽ chi tiết hơn' },
        inputType: 'number',
        isRequired: false,
        defaultValue: '1000',
        options: [],
        validation: { min: 100, max: 5000 },
        sortOrder: 5,
      },
    ],
    variants: [
      {
        aiModelCode: 'gpt-4o',
        promptBodyOverride: null,
        systemPromptOverride: null,
        modelConfig: {},
      },
      {
        aiModelCode: 'claude',
        promptBodyOverride:
          'Role: {{role}}\n\nDebug the following log:\n\n{{log}}\n\nRequirements:\n1. Identify root cause\n2. Suggest specific fix\n3. Check related edge cases',
        systemPromptOverride: null,
        modelConfig: {},
      },
    ],
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
