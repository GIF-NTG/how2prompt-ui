import type { TemplateListItem, AiModel, Category, Tag } from '../types'
import type { PageInfo } from '@/shared/types/api'

export interface TemplateClient {
  getTemplates(params: {
    q?: string
    category?: string
    tags?: string
    model?: string
    sort?: 'popular' | 'newest' | 'most_used' | 'official'
    limit?: number
    cursor?: string
  }): Promise<{ data: TemplateListItem[]; page_info: PageInfo; total_count: number }>

  getFeatured(): Promise<TemplateListItem[]>

  getTrending(params?: { window?: '24h' | '7d' | '30d' }): Promise<TemplateListItem[]>

  getModels(): Promise<AiModel[]>

  getCategories(): Promise<Category[]>

  getTags(params?: { q?: string; limit?: number }): Promise<Tag[]>

  toggleFavorite(templateId: string): Promise<{ is_favorited: boolean }>
}
