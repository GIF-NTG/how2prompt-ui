import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { ScoreResult } from '../api/aiEnhanceClient.types'
import { ScoreResultView } from './ScoreResultView'

function makeResult(overrides: Partial<ScoreResult> = {}): ScoreResult {
  return {
    promptId: 'gp1',
    score: 8,
    breakdown: { clarity: 8, specificity: 7, context: 9, format: 8 },
    suggestions: ['Add an explicit output format.', 'Specify the target audience.'],
    modelVersion: 'test-v1',
    ...overrides,
  }
}

describe('ScoreResultView', () => {
  it('renders the radar chart with 4 axis labels', () => {
    render(<ScoreResultView result={makeResult()} />)

    expect(screen.getByText('Clarity')).toBeInTheDocument()
    expect(screen.getByText('Specificity')).toBeInTheDocument()
    expect(screen.getByText('Context')).toBeInTheDocument()
    expect(screen.getByText('Format')).toBeInTheDocument()
  })

  it('renders the overall score', () => {
    render(<ScoreResultView result={makeResult()} />)
    expect(screen.getByText('Overall Score')).toBeInTheDocument()
    expect(screen.getByText('out of 10')).toBeInTheDocument()
  })

  it('renders the suggestions list', () => {
    render(<ScoreResultView result={makeResult()} />)
    expect(screen.getByText('Add an explicit output format.')).toBeInTheDocument()
    expect(screen.getByText('Specify the target audience.')).toBeInTheDocument()
  })

  it('renders the disclaimer', () => {
    render(<ScoreResultView result={makeResult()} />)
    expect(screen.getByText(/ai assessment for reference only/i)).toBeInTheDocument()
  })

  it('renders empty state when suggestions list is empty', () => {
    render(<ScoreResultView result={makeResult({ suggestions: [] })} />)
    expect(screen.getByText(/no suggestions/i)).toBeInTheDocument()
  })

  it('renders nothing when result is null', () => {
    const { container } = render(<ScoreResultView result={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders unchanged across unrelated parent re-renders (FR-006)', () => {
    const result = makeResult()
    const { rerender } = render(<ScoreResultView result={result} />)

    expect(screen.getByText('Add an explicit output format.')).toBeInTheDocument()
    expect(screen.getByText('AI assessment for reference only')).toBeInTheDocument()

    rerender(<ScoreResultView result={result} />)

    expect(screen.getByText('Add an explicit output format.')).toBeInTheDocument()
    expect(screen.getByText('AI assessment for reference only')).toBeInTheDocument()
  })
})
