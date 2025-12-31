import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Відносні шляхи для GitHub Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});

