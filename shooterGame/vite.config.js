import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Відносні шляхи для GitHub Pages
  server: {
    port: 5173, // Shooter на порті 5173
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});


