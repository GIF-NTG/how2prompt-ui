import type { I18nString, PageMeta } from '@/shared/types/api'

export interface AuthorBrief {
  id: string | null
  fullName: string | null
  username: string | null
  avatarUrl: string | null
  type: 'admin' | 'user' | 'system' | 'forked'
}

export interface Category {
  id: string
  slug: string
  name: I18nString
  description: I18nString
  icon: string | null
  color: string | null
  parentId: string | null
  sortOrder: number
  templateCount: number
}

export interface Tag {
  id: string
  slug: string
  name: string
  usageCount: number
}

export interface AiModel {
  id: string
  code: string
  name: string
  provider: string
  modelType: 'text' | 'image' | 'video' | 'audio' | 'multimodal'
  description: string | null
  capabilities: Record<string, unknown>
  iconUrl: string | null
  isActive: boolean
  sortOrder: number
}

export interface TemplateListItem {
  id: string
  slug: string
  title: I18nString
  description: I18nString
  coverImage: string | null
  isOfficial: boolean
  isFeatured: boolean
  author: AuthorBrief
  categories: Category[]
  tags: Tag[]
  supportedModels: string[]
  usageCount: number
  favoriteCount: number
  isFavorited: boolean
  createdAt: string
}

export interface CatalogFilters {
  search: string
  tag: string
  model: string
}

export type { I18nString, PageMeta }
