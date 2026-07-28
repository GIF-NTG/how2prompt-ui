import type { TemplateDetail } from '../types'

export interface TemplateDetailClient {
  getDetail(slug: string): Promise<TemplateDetail>
  toggleFavorite(templateId: string): Promise<{ isFavorited: boolean }>
  incrementViewCount(slug: string): Promise<void>
}
