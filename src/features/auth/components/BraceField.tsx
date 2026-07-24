const GLYPHS = [
  { text: '{role}', top: '8%', left: '5%', size: '1.6rem', rotate: '-6deg' },
  { text: '{context}', top: '20%', left: '82%', size: '2.1rem', rotate: '4deg' },
  { text: '{ }', top: '40%', left: '10%', size: '2.6rem', rotate: '-3deg' },
  { text: '{constraints}', top: '64%', left: '72%', size: '1.4rem', rotate: '7deg' },
  { text: '{email}', top: '82%', left: '18%', size: '1.9rem', rotate: '-5deg' },
  { text: '{role}', top: '12%', left: '46%', size: '1.3rem', rotate: '2deg' },
  { text: '{ }', top: '55%', left: '92%', size: '2.3rem', rotate: '-8deg' },
  { text: '{context}', top: '92%', left: '55%', size: '1.5rem', rotate: '5deg' },
] as const

/**
 * Decorative background glyphs echoing the product's `{field_name}` template
 * syntax (SRS `raw_template`). Positions are fixed (not randomized) so the
 * decoration doesn't shift between renders.
 */
export function BraceField() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden font-mono font-semibold text-[#1B1D1B] opacity-[0.035] dark:text-[#ECEEE8]"
    >
      {GLYPHS.map((glyph) => (
        <span
          key={`${glyph.text}-${glyph.top}-${glyph.left}`}
          className="absolute whitespace-nowrap"
          style={{ top: glyph.top, left: glyph.left, fontSize: glyph.size, transform: `rotate(${glyph.rotate})` }}
        >
          {glyph.text}
        </span>
      ))}
    </div>
  )
}
