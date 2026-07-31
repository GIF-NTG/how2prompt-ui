import { apiFetch } from '@/shared/utils/httpClient'
import type { TemplateDetailClient } from './templateDetailClient.types'
import type { AuthorBrief, Category, TemplateDetail, TemplateVersion } from '../types'
import type { I18nString } from '@/shared/types/api'
import type { TemplateVariable, TemplateVariant } from '@/features/template-generate/types'

/** Shape actually returned by the real backend for a template detail, which
 *  diverges from `docs/api/openapi.yaml`'s `TemplateDetail`/`TemplateVersion`/
 *  `TemplateVariable` (titleI18n vs. title, official vs. isOfficial, models vs.
 *  supportedModels, authorId/authorType vs. an `author` object, no
 *  `isFavorited`, currentVersion.guideI18n vs. guide, variables' labelI18n/
 *  descriptionI18n/placeholderI18n/helpTextI18n vs. label/description/
 *  placeholder/helpText, required vs. isRequired) — same kind of drift as
 *  `project_templates_pagination_contract_drift`. Mapped to the FE's
 *  `TemplateDetail` shape below rather than propagating the raw fields. */
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

interface RawTemplateDetail {
  id: string
  slug: string
  titleI18n: I18nString
  descriptionI18n: I18nString
  coverImage: string | null
  official: boolean
  authorId: string | null
  authorType: AuthorBrief['type']
  categories: Category[]
  models: string[]
  usageCount: number
  favoriteCount: number
  isFavorited?: boolean
  viewCount: number
  createdAt: string
  currentVersion: RawTemplateVersion
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

function mapTemplateVersion(raw: RawTemplateVersion): TemplateVersion {
  return {
    id: raw.id,
    version: raw.versionNumber,
    promptBody: raw.promptBody,
    guide: raw.guideI18n,
    exampleOutput: raw.exampleOutput
      ? { en: raw.exampleOutput, vi: raw.exampleOutput }
      : { en: '', vi: '' },
    variables: raw.variables.map(mapTemplateVariable),
    variants: raw.variants ?? [],
  }
}

function mapTemplateDetail(raw: RawTemplateDetail): TemplateDetail {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.titleI18n,
    description: raw.descriptionI18n,
    coverImage: raw.coverImage,
    isOfficial: raw.official,
    author: {
      id: raw.authorId,
      fullName: null,
      username: null,
      avatarUrl: null,
      type: raw.authorType,
    },
    categories: raw.categories ?? [],
    supportedModels: raw.models ?? [],
    usageCount: raw.usageCount,
    favoriteCount: raw.favoriteCount,
    isFavorited: raw.isFavorited ?? false,
    viewCount: raw.viewCount,
    createdAt: raw.createdAt,
    currentVersion: mapTemplateVersion(raw.currentVersion),
  }
}

export function createRealTemplateDetailClient(): TemplateDetailClient {
  return {
    async getDetail(id) {
      const raw = await apiFetch<RawTemplateDetail>(`/templates/${id}`)
      return mapTemplateDetail(raw)
    },

    async toggleFavorite(templateId, isFavorited) {
      await apiFetch<void>(`/templates/${templateId}/favorite`, {
        method: isFavorited ? 'DELETE' : 'POST',
      })
      return { isFavorited: !isFavorited }
    },

    // No `/templates/{id}/view` endpoint exists in docs/api/openapi.yaml —
    // the backend tracks viewCount itself (returned on getDetail); calling it
    // 404s (surfaced as UNAUTHORIZED by the fallback route handler).
    async incrementViewCount() {},
  }
}
