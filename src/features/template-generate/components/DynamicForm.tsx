import { useMemo } from 'react'
import type { TemplateVariable } from '../types'
import { FormField } from './FormField'

interface DynamicFormProps {
  variables: TemplateVariable[]
  inputValues: Record<string, string | number | boolean | string[]>
  errors: Record<string, string>
  onValueChange: (varKey: string, value: string | number | boolean | string[]) => void
}

export function DynamicForm({
  variables,
  inputValues,
  errors,
  onValueChange,
}: DynamicFormProps) {
  const sorted = useMemo(
    () => [...variables].sort((a, b) => a.sortOrder - b.sortOrder),
    [variables],
  )

  if (sorted.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      {sorted.map((v) => (
        <FormField
          key={v.id}
          variable={v}
          value={inputValues[v.varKey]}
          error={errors[v.varKey]}
          onChange={(val) => onValueChange(v.varKey, val)}
        />
      ))}
    </div>
  )
}
