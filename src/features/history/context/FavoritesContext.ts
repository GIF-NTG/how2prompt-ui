import { createContext } from 'react'

export interface FavoritesContextValue {
  isFavorited: (templateId: string) => boolean
  setFavorited: (templateId: string, favorited: boolean) => void
}

// Default (no-op) value lets components call useFavorites() safely outside a
// FavoritesProvider (e.g. in tests that don't need favorite-state accuracy)
// instead of throwing — unlike useAuth(), this is a progressive enhancement,
// not a hard requirement.
export const FavoritesContext = createContext<FavoritesContextValue>({
  isFavorited: () => false,
  setFavorited: () => {},
})
