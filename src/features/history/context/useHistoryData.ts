import { useContext } from 'react'
import { HistoryDataContext, type HistoryDataContextValue } from './HistoryDataContext'

/** History list cache shared across the History page's re-visits — see
 *  `HistoryDataProvider` for why this is fetched once (per filter set)
 *  at the layout level instead of per-mount. */
export function useHistoryData(): HistoryDataContextValue {
  const value = useContext(HistoryDataContext)
  if (!value) {
    throw new Error('useHistoryData must be used within HistoryDataProvider')
  }
  return value
}
