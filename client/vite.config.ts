import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Allow any ngrok free-domain tunnel (e.g. *.ngrok-free.app)
    allowedHosts: ['.ngrok-free.app'],
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        ws: true
      },
    },
    watch: {
      usePolling: true
    }
  }
})
