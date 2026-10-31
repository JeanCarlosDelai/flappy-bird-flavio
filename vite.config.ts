import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

const root = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// base relativa: o build funciona no Vercel e no GitHub Pages (subpasta).
// Duas páginas: landing (index.html) e o jogo (jogar.html).
export default defineConfig({
  base: './',
  resolve: {
    alias: { '@': root('./src') }
  },
  build: {
    rollupOptions: {
      input: {
        main: root('./index.html'),
        jogar: root('./jogar.html')
      }
    }
  }
});
