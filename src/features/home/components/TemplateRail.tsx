import MarqueeImport from 'react-fast-marquee'
import type { TemplateListItem } from '../types'
import { TemplateCard } from './TemplateCard'

// react-fast-marquee's CJS build double-wraps its default export
// (`exports.default = Marquee` with `__esModule` set) — depending on how a
// bundler's interop resolves it, the default import can land on the
// component itself or on the whole `{ default: Component }` exports object.
// Unwrap defensively so this works either way.
const Marquee =
  (MarqueeImport as unknown as { default?: typeof MarqueeImport }).default ?? MarqueeImport

interface TemplateRailProps {
  title: string
  subtitle?: string
  templates: TemplateListItem[]
  isSignedIn?: boolean
  onTemplateClick?: (id: string) => void
}

export function TemplateRail({
  title,
  subtitle,
  templates,
  isSignedIn,
  onTemplateClick,
}: TemplateRailProps) {
  return (
    <section className="flex flex-col gap-[0.75rem]">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="m-0 text-[0.95rem] font-bold tracking-[-0.005em]">{title}</h2>
        {subtitle && (
          <span className="font-mono text-[0.72rem] text-[#8B8F86] dark:text-[#6D726A]">
            {subtitle}
          </span>
        )}
      </div>
      {templates.length === 0 ? (
        <p className="m-0 rounded-card border border-dashed border-[#DBDFD3] px-4 py-6 text-[0.82rem] text-[#8B8F86] dark:border-[#2C3130] dark:text-[#6D726A]">
          Chưa có dữ liệu.
        </p>
      ) : (
        <Marquee pauseOnHover pauseOnClick speed={40} gradient={false} className="pb-[0.35rem]">
          {templates.map((t, index) => (
            <div key={t.id} className="mr-[0.9rem] h-[232px] w-[264px] flex-[0_0_auto]">
              <TemplateCard
                template={t}
                isSignedIn={!!isSignedIn}
                onClick={onTemplateClick}
                index={index}
              />
            </div>
          ))}
        </Marquee>
      )}
    </section>
  )
}
