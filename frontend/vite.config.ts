import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':   ['react', 'react-dom'],
          'vendor-motion':  ['framer-motion'],
          'vendor-ui':      ['lucide-react', '@radix-ui/react-tooltip', '@radix-ui/react-collapsible'],
          'vendor-data':    ['@tanstack/react-query', 'zustand'],
          'vendor-markdown': ['react-markdown', 'remark-gfm'],
        },
      },
    },
  },
})
