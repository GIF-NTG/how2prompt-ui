import type { I18nString } from '@/shared/types/api'
import { getI18nValue } from '@/shared/utils/i18n'

interface ExampleOutputProps {
  exampleOutput: I18nString
}

export function ExampleOutput({ exampleOutput }: ExampleOutputProps) {
  return (
    <section className="flex flex-col gap-2 rounded-[14px] border border-[#DBDFD3] bg-white p-[1.1rem_1.2rem] dark:border-[#2C3130] dark:bg-[#1C2024]">
      <h2 className="m-0 text-[0.95rem] font-bold tracking-[-0.005em]">Ví dụ kết quả</h2>
      <pre className="m-0 whitespace-pre-wrap rounded-lg bg-[#F3F5F0] p-4 font-mono text-[0.8rem] leading-[1.6] text-[#1B1D1B] dark:bg-[#23282C] dark:text-[#ECEEE8]">
        {getI18nValue(exampleOutput)}
      </pre>
    </section>
  )
}
