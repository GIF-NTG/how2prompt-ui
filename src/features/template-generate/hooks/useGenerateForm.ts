import { useState, useMemo, useCallback } from 'react'
import type { TemplateDetail } from '@/features/template-detail/types'
import type { GenerateFormOverride, TemplateVariable, UseGenerateFormResult } from '../types'

function getInitialModelCode(template: TemplateDetail, override?: GenerateFormOverride): string {
  if (override?.modelCode) {
    return override.modelCode
  }
  if (template.supportedModels.length > 0) {
    return template.supportedModels[0]
  }
  return ''
}

function getActiveVariables(template: TemplateDetail, modelCode: string): TemplateVariable[] {
  const variant = template.currentVersion.variants.find((v) => v.aiModelCode === modelCode)
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

  if ((variable.inputType === 'text' || variable.inputType === 'textarea') && validation.regex) {
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

export function useGenerateForm(
  template: TemplateDetail,
  override?: GenerateFormOverride,
): UseGenerateFormResult {
  const initialModelCode = getInitialModelCode(template, override)
  const initialVariables = useMemo(
    () => getActiveVariables(template, initialModelCode),
    [template, initialModelCode],
  )

  const [selectedModelCode, setSelectedModelCode] = useState(initialModelCode)
  const [inputValues, setInputValues] = useState(() =>
    override
      ? { ...getInitialValues(initialVariables), ...override.inputValues }
      : getInitialValues(initialVariables),
  )
  const [extraInstructions, setExtraInstructions] = useState(override?.extraInstructions ?? '')
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const activeVariables = useMemo(
    () => getActiveVariables(template, selectedModelCode),
    [template, selectedModelCode],
  )

  const { errors: allErrors, isValid } = useMemo(
    () => validateAll(activeVariables, inputValues),
    [activeVariables, inputValues],
  )

  // Only surface errors for fields the visitor has actually interacted with —
  // otherwise every required field flashes an error before they've typed anything.
  const errors = useMemo(() => {
    const visible: Record<string, string> = {}
    for (const key of Object.keys(allErrors)) {
      if (touched[key]) {
        visible[key] = allErrors[key]
      }
    }
    return visible
  }, [allErrors, touched])

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
      setTouched({})
    },
    [template],
  )

  const setValue = useCallback((varKey: string, value: string | number | boolean | string[]) => {
    setInputValues((prev) => ({ ...prev, [varKey]: value }))
    setTouched((prev) => (prev[varKey] ? prev : { ...prev, [varKey]: true }))
  }, [])

  const markTouched = useCallback((varKey: string) => {
    setTouched((prev) => (prev[varKey] ? prev : { ...prev, [varKey]: true }))
  }, [])

  const setExtraInstructionsText = useCallback((text: string) => {
    setExtraInstructions(text)
  }, [])

  return {
    state: { selectedModelCode, inputValues, extraInstructions, errors, isValid },
    setModelCode,
    setValue,
    setExtraInstructions: setExtraInstructionsText,
    markTouched,
    activeVariables,
  }
}
