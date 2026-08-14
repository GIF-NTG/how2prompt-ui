import { Suspense } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, Cpu, FolderTree, FileText, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/features/auth/context/useAuth'
import { ThemeToggle } from '@/shared/components/ThemeToggle'
import { getTagAvatarClasses } from '@/shared/utils/colorTag'
import { PageFallback } from '@/app/PageFallback'
import {
  adminAiModelsChunk,
  adminDashboardChunk,
  adminTaxonomyChunk,
  adminTemplatesChunk,
} from '@/app/routeChunks'
import { AdminDataProvider } from '../context/AdminDataProvider'

const NAV_ITEM_BASE =
  'flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm transition-colors duration-150'
const NAV_ITEM_INACTIVE =
  'text-[#5B5F58] hover:bg-[#EAEDE6] hover:text-[#1B1D1B] dark:text-[#A2A79C] dark:hover:bg-[#23282C] dark:hover:text-[#ECEEE8]'
const NAV_ITEM_ACTIVE =
  'bg-[#E7EAFC] font-semibold text-[#3652E0] dark:bg-[#262C4A] dark:text-[#8493FF]'

function NavGroupLabel({ children }: { children: string }) {
  return (
    <div className="mb-1 px-3 font-mono text-[0.66rem] uppercase tracking-[0.08em] text-[#8B8F86] dark:text-[#6D726A]">
      {children}
    </div>
  )
}

/** Standalone admin shell (sidebar + main) per
 *  `docs/design/how2prompt-admin-dashboard-mockup.html` — deliberately not the
 *  consumer app's `RootLayout`/`TopBar`, since the mockup treats `/admin/*` as
 *  its own surface with a persistent sidebar nav instead of the top nav bar. */
export function AdminLayout() {
  const { session } = useAuth()
  const location = useLocation()

  return (
    // Above the `key={location.pathname}` div below (which remounts on every
    // nested route change) so categories/tags/AI models survive navigating
    // between Templates/Taxonomy/AI Models instead of being re-fetched by
    // each page every time — see AdminDataProvider.
    <AdminDataProvider>
      <div className="grid min-h-screen grid-cols-1 bg-[#F3F5F0] text-[#1B1D1B] dark:bg-[#14171A] dark:text-[#ECEEE8] md:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-7 border-b border-[#DBDFD3] bg-white p-[1.1rem] dark:border-[#2C3130] dark:bg-[#1C2024] md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r">
          <div className="flex items-center gap-2.5 px-1 text-[1.02rem] font-bold tracking-[-0.01em]">
            <span className="font-mono rounded-md bg-[#1B1D1B] px-2 py-0.5 text-[0.95rem] font-bold text-[#F3F5F0] dark:bg-[#ECEEE8] dark:text-[#14171A]">
              {'{ }'}
            </span>
            <div>
              <div>How2Prompt</div>
              <div className="font-mono text-[0.68rem] uppercase tracking-[0.08em] text-[#8B8F86] dark:text-[#6D726A]">
                Admin
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-0.5">
            <NavGroupLabel>Overview</NavGroupLabel>
            <NavLink
              to="/admin/dashboard"
              onMouseEnter={() => void adminDashboardChunk()}
              onFocus={() => void adminDashboardChunk()}
              className={({ isActive }) =>
                `${NAV_ITEM_BASE} ${isActive ? NAV_ITEM_ACTIVE : NAV_ITEM_INACTIVE}`
              }
            >
              <LayoutDashboard aria-hidden="true" size={18} className="flex-shrink-0" />
              Dashboard
            </NavLink>
          </nav>

          <nav className="flex flex-col gap-0.5">
            <NavGroupLabel>Content</NavGroupLabel>
            <NavLink
              to="/admin/ai-models"
              onMouseEnter={() => void adminAiModelsChunk()}
              onFocus={() => void adminAiModelsChunk()}
              className={({ isActive }) =>
                `${NAV_ITEM_BASE} ${isActive ? NAV_ITEM_ACTIVE : NAV_ITEM_INACTIVE}`
              }
            >
              <Cpu aria-hidden="true" size={18} className="flex-shrink-0" />
              AI Models
            </NavLink>
            <NavLink
              to="/admin/taxonomy"
              onMouseEnter={() => void adminTaxonomyChunk()}
              onFocus={() => void adminTaxonomyChunk()}
              className={({ isActive }) =>
                `${NAV_ITEM_BASE} ${isActive ? NAV_ITEM_ACTIVE : NAV_ITEM_INACTIVE}`
              }
            >
              <FolderTree aria-hidden="true" size={18} className="flex-shrink-0" />
              Categories &amp; Tags
            </NavLink>
            <NavLink
              to="/admin/templates"
              onMouseEnter={() => void adminTemplatesChunk()}
              onFocus={() => void adminTemplatesChunk()}
              className={({ isActive }) =>
                `${NAV_ITEM_BASE} ${isActive ? NAV_ITEM_ACTIVE : NAV_ITEM_INACTIVE}`
              }
            >
              <FileText aria-hidden="true" size={18} className="flex-shrink-0" />
              Templates
            </NavLink>
          </nav>

          <div className="mt-auto flex flex-col gap-2 border-t border-[#DBDFD3] pt-4 dark:border-[#2C3130]">
            {session && (
              <div className="flex items-center gap-2.5 px-1">
                <span
                  className={`inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-mono text-[0.82rem] font-bold ${getTagAvatarClasses(session.accountId)}`}
                >
                  {session.displayName.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[0.85rem] font-semibold">{session.displayName}</div>
                  <div className="truncate font-mono text-[0.68rem] text-[#8B8F86] dark:text-[#6D726A]">
                    {session.email}
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 px-1">
              <ThemeToggle />
              <span className="text-xs text-[#5B5F58] dark:text-[#A2A79C]">Toggle theme</span>
            </div>
            <Link
              to="/"
              className="flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-sm text-[#5B5F58] hover:bg-[#EAEDE6] hover:text-[#1B1D1B] dark:text-[#A2A79C] dark:hover:bg-[#23282C] dark:hover:text-[#ECEEE8]"
            >
              <ArrowLeft aria-hidden="true" size={18} className="flex-shrink-0" />
              Back to home
            </Link>
          </div>
        </aside>

        <div
          className="flex min-w-0 flex-col gap-7 px-5 pb-16 pt-6 sm:px-[clamp(1.25rem,3vw,2.5rem)]"
          key={location.pathname}
        >
          {/* Scoped to the routed page, not the sidebar — see RootLayout.tsx's
           *  Suspense for why this can't sit above the layout instead. */}
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </AdminDataProvider>
  )
}
