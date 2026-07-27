export interface I18nString {
  en: string
  vi?: string
}

export interface PageInfo {
  next_cursor: string | null
  has_next: boolean
}

export { ApiError } from '@/shared/utils/httpClient'
