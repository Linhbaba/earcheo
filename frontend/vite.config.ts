import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Development proxy - routes API calls to local Node.js proxy server
      '/api': {
        target: 'http://localhost:3010',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    // Ensure assets are properly referenced for Vercel deployment
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'maplibre': ['maplibre-gl'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        }
      }
    }
  }
})
