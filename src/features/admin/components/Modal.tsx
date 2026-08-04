import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  wide?: boolean
}

/** Generic overlay dialog for admin create/edit forms — Escape and
 *  backdrop click both close it. Same overlay/panel visual language as
 *  `history/components/DeleteConfirmDialog.tsx`. */
export function Modal({ title, onClose, children, wide = false }: ModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div
        role="presentation"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
          className={`flex max-h-[85vh] w-full flex-col gap-4 overflow-y-auto rounded-panel border border-[#DBDFD3] bg-white p-5 dark:border-[#2C3130] dark:bg-[#1C2024] ${wide ? 'max-w-2xl' : 'max-w-md'}`}
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="m-0 text-base font-bold text-[#1B1D1B] dark:text-[#ECEEE8]">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="text-[#5B5F58] hover:text-[#1B1D1B] dark:text-[#A2A79C] dark:hover:text-[#ECEEE8]"
            >
              <X size={18} />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
