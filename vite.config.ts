import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import { devApi } from './server/dev-plugin.ts';
import { pwaServiceWorker } from './server/pwa-plugin.ts';

const root = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// base relativa: o build funciona no Vercel e no GitHub Pages (subpasta).
// Três páginas: landing (index.html), jogo (jogar.html) e ranking (ranking.html).
export default defineConfig({
  base: './',
  plugins: [devApi(), pwaServiceWorker()],
  resolve: {
    alias: { '@': root('./src'), '@server': root('./server') }
  },
  build: {
    rollupOptions: {
      input: {
        main: root('./index.html'),
        jogar: root('./jogar.html'),
        ranking: root('./ranking.html'),
        vozes: root('./vozes.html'),
        colecao: root('./colecao.html'),
        teste: root('./teste.html'),
        hangar: root('./hangar.html')
      }
    }
  }
});
