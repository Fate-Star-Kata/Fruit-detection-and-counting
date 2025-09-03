import type { UserConfig } from 'vite'
import { defineConfig } from 'vite'

// 开发环境配置
export const devConfig: UserConfig = {
  server: {
    port: 5173,
    host: true,
    open: true,
    cors: true,
  },
  build: {
    sourcemap: true,
    minify: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          elementPlus: ['element-plus'],
        },
      },
    },
  },
  define: {
    __DEV__: true,
    __PROD__: false,
  },
  css: {
    devSourcemap: true,
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'element-plus'],
  },
}

export default defineConfig(devConfig)
