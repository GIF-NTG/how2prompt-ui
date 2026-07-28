import { ApiError } from '@/shared/utils/httpClient'
import type { TemplateDetailClient } from './templateDetailClient.types'
import type { TemplateDetail } from '../types'

const DEBUG_TEMPLATE: TemplateDetail = {
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

const REWRITE_TEMPLATE: TemplateDetail = {
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
  categories: [
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
  ],
  supportedModels: ['gpt-4o', 'claude', 'gemini'],
  usageCount: 311,
  favoriteCount: 8,
  isFavorited: false,
  viewCount: 940,
  createdAt: '2026-07-19T00:00:00Z',
  currentVersion: {
    version: 1,
    promptBody:
      'Viết lại đoạn văn sau theo giọng điệu {{tone}}, độ dài khoảng {{length}} từ:\n\n{{content}}',
    guide: {
      en: 'Paste the original paragraph, pick a target tone and an approximate word count.',
      vi: 'Dán đoạn văn gốc, chọn giọng điệu mong muốn và độ dài xấp xỉ.',
    },
    exampleOutput: {
      en: 'A rewritten paragraph matching the requested tone and length.',
      vi: 'Đoạn văn được viết lại đúng giọng điệu và độ dài yêu cầu.',
    },
    variables: [
      {
        id: 'v1',
        varKey: 'content',
        label: { en: 'Original content', vi: 'Nội dung gốc' },
        description: { en: 'The paragraph to rewrite', vi: 'Đoạn văn cần viết lại' },
        placeholder: { en: 'Paste your text...', vi: 'Dán văn bản của bạn...' },
        helpText: { en: '', vi: '' },
        inputType: 'textarea',
        isRequired: true,
        defaultValue: null,
        options: [],
        validation: {},
        sortOrder: 1,
      },
      {
        id: 'v2',
        varKey: 'tone',
        label: { en: 'Tone', vi: 'Giọng điệu' },
        description: { en: 'Desired tone of voice', vi: 'Giọng điệu mong muốn' },
        placeholder: { en: '', vi: '' },
        helpText: { en: '', vi: '' },
        inputType: 'select',
        isRequired: true,
        defaultValue: 'chuyen-nghiep',
        options: [
          { value: 'chuyen-nghiep', label: { en: 'Professional', vi: 'Chuyên nghiệp' } },
          { value: 'than-thien', label: { en: 'Friendly', vi: 'Thân thiện' } },
          { value: 'trang-trong', label: { en: 'Formal', vi: 'Trang trọng' } },
        ],
        validation: {},
        sortOrder: 2,
      },
      {
        id: 'v3',
        varKey: 'length',
        label: { en: 'Target word count', vi: 'Số từ mong muốn' },
        description: { en: '', vi: '' },
        placeholder: { en: '150', vi: '150' },
        helpText: { en: '', vi: '' },
        inputType: 'number',
        isRequired: false,
        defaultValue: '150',
        options: [],
        validation: { min: 20, max: 2000 },
        sortOrder: 3,
      },
    ],
    variants: [
      { aiModelCode: 'gpt-4o', promptBodyOverride: null, systemPromptOverride: null, modelConfig: {} },
      { aiModelCode: 'claude', promptBodyOverride: null, systemPromptOverride: null, modelConfig: {} },
      { aiModelCode: 'gemini', promptBodyOverride: null, systemPromptOverride: null, modelConfig: {} },
    ],
  },
}

const MARKETING_TEMPLATE: TemplateDetail = {
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
  categories: [
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
  ],
  supportedModels: ['gpt-4o', 'gemini'],
  usageCount: 205,
  favoriteCount: 5,
  isFavorited: false,
  viewCount: 620,
  createdAt: '2026-07-18T00:00:00Z',
  currentVersion: {
    version: 1,
    promptBody:
      'Viết mô tả sản phẩm cho {{productName}}, nhấn mạnh các tính năng: {{features}}. Đối tượng khách hàng: {{audience}}.',
    guide: {
      en: 'Provide the product name, its key features and the target audience.',
      vi: 'Cung cấp tên sản phẩm, các tính năng nổi bật và đối tượng khách hàng.',
    },
    exampleOutput: {
      en: 'A persuasive product description highlighting the given features.',
      vi: 'Một đoạn mô tả sản phẩm thuyết phục, làm nổi bật các tính năng đã cho.',
    },
    variables: [
      {
        id: 'v1',
        varKey: 'productName',
        label: { en: 'Product name', vi: 'Tên sản phẩm' },
        description: { en: '', vi: '' },
        placeholder: { en: 'e.g. SmartWatch X1', vi: 'ví dụ: SmartWatch X1' },
        helpText: { en: '', vi: '' },
        inputType: 'text',
        isRequired: true,
        defaultValue: null,
        options: [],
        validation: {},
        sortOrder: 1,
      },
      {
        id: 'v2',
        varKey: 'features',
        label: { en: 'Key features', vi: 'Tính năng nổi bật' },
        description: { en: '', vi: '' },
        placeholder: { en: 'Comma-separated list', vi: 'Danh sách, cách nhau bằng dấu phẩy' },
        helpText: { en: '', vi: '' },
        inputType: 'textarea',
        isRequired: true,
        defaultValue: null,
        options: [],
        validation: {},
        sortOrder: 2,
      },
      {
        id: 'v3',
        varKey: 'audience',
        label: { en: 'Target audience', vi: 'Đối tượng khách hàng' },
        description: { en: '', vi: '' },
        placeholder: { en: 'e.g. Young professionals', vi: 'ví dụ: Người đi làm trẻ' },
        helpText: { en: '', vi: '' },
        inputType: 'text',
        isRequired: false,
        defaultValue: null,
        options: [],
        validation: {},
        sortOrder: 3,
      },
    ],
    variants: [
      { aiModelCode: 'gpt-4o', promptBodyOverride: null, systemPromptOverride: null, modelConfig: {} },
      { aiModelCode: 'gemini', promptBodyOverride: null, systemPromptOverride: null, modelConfig: {} },
    ],
  },
}

const CODE_REVIEW_TEMPLATE: TemplateDetail = {
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
  categories: [
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
  ],
  supportedModels: ['claude'],
  usageCount: 158,
  favoriteCount: 3,
  isFavorited: false,
  viewCount: 410,
  createdAt: '2026-07-22T00:00:00Z',
  currentVersion: {
    version: 1,
    promptBody:
      'Rà soát đoạn diff sau theo checklist bảo mật và hiệu năng:\n\n{{diff}}\n\nMức độ nghiêm ngặt: {{strictness}}',
    guide: {
      en: 'Paste the diff/PR content and pick a strictness level.',
      vi: 'Dán nội dung diff/PR và chọn mức độ nghiêm ngặt.',
    },
    exampleOutput: {
      en: 'A structured review listing security and performance findings.',
      vi: 'Một bản review có cấu trúc liệt kê các vấn đề bảo mật và hiệu năng.',
    },
    variables: [
      {
        id: 'v1',
        varKey: 'diff',
        label: { en: 'Diff / PR content', vi: 'Nội dung diff / PR' },
        description: { en: '', vi: '' },
        placeholder: { en: 'Paste the diff...', vi: 'Dán diff của bạn...' },
        helpText: { en: '', vi: '' },
        inputType: 'textarea',
        isRequired: true,
        defaultValue: null,
        options: [],
        validation: {},
        sortOrder: 1,
      },
      {
        id: 'v2',
        varKey: 'strictness',
        label: { en: 'Strictness', vi: 'Mức độ nghiêm ngặt' },
        description: { en: '', vi: '' },
        placeholder: { en: '', vi: '' },
        helpText: { en: '', vi: '' },
        inputType: 'select',
        isRequired: false,
        defaultValue: 'standard',
        options: [
          { value: 'lenient', label: { en: 'Lenient', vi: 'Nhẹ nhàng' } },
          { value: 'standard', label: { en: 'Standard', vi: 'Tiêu chuẩn' } },
          { value: 'strict', label: { en: 'Strict', vi: 'Nghiêm ngặt' } },
        ],
        validation: {},
        sortOrder: 2,
      },
    ],
    variants: [{ aiModelCode: 'claude', promptBodyOverride: null, systemPromptOverride: null, modelConfig: {} }],
  },
}

const MEETING_SUMMARY_TEMPLATE: TemplateDetail = {
  id: 't5',
  slug: 'tom-tat-cuoc-hop',
  title: { en: 'Summarize meeting notes', vi: 'Tóm tắt cuộc họp' },
  description: {
    en: 'Turn raw meeting notes into a structured summary with action items.',
    vi: 'Biến ghi chú cuộc họp thô thành bản tóm tắt có cấu trúc kèm việc cần làm.',
  },
  coverImage: null,
  isOfficial: false,
  author: { id: 'u1', fullName: 'Nguyễn Văn A', username: 'nguyenvana', avatarUrl: null, type: 'user' },
  categories: [
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
  ],
  supportedModels: ['gpt-4o'],
  usageCount: 600,
  favoriteCount: 2,
  isFavorited: false,
  viewCount: 1280,
  createdAt: '2026-07-21T00:00:00Z',
  currentVersion: {
    version: 1,
    promptBody: 'Tóm tắt ghi chú cuộc họp sau thành các mục chính và việc cần làm:\n\n{{notes}}',
    guide: {
      en: 'Paste the raw meeting notes.',
      vi: 'Dán ghi chú cuộc họp thô.',
    },
    exampleOutput: {
      en: 'A structured summary with key points and action items.',
      vi: 'Bản tóm tắt có cấu trúc gồm các ý chính và việc cần làm.',
    },
    variables: [
      {
        id: 'v1',
        varKey: 'notes',
        label: { en: 'Meeting notes', vi: 'Ghi chú cuộc họp' },
        description: { en: '', vi: '' },
        placeholder: { en: 'Paste your notes...', vi: 'Dán ghi chú của bạn...' },
        helpText: { en: '', vi: '' },
        inputType: 'textarea',
        isRequired: true,
        defaultValue: null,
        options: [],
        validation: {},
        sortOrder: 1,
      },
    ],
    variants: [{ aiModelCode: 'gpt-4o', promptBodyOverride: null, systemPromptOverride: null, modelConfig: {} }],
  },
}

const MOCK_TEMPLATES_BY_SLUG = new Map<string, TemplateDetail>(
  [
    DEBUG_TEMPLATE,
    REWRITE_TEMPLATE,
    MARKETING_TEMPLATE,
    CODE_REVIEW_TEMPLATE,
    MEETING_SUMMARY_TEMPLATE,
  ].map((template) => [template.slug, template]),
)

const favorites = new Set<string>()

export function createMockTemplateDetailClient(): TemplateDetailClient {
  return {
    async getDetail(slug) {
      const template = MOCK_TEMPLATES_BY_SLUG.get(slug)
      if (!template) {
        throw new ApiError('TEMPLATE_NOT_FOUND', 'Không tìm thấy mẫu.', 404)
      }
      return { ...template, isFavorited: favorites.has(template.id) }
    },

    async toggleFavorite(templateId) {
      if (favorites.has(templateId)) {
        favorites.delete(templateId)
      } else {
        favorites.add(templateId)
      }
      return { isFavorited: favorites.has(templateId) }
    },

    async incrementViewCount(slug) {
      const template = MOCK_TEMPLATES_BY_SLUG.get(slug)
      if (template) {
        MOCK_TEMPLATES_BY_SLUG.set(slug, { ...template, viewCount: template.viewCount + 1 })
      }
    },
  }
}
