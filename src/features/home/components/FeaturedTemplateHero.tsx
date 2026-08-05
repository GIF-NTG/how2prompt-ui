import { Sparkles, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Fixed by product decision, not computed — the one "start here" template a
// first-time visitor can use immediately without evaluating the catalog.
const FEATURED_TEMPLATE = {
  id: 'c0000000-0000-0000-0000-000000000012',
  title: 'Khung Prompt Phổ quát',
  description: 'Một khung tiêu chuẩn rất linh hoạt áp dụng cho hầu hết mọi tác vụ.',
}

export function FeaturedTemplateHero() {
  const navigate = useNavigate()

  return (
    <div className="relative flex flex-col gap-4 overflow-hidden rounded-card bg-[linear-gradient(135deg,#3652E0_0%,#5B3FE0_100%)] p-[2rem_2.2rem] text-white shadow-[0_20px_45px_-20px_rgba(54,82,224,0.55)] dark:bg-[linear-gradient(135deg,#4557D8_0%,#6B4FE0_100%)]">
      <Sparkles
        size={140}
        strokeWidth={1}
        className="pointer-events-none absolute -top-6 -right-6 text-white/15"
      />

      <div className="relative flex flex-wrap items-center gap-1.5">
        <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 font-mono text-[0.7rem] font-bold tracking-[0.03em] text-white uppercase backdrop-blur-sm">
          <Sparkles size={12} />
          Nổi bật nhất
        </span>
        <span className="rounded-full bg-white/15 px-2.5 py-1 font-mono text-[0.7rem] font-bold tracking-[0.03em] text-white backdrop-blur-sm">
          Chính thức
        </span>
      </div>

      <h2 className="relative m-0 text-[1.7rem] leading-[1.15] font-bold tracking-[-0.015em]">
        {FEATURED_TEMPLATE.title}
      </h2>
      <p className="relative m-0 max-w-[52ch] text-[0.95rem] leading-[1.6] text-white/85">
        {FEATURED_TEMPLATE.description}
      </p>

      <button
        type="button"
        onClick={() => navigate(`/templates/${FEATURED_TEMPLATE.id}`, { viewTransition: true })}
        className="relative mt-1 flex w-fit cursor-pointer items-center gap-1.5 rounded-lg bg-white px-5 py-2.5 text-[0.9rem] font-bold text-[#3652E0] transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Dùng ngay
        <ArrowRight size={16} />
      </button>
    </div>
  )
}
