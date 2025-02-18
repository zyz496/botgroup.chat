import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import copy from 'vite-plugin-copy'

export default defineConfig({
  plugins: [
    react(),
    copy({
      patterns: [
        {
          from: 'assets',  // 源目录
          to: 'dist/assets'  // 目标目录
        }
      ]
    })
  ],
  base: '/',
  server: {
    port: 3000,
    open: true,
    host: true,
    // 如果有跨域需求，可以添加代理配置
    // proxy: {
    //   '/api': {
    //     target: 'your-api-url',
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/api/, '')
    //   }
    // }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    assetsDir: 'assets', // 静态资源目录
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js'
      }
    }
  }
})
