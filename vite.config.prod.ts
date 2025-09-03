import type { UserConfig } from 'vite'
import { defineConfig } from 'vite'

// 生产环境配置
export const prodConfig: UserConfig = {
  server: {
    port: 4173,
    host: false,
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]',
        manualChunks: {
          'vue': ['vue'],
          'vue-router': ['vue-router'],
          'element-plus': ['element-plus'],
          'vendor': ['axios', 'qs'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false,
  },
  define: {
    __DEV__: false,
    __PROD__: true,
  },
  css: {
    devSourcemap: false,
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
}

export default defineConfig(prodConfig)
