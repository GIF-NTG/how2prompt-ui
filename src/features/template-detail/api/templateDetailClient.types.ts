import type { TemplateDetail } from '../types'

export interface TemplateDetailClient {
  getDetail(id: string): Promise<TemplateDetail>
  toggleFavorite(templateId: string, isFavorited: boolean): Promise<{ isFavorited: boolean }>
  incrementViewCount(id: string): Promise<void>
}
