import { useState, useMemo, useCallback } from 'react'
import type { TemplateDetail } from '@/features/template-detail/types'
import type {
  TemplateVariable,
  UseGenerateFormResult,
} from '../types'

function getInitialModelCode(template: TemplateDetail): string {
  if (template.supportedModels.length > 0) {
    return template.supportedModels[0]
  }
  return ''
}

function getActiveVariables(
  template: TemplateDetail,
  modelCode: string,
): TemplateVariable[] {
  const variant = template.currentVersion.variants.find(
    (v) => v.aiModelCode === modelCode,
  )
  if (variant?.promptBodyOverride) {
    return template.currentVersion.variables
  }
  return template.currentVersion.variables
}

function validateVariable(
  variable: TemplateVariable,
  value: string | number | boolean | string[] | undefined,
): string | null {
  if (variable.isRequired) {
    if (value === undefined || value === null || value === '') {
      return `${variable.label.en || variable.label.vi || variable.varKey} is required`
    }
    if (Array.isArray(value) && value.length === 0) {
      return `${variable.label.en || variable.label.vi || variable.varKey} is required`
    }
  }

  if (value === undefined || value === null || value === '') {
    return null
  }

  const { validation } = variable

  if (variable.inputType === 'number' || variable.inputType === 'slider') {
    const num = Number(value)
    if (isNaN(num)) {
      return 'Must be a number'
    }
    if (validation.min !== undefined && num < validation.min) {
      return `Must be at least ${validation.min}`
    }
    if (validation.max !== undefined && num > validation.max) {
      return `Must be at most ${validation.max}`
    }
  }

  if (
    (variable.inputType === 'text' || variable.inputType === 'textarea') &&
    validation.regex
  ) {
    try {
      const re = new RegExp(validation.regex)
      if (!re.test(String(value))) {
        return `Must match pattern: ${validation.regex}`
      }
    } catch {
      // invalid regex in data — skip validation
    }
  }

  return null
}

function validateAll(
  variables: TemplateVariable[],
  inputValues: Record<string, string | number | boolean | string[]>,
): { errors: Record<string, string>; isValid: boolean } {
  const errors: Record<string, string> = {}
  for (const v of variables) {
    const err = validateVariable(v, inputValues[v.varKey])
    if (err) {
      errors[v.varKey] = err
    }
  }
  return { errors, isValid: Object.keys(errors).length === 0 }
}

function getInitialValues(
  variables: TemplateVariable[],
): Record<string, string | number | boolean | string[]> {
  const values: Record<string, string | number | boolean | string[]> = {}
  for (const v of variables) {
    if (v.defaultValue !== null) {
      if (v.inputType === 'number' || v.inputType === 'slider') {
        values[v.varKey] = Number(v.defaultValue)
      } else if (v.inputType === 'boolean') {
        values[v.varKey] = v.defaultValue === 'true'
      } else {
        values[v.varKey] = v.defaultValue
      }
    }
  }
  return values
}

export function useGenerateForm(template: TemplateDetail): UseGenerateFormResult {
  const initialModelCode = getInitialModelCode(template)
  const initialVariables = useMemo(
    () => getActiveVariables(template, initialModelCode),
    [template, initialModelCode],
  )

  const [selectedModelCode, setSelectedModelCode] = useState(initialModelCode)
  const [inputValues, setInputValues] = useState(() =>
    getInitialValues(initialVariables),
  )
  const [extraInstructions, setExtraInstructions] = useState('')

  const activeVariables = useMemo(
    () => getActiveVariables(template, selectedModelCode),
    [template, selectedModelCode],
  )

  const { errors, isValid } = useMemo(
    () => validateAll(activeVariables, inputValues),
    [activeVariables, inputValues],
  )

  const setModelCode = useCallback(
    (code: string) => {
      setSelectedModelCode(code)
      const newVars = getActiveVariables(template, code)
      const newKeys = new Set(newVars.map((v) => v.varKey))
      setInputValues((prev) => {
        const preserved: Record<string, string | number | boolean | string[]> = {}
        for (const key of Object.keys(prev)) {
          if (newKeys.has(key)) {
            preserved[key] = prev[key]
          }
        }
        return { ...getInitialValues(newVars), ...preserved }
      })
    },
    [template],
  )

  const setValue = useCallback(
    (varKey: string, value: string | number | boolean | string[]) => {
      setInputValues((prev) => ({ ...prev, [varKey]: value }))
    },
    [],
  )

  const setExtraInstructionsText = useCallback((text: string) => {
    setExtraInstructions(text)
  }, [])

  return {
    state: { selectedModelCode, inputValues, extraInstructions, errors, isValid },
    setModelCode,
    setValue,
    setExtraInstructions: setExtraInstructionsText,
    activeVariables,
  }
}
