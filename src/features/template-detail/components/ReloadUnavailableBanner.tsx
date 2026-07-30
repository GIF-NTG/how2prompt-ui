import { useState } from 'react'
import { AlertTriangle, Check, Copy } from 'lucide-react'

interface ReloadUnavailableBannerProps {
  finalPrompt: string
}

/** Shown instead of the generate form when a "Re-run" target's template no
 *  longer exists (FR-009) — the saved prompt text is still viewable/copyable. */
export function ReloadUnavailableBanner({ finalPrompt }: ReloadUnavailableBannerProps) {
  const [justCopied, setJustCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(finalPrompt)
    setJustCopied(true)
    setTimeout(() => setJustCopied(false), 1500)
  }

  return (
    <section className="flex flex-col gap-4 rounded-panel border border-[#E2E5DC] bg-white p-6 dark:border-[#2C3130] dark:bg-[#1A1E1D]">
      <div
        role="alert"
        className="flex items-start gap-2 rounded-lg border border-[#C23A2E]/40 bg-[#FBE7E4] px-4 py-3 text-sm text-[#C23A2E] dark:border-[#FF7A6B]/40 dark:bg-[#3A2224] dark:text-[#FF7A6B]"
      >
        <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
        <span>
          Template gốc của prompt này không còn tồn tại, nên bạn không thể tải lại vào form. Nội
          dung prompt đã tạo trước đây vẫn được lưu bên dưới.
        </span>
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-[#E2E5DC] bg-[#F3F5F0] p-4 dark:border-[#2C3130] dark:bg-[#14171A]">
        <pre className="m-0 whitespace-pre-wrap font-mono text-sm text-[#14171A] dark:text-[#F3F5F0]">
          {finalPrompt}
        </pre>
      </div>

      <button
        type="button"
        onClick={() => void handleCopy()}
        className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md border border-[#E2E5DC] px-4 py-2 text-sm font-medium text-[#14171A] transition-transform duration-150 active:scale-[0.97] active:duration-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] dark:border-[#2C3130] dark:text-[#F3F5F0]"
      >
        {justCopied ? (
          <Check size={15} aria-hidden="true" />
        ) : (
          <Copy size={15} aria-hidden="true" />
        )}
        Sao chép
      </button>
    </section>
  )
}
