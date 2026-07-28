import type { I18nString } from '@/shared/types/api'
import type { TemplateVariable, TemplateVariant } from '@/features/template-generate/types'

export interface AuthorBrief {
  id: string | null
  full_name: string | null
  username: string | null
  avatar_url: string | null
  type: 'admin' | 'user' | 'system' | 'forked'
}

export interface Category {
  id: string
  slug: string
  name: I18nString
  description: I18nString
  icon: string | null
  color: string | null
  parent_id: string | null
  sort_order: number
  template_count: number
}

export interface TemplateVersion {
  version: number
  prompt_body: string
  guide: I18nString
  example_output: I18nString
  created_at: string
  variables: TemplateVariable[]
  variants: TemplateVariant[]
}

export interface TemplateDetail {
  id: string
  slug: string
  title: I18nString
  description: I18nString
  cover_image: string | null
  is_official: boolean
  author: AuthorBrief
  categories: Category[]
  supported_models: string[]
  usage_count: number
  favorite_count: number
  is_favorited: boolean
  view_count: number
  created_at: string
  current_version: TemplateVersion
}
