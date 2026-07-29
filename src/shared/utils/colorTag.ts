/** Small deterministic accent palette for coloring same-shaped lists of
 *  items (category chips, tag chips, model badges) so they read as
 *  distinct instead of uniform gray, without touching the neutral base
 *  palette or the indigo brand accent. Deliberately distinct from the
 *  existing danger-red/good-green tokens so nothing reads as an
 *  error/success state.
 *
 *  Each entry is a complete, literal Tailwind class string (not built via
 *  template-literal interpolation) — Tailwind v4's JIT scanner only
 *  generates CSS for arbitrary-value classes it can find as literal
 *  substrings in source, so an interpolated `text-[${hex}]` would silently
 *  produce no CSS at build time. */
const TAG_COLOR_CLASSES = [
  'text-[#0F9B8E] dark:text-[#4ED9C9] border-[#0F9B8E] dark:border-[#4ED9C9]', // teal
  'text-[#C98A1F] dark:text-[#F0B94D] border-[#C98A1F] dark:border-[#F0B94D]', // amber
  'text-[#C23A6B] dark:text-[#FF8FB3] border-[#C23A6B] dark:border-[#FF8FB3]', // rose
  'text-[#1F7FC9] dark:text-[#6FC2FF] border-[#1F7FC9] dark:border-[#6FC2FF]', // sky
  'text-[#5B8C2A] dark:text-[#A3D65C] border-[#5B8C2A] dark:border-[#A3D65C]', // lime
] as const

/** Parallel hex pairs for call sites that need raw values instead of
 *  classes (e.g. the TopBar avatar's `background-color`, or confetti's
 *  particle colors). Index-aligned with `TAG_COLOR_CLASSES`. */
const TAG_COLOR_HEX = [
  { light: '#0F9B8E', dark: '#4ED9C9' },
  { light: '#C98A1F', dark: '#F0B94D' },
  { light: '#C23A6B', dark: '#FF8FB3' },
  { light: '#1F7FC9', dark: '#6FC2FF' },
  { light: '#5B8C2A', dark: '#A3D65C' },
] as const

/** Pastel-filled variant (soft `background-color` + matching `text-color`)
 *  for spots that currently use a solid tinted circle/pill (e.g. the
 *  TopBar avatar), matching the existing indigo `bg-[#E7EAFC] text-[#3652E0]`
 *  pattern already used for the default avatar. Index-aligned with
 *  `TAG_COLOR_CLASSES`/`TAG_COLOR_HEX`. */
const TAG_AVATAR_CLASSES = [
  'bg-[#DFF3F0] text-[#0F9B8E] dark:bg-[#173330] dark:text-[#4ED9C9]', // teal
  'bg-[#F7EAD2] text-[#C98A1F] dark:bg-[#3A2E14] dark:text-[#F0B94D]', // amber
  'bg-[#FBE3EE] text-[#C23A6B] dark:bg-[#3A1F2B] dark:text-[#FF8FB3]', // rose
  'bg-[#DEEEFB] text-[#1F7FC9] dark:bg-[#152C40] dark:text-[#6FC2FF]', // sky
  'bg-[#EAF3DC] text-[#5B8C2A] dark:bg-[#243318] dark:text-[#A3D65C]', // lime
] as const

function hashColorIndex(key: string): number {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  }
  return hash % TAG_COLOR_CLASSES.length
}

/** Ready-to-use `text-[..] dark:text-[..] border-[..] dark:border-[..]`
 *  class string for a pill/chip/badge, deterministically picked from `key`
 *  (e.g. a category slug, tag slug, or AI model code) so the same key
 *  always renders the same color. */
export function getTagColorClasses(key: string): string {
  return TAG_COLOR_CLASSES[hashColorIndex(key)]
}

/** Ready-to-use pastel-filled `bg-[..] text-[..]` class string (see
 *  `TAG_AVATAR_CLASSES`), deterministically picked from `key`. */
export function getTagAvatarClasses(key: string): string {
  return TAG_AVATAR_CLASSES[hashColorIndex(key)]
}

/** Raw light/dark hex pair for the same deterministic color, for call
 *  sites that can't use a Tailwind class (inline `style`, confetti
 *  particle colors). */
export function getTagColorHex(key: string): { light: string; dark: string } {
  return TAG_COLOR_HEX[hashColorIndex(key)]
}

/** All accent hex values (light mode), for spots that want the whole
 *  palette at once rather than a single deterministic pick (e.g. the
 *  generate-success confetti burst). */
export const TAG_ACCENT_PALETTE_LIGHT = TAG_COLOR_HEX.map((c) => c.light)
