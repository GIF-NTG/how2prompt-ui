import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { RootLayout } from './layout/RootLayout'
import { HomePage } from '@/features/home/pages/HomePage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage'
import { VerifyEmailPage } from '@/features/auth/pages/VerifyEmailPage'
import { GoogleCallbackPage } from '@/features/auth/pages/GoogleCallbackPage'
import { AuthProvider } from '@/features/auth/context/AuthProvider'

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="verify-email" element={<VerifyEmailPage />} />
            <Route path="auth/google/callback" element={<GoogleCallbackPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
