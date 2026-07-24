import { Link } from 'react-router-dom'

/**
 * Lets a visitor dismiss authentication entirely and keep browsing without an
 * account (FR-015). Rendered on both LoginPage and RegisterPage.
 */
export function GuestContinueLink() {
  return (
    <Link
      to="/"
      className="text-sm text-[#5B5F58] underline decoration-[#8B8F86] underline-offset-2 hover:text-[#1B1D1B] dark:text-[#A2A79C] dark:decoration-[#6D726A] dark:hover:text-[#ECEEE8]"
    >
      Tiếp tục với vai trò Khách →
    </Link>
  )
}
