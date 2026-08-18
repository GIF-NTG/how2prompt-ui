import { useEffect, useRef, useState } from 'react'
import { Sparkles, Wand2 } from 'lucide-react'
import type { RefinementResult } from '../hooks/useRefinePrompt.types'

interface RefineDiffViewProps {
  result: RefinementResult | null
  /** `undefined` means "accept the AI's suggestion as-is"; a string means
   *  the user hand-edited the refined text before accepting (US3). */
  onAccept: (editedText?: string) => void
  onDiscard: () => void
}

// Explanations come back as plain sentences that sometimes wrap a token in
// backticks (e.g. "added `[PASTE_ERROR_LOG_HERE]`") — rendering those as an
// inline <code> chip instead of literal backtick characters is a small,
// self-contained readability win, not a full markdown renderer.
function renderExplanation(text: string) {
  const parts = text.split(/(`[^`]+`)/g)
  return parts.map((part, index) =>
    part.startsWith('`') && part.endsWith('`') ? (
      <code
        key={index}
        className="rounded-sm bg-[#3652E0]/10 px-1 py-0.5 font-mono text-[0.8em] text-[#3652E0] dark:bg-[#8493FF]/15 dark:text-[#A6B4FF]"
      >
        {part.slice(1, -1)}
      </code>
    ) : (
      <span key={index}>{part}</span>
    ),
  )
}

/** Refined (editable) text + explanations, plus Accept / (inline) Edit
 *  manually / Reject controls (US1–US3). Renders no "Original" column of its
 *  own — the caller already shows the original/current final prompt in an
 *  adjacent panel (e.g. the generate page's "Result" preview), so repeating
 *  it here would just be visual noise next to that panel. */
export function RefineDiffView({ result, onAccept, onDiscard }: RefineDiffViewProps) {
  const [editedText, setEditedText] = useState(result?.refinedPrompt ?? '')
  const sectionRef = useRef<HTMLElement>(null)

  // A fresh refine cycle (new `result.promptId`/`refinedPrompt`) resets the
  // editable field back to the AI's latest suggestion.
  useEffect(() => {
    setEditedText(result?.refinedPrompt ?? '')
  }, [result?.refinedPrompt])

  // Scroll the result into view the moment it appears — the trigger button
  // lives in the form column above/beside it, and on narrower layouts (or a
  // long form) this panel renders below the fold, so without this the user
  // has to go hunting for it after a refine finishes.
  useEffect(() => {
    if (result) {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [result])

  if (!result) {
    return null
  }

  function handleAccept() {
    onAccept(editedText !== result?.refinedPrompt ? editedText : undefined)
  }

  return (
    <section ref={sectionRef} className="flex h-full scroll-mt-6 flex-col gap-4">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center gap-2">
          <Wand2 size={15} className="text-[#3652E0] dark:text-[#8493FF]" aria-hidden="true" />
          <label
            htmlFor="refine-edited-text"
            className="text-sm font-semibold text-[#14171A] dark:text-[#F3F5F0]"
          >
            Refined (editable)
          </label>
        </div>
        <textarea
          id="refine-edited-text"
          value={editedText}
          onChange={(event) => setEditedText(event.target.value)}
          rows={14}
          className="min-h-[20rem] w-full flex-1 resize-y rounded-lg border border-[#3652E0]/40 bg-[#F3F5F0] p-4 font-mono text-sm leading-relaxed text-[#14171A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] dark:border-[#8493FF]/40 dark:bg-[#14171A] dark:text-[#F3F5F0]"
        />
      </div>

      {result.explanations.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-[#E2E5DC] pt-3 dark:border-[#2C3130]">
          <div className="flex items-center gap-1.5 text-[0.75rem] font-semibold tracking-wide text-[#5B5F58] uppercase dark:text-[#A2A79C]">
            <Sparkles size={13} aria-hidden="true" />
            What changed
          </div>
          <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[0.85rem] leading-relaxed text-[#3A3F38] dark:text-[#C7CBC3]">
            {result.explanations.map((explanation) => (
              <li key={explanation} className="flex gap-2">
                <span
                  className="mt-[0.5em] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3652E0] dark:bg-[#8493FF]"
                  aria-hidden="true"
                />
                <span>{renderExplanation(explanation)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleAccept}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-gradient-to-r from-[#3652E0] to-[#5D6EF5] px-4 py-2 text-sm font-medium text-white transition-transform duration-150 active:scale-[0.97] active:duration-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] dark:from-[#8493FF] dark:to-[#A6B4FF] dark:text-[#14171A]"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={onDiscard}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#E2E5DC] px-4 py-2 text-sm font-medium text-[#14171A] transition-transform duration-150 active:scale-[0.97] active:duration-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] dark:border-[#2C3130] dark:text-[#F3F5F0]"
        >
          Reject
        </button>
      </div>
    </section>
  )
}
