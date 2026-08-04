import type { TemplateVariable } from '../types'

interface FormFieldProps {
  variable: TemplateVariable
  value: string | number | boolean | string[] | undefined
  error: string | undefined
  locale?: 'en' | 'vi'
  onChange: (value: string | number | boolean | string[]) => void
  onBlur: () => void
}

function getLocalizedText(obj: { en: string; vi?: string }, locale: 'en' | 'vi'): string {
  return (locale === 'vi' && obj.vi) || obj.en
}

const inputBase =
  'w-full rounded-xl border bg-white px-[0.9rem] py-[0.62rem] text-[0.86rem] text-[#1B1D1B] transition-colors duration-150 focus:border-[#3652E0] focus:outline-none dark:border-[#2C3130] dark:bg-[#1C2024] dark:text-[#ECEEE8]'

function TextInput({
  variable,
  value,
  locale,
  onChange,
  onBlur,
  hasError,
}: {
  variable: TemplateVariable
  value: string | number | boolean | string[] | undefined
  locale: 'en' | 'vi'
  onChange: (v: string) => void
  onBlur: () => void
  hasError: boolean
}) {
  return (
    <input
      type="text"
      id={variable.varKey}
      name={variable.varKey}
      value={typeof value === 'string' ? value : ''}
      placeholder={getLocalizedText(variable.placeholder, locale)}
      required={variable.isRequired}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      className={`${inputBase} ${hasError ? 'border-[#C23A2A] dark:border-[#FF7A6B]' : 'border-[#DBDFD3] dark:border-[#2C3130]'}`}
    />
  )
}

function TextareaInput({
  variable,
  value,
  locale,
  onChange,
  onBlur,
  hasError,
}: {
  variable: TemplateVariable
  value: string | number | boolean | string[] | undefined
  locale: 'en' | 'vi'
  onChange: (v: string) => void
  onBlur: () => void
  hasError: boolean
}) {
  return (
    <textarea
      id={variable.varKey}
      name={variable.varKey}
      value={typeof value === 'string' ? value : ''}
      placeholder={getLocalizedText(variable.placeholder, locale)}
      required={variable.isRequired}
      rows={4}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      className={`${inputBase} min-h-[5rem] resize-y ${hasError ? 'border-[#C23A2A] dark:border-[#FF7A6B]' : 'border-[#DBDFD3] dark:border-[#2C3130]'}`}
    />
  )
}

function SelectInput({
  variable,
  value,
  locale,
  onChange,
  onBlur,
  hasError,
}: {
  variable: TemplateVariable
  value: string | number | boolean | string[] | undefined
  locale: 'en' | 'vi'
  onChange: (v: string) => void
  onBlur: () => void
  hasError: boolean
}) {
  return (
    <select
      id={variable.varKey}
      name={variable.varKey}
      value={typeof value === 'string' ? value : ''}
      required={variable.isRequired}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      className={`${inputBase} cursor-pointer ${hasError ? 'border-[#C23A2A] dark:border-[#FF7A6B]' : 'border-[#DBDFD3] dark:border-[#2C3130]'}`}
    >
      <option value="">{getLocalizedText(variable.placeholder, locale) || '-- Chọn --'}</option>
      {variable.options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {getLocalizedText(opt.label, locale)}
        </option>
      ))}
    </select>
  )
}

function MultiselectInput({
  variable,
  value,
  locale,
  onChange,
  onBlur,
}: {
  variable: TemplateVariable
  value: string | number | boolean | string[] | undefined
  locale: 'en' | 'vi'
  onChange: (v: string[]) => void
  onBlur: () => void
}) {
  const selected: string[] = Array.isArray(value) ? value : []

  function toggle(opt: string) {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt))
    } else {
      onChange([...selected, opt])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {variable.options.map((opt) => {
        const active = selected.includes(opt.value)
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            onBlur={onBlur}
            className={`cursor-pointer rounded-full border px-[0.75rem] py-[0.35rem] text-[0.8rem] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] ${
              active
                ? 'border-[#3652E0] bg-[#3652E0] text-white dark:border-[#8493FF] dark:bg-[#8493FF]'
                : 'border-[#DBDFD3] bg-white text-[#4A4F4A] hover:border-[#3652E0] dark:border-[#2C3130] dark:bg-[#1C2024] dark:text-[#A8ADA7] dark:hover:border-[#8493FF]'
            }`}
          >
            {getLocalizedText(opt.label, locale)}
          </button>
        )
      })}
    </div>
  )
}

function NumberInput({
  variable,
  value,
  onChange,
  onBlur,
  hasError,
}: {
  variable: TemplateVariable
  value: string | number | boolean | string[] | undefined
  onChange: (v: number) => void
  onBlur: () => void
  hasError: boolean
}) {
  return (
    <input
      type="number"
      id={variable.varKey}
      name={variable.varKey}
      value={typeof value === 'number' ? value : ''}
      min={variable.validation.min}
      max={variable.validation.max}
      required={variable.isRequired}
      onChange={(e) => {
        const raw = e.target.value
        onChange(raw === '' ? 0 : Number(raw))
      }}
      onBlur={onBlur}
      className={`${inputBase} ${hasError ? 'border-[#C23A2A] dark:border-[#FF7A6B]' : 'border-[#DBDFD3] dark:border-[#2C3130]'}`}
    />
  )
}

function BooleanInput({
  variable,
  value,
  locale,
  onChange,
  onBlur,
}: {
  variable: TemplateVariable
  value: string | number | boolean | string[] | undefined
  locale: 'en' | 'vi'
  onChange: (v: boolean) => void
  onBlur: () => void
}) {
  const checked = value === true || value === 'true'
  const label = getLocalizedText(variable.label, locale)

  return (
    <label htmlFor={variable.varKey} className="flex cursor-pointer items-center gap-3">
      <button
        id={variable.varKey}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        onBlur={onBlur}
        className={`relative inline-flex h-[1.35rem] w-[2.4rem] shrink-0 cursor-pointer items-center rounded-full transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] ${
          checked ? 'bg-[#3652E0] dark:bg-[#8493FF]' : 'bg-[#DBDFD3] dark:bg-[#2C3130]'
        }`}
      >
        <span
          className={`inline-block h-[1rem] w-[1rem] rounded-full bg-white shadow transition-transform duration-150 ${
            checked ? 'translate-x-[1.1rem]' : 'translate-x-[0.2rem]'
          }`}
        />
      </button>
      <span className="text-[0.86rem] text-[#1B1D1B] dark:text-[#ECEEE8]">{label}</span>
    </label>
  )
}

function SliderInput({
  variable,
  value,
  onChange,
  onBlur,
}: {
  variable: TemplateVariable
  value: string | number | boolean | string[] | undefined
  onChange: (v: number) => void
  onBlur: () => void
}) {
  const num = typeof value === 'number' ? value : 0
  const min = variable.validation.min ?? 0
  const max = variable.validation.max ?? 100

  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        id={variable.varKey}
        name={variable.varKey}
        value={num}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        onBlur={onBlur}
        className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-[#DBDFD3] accent-[#3652E0] dark:bg-[#2C3130] dark:accent-[#8493FF]"
      />
      <span className="min-w-[2.5rem] text-right text-[0.82rem] text-[#4A4F4A] dark:text-[#A8ADA7]">
        {num}
      </span>
    </div>
  )
}

function FallbackInput({
  variable,
  value,
  locale,
  onChange,
  onBlur,
  hasError,
}: {
  variable: TemplateVariable
  value: string | number | boolean | string[] | undefined
  locale: 'en' | 'vi'
  onChange: (v: string) => void
  onBlur: () => void
  hasError: boolean
}) {
  return (
    <input
      type="text"
      id={variable.varKey}
      name={variable.varKey}
      value={typeof value === 'string' ? value : ''}
      placeholder={getLocalizedText(variable.placeholder, locale)}
      required={variable.isRequired}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      className={`${inputBase} ${hasError ? 'border-[#C23A2A] dark:border-[#FF7A6B]' : 'border-[#DBDFD3] dark:border-[#2C3130]'}`}
    />
  )
}

export function FormField({
  variable,
  value,
  error,
  locale = 'vi',
  onChange,
  onBlur,
}: FormFieldProps) {
  const label = getLocalizedText(variable.label, locale)
  const helpText = getLocalizedText(variable.helpText, locale)
  const hasError = Boolean(error)

  function renderControl() {
    switch (variable.inputType) {
      case 'text':
        return (
          <TextInput
            variable={variable}
            value={value}
            locale={locale}
            onChange={onChange}
            onBlur={onBlur}
            hasError={hasError}
          />
        )
      case 'textarea':
        return (
          <TextareaInput
            variable={variable}
            value={value}
            locale={locale}
            onChange={onChange}
            onBlur={onBlur}
            hasError={hasError}
          />
        )
      case 'select':
        return (
          <SelectInput
            variable={variable}
            value={value}
            locale={locale}
            onChange={onChange}
            onBlur={onBlur}
            hasError={hasError}
          />
        )
      case 'multiselect':
        return (
          <MultiselectInput
            variable={variable}
            value={value}
            locale={locale}
            onChange={onChange as (v: string[]) => void}
            onBlur={onBlur}
          />
        )
      case 'number':
        return (
          <NumberInput
            variable={variable}
            value={value}
            onChange={onChange as (v: number) => void}
            onBlur={onBlur}
            hasError={hasError}
          />
        )
      case 'boolean':
        return (
          <BooleanInput
            variable={variable}
            value={value}
            locale={locale}
            onChange={onChange as (v: boolean) => void}
            onBlur={onBlur}
          />
        )
      case 'slider':
        return (
          <SliderInput
            variable={variable}
            value={value}
            onChange={onChange as (v: number) => void}
            onBlur={onBlur}
          />
        )
      default:
        return (
          <FallbackInput
            variable={variable}
            value={value}
            locale={locale}
            onChange={onChange}
            onBlur={onBlur}
            hasError={hasError}
          />
        )
    }
  }

  return (
    <div className="flex flex-col gap-[0.35rem]">
      <label
        htmlFor={variable.varKey}
        className="text-[0.82rem] font-medium text-[#4A4F4A] dark:text-[#A8ADA7]"
      >
        {label}
        {variable.isRequired && (
          <span className="ml-0.5 text-[#C23A2A] dark:text-[#FF7A6B]">*</span>
        )}
      </label>
      {renderControl()}
      {helpText && (
        <p className="m-0 text-[0.75rem] text-[#8A8F8A] dark:text-[#6B706B]">{helpText}</p>
      )}
      {error && (
        <p className="m-0 animate-[fade-slide-up_150ms_ease] text-[0.75rem] text-[#C23A2A] dark:text-[#FF7A6B]">
          {error}
        </p>
      )}
    </div>
  )
}
