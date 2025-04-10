import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  base: './',  // 使用相對路徑
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    minify: 'terser',  // 使用 terser 進行更激進的壓縮
    terserOptions: {
      compress: {
        drop_console: true,  // 移除 console.log
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 5,  // 增加壓縮次數
        dead_code: true,  // 移除未使用的代碼
        keep_classnames: false,
        keep_fnames: false,
        reduce_vars: true,
        collapse_vars: true,
        unused: true,
        hoist_funs: true,
        hoist_vars: true,
        if_return: true,
        join_vars: true,
        loops: true,
        sequences: true,
        properties: true,
        conditionals: true,
        evaluate: true,
        booleans: true,
        comparisons: true,
        typeofs: true
      },
      mangle: {
        toplevel: true,  // 混淆頂層變量
        keep_classnames: false,
        keep_fnames: false,
        properties: {
          regex: /^_/  // 只混淆以下劃線開頭的屬性
        }
      },
      format: {
        comments: false,
        beautify: false
      }
    },
    rollupOptions: {
      output: {
        // 使用函數方式進行代碼分割
        manualChunks: (id) => {
          // 第三方庫
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('pinia')) {
              return 'vendor';
            }
            return 'deps';
          }
          // API 相關
          if (id.includes('services/api')) {
            return 'api';
          }
          // 組件
          if (id.includes('src/components')) {
            return 'components';
          }
          // 頁面
          if (id.includes('src/views')) {
            return 'views';
          }
        },
        // 自定義分包命名
        chunkFileNames: 'assets/js/[name].[hash].js',
        // 入口文件命名
        entryFileNames: 'assets/js/[name].[hash].js',
        // 靜態資源命名
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          let extType = info[info.length - 1];
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'media';
          } else if (/\.(png|jpe?g|gif|svg|ico|webp)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'img';
          } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'fonts';
          }
          return `assets/${extType}/[name].[hash].[ext]`;
        }
      }
    }
  },
  // 優化開發伺服器配置
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    hmr: false  // 禁用熱更新
  }
})
