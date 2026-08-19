import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RadarChart } from './RadarChart'
import type { ScoreBreakdown } from '../api/aiEnhanceClient.types'

const defaultBreakdown: ScoreBreakdown = { clarity: 8, specificity: 7, context: 9, format: 6 }

describe('RadarChart', () => {
  it('renders exactly 4 labeled axes', () => {
    render(<RadarChart breakdown={defaultBreakdown} />)

    expect(screen.getByText('Clarity')).toBeInTheDocument()
    expect(screen.getByText('Specificity')).toBeInTheDocument()
    expect(screen.getByText('Context')).toBeInTheDocument()
    expect(screen.getByText('Format')).toBeInTheDocument()
  })

  it('renders a polygon for the score shape', () => {
    const { container } = render(<RadarChart breakdown={defaultBreakdown} />)
    const polygon = container.querySelector('polygon')
    expect(polygon).toBeInTheDocument()
  })

  it('renders 4 axis lines', () => {
    const { container } = render(<RadarChart breakdown={defaultBreakdown} />)
    const lines = container.querySelectorAll('line')
    expect(lines.length).toBe(4)
  })

  it('renders score values for each axis', () => {
    render(<RadarChart breakdown={defaultBreakdown} />)
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('9')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
  })
})
