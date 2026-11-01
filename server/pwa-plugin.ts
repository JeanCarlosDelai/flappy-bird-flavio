import type { Plugin } from 'vite';

/**
 * Gera o service worker (sw.js) no build, com a lista de TODOS os arquivos do jogo
 * para funcionar offline. A versão muda a cada build, então o celular atualiza sozinho.
 */
export function pwaServiceWorker(): Plugin {
  return {
    name: 'jatinho-pwa-sw',
    apply: 'build',
    generateBundle(_options, bundle) {
      const files = Object.keys(bundle).filter((f) => !f.endsWith('.map'));
      const pages = ['index.html', 'jogar.html', 'ranking.html', 'colecao.html', 'vozes.html', 'teste.html'];
      const extra = [...pages, 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png'];
      const version = Date.now().toString(36);
      const precache = ['./', ...files, ...extra].map((f) => (f === './' ? f : `./${f}`));
      const source = `// Gerado no build (server/pwa-plugin.ts). Não editar à mão.
const VERSION = ${JSON.stringify(version)};
const CACHE = 'jatinho-' + VERSION;
const PRECACHE = ${JSON.stringify(precache)};

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('jatinho-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  // só arquivos do próprio site; a API (ranking) sempre vai para a rede
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return;

  // páginas: tenta a rede primeiro (pega versão nova), sem internet usa o guardado
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() =>
          caches.match(req, { ignoreSearch: true }).then((hit) => {
            if (hit) return hit;
            // URLs sem .html (Vercel) → arquivo .html guardado
            const html = url.pathname.endsWith('/') ? './' : '.' + url.pathname + '.html';
            return caches.match(html).then((h) => h || caches.match('./jogar.html'));
          })
        )
    );
    return;
  }

  // demais arquivos (têm hash no nome): cache primeiro
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
    )
  );
});
`;
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    }
  };
}
