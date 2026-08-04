import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DynamicForm } from './DynamicForm'
import type { TemplateVariable } from '../types'

function makeVariable(overrides: Partial<TemplateVariable> & { varKey: string }): TemplateVariable {
  const { varKey, ...rest } = overrides
  return {
    id: varKey,
    varKey,
    label: { en: varKey, vi: varKey },
    description: { en: '', vi: '' },
    placeholder: { en: 'placeholder', vi: 'placeholder' },
    helpText: { en: '', vi: '' },
    inputType: 'text',
    isRequired: false,
    defaultValue: null,
    options: [],
    validation: {},
    sortOrder: 0,
    ...rest,
  }
}

const textVar = makeVariable({ varKey: 'role', inputType: 'text', isRequired: true, sortOrder: 1 })
const textareaVar = makeVariable({
  varKey: 'log',
  inputType: 'textarea',
  isRequired: true,
  sortOrder: 2,
})
const selectVar = makeVariable({
  varKey: 'severity',
  inputType: 'select',
  isRequired: false,
  defaultValue: 'medium',
  options: [
    { value: 'low', label: { en: 'Low', vi: 'Thấp' } },
    { value: 'high', label: { en: 'High', vi: 'Cao' } },
  ],
  sortOrder: 3,
})
const numberVar = makeVariable({
  varKey: 'maxTokens',
  inputType: 'number',
  isRequired: false,
  defaultValue: '1000',
  validation: { min: 100, max: 5000 },
  sortOrder: 4,
})
const booleanVar = makeVariable({
  varKey: 'includeEdgeCases',
  inputType: 'boolean',
  isRequired: false,
  defaultValue: 'true',
  sortOrder: 5,
})
const sliderVar = makeVariable({
  varKey: 'temperature',
  inputType: 'slider',
  isRequired: false,
  defaultValue: '0.7',
  validation: { min: 0, max: 2 },
  sortOrder: 6,
})

const allVariables = [textVar, textareaVar, selectVar, numberVar, booleanVar, sliderVar]

function renderForm(
  overrides: {
    variables?: TemplateVariable[]
    inputValues?: Record<string, string | number | boolean | string[]>
    errors?: Record<string, string>
  } = {},
) {
  const onValueChange = vi.fn()
  return {
    onValueChange,
    ...render(
      <DynamicForm
        variables={overrides.variables ?? allVariables}
        inputValues={overrides.inputValues ?? {}}
        errors={overrides.errors ?? {}}
        onValueChange={onValueChange}
        onBlur={vi.fn()}
      />,
    ),
  }
}

describe('DynamicForm', () => {
  it('renders one control per variable type', () => {
    renderForm()
    expect(screen.getByRole('textbox', { name: /role/ })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /log/ })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /severity/ })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: /maxTokens/ })).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: /includeEdgeCases/ })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: /temperature/ })).toBeInTheDocument()
  })

  it('renders variables sorted by sortOrder', () => {
    renderForm()
    const fieldOrder = [
      screen.getByRole('textbox', { name: /role/ }),
      screen.getByRole('textbox', { name: /log/ }),
      screen.getByRole('combobox', { name: /severity/ }),
      screen.getByRole('spinbutton', { name: /maxTokens/ }),
      screen.getByRole('switch', { name: /includeEdgeCases/ }),
      screen.getByRole('slider', { name: /temperature/ }),
    ]
    for (let i = 1; i < fieldOrder.length; i++) {
      expect(
        fieldOrder[i - 1].compareDocumentPosition(fieldOrder[i]) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
    }
  })

  it('shows inline error message when error is provided', () => {
    renderForm({
      errors: { role: 'role is required' },
    })
    expect(screen.getByText('role is required')).toBeInTheDocument()
  })

  it('shows required asterisk for required fields', () => {
    renderForm()
    const roleLabel = screen.getByText(
      (_, el) =>
        el?.tagName === 'LABEL' &&
        el.textContent?.includes('role') &&
        el.textContent?.includes('*'),
    )
    expect(roleLabel).toBeInTheDocument()
  })

  it('calls onValueChange with new text value on input', async () => {
    const user = userEvent.setup()
    const { onValueChange } = renderForm({ inputValues: { role: '' } })
    await user.type(screen.getByRole('textbox', { name: /role/ }), 'a')
    expect(onValueChange).toHaveBeenCalledWith('role', 'a')
  })

  it('calls onValueChange with boolean toggle', async () => {
    const user = userEvent.setup()
    const { onValueChange } = renderForm({ inputValues: { includeEdgeCases: true } })
    await user.click(screen.getByRole('switch', { name: /includeEdgeCases/ }))
    expect(onValueChange).toHaveBeenCalledWith('includeEdgeCases', false)
  })

  it('calls onValueChange with selected option for select', async () => {
    const user = userEvent.setup()
    const { onValueChange } = renderForm({ inputValues: { severity: 'medium' } })
    await user.selectOptions(screen.getByRole('combobox', { name: /severity/ }), 'high')
    expect(onValueChange).toHaveBeenCalledWith('severity', 'high')
  })

  it('calls onValueChange with number value', async () => {
    const user = userEvent.setup()
    const { onValueChange } = renderForm({ inputValues: { maxTokens: 1000 } })
    const input = screen.getByRole('spinbutton', { name: /maxTokens/ })
    await user.clear(input)
    await user.type(input, '2000')
    expect(onValueChange).toHaveBeenCalled()
  })

  it('calls onValueChange with slider value', () => {
    const { onValueChange } = renderForm({ inputValues: { temperature: 0.7 } })
    const slider = screen.getByRole('slider', { name: /temperature/ })
    fireEvent.change(slider, { target: { value: '1.5' } })
    expect(onValueChange).toHaveBeenCalledWith('temperature', 1.5)
  })

  it('returns null when variables is empty', () => {
    const { container } = renderForm({ variables: [] })
    expect(container.firstChild).toBeNull()
  })

  it('shows help text when provided', () => {
    renderForm({
      variables: [
        makeVariable({
          varKey: 'test',
          helpText: { en: 'Some help', vi: 'Trợ giúp' },
        }),
      ],
    })
    expect(screen.getByText('Trợ giúp')).toBeInTheDocument()
  })

  it('shows placeholder fallback for unknown input types', () => {
    renderForm({
      variables: [
        makeVariable({
          varKey: 'unknown',
          inputType: 'date' as TemplateVariable['inputType'],
        }),
      ],
    })
    expect(screen.getByRole('textbox', { name: /unknown/ })).toBeInTheDocument()
  })

  describe('model switch preserves shared varKey values', () => {
    it('preserves values for variables that exist in both models', async () => {
      const user = userEvent.setup()
      const { onValueChange } = renderForm({
        inputValues: { role: 'Senior Dev', log: 'error trace' },
      })

      await user.type(screen.getByRole('textbox', { name: /role/ }), '!')
      expect(onValueChange).toHaveBeenCalledWith('role', 'Senior Dev!')
    })
  })
})
