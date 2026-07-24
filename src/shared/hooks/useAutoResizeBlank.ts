import { useEffect, useLayoutEffect, useRef } from 'react'

const MIN_WIDTH_PX = 24
const WIDTH_PADDING_PX = 16

/**
 * Auto-resizes an inline input to fit its typed content, per the hidden-span
 * measuring technique (agent/BA.md §4.3, Constitution Principle I): an
 * off-screen span mirrors the typed text in the input's own font, and the
 * input's width is set from that span's measured width plus a padding buffer.
 *
 * This is the ONE implementation of this technique in the app — every
 * placeholder/blank surface (auth forms today, the Variable Canvas later)
 * must reuse this hook rather than re-implementing the measurement.
 */
export function useAutoResizeBlank(value: string, placeholder = '') {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const measureRef = useRef<HTMLSpanElement | null>(null)

  useLayoutEffect(() => {
    const input = inputRef.current
    if (!input) return

    let measure = measureRef.current
    if (!measure) {
      measure = document.createElement('span')
      measure.style.position = 'absolute'
      measure.style.left = '-9999px'
      measure.style.top = '-9999px'
      measure.style.whiteSpace = 'pre'
      document.body.appendChild(measure)
      measureRef.current = measure
    }

    const computed = window.getComputedStyle(input)
    measure.style.fontFamily = computed.fontFamily
    measure.style.fontSize = computed.fontSize
    measure.style.fontWeight = computed.fontWeight
    measure.style.letterSpacing = computed.letterSpacing
    measure.textContent = value || placeholder || ''

    const measuredWidth = measure.getBoundingClientRect().width
    input.style.width = `${Math.max(measuredWidth + WIDTH_PADDING_PX, MIN_WIDTH_PX)}px`
  }, [value, placeholder])

  useEffect(() => {
    return () => {
      measureRef.current?.remove()
      measureRef.current = null
    }
  }, [])

  return inputRef
}
