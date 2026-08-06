import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function BackLink() {
  return (
    <Link
      to="/"
      viewTransition
      className="inline-flex items-center gap-1 font-mono text-[0.8rem] text-[#5B5F58] underline underline-offset-2 transition-colors duration-150 hover:text-[#1B1D1B] dark:text-[#A2A79C] dark:hover:text-[#ECEEE8]"
    >
      <ArrowLeft size={14} />
      Back to library
    </Link>
  )
}
