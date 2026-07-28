import type { I18nString } from '@/shared/types/api'

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

export interface TemplateVersion {
  version: number
  promptBody: string
  guide: I18nString
  exampleOutput: I18nString
}

export interface TemplateDetail {
  id: string
  slug: string
  title: I18nString
  description: I18nString
  coverImage: string | null
  isOfficial: boolean
  author: AuthorBrief
  categories: Category[]
  supportedModels: string[]
  usageCount: number
  favoriteCount: number
  isFavorited: boolean
  viewCount: number
  createdAt: string
  currentVersion: TemplateVersion
}
