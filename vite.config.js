import { defineConfig } from 'vite';

export default defineConfig({
  // Relative paths work for gh-pages and main/docs without hard-coded repo prefix.
  base: './',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
});
