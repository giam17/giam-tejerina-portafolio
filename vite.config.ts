import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const { API_PORT = '3001' } = loadEnv(mode, process.cwd(), 'API_PORT')

  return {
    plugins: [react()],
    build: { assetsInlineLimit: 0 },
    server: { proxy: { '/api': 'http://127.0.0.1:' + Number(API_PORT) } },
  }
})
