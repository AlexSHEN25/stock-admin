export default {
  dev: {
    '/api/schema': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
    '/api/lowcode': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
  },
};
