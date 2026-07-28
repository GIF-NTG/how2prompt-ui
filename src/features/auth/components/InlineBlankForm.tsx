import { forwardRef, type InputHTMLAttributes } from 'react'
import { useAutoResizeBlank } from '@/shared/hooks/useAutoResizeBlank'

interface InlineBlankProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className' | 'style'
> {
  /** Highlights the blank red when it failed validation (FR-006). */
  invalid?: boolean
}

/**
 * A single inline fill-in-the-blank input, meant to sit inside a sentence of
 * static text (per the project's approved auth interaction pattern). Auto-
 * resizes to its typed content via the shared `useAutoResizeBlank` hook —
 * this is the one place that technique is wired into an actual `<input>` for
 * the auth feature.
 */
export const InlineBlank = forwardRef<HTMLInputElement, InlineBlankProps>(function InlineBlank(
  { invalid = false, value, placeholder, ...rest },
  forwardedRef,
) {
  const autoResizeRef = useAutoResizeBlank(
    typeof value === 'string' ? value : '',
    String(placeholder ?? ''),
  )

  return (
    <input
      {...rest}
      value={value}
      placeholder={placeholder}
      ref={(node) => {
        autoResizeRef.current = node
        if (typeof forwardedRef === 'function') {
          forwardedRef(node)
        } else if (forwardedRef) {
          forwardedRef.current = node
        }
      }}
      className={[
        'mx-1 inline-block min-w-[2ch] rounded-none border-0 border-b-2 bg-transparent px-0.5 align-baseline',
        'font-mono text-[0.95em] leading-tight text-[#1B1D1B] dark:text-[#ECEEE8]',
        'placeholder:text-[#8B8F86] dark:placeholder:text-[#6D726A]',
        'focus:outline-none',
        invalid
          ? 'border-[#C23A2E] dark:border-[#FF7A6B]'
          : 'border-[#8B8F86] focus:border-[#3652E0] dark:border-[#6D726A] dark:focus:border-[#8493FF]',
      ].join(' ')}
    />
  )
})
