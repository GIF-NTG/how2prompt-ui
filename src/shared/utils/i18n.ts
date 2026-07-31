import type { I18nString } from '@/shared/types/api'

export function getI18nValue(obj: I18nString | null | undefined, locale: string = 'vi'): string {
  if (!obj) return ''
  if (locale === 'vi' && obj.vi) return obj.vi
  return obj.vi ?? obj.en ?? ''
}
