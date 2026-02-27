import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function resolvePagesBasePath() {
  const explicitBase = process.env.VITE_BASE_PATH
  if (explicitBase) {
    return explicitBase.endsWith('/') ? explicitBase : `${explicitBase}/`
  }

  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]
  return repoName ? `/${repoName}/` : '/senet-game/'
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? resolvePagesBasePath() : '/',
  plugins: [react()],
  build: {
    // Keep SVGs as files (not data URIs) so CSS masks are stable on GitHub Pages.
    assetsInlineLimit: 0
  },
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
}))
