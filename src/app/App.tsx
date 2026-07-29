import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RootLayout } from './layout/RootLayout'
import { CatalogPage } from '@/features/home/pages/CatalogPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage'
import { TemplateDetailPage } from '@/features/template-detail/components/TemplateDetailPage'
import { HistoryPage } from '@/features/history/pages/HistoryPage'
import { FavoritesPage } from '@/features/history/pages/FavoritesPage'
import { VerifyEmailPage } from '@/features/auth/pages/VerifyEmailPage'
import { ProfileSettingsPage } from '@/features/auth/pages/ProfileSettingsPage'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import { ThemeProvider } from '@/shared/context/ThemeProvider'

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* AuthLayout-based pages render their own full-page header — nesting them
                under RootLayout would stack RootLayout's app-shell TopBar on top of it. */}
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="verify-email" element={<VerifyEmailPage />} />
            <Route path="profile" element={<ProfileSettingsPage />} />
            {/* Pre-v1.1.0 Google authorization-code callback URL — the backend no
                longer exposes that flow at all, so a stale bookmark/in-flight link
                redirects straight to login instead of rendering a dead page. */}
            <Route path="auth/google/callback" element={<Navigate to="/login" replace />} />

            <Route element={<RootLayout />}>
              <Route index element={<CatalogPage />} />
              <Route path="templates/:slug" element={<TemplateDetailPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="favorites" element={<FavoritesPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
