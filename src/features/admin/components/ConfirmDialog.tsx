import { motion, AnimatePresence } from 'framer-motion'

interface ConfirmDialogProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
}

/** Generic destructive-action confirmation, following the same visual
 *  pattern as `history/components/DeleteConfirmDialog.tsx`. */
export function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Delete',
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Confirm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.18 }}
          className="flex w-full max-w-sm flex-col gap-4 rounded-panel border border-[#DBDFD3] bg-white p-5 dark:border-[#2C3130] dark:bg-[#1C2024]"
        >
          <p className="m-0 text-[0.9rem] text-[#1B1D1B] dark:text-[#ECEEE8]">{message}</p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="cursor-pointer rounded-md border border-[#DBDFD3] px-4 py-2 text-[0.85rem] font-semibold text-[#1B1D1B] transition-colors duration-150 hover:border-[#8B8F86] dark:border-[#2C3130] dark:text-[#ECEEE8]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="cursor-pointer rounded-md bg-[#C23A2E] px-4 py-2 text-[0.85rem] font-semibold text-white transition-colors duration-150 hover:brightness-110 dark:bg-[#FF7A6B] dark:text-[#14171A]"
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
