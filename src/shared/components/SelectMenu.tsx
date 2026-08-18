import { useEffect, useRef, useState } from 'react'
import { CaretDown } from '@phosphor-icons/react'

export interface SelectMenuOption {
  value: string
  label: string
}

interface SelectMenuProps {
  value: string
  options: SelectMenuOption[]
  onChange: (value: string) => void
  ariaLabel: string
}

/** Custom-styled replacement for a native `<select>` — the native element's
 *  open dropdown panel is rendered by the OS/browser and can't be themed
 *  (square corners, no shadow, no border-radius), which reads as visually
 *  broken next to the rest of the rounded/bordered filter bar. Matches
 *  `FilterPopover`'s trigger-button + absolute-panel pattern instead. */
export function SelectMenu({ value, options, onChange, ariaLabel }: SelectMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        title={selected?.label}
        className="flex max-w-[240px] cursor-pointer items-center gap-2 rounded-xl border border-[#DBDFD3] bg-white px-[0.9rem] py-[0.62rem] text-[0.86rem] text-[#1B1D1B] transition-colors duration-150 focus:border-[#3652E0] focus:outline-none dark:border-[#2C3130] dark:bg-[#1C2024] dark:text-[#ECEEE8]"
      >
        <span className="min-w-0 flex-1 truncate">{selected?.label ?? ''}</span>
        <CaretDown
          size={14}
          weight="bold"
          aria-hidden="true"
          className={`shrink-0 text-[#8B8F86] transition-transform duration-150 dark:text-[#6D726A] ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 top-[calc(100%+0.5rem)] z-20 flex max-h-[min(320px,60vh)] w-max min-w-[180px] max-w-[320px] flex-col gap-0.5 overflow-y-auto rounded-xl border border-[#DBDFD3] bg-white p-1.5 shadow-lg dark:border-[#2C3130] dark:bg-[#1C2024]"
        >
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                title={option.label}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
                className={`w-full truncate rounded-lg px-[0.7rem] py-[0.45rem] text-left text-[0.86rem] transition-colors duration-150 ${
                  isSelected
                    ? 'bg-[#3652E0] text-white dark:bg-[#8493FF] dark:text-[#14171A]'
                    : 'text-[#1B1D1B] hover:bg-[#F3F5F0] dark:text-[#ECEEE8] dark:hover:bg-[#22262A]'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
