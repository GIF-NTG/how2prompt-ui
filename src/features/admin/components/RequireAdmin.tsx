import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/useAuth'

/** Route guard for every `/admin/*` screen (FR-001). Renders nothing while the
 *  initial session restore is in flight to avoid flashing admin UI to a
 *  not-yet-known session, per research.md Decision 2. */
export function RequireAdmin() {
  const { session, isRestoring } = useAuth()

  if (isRestoring) return null
  if (!session) return <Navigate to="/login" replace />
  if (!session.isAdmin) return <Navigate to="/" replace />

  return <Outlet />
}
