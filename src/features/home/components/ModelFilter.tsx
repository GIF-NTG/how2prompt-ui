import { useEffect } from 'react'
import { useHomeData } from '@/features/home/context/useHomeData'

interface ModelFilterProps {
  value: string
  onChange: (code: string) => void
}

export function ModelFilter({ value, onChange }: ModelFilterProps) {
  const { models, modelsLoaded, ensureModels } = useHomeData()

  useEffect(() => {
    void ensureModels()
  }, [ensureModels])

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Filter by AI model"
      className="font-[inherit] cursor-pointer rounded-xl border border-[#DBDFD3] bg-white px-[0.9rem] py-[0.62rem] text-[0.86rem] text-[#1B1D1B] transition-colors duration-150 focus:border-[#3652E0] focus:outline-none dark:border-[#2C3130] dark:bg-[#1C2024] dark:text-[#ECEEE8]"
    >
      <option value="">{modelsLoaded ? 'All AI models' : 'Loading…'}</option>
      {models.map((m) => (
        <option key={m.id} value={m.code}>
          {m.name}
        </option>
      ))}
    </select>
  )
}
