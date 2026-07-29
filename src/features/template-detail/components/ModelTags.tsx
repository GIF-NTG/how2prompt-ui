import { getModelLabel } from '@/shared/utils/modelLabel'
import { getTagColorClasses } from '@/shared/utils/colorTag'

interface ModelTagsProps {
  models: string[]
}

export function ModelTags({ models }: ModelTagsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {models.map((m) => (
        <span
          key={m}
          className={`rounded-full border bg-[#EAEDE6] px-2 py-[0.14rem] font-mono text-[0.68rem] dark:bg-[#23282C] ${getTagColorClasses(m)}`}
        >
          {getModelLabel(m)}
        </span>
      ))}
    </div>
  )
}
