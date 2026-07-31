import type { ReactNode } from 'react'

interface AdminPageHeaderProps {
  eyebrow: string
  title: string
  actions?: ReactNode
}

/** Matches the mockup's `.topbar` — an eyebrow breadcrumb, page title, and an
 *  optional actions slot on the right. */
export function AdminPageHeader({ eyebrow, title, actions }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <span className="before:mr-1.5 before:inline-block before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#3652E0] font-mono text-[0.7rem] uppercase tracking-[0.08em] text-[#3652E0] dark:text-[#8493FF] dark:before:bg-[#8493FF]">
          {eyebrow}
        </span>
        <h1 className="m-0 text-[clamp(1.35rem,2.2vw,1.6rem)] leading-[1.2] tracking-[-0.015em]">
          {title}
        </h1>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
