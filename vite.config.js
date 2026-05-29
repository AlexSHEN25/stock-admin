import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('axios')) return 'vendor-axios';
          if (id.includes('ant-design-vue')) return 'vendor-antd';
          return 'vendor';
        },
      },
    },
  },
  server: {
    port: 8000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/avatar': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => `/api${path}`,
      },
      '/upload': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});

