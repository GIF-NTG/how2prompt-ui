import { useContext } from 'react'
import { AdminDataContext, type AdminDataContextValue } from './AdminDataContext'

/** Categories/tags/AI models used across all three admin content pages
 *  (Templates, Taxonomy, AI Models) — see `AdminDataProvider` for why this
 *  is fetched once at the layout level instead of per-page. */
export function useAdminData(): AdminDataContextValue {
  const value = useContext(AdminDataContext)
  if (!value) {
    throw new Error('useAdminData must be used within AdminDataProvider')
  }
  return value
}
