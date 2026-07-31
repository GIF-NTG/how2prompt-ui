import type { TemplateVariable } from '@/features/template-generate/types'
import type { TemplateVariableInput } from '../api/templatesAdminClient.types'

const FIELD_CLASSES =
  'rounded-lg border border-[#DBDFD3] bg-transparent px-2 py-1.5 text-xs text-[#1B1D1B] focus:border-[#3652E0] focus:outline-none dark:border-[#2C3130] dark:text-[#ECEEE8] dark:focus:border-[#8493FF]'

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

function emptyVariable(sortOrder: number): TemplateVariableInput {
  return {
    varKey: '',
    label: { en: '' },
    description: { en: '' },
    placeholder: { en: '' },
    helpText: { en: '' },
    inputType: 'text',
    isRequired: false,
    defaultValue: null,
    options: [],
    validation: {},
    sortOrder,
  }
}

interface TemplateVariableEditorProps {
  variables: TemplateVariableInput[]
  onChange: (variables: TemplateVariableInput[]) => void
}

/** Declares/reorders a template's variables (FR-009) — same
 *  `template_variables` shape Epic 3's dynamic form already consumes
 *  (Constitution Principle I), reused via `TemplateVariable` from
 *  `template-generate/types`. */
export function TemplateVariableEditor({ variables, onChange }: TemplateVariableEditorProps) {
  function updateVariable(index: number, patch: Partial<TemplateVariableInput>) {
    onChange(variables.map((v, i) => (i === index ? { ...v, ...patch } : v)))
  }

  function addVariable() {
    onChange([...variables, emptyVariable(variables.length)])
  }

  function removeVariable(index: number) {
    onChange(variables.filter((_, i) => i !== index))
  }

  function moveVariable(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= variables.length) return
    const next = [...variables]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next.map((v, i) => ({ ...v, sortOrder: i })))
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="m-0 text-xs font-bold uppercase tracking-wide text-[#5B5F58] dark:text-[#A2A79C]">
          Variables
        </h3>
        <button
          type="button"
          onClick={addVariable}
          className="text-xs text-[#3652E0] underline underline-offset-2 dark:text-[#8493FF]"
        >
          + Thêm variable
        </button>
      </div>

      {variables.length === 0 ? (
        <p className="text-xs text-[#5B5F58] dark:text-[#A2A79C]">
          Chưa có variable nào được khai báo.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {variables.map((variable, index) => (
            <li
              key={index}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-[#DBDFD3] p-2 dark:border-[#2C3130]"
            >
              <input
                value={variable.varKey}
                onChange={(e) => updateVariable(index, { varKey: e.target.value })}
                placeholder="varKey"
                className={FIELD_CLASSES}
              />
              <input
                value={variable.label.en}
                onChange={(e) =>
                  updateVariable(index, { label: { ...variable.label, en: e.target.value } })
                }
                placeholder="Label"
                className={FIELD_CLASSES}
              />
              <select
                value={variable.inputType}
                onChange={(e) =>
                  updateVariable(index, {
                    inputType: e.target.value as TemplateVariable['inputType'],
                  })
                }
                className={FIELD_CLASSES}
              >
                {INPUT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={variable.isRequired}
                  onChange={(e) => updateVariable(index, { isRequired: e.target.checked })}
                />
                Bắt buộc
              </label>
              <button
                type="button"
                onClick={() => moveVariable(index, -1)}
                disabled={index === 0}
                className="text-xs text-[#5B5F58] disabled:opacity-40 dark:text-[#A2A79C]"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveVariable(index, 1)}
                disabled={index === variables.length - 1}
                className="text-xs text-[#5B5F58] disabled:opacity-40 dark:text-[#A2A79C]"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeVariable(index)}
                className="text-xs text-[#C23A2E] dark:text-[#FF7A6B]"
              >
                Xoá
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
