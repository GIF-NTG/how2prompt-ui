import type { I18nString } from '@/shared/types/api'

export interface TemplateVariableOption {
  value: string
  label: I18nString
}

export interface TemplateVariable {
  id: string
  varKey: string
  label: I18nString
  description: I18nString
  placeholder: I18nString
  helpText: I18nString
  inputType:
    | 'text'
    | 'textarea'
    | 'select'
    | 'multiselect'
    | 'number'
    | 'boolean'
    | 'date'
    | 'file'
    | 'url'
    | 'color'
    | 'slider'
  isRequired: boolean
  defaultValue: string | null
  options: TemplateVariableOption[]
  validation: { min?: number; max?: number; regex?: string; [k: string]: unknown }
  sortOrder: number
}

export interface TemplateVariant {
  aiModelCode: string
  promptBodyOverride: string | null
  systemPromptOverride: string | null
  modelConfig: Record<string, unknown>
}

export type GenerateFormState = {
  selectedModelCode: string
  inputValues: Record<string, string | number | boolean | string[]>
  extraInstructions: string
  errors: Record<string, string>
  isValid: boolean
}

/** Seeds the form from a reloaded history entry (US3) instead of the
 *  template's own defaults. */
export interface GenerateFormOverride {
  modelCode: string
  inputValues: Record<string, string | number | boolean | string[]>
  extraInstructions?: string | null
}

export type UseGenerateFormResult = {
  state: GenerateFormState
  setModelCode: (code: string) => void
  setValue: (varKey: string, value: string | number | boolean | string[]) => void
  setExtraInstructions: (text: string) => void
  markTouched: (varKey: string) => void
  activeVariables: TemplateVariable[]
}
