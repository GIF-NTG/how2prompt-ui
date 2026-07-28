export interface I18nString {
  en: string
  vi?: string
}

export interface PageMeta {
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export { ApiError } from '@/shared/utils/httpClient'
