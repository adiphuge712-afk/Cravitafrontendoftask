import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // "@" always means /src, so moving a file never breaks its imports
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
