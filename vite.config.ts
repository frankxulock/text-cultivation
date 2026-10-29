import { defineConfig } from 'vite';

export default defineConfig({
  // TG Mini App / 静态托管可用相对路径
  base: './',
  server: {
    host: true,
    port: 5173,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
