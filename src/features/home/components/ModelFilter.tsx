import { useEffect, useMemo } from 'react'
import { useHomeData } from '@/features/home/context/useHomeData'
import { SelectMenu } from '@/shared/components/SelectMenu'

interface ModelFilterProps {
  value: string
  onChange: (code: string) => void
}

export function ModelFilter({ value, onChange }: ModelFilterProps) {
  const { models, modelsLoaded, ensureModels } = useHomeData()

  useEffect(() => {
    void ensureModels()
  }, [ensureModels])

  const options = useMemo(
    () => [
      { value: '', label: modelsLoaded ? 'All AI models' : 'Loading…' },
      ...models.map((m) => ({ value: m.code, label: m.name })),
    ],
    [models, modelsLoaded],
  )

  return (
    <SelectMenu
      value={value}
      options={options}
      onChange={onChange}
      ariaLabel="Filter by AI model"
    />
  )
}
