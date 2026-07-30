import type { TemplateListItem, AiModel, Category, Tag } from '../types'

export interface TemplateClient {
  getTemplates(params: {
    q?: string
    category?: string
    tags?: string
    model?: string
    sort?: 'popular' | 'newest' | 'most_used' | 'official'
    cursor?: string
    size?: number
  }): Promise<{ items: TemplateListItem[]; nextCursor: string | null; hasMore: boolean }>

  getFeatured(): Promise<TemplateListItem[]>

  getTrending(params?: { window?: '24h' | '7d' | '30d' }): Promise<TemplateListItem[]>

  getModels(): Promise<AiModel[]>

  getCategories(): Promise<Category[]>

  getTags(params?: { q?: string; limit?: number }): Promise<Tag[]>

  toggleFavorite(templateId: string, isFavorited: boolean): Promise<{ isFavorited: boolean }>
}
