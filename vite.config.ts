import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Two pages: the public site, and the members-only profile editor at /profile/.
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        profile: resolve(import.meta.dirname, 'profile/index.html'),
      },
    },
  },
})
