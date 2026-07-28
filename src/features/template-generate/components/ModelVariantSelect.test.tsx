import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ModelVariantSelect } from './ModelVariantSelect'

describe('ModelVariantSelect', () => {
  it('renders a dropdown when multiple models are supported', () => {
    render(
      <ModelVariantSelect
        supportedModels={['gpt-4o', 'claude']}
        selectedModelCode="gpt-4o"
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByLabelText('Mô hình AI')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'gpt-4o' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'claude' })).toBeInTheDocument()
  })

  it('hides when only one model is supported', () => {
    const { container } = render(
      <ModelVariantSelect
        supportedModels={['gpt-4o']}
        selectedModelCode="gpt-4o"
        onChange={vi.fn()}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('hides when no models are supported', () => {
    const { container } = render(
      <ModelVariantSelect
        supportedModels={[]}
        selectedModelCode=""
        onChange={vi.fn()}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('calls onChange when a different model is selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <ModelVariantSelect
        supportedModels={['gpt-4o', 'claude']}
        selectedModelCode="gpt-4o"
        onChange={onChange}
      />,
    )
    await user.selectOptions(screen.getByLabelText('Mô hình AI'), 'claude')
    expect(onChange).toHaveBeenCalledWith('claude')
  })
})
