import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5175,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5175
    },
    allowedHosts: [
      '1727a9193a55.ngrok-free.app',
      '540ab6ac36ae.ngrok-free.app',
      '04ccac0e3974.ngrok-free.app',
      '8aea916941c8.ngrok-free.app',
      '90cb1b18e03c.ngrok-free.app '
    ]
  },
  optimizeDeps: {
    include: [
      '@fortawesome/fontawesome-svg-core',
      '@fortawesome/free-solid-svg-icons',
      '@fortawesome/vue-fontawesome'
    ]
  },
  build: {
    sourcemap: false,
    outDir: 'dist'
  }
})