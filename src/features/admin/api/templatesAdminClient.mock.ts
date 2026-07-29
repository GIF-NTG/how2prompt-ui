import type {
  Template,
  TemplateUpsert,
  TemplatesAdminClient,
} from './templatesAdminClient.types'
import { PublishValidationError } from './templatesAdminClient.types'
import { findMissingPlaceholders } from '@/features/admin/utils/validatePlaceholders'

let mockTemplates: Template[] = []

function createId(): string {
  return `tpl.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || createId()
  )
}

function toTemplate(id: string, input: TemplateUpsert, base: Partial<Template>): Template {
  return {
    id,
    slug: base.slug ?? slugify(input.title.en),
    title: input.title,
    description: input.description ?? { en: '' },
    coverImage: input.coverImage ?? base.coverImage ?? null,
    isOfficial: base.isOfficial ?? false,
    status: base.status ?? 'draft',
    categoryIds: input.categoryIds ?? base.categoryIds ?? [],
    tagSlugs: input.tagSlugs ?? base.tagSlugs ?? [],
    modelCodes: input.modelCodes ?? base.modelCodes ?? [],
    promptBody: input.promptBody,
    systemPrompt: input.systemPrompt ?? base.systemPrompt ?? null,
    exampleOutput: input.exampleOutput ?? base.exampleOutput ?? null,
    guide: input.guide ?? base.guide ?? { en: '' },
    variables: input.variables ?? base.variables ?? [],
    variants: base.variants ?? [],
    versionNumber: base.versionNumber ?? 1,
    createdAt: base.createdAt ?? new Date().toISOString(),
  }
}

export function createMockTemplatesAdminClient(): TemplatesAdminClient {
  return {
    async create(_accessToken: string, input: TemplateUpsert) {
      const template = toTemplate(createId(), input, {})
      mockTemplates = [...mockTemplates, template]
      return template
    },
    async update(_accessToken: string, id: string, input: TemplateUpsert) {
      const existing = mockTemplates.find((t) => t.id === id)
      if (!existing) throw new Error(`Template ${id} not found`)

      // Editing an already-published template creates a new version rather than
      // overwriting it in place (FR-014, us-5.3) — the mock models this as bumping
      // versionNumber while keeping the same id/slug (the prior version is not kept
      // around separately here since nothing in this feature's UI reads version
      // history; the important, testable behavior is that versionNumber advances).
      const wasPublished = existing.status === 'published'
      const updated = toTemplate(id, input, existing)
      if (wasPublished) {
        updated.versionNumber = existing.versionNumber + 1
        updated.status = 'draft'
        updated.isOfficial = false
      }
      mockTemplates = mockTemplates.map((t) => (t.id === id ? updated : t))
      return updated
    },
    async publish(_accessToken: string, id: string) {
      const existing = mockTemplates.find((t) => t.id === id)
      if (!existing) throw new Error(`Template ${id} not found`)

      const missing = findMissingPlaceholders(existing.promptBody, existing.variables)
      if (missing.length > 0) {
        throw new PublishValidationError(missing)
      }

      const published: Template = { ...existing, status: 'published', isOfficial: true }
      mockTemplates = mockTemplates.map((t) => (t.id === id ? published : t))
      return published
    },
    async list() {
      return [...mockTemplates].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    },
  }
}
