/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // Vite loads .env.local even for `vitest` — force the mock AuthClient
    // regardless of a developer's local VITE_API_BASE_URL, so tests stay
    // hermetic instead of silently hitting a real (possibly incomplete) backend.
    env: {
      VITE_API_BASE_URL: '',
    },
  },
})
