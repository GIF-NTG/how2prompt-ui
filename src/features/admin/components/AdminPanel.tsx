import type { ReactNode } from 'react'

interface AdminPanelProps {
  title?: string
  hint?: string
  children: ReactNode
  className?: string
}

/** Matches the mockup's `.panel` card — the base surface every admin content
 *  block (form, table, chart) sits in. */
export function AdminPanel({ title, hint, children, className = '' }: AdminPanelProps) {
  return (
    <section
      className={`flex flex-col gap-4 rounded-2xl border border-[#DBDFD3] bg-white p-5 dark:border-[#2C3130] dark:bg-[#1C2024] ${className}`}
    >
      {title && (
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="m-0 text-[0.98rem] tracking-[-0.005em]">{title}</h2>
          {hint && (
            <span className="font-mono text-[0.7rem] text-[#8B8F86] dark:text-[#6D726A]">
              {hint}
            </span>
          )}
        </div>
      )}
      {children}
    </section>
  )
}
