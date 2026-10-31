import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

// base relativa: o build funciona tanto no Vercel quanto no GitHub Pages (subpasta).
export default defineConfig({
  base: './',
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  }
});
