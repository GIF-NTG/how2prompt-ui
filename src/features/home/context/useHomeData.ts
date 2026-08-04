import { useContext } from 'react'
import { HomeDataContext, type HomeDataContextValue } from './HomeDataContext'

/** Categories/tags/AI models shared across `CatalogPage`'s filter controls
 *  — see `HomeDataProvider` for why this is fetched once at the layout
 *  level instead of per-component. */
export function useHomeData(): HomeDataContextValue {
  const value = useContext(HomeDataContext)
  if (!value) {
    throw new Error('useHomeData must be used within HomeDataProvider')
  }
  return value
}
