import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { CatalogPage } from './CatalogPage'
import { AuthProvider } from '@/features/auth/context/AuthProvider'

describe('CatalogPage', () => {
  it('renders the page heading and eyebrow', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <CatalogPage />
        </MemoryRouter>
      </AuthProvider>,
    )
    expect(screen.getByText('templates · guest & member')).toBeInTheDocument()
    expect(
      screen.getByText('Tìm mẫu prompt phù hợp — đăng nhập để lưu lịch sử'),
    ).toBeInTheDocument()
  })
})
