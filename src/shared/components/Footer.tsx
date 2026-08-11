import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/useAuth'

interface FooterLink {
  to: string
  label: string
}

const PRODUCT_LINKS: FooterLink[] = [
  { to: '/', label: 'Library' },
  { to: '/history', label: 'History' },
  { to: '/favorites', label: 'Favorites' },
]

const LINK_CLASSES =
  'text-[0.85rem] text-[#5B5F58] transition-colors duration-150 hover:text-[#1B1D1B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] dark:text-[#A2A79C] dark:hover:text-[#ECEEE8]'

function FooterLinkGroup({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-[0.72rem] tracking-wider text-[#8B8F86] uppercase dark:text-[#6D726A]">
        {title}
      </span>
      <nav className="flex flex-col gap-2.5">
        {links.map((link) => (
          <Link key={link.to} to={link.to} className={LINK_CLASSES}>
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

/** Global site footer, mounted once in `RootLayout` (same shell TopBar lives
 *  in) so it appears consistently across Library/History/Favorites/Profile
 *  without every page wiring it in individually. Not shown on the
 *  Admin shell (its own sidebar layout, per CLAUDE.md) or the auth screens
 *  (Login/Register/etc. intentionally render outside RootLayout as a
 *  minimal full-page card). */
export function Footer() {
  const { session } = useAuth()
  const accountLinks: FooterLink[] = session
    ? [{ to: '/profile', label: 'Profile' }]
    : [
        { to: '/login', label: 'Log in' },
        { to: '/register', label: 'Sign up' },
      ]
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-[#DBDFD3] dark:border-[#2C3130]">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-5 py-10 sm:px-[clamp(1.25rem,4vw,3rem)]">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-[1.3fr_1fr_1fr]">
          <div className="flex flex-col gap-3">
            <Link
              to="/"
              className="flex w-fit items-center gap-2.5 text-[1.05rem] font-bold tracking-[-0.01em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0]"
            >
              <span className="font-mono rounded-md bg-[#1B1D1B] px-2 py-0.5 text-[0.95rem] font-bold text-[#F3F5F0] dark:bg-[#ECEEE8] dark:text-[#14171A]">
                {'{ }'}
              </span>
              How2Prompt
            </Link>
            <p className="max-w-[32ch] text-[0.85rem] leading-relaxed text-[#5B5F58] dark:text-[#A2A79C]">
              Pick a prompt template, fill in the blanks, and get a ready-to-use prompt for your
              favorite AI model.
            </p>
          </div>

          <FooterLinkGroup title="Product" links={PRODUCT_LINKS} />
          <FooterLinkGroup title="Account" links={accountLinks} />
        </div>

        <div className="border-t border-[#DBDFD3] pt-6 text-[0.78rem] text-[#8B8F86] dark:border-[#2C3130] dark:text-[#6D726A]">
          © {year} How2Prompt. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
