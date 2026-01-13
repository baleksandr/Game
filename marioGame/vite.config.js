import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Відносні шляхи для GitHub Pages
  server: {
    port: 5174, // Mario на порті 5174
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});


