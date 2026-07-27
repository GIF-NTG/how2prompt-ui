import type { I18nString, PageInfo } from '@/shared/types/api'

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

export interface Tag {
  id: string
  slug: string
  name: string
  usage_count: number
}

export interface AiModel {
  id: string
  code: string
  name: string
  provider: string
  model_type: 'text' | 'image' | 'video' | 'audio' | 'multimodal'
  description: string | null
  capabilities: Record<string, unknown>
  icon_url: string | null
  is_active: boolean
  sort_order: number
}

export interface TemplateListItem {
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
  created_at: string
}

export interface CatalogFilters {
  search: string
  tag: string
  model: string
}

export interface CatalogPageData {
  templates: TemplateListItem[]
  featured: TemplateListItem[]
  trending: TemplateListItem[]
  categories: Category[]
  tags: Tag[]
  models: AiModel[]
  total_count: number
  page_info: PageInfo
}

export type { I18nString, PageInfo }
