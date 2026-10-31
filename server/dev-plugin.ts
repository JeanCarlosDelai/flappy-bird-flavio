import type { Connect, Plugin } from 'vite';
import { handleRanking, handleRuns, handleStats } from './handlers.js';
import { MemoryStore } from './store.js';

/**
 * No `npm run dev`/`preview` a API roda dentro do Vite com um banco em memória,
 * para dar para testar o ranking sem configurar nada. Em produção quem responde
 * são as funções da pasta api/ com o Upstash Redis.
 */
export function devApi(): Plugin {
  const store = new MemoryStore();
  const routes: Record<string, (req: Request, s: MemoryStore) => Promise<Response>> = {
    '/api/runs': handleRuns,
    '/api/ranking': handleRanking,
    '/api/stats': handleStats
  };

  const middleware: Connect.NextHandleFunction = async (req, res, next) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const route = routes[url.pathname];
    if (!route) return next();
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    const request = new Request(url, {
      method: req.method,
      headers: { 'content-type': 'application/json' },
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : Buffer.concat(chunks)
    });
    const response = await route(request, store);
    res.statusCode = response.status;
    response.headers.forEach((v, k) => res.setHeader(k, v));
    res.end(await response.text());
  };

  return {
    name: 'jatinho-dev-api',
    configureServer: (server) => void server.middlewares.use(middleware),
    configurePreviewServer: (server) => void server.middlewares.use(middleware)
  };
}
