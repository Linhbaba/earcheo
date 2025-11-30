import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Development proxy - routes API calls to Vercel in dev mode
      '/api': {
        target: process.env.VITE_API_URL || 'https://earcheo.cz',
        changeOrigin: true,
        secure: true,
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
