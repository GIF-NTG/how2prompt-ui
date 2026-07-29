import type { I18nString } from '@/shared/types/api'

export interface TemplateVariableOption {
  value: string
  label: I18nString
}

export interface TemplateVariable {
  varKey: string
  label: I18nString
  description?: I18nString
  placeholder?: I18nString
  inputType:
    | 'text'
    | 'textarea'
    | 'select'
    | 'multiselect'
    | 'number'
    | 'boolean'
    | 'date'
    | 'file'
    | 'url'
    | 'color'
    | 'slider'
  isRequired?: boolean
  defaultValue?: string
  options?: TemplateVariableOption[]
  validation?: Record<string, unknown>
  sortOrder?: number
}

export interface TemplateVariant {
  aiModelCode: string
  promptBodyOverride: string | null
  systemPromptOverride: string | null
  modelConfig: Record<string, unknown>
}

export interface TemplateUpsert {
  title: I18nString
  description?: I18nString
  coverImage?: string
  categoryIds?: string[]
  tagSlugs?: string[]
  modelCodes?: string[]
  promptBody: string
  systemPrompt?: string
  exampleOutput?: string
  guide?: I18nString
  variables?: TemplateVariable[]
  changelog?: string
}

export interface Template {
  id: string
  slug: string
  title: I18nString
  description: I18nString
  coverImage: string | null
  isOfficial: boolean
  status: 'draft' | 'published'
  categoryIds: string[]
  tagSlugs: string[]
  modelCodes: string[]
  promptBody: string
  systemPrompt: string | null
  exampleOutput: string | null
  guide: I18nString
  variables: TemplateVariable[]
  variants: TemplateVariant[]
  versionNumber: number
  createdAt: string
}

/** Thrown by publish() when the backend's placeholder/variable validation fails
 *  (docs/api/openapi.yaml's 422 response — contracts/admin-api.md). */
export class PublishValidationError extends Error {
  missingPlaceholders: string[]
  constructor(missingPlaceholders: string[]) {
    super('Một số placeholder chưa có biến tương ứng.')
    this.name = 'PublishValidationError'
    this.missingPlaceholders = missingPlaceholders
  }
}

export interface TemplatesAdminClient {
  create(accessToken: string, input: TemplateUpsert): Promise<Template>
  update(accessToken: string, id: string, input: TemplateUpsert): Promise<Template>
  /** Throws PublishValidationError if a `{{placeholder}}` has no matching variable. */
  publish(accessToken: string, id: string): Promise<Template>
  list(): Promise<Template[]>
}
