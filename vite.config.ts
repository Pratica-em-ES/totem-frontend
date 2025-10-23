import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: true,
    strictPort: false,
    allowedHosts: ['all']
  },
  preview: {
    host: true,
    strictPort: false,
    allowedHosts: ['.run.app', '.googleusercontent.com', 'totem-frontend-1099316651461.southamerica-east1.run.app']
  }
})
