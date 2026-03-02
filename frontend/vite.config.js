import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'color-functions']
      }
    }
  },
  server: {
    port: 5173,
    strictPort: false,
    host: 'localhost',
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})
