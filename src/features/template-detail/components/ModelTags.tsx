import { getModelLabel } from '@/shared/utils/modelLabel'

interface ModelTagsProps {
  models: string[]
}

export function ModelTags({ models }: ModelTagsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {models.map((m) => (
        <span
          key={m}
          className="rounded-full bg-[#EAEDE6] px-2 py-[0.14rem] font-mono text-[0.68rem] text-[#8B8F86] dark:bg-[#23282C] dark:text-[#6D726A]"
        >
          {getModelLabel(m)}
        </span>
      ))}
    </div>
  )
}
