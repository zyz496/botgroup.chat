import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import copy from 'rollup-plugin-copy'

export default defineConfig({
  plugins: [
    react(),
    copy({
      targets: [
        {
          src: 'img',  // 源目录
          dest: 'dist/img'    // 目标目录
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
    outDir: 'dist'
  }
})
