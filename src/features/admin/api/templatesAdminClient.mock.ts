import { ApiError } from '@/shared/utils/httpClient'
import { MOCK_TEMPLATES } from '@/features/home/api/templateClient.mock'
import { validatePlaceholders } from '../utils/validatePlaceholders'
import type {
  AdminTemplate,
  TemplateUpsert,
  TemplatesAdminClient,
} from './templatesAdminClient.types'

let nextId = 1000
const store = new Map<string, AdminTemplate>()

function toAdminTemplate(
  id: string,
  input: TemplateUpsert,
  previous: AdminTemplate | undefined,
): AdminTemplate {
  const versionNumber = previous ? previous.currentVersion.versionNumber + 1 : 1
  return {
    id,
    title: input.title,
    description: input.description,
    coverImage: input.coverImage,
    categoryIds: input.categoryIds,
    tagSlugs: input.tagSlugs,
    modelCodes: input.modelCodes,
    isOfficial: previous?.isOfficial ?? false,
    status: previous?.status ?? 'draft',
    currentVersion: {
      id: `${id}-v${versionNumber}`,
      versionNumber,
      promptBody: input.promptBody,
      systemPrompt: input.systemPrompt,
      exampleOutput: input.exampleOutput,
      guide: input.guide,
      variables: input.variables.map((v, index) => ({ id: v.id ?? `var-${index}`, ...v })),
      variants: input.variants,
    },
  }
}

function syncPublicCatalog(template: AdminTemplate) {
  const existingIndex = MOCK_TEMPLATES.findIndex((t) => t.id === template.id)
  const listItem = {
    id: template.id,
    slug: template.id,
    title: template.title,
    description: template.description,
    coverImage: template.coverImage,
    isOfficial: true,
    author: { id: null, fullName: null, username: null, avatarUrl: null, type: 'admin' as const },
    categories: [],
    tags: [],
    supportedModels: template.modelCodes,
    usageCount: 0,
    favoriteCount: 0,
    isFavorited: false,
    createdAt: new Date().toISOString(),
  }
  if (existingIndex === -1) {
    MOCK_TEMPLATES.push(listItem)
  } else {
    MOCK_TEMPLATES[existingIndex] = listItem
  }
}

export function createMockTemplatesAdminClient(): TemplatesAdminClient {
  return {
    async list() {
      return { items: [...store.values()], nextCursor: null, hasMore: false }
    },

    async create(input) {
      const id = `t${nextId++}`
      const created = toAdminTemplate(id, input, undefined)
      store.set(id, created)
      return created
    },

    async update(id, input) {
      const previous = store.get(id)
      if (!previous) {
        throw new ApiError('NOT_FOUND', `Template ${id} not found`, 404)
      }
      const updated = toAdminTemplate(id, input, previous)
      store.set(id, updated)
      if (updated.status === 'published') {
        syncPublicCatalog(updated)
      }
      return updated
    },

    async publish(id) {
      const template = store.get(id)
      if (!template) {
        throw new ApiError('NOT_FOUND', `Template ${id} not found`, 404)
      }
      const { isValid, missingVarKeys } = validatePlaceholders(
        template.currentVersion.promptBody,
        template.currentVersion.variables,
      )
      if (!isValid) {
        throw new ApiError(
          'VALIDATION_ERROR',
          `Missing variable declaration for placeholder(s): ${missingVarKeys.join(', ')}`,
          422,
          { missingVarKeys: missingVarKeys.join(', ') },
        )
      }
      const published: AdminTemplate = { ...template, status: 'published', isOfficial: true }
      store.set(id, published)
      syncPublicCatalog(published)
      return published
    },
  }
}
