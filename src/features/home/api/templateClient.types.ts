import type { TemplateListItem, AiModel, Category, Tag } from '../types'
import type { PageMeta } from '@/shared/types/api'

export interface TemplateClient {
  getTemplates(params: {
    q?: string
    category?: string
    tags?: string
    model?: string
    sort?: 'popular' | 'newest' | 'most_used' | 'official'
    page?: number
    size?: number
  }): Promise<{ data: TemplateListItem[]; meta: PageMeta }>

  getFeatured(): Promise<TemplateListItem[]>

  getTrending(params?: { window?: '24h' | '7d' | '30d' }): Promise<TemplateListItem[]>

  getModels(): Promise<AiModel[]>

  getCategories(): Promise<Category[]>

  getTags(params?: { q?: string; limit?: number }): Promise<Tag[]>

  toggleFavorite(templateId: string): Promise<{ isFavorited: boolean }>
}
