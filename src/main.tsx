import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './app/App'

// A hard refresh (F5) should land on a filtered page's default state, not
// resume whatever filter query params were in the URL — only in-app
// navigation (clicking a filter, the back/forward button, opening a shared
// link) should preserve them. The Navigation Timing API's `type` is the one
// signal that tells an actual reload apart from a fresh navigation, since by
// the time this file runs both otherwise look identical (same URL). Runs
// once per real page load — SPA route changes never re-execute this file —
// and clears the query string for every page (Catalog, History, ...)
// uniformly instead of each filter hook having to special-case it.
const [navigationEntry] = performance.getEntriesByType(
  'navigation',
) as PerformanceNavigationTiming[]
if (navigationEntry?.type === 'reload' && window.location.search) {
  window.history.replaceState(null, '', window.location.pathname)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
