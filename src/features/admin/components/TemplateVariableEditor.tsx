import type { TemplateVariable } from '@/features/admin/api/templatesAdminClient.types'

interface TemplateVariableEditorProps {
  variables: TemplateVariable[]
  onChange: (variables: TemplateVariable[]) => void
}

const INPUT_TYPES: TemplateVariable['inputType'][] = [
  'text',
  'textarea',
  'select',
  'multiselect',
  'number',
  'boolean',
  'date',
  'file',
  'url',
  'color',
  'slider',
]

const inputBase =
  'w-full rounded-lg border border-[#DBDFD3] bg-white px-3 py-1.5 text-[0.82rem] text-[#1B1D1B] transition-colors duration-150 focus:border-[#3652E0] focus:outline-none dark:border-[#2C3130] dark:bg-[#1C2024] dark:text-[#ECEEE8]'

function optionsToText(variable: TemplateVariable): string {
  return (variable.options ?? []).map((o) => o.value).join(', ')
}

function parseOptions(text: string): TemplateVariable['options'] {
  return text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((value) => ({ value, label: { en: value } }))
}

export function TemplateVariableEditor({ variables, onChange }: TemplateVariableEditorProps) {
  function updateVariable(index: number, patch: Partial<TemplateVariable>) {
    onChange(variables.map((v, i) => (i === index ? { ...v, ...patch } : v)))
  }

  function removeVariable(index: number) {
    onChange(variables.filter((_, i) => i !== index))
  }

  function addVariable() {
    onChange([
      ...variables,
      {
        varKey: '',
        label: { en: '' },
        inputType: 'text',
        isRequired: false,
        sortOrder: variables.length + 1,
      },
    ])
  }

  return (
    <div className="flex flex-col gap-3">
      {variables.map((variable, index) => (
        <div
          key={index}
          className="flex flex-col gap-2 rounded-lg border border-[#DBDFD3] p-3 dark:border-[#2C3130]"
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
            <input
              className={inputBase}
              value={variable.varKey}
              onChange={(e) => updateVariable(index, { varKey: e.target.value })}
              placeholder="varKey (khớp với {{varKey}})"
              aria-label={`Var key ${index + 1}`}
            />
            <input
              className={inputBase}
              value={variable.label.en}
              onChange={(e) => updateVariable(index, { label: { ...variable.label, en: e.target.value } })}
              placeholder="Nhãn (EN)"
              aria-label={`Nhãn ${index + 1}`}
            />
            <select
              className={`${inputBase} cursor-pointer`}
              value={variable.inputType}
              onChange={(e) =>
                updateVariable(index, { inputType: e.target.value as TemplateVariable['inputType'] })
              }
              aria-label={`Loại trường ${index + 1}`}
            >
              {INPUT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-[0.8rem] text-[#4A4F4A] dark:text-[#A8ADA7]">
              <input
                type="checkbox"
                checked={variable.isRequired ?? false}
                onChange={(e) => updateVariable(index, { isRequired: e.target.checked })}
              />
              Bắt buộc
            </label>
          </div>
          {(variable.inputType === 'select' || variable.inputType === 'multiselect') && (
            <input
              className={inputBase}
              value={optionsToText(variable)}
              onChange={(e) => updateVariable(index, { options: parseOptions(e.target.value) })}
              placeholder="Các lựa chọn, cách nhau bởi dấu phẩy"
              aria-label={`Lựa chọn ${index + 1}`}
            />
          )}
          <button
            type="button"
            onClick={() => removeVariable(index)}
            className="w-fit cursor-pointer text-[0.78rem] text-[#C23A2A] underline underline-offset-2 dark:text-[#FF7A6B]"
          >
            Xóa biến này
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addVariable}
        className="w-fit cursor-pointer rounded-lg border border-[#DBDFD3] px-3 py-1.5 text-[0.8rem] text-[#4A4F4A] transition-colors duration-150 hover:border-[#3652E0] dark:border-[#2C3130] dark:text-[#A8ADA7] dark:hover:border-[#8493FF]"
      >
        + Thêm biến
      </button>
    </div>
  )
}
