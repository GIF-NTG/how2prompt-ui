import type { I18nString } from '@/shared/types/api'
import { getI18nValue } from '@/shared/utils/i18n'

interface UsageGuideProps {
  guide: I18nString
}

export function UsageGuide({ guide }: UsageGuideProps) {
  return (
    <section className="flex flex-col gap-2 rounded-[14px] border border-[#DBDFD3] bg-white p-[1.1rem_1.2rem] dark:border-[#2C3130] dark:bg-[#1C2024]">
      <h2 className="m-0 text-[0.95rem] font-bold tracking-[-0.005em]">Hướng dẫn sử dụng</h2>
      <p className="m-0 whitespace-pre-wrap text-[0.88rem] leading-[1.65] text-[#5B5F58] dark:text-[#A2A79C]">
        {getI18nValue(guide)}
      </p>
    </section>
  )
}
