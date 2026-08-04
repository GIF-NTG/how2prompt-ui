import { useContext } from 'react'
import { FavoritesContext, type FavoritesContextValue } from './FavoritesContext'

export function useFavorites(): FavoritesContextValue {
  return useContext(FavoritesContext)
}
