import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const BASE_URL = env.VITE_BASE_URL

  return {
    base: BASE_URL,
    plugins: [react(), tailwindcss()],
    build: {
      outDir: '../',
      emptyOutDir: false,
      assetsDir: 'dist/assets',
    },
    server: {
      proxy: {
        [`${BASE_URL}/api`]: {
          target: 'http://localhost',
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
