import { useEffect, useState } from 'react'
import { templateClient } from '@/features/home/api/templateClient'
import type { AiModel } from '@/features/home/types'

interface ModelFilterProps {
  value: string
  onChange: (code: string) => void
}

export function ModelFilter({ value, onChange }: ModelFilterProps) {
  const [models, setModels] = useState<AiModel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    templateClient.getModels().then((data) => {
      if (!cancelled) {
        setModels(data)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="font-[inherit] cursor-pointer rounded-xl border border-[#DBDFD3] bg-white px-[0.9rem] py-[0.62rem] text-[0.86rem] text-[#1B1D1B] transition-colors duration-150 focus:border-[#3652E0] focus:outline-none dark:border-[#2C3130] dark:bg-[#1C2024] dark:text-[#ECEEE8]"
    >
      <option value="">{loading ? 'Đang tải...' : 'Tất cả model AI'}</option>
      {models.map((m) => (
        <option key={m.id} value={m.code}>
          {m.name}
        </option>
      ))}
    </select>
  )
}
