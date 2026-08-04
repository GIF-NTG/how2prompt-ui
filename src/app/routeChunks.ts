/** Import functions backing `React.lazy()` in `App.tsx`, re-exported so nav
 *  links can prefetch a page's chunk on hover/focus (rule: preload based on
 *  user intent) — calling one of these again after the chunk has already
 *  loaded is a no-op cache hit, not a duplicate fetch. */
export const adminAiModelsChunk = () => import('@/features/admin/pages/AiModelsPage')
export const adminTaxonomyChunk = () => import('@/features/admin/pages/TaxonomyPage')
export const adminTemplatesChunk = () => import('@/features/admin/pages/TemplatesAdminPage')
export const adminDashboardChunk = () => import('@/features/admin/pages/DashboardPage')

export const historyChunk = () => import('@/features/history/pages/HistoryPage')
export const favoritesChunk = () => import('@/features/history/pages/FavoritesPage')
export const profileChunk = () => import('@/features/auth/pages/ProfileSettingsPage')
