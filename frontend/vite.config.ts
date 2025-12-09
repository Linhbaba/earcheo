import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // WMS proxy - goes to local backend for proper ČÚZK proxy
      '/api/proxy': {
        target: 'http://localhost:3010',
        changeOrigin: true,
      },
      // Other API calls go to production
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
