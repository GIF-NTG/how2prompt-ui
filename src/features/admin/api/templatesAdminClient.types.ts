import type { I18nString } from '@/shared/types/api'
import type { TemplateVariable, TemplateVariant } from '@/features/template-generate/types'

export type { TemplateVariable, TemplateVariant }

export type TemplateVariableInput = Omit<TemplateVariable, 'id'> & { id?: string }

export type TemplateStatus = 'draft' | 'published'

/** Create/edit payload (FR-009). `tagSlugs` may only reference already-existing
 *  tags — no free-text tag creation exists in this feature (FR-007a). */
export interface TemplateUpsert {
  title: I18nString
  description: I18nString
  coverImage: string | null
  isFeatured: boolean
  categoryIds: string[]
  tagSlugs: string[]
  modelCodes: string[]
  promptBody: string
  systemPrompt: string | null
  exampleOutput: string | null
  guide: I18nString
  variables: TemplateVariableInput[]
  variants: TemplateVariant[]
}

export interface AdminTemplateVersion {
  id: string
  versionNumber: number
  promptBody: string
  systemPrompt: string | null
  exampleOutput: string | null
  guide: I18nString
  variables: TemplateVariable[]
  variants: TemplateVariant[]
}

export interface AdminTemplate {
  id: string
  title: I18nString
  description: I18nString
  coverImage: string | null
  isFeatured: boolean
  categoryIds: string[]
  tagSlugs: string[]
  modelCodes: string[]
  isOfficial: boolean
  status: TemplateStatus
  currentVersion: AdminTemplateVersion
}

export interface AdminTemplatePage {
  items: AdminTemplate[]
  nextCursor: string | null
  hasMore: boolean
}

export interface TemplatesAdminClient {
  list(cursor?: string): Promise<AdminTemplatePage>
  create(input: TemplateUpsert): Promise<AdminTemplate>
  /** Editing an already-published template creates a new version server-side
   *  (FR-014) rather than mutating the current one in place; concurrent edits
   *  by different Admins are last-write-wins (research.md Decision 7) — no
   *  conflict token is sent. */
  update(id: string, input: TemplateUpsert): Promise<AdminTemplate>
  /** Throws (mirroring the backend's `422`) if a `{{placeholder}}` has no
   *  matching declared variable — callers should run
   *  `validatePlaceholders` first for immediate feedback (FR-011). */
  publish(id: string): Promise<AdminTemplate>
  delete(id: string): Promise<void>
}
