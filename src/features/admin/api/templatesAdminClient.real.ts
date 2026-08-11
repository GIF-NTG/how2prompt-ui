import { apiFetch } from '@/shared/utils/httpClient'
import type { I18nString } from '@/shared/types/api'
import type { TemplateVariable, TemplateVariant } from '@/features/template-generate/types'
import type { RawTemplateListItem } from '@/features/home/api/templateClient.real'
import type {
  AdminTemplate,
  AdminTemplateVersion,
  TemplateUpsert,
  TemplateVariableInput,
  TemplatesAdminClient,
} from './templatesAdminClient.types'

/** No `GET /admin/templates` list/detail endpoint exists on the real backend
 *  (verified against its live `/v3/api-docs` — `docs/api/openapi.yaml` in
 *  this repo is stale on this point) — reads go through the same public
 *  `/templates` and `/templates/{id}` endpoints the home page uses (see
 *  `home/api/templateClient.real.ts`). Since the public list only returns
 *  published templates, drafts won't reappear in `list()` until published
 *  (existing tracked gap, see CLAUDE.md).
 *
 *  The write side of `/admin/templates` is narrower than `TemplateUpsert`
 *  suggests: `POST /admin/templates` only accepts the version-1 content
 *  fields (slug/title/description/cover/promptBody/systemPrompt/
 *  exampleOutput/guide) — categories/tags/models are set via a *separate*
 *  `PATCH /admin/templates/{id}` call, and variables/variants are added via
 *  their own `POST /admin/templates/{id}/variables` and `.../variants`
 *  endpoints, one call per item. There is no endpoint to edit promptBody,
 *  guide, systemPrompt, exampleOutput, variables, or variants of an
 *  already-created template — `update()` below can only patch metadata
 *  (title/description/cover/categories/tags/models); content changes made in
 *  the editor form for an existing template are not persisted. */
interface TemplatesPage {
  items: RawTemplateListItem[]
  nextCursor: string | null
  hasMore: boolean
}

interface RawTemplateVariable {
  id: string
  varKey: string
  labelI18n: I18nString
  descriptionI18n: I18nString
  placeholderI18n: I18nString
  helpTextI18n: I18nString
  inputType: TemplateVariable['inputType']
  required: boolean
  defaultValue: string | null
  options: TemplateVariable['options']
  validation: TemplateVariable['validation']
  sortOrder: number
}

interface RawTemplateVersion {
  id: string
  versionNumber: number
  promptBody: string
  systemPrompt: string | null
  exampleOutput: string | null
  guideI18n: I18nString
  variables: RawTemplateVariable[]
  variants: TemplateVariant[]
}

interface RawTemplateDetail extends RawTemplateListItem {
  currentVersion: RawTemplateVersion
  status?: 'draft' | 'published'
  isFeatured?: boolean
}

function mapTemplateVariable(raw: RawTemplateVariable): TemplateVariable {
  return {
    id: raw.id,
    varKey: raw.varKey,
    label: raw.labelI18n,
    description: raw.descriptionI18n,
    placeholder: raw.placeholderI18n,
    helpText: raw.helpTextI18n,
    inputType: raw.inputType,
    isRequired: raw.required,
    defaultValue: raw.defaultValue,
    options: raw.options,
    validation: raw.validation,
    sortOrder: raw.sortOrder,
  }
}

function mapTemplateVersion(raw: RawTemplateVersion): AdminTemplateVersion {
  return {
    id: raw.id,
    versionNumber: raw.versionNumber,
    promptBody: raw.promptBody,
    systemPrompt: raw.systemPrompt,
    exampleOutput: raw.exampleOutput,
    guide: raw.guideI18n,
    variables: raw.variables.map(mapTemplateVariable),
    variants: raw.variants ?? [],
  }
}

function mapAdminTemplate(raw: RawTemplateDetail): AdminTemplate {
  return {
    id: raw.id,
    title: raw.titleI18n,
    description: raw.descriptionI18n,
    coverImage: raw.coverImage,
    isFeatured: raw.isFeatured ?? false,
    categoryIds: (raw.categories ?? []).map((c) => c.id),
    tagSlugs: (raw.tags ?? []).map((t) => t.slug),
    modelCodes: (raw.models ?? []).map((m) => (typeof m === 'string' ? m : m.code)),
    isOfficial: raw.official,
    status: raw.status ?? 'published',
    currentVersion: mapTemplateVersion(raw.currentVersion),
  }
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `template-${Date.now()}`
  )
}

async function fetchDetail(id: string, accessToken?: string): Promise<AdminTemplate> {
  const raw = await apiFetch<RawTemplateDetail>(`/templates/${id}`, { accessToken })
  return mapAdminTemplate(raw)
}

/** `/admin/templates` writes address categories/tags/models by id, but the
 *  editor form (and the rest of the app) works with tag slugs and model
 *  codes — resolved here against the public `/tags` and `/ai-models` reads
 *  rather than growing the write payload the form has to build. */
async function resolveTagIds(slugs: string[]): Promise<string[]> {
  if (slugs.length === 0) return []
  const tags = await apiFetch<{ id: string; slug: string }[]>('/tags')
  const bySlug = new Map(tags.map((t) => [t.slug, t.id]))
  return slugs.map((s) => bySlug.get(s)).filter((id): id is string => Boolean(id))
}

async function resolveModelIds(codes: string[]): Promise<string[]> {
  if (codes.length === 0) return []
  const models = await apiFetch<{ id: string; code: string }[]>('/ai-models')
  const byCode = new Map(models.map((m) => [m.code, m.id]))
  return codes.map((c) => byCode.get(c)).filter((id): id is string => Boolean(id))
}

async function patchMetadata(
  id: string,
  input: TemplateUpsert,
  accessToken: string | undefined,
  extra?: Record<string, unknown>,
) {
  const [tagIds, modelIds] = await Promise.all([
    resolveTagIds(input.tagSlugs),
    resolveModelIds(input.modelCodes),
  ])
  await apiFetch(`/admin/templates/${id}`, {
    method: 'PATCH',
    body: {
      titleI18n: input.title,
      descriptionI18n: input.description,
      coverImage: input.coverImage ?? undefined,
      isFeatured: input.isFeatured,
      categoryIds: input.categoryIds,
      tagIds,
      modelIds,
      ...extra,
    },
    accessToken,
  })
}

async function addVariables(id: string, variables: TemplateVariableInput[], accessToken?: string) {
  for (const variable of variables) {
    await apiFetch(`/admin/templates/${id}/variables`, {
      method: 'POST',
      body: {
        varKey: variable.varKey,
        labelI18n: variable.label,
        descriptionI18n: variable.description,
        placeholderI18n: variable.placeholder,
        helpTextI18n: variable.helpText,
        inputType: variable.inputType,
        required: variable.isRequired,
        defaultValue: variable.defaultValue,
        options: variable.options,
        validation: variable.validation,
        sortOrder: variable.sortOrder,
      },
      accessToken,
    })
  }
}

async function addVariants(id: string, variants: TemplateVariant[], accessToken?: string) {
  for (const variant of variants) {
    const [modelId] = await resolveModelIds([variant.aiModelCode])
    if (!modelId) continue
    await apiFetch(`/admin/templates/${id}/variants`, {
      method: 'POST',
      body: {
        aiModelId: modelId,
        promptBodyOverride: variant.promptBodyOverride ?? undefined,
        systemPromptOverride: variant.systemPromptOverride ?? undefined,
        modelConfig: variant.modelConfig,
      },
      accessToken,
    })
  }
}

const PAGE_SIZE = 20

export function createRealTemplatesAdminClient(accessToken?: string): TemplatesAdminClient {
  return {
    // `limit`, not `size` — verified against the real backend's live
    // `/v3/api-docs` (`docs/api/openapi.yaml` is stale here); the previous
    // `?size=100` was silently ignored, so every call fetched the backend's
    // full default page in one shot instead of actually paging.
    async list(cursor) {
      const searchParams = new URLSearchParams()
      searchParams.set('limit', String(PAGE_SIZE))
      if (cursor) searchParams.set('cursor', cursor)
      const page = await apiFetch<TemplatesPage>(`/templates?${searchParams.toString()}`, {
        accessToken,
      })
      const details = await Promise.all(
        page.items.map((item) =>
          apiFetch<RawTemplateDetail>(`/templates/${item.id}`, { accessToken }),
        ),
      )
      return {
        items: details.map(mapAdminTemplate),
        nextCursor: page.nextCursor,
        hasMore: page.hasMore,
      }
    },

    async create(input) {
      const created = await apiFetch<{ id: string }>('/admin/templates', {
        method: 'POST',
        body: {
          slug: slugify(input.title.en),
          titleI18n: input.title,
          descriptionI18n: input.description,
          coverImage: input.coverImage ?? undefined,
          promptBody: input.promptBody,
          systemPrompt: input.systemPrompt ?? undefined,
          exampleOutput: input.exampleOutput ?? undefined,
          guideI18n: input.guide,
        },
        accessToken,
      })
      await patchMetadata(created.id, input, accessToken)
      await addVariables(created.id, input.variables, accessToken)
      await addVariants(created.id, input.variants, accessToken)
      return fetchDetail(created.id, accessToken)
    },

    // Metadata-only — see file header comment. promptBody/guide/systemPrompt/
    // exampleOutput/variables/variants edits in the form are not sent; the
    // backend has no endpoint to change them after creation.
    async update(id, input) {
      await patchMetadata(id, input, accessToken)
      return fetchDetail(id, accessToken)
    },

    async publish(id) {
      await apiFetch(`/admin/templates/${id}`, {
        method: 'PATCH',
        body: { status: 'published', isPublic: true },
        accessToken,
      })
      return fetchDetail(id, accessToken)
    },

    async delete(id) {
      await apiFetch(`/admin/templates/${id}`, { method: 'DELETE', accessToken })
    },
  }
}
