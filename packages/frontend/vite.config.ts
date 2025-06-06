import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic', // this is default, but make it explicit
    }),
  ],
  optimizeDeps: {
    include: ['redux'],
  },
  server: {
    host: true,
    port: 3000,
    watch: {
      usePolling: true,
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3000,
    },
  },
})
