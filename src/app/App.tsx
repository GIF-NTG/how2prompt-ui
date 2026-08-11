import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RootLayout } from './layout/RootLayout'
import { PageFallback } from './PageFallback'
import { RequireAdmin } from '@/features/admin/components/RequireAdmin'
import { AdminLayout } from '@/features/admin/components/AdminLayout'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import { FavoritesProvider } from '@/features/history/context/FavoritesProvider'
import { ThemeProvider } from '@/shared/context/ThemeProvider'
import {
  adminAiModelsChunk,
  adminDashboardChunk,
  adminTaxonomyChunk,
  adminTemplatesChunk,
  favoritesChunk,
  historyChunk,
  profileChunk,
} from './routeChunks'

// Every route page is code-split — each import() becomes its own chunk,
// fetched on first navigation instead of bundled into the initial load.
const CatalogPage = lazy(() =>
  import('@/features/home/pages/CatalogPage').then((m) => ({ default: m.CatalogPage })),
)
const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const RegisterPage = lazy(() =>
  import('@/features/auth/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })),
)
const ForgotPasswordPage = lazy(() =>
  import('@/features/auth/pages/ForgotPasswordPage').then((m) => ({
    default: m.ForgotPasswordPage,
  })),
)
const ResetPasswordPage = lazy(() =>
  import('@/features/auth/pages/ResetPasswordPage').then((m) => ({
    default: m.ResetPasswordPage,
  })),
)
const VerifyEmailPage = lazy(() =>
  import('@/features/auth/pages/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage })),
)
const ProfileSettingsPage = lazy(() =>
  profileChunk().then((m) => ({ default: m.ProfileSettingsPage })),
)
const TemplateDetailPage = lazy(() =>
  import('@/features/template-detail/components/TemplateDetailPage').then((m) => ({
    default: m.TemplateDetailPage,
  })),
)
const HistoryPage = lazy(() => historyChunk().then((m) => ({ default: m.HistoryPage })))
const RegenerateHistoryPage = lazy(() =>
  import('@/features/history/pages/RegenerateHistoryPage').then((m) => ({
    default: m.RegenerateHistoryPage,
  })),
)
const FavoritesPage = lazy(() => favoritesChunk().then((m) => ({ default: m.FavoritesPage })))
const AiModelsPage = lazy(() => adminAiModelsChunk().then((m) => ({ default: m.AiModelsPage })))
const TaxonomyPage = lazy(() => adminTaxonomyChunk().then((m) => ({ default: m.TaxonomyPage })))
const TemplatesAdminPage = lazy(() =>
  adminTemplatesChunk().then((m) => ({ default: m.TemplatesAdminPage })),
)
const DashboardPage = lazy(() =>
  adminDashboardChunk().then((m) => ({ default: m.DashboardPage })),
)

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FavoritesProvider>
          <BrowserRouter>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* AuthLayout-based pages render their own full-page header — nesting them
                    under RootLayout would stack RootLayout's app-shell TopBar on top of it. */}
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route path="reset-password" element={<ResetPasswordPage />} />
                <Route path="verify-email" element={<VerifyEmailPage />} />
                {/* Pre-v1.1.0 Google authorization-code callback URL — the backend no
                    longer exposes that flow at all, so a stale bookmark/in-flight link
                    redirects straight to login instead of rendering a dead page. */}
                <Route path="auth/google/callback" element={<Navigate to="/login" replace />} />

                <Route element={<RootLayout />}>
                  <Route index element={<CatalogPage />} />
                  <Route path="templates/:id" element={<TemplateDetailPage />} />
                  <Route path="history" element={<HistoryPage />} />
                  <Route
                    path="history/:historyId/regenerate"
                    element={<RegenerateHistoryPage />}
                  />
                  <Route path="favorites" element={<FavoritesPage />} />
                  <Route path="profile" element={<ProfileSettingsPage />} />
                </Route>

                {/* Admin uses its own sidebar shell (AdminLayout), per
                    docs/design/how2prompt-admin-dashboard-mockup.html — not nested
                    under RootLayout's TopBar. */}
                <Route element={<RequireAdmin />}>
                  <Route element={<AdminLayout />}>
                    <Route path="admin/ai-models" element={<AiModelsPage />} />
                    <Route path="admin/taxonomy" element={<TaxonomyPage />} />
                    <Route path="admin/templates" element={<TemplatesAdminPage />} />
                    <Route path="admin/dashboard" element={<DashboardPage />} />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </FavoritesProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
