import type { TemplateDetail } from '../types'

export interface TemplateDetailClient {
  getDetail(id: string, accessToken?: string): Promise<TemplateDetail>
  toggleFavorite(
    templateId: string,
    isFavorited: boolean,
    accessToken?: string,
  ): Promise<{ isFavorited: boolean }>
  incrementViewCount(id: string): Promise<void>
}
