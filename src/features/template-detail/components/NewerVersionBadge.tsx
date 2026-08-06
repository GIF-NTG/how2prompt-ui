import { Info } from 'lucide-react'

/** Shown above the generate form when a "Re-run" target used an older
 *  template version than the template's current one (FR-010). */
export function NewerVersionBadge() {
  return (
    <div
      role="status"
      className="flex items-center gap-2 rounded-lg border border-[#3652E0]/30 bg-[#E7EAFC] px-4 py-2.5 text-sm text-[#3652E0] dark:border-[#8493FF]/30 dark:bg-[#262C4A] dark:text-[#8493FF]"
    >
      <Info size={16} className="flex-shrink-0" aria-hidden="true" />
      This prompt used an older version of the template — a newer version is now available and
      the form below is using the latest version.
    </div>
  )
}
