import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { RootLayout } from './layout/RootLayout'
import { CatalogPage } from '@/features/home/pages/CatalogPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage'
import { GoogleCallbackPage } from '@/features/auth/pages/GoogleCallbackPage'
import { TemplateDetailPage } from '@/features/template-detail/components/TemplateDetailPage'
import { AuthProvider } from '@/features/auth/context/AuthProvider'

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<CatalogPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="auth/google/callback" element={<GoogleCallbackPage />} />
            <Route path="templates/:slug" element={<TemplateDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
