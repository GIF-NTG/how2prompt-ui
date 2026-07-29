import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/useAuth'

/** Route guard for every /admin/* screen (Epic 5, FR-001). Renders nothing while
 *  the session is still restoring to avoid flashing admin UI or a redirect before
 *  restoreSession() has had a chance to settle (research.md Decision 2). */
export function RequireAdmin() {
  const { session, isRestoring } = useAuth()

  if (isRestoring) return null
  if (!session) return <Navigate to="/login" replace />
  if (!session.isAdmin) return <Navigate to="/" replace />

  return <Outlet />
}
