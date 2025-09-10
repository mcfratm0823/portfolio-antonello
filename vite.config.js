import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      },
      format: {
        comments: false
      }
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        portfolio: resolve(__dirname, 'portfolio.html'),
        success: resolve(__dirname, 'success.html')
      },
      output: {
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'css/[name].[hash][extname]';
          } else if (assetInfo.name.match(/\.(woff2?|ttf|eot)$/)) {
            return 'fonts/[name][extname]';
          } else if (assetInfo.name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) {
            return 'img/[name][extname]';
          }
          return '[name].[hash][extname]';
        }
      }
    },
    // Soglia per inline base64 (4kb)
    assetsInlineLimit: 4096,
    // Genera source maps per debug
    sourcemap: false
  },
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  server: {
    port: 3000,
    open: true
  }
});