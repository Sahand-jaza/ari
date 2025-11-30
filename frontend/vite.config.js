import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const FRONTEND_PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const BACKEND_PORT = process.env.BACKEND_PORT ? Number(process.env.BACKEND_PORT) : 5000;
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${BACKEND_PORT}`;

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: FRONTEND_PORT,
    proxy: {
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
      }
    }
  },
  preview: {
    // Bind preview server to all interfaces and use Railway $PORT when provided
    host: '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
    // Allowlist hosts for Vite preview. Set FRONTEND_HOST or VITE_ALLOWED_HOST in env if needed.
    allowedHosts: [process.env.FRONTEND_HOST || process.env.VITE_ALLOWED_HOST || 'frontend-production-368d.up.railway.app']
  }
})
