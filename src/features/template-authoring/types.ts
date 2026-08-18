import type { I18nString } from '@/shared/types/api'

/** Epic 7 (Template Customization & Versioning) DTOs — see
 *  docs/api/openapi.yaml's "Template Authoring" tag. Distinct from
 *  `template-detail/types.ts`'s read-only `TemplateDetail`/`TemplateVersion`
 *  (Epic 2/3): this is the owner-side authoring/draft model. */

export type TemplateAuthoringStatus = 'draft' | 'pending' | 'published'

export interface TemplateModelLink {
  aiModelId: string
  primary: boolean
}

export interface TemplateAuthoringResponse {
  id: string
  workspaceId: string
  slug: string
  titleI18n: I18nString
  descriptionI18n: I18nString
  coverImage: string | null
  authorId: string
  authorType: string
  official: boolean
  isPublic: boolean
  status: TemplateAuthoringStatus
  currentVersionId: string
  usageCount: number
  favoriteCount: number
  featuredAt: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  categoryIds: string[]
  tagIds: string[]
  models: TemplateModelLink[]
  forkedFromTemplateId: string | null
  forkedFromVersionId: string | null
  forkCount: number
  lockVersion: number
}

export interface TemplateAuthoringCreateInput {
  slug: string
  titleI18n?: I18nString
  descriptionI18n?: I18nString
  coverImage?: string | null
  promptBody: string
  systemPrompt?: string | null
  exampleOutput?: string | null
  guideI18n?: I18nString
}

export interface TemplateAuthoringEditInput {
  titleI18n?: I18nString
  descriptionI18n?: I18nString
  promptBody?: string | null
  systemPrompt?: string | null
  exampleOutput?: string | null
  guideI18n?: I18nString
  changelog?: string | null
  variableKeysToRemove?: string[]
  expectedLockVersion: number
}

export interface TemplateVersionSummary {
  id: string
  versionNumber: number
  changelog: string | null
  createdBy: string
  createdAt: string
  current: boolean
  archivedAt: string | null
}

export interface TemplateVersionDiff {
  promptBodyChanged: boolean
  oldPromptBody: string | null
  newPromptBody: string | null
  systemPromptChanged: boolean
  oldSystemPrompt: string | null
  newSystemPrompt: string | null
  guideI18nChanged: boolean
  oldGuideI18n: I18nString
  newGuideI18n: I18nString
  addedVariableKeys: string[]
  removedVariableKeys: string[]
  changedVariableKeys: string[]
}

export interface TemplateSubmitResult {
  templateId: string
  status: 'draft' | 'pending'
  rejectionReason: string | null
  missingFields: string[]
}
