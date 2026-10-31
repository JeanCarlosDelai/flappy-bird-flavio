import { createHash, randomUUID } from 'node:crypto';
import { betterThanPercent, buildStats, type RankingPeriod, type Store } from './store.js';
import { checkName, parseRunReport } from './validate.js';
import type { RunResult } from './types.js';

const LIMITS = { runs: 30, ranking: 10, read: 120 } as const;

const json = (status: number, body: unknown, cache?: string) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cache ?? 'no-store'
    }
  });

/** Data de hoje no horário de Brasília (o ranking "hoje" vira à meia-noite daqui). */
export const today = (now = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(now);

/** O IP só vira um hash curto para o limite de requisições; não é guardado. */
function clientKey(req: Request): string {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  return createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

async function limited(store: Store, req: Request, kind: keyof typeof LIMITS): Promise<boolean> {
  const minute = Math.floor(Date.now() / 60000);
  const count = await store.hit(`${kind}:${minute}:${clientKey(req)}`, 120);
  return count > LIMITS[kind];
}

async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

const unavailable = () => json(503, { error: 'storage_not_configured' });

/** POST /api/runs — registra uma partida (anônima) nas estatísticas. */
export async function handleRuns(req: Request, store: Store | null): Promise<Response> {
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });
  if (!store) return unavailable();
  if (await limited(store, req, 'runs')) return json(429, { error: 'too_many_requests' });

  const report = parseRunReport(await readJson(req));
  if (!report) return json(400, { error: 'invalid_run' });

  const histogram = await store.recordRun(report);
  const runId = randomUUID();
  await store.saveTicket(runId, report.score);
  const { percent, total } = betterThanPercent(histogram, report.score);
  const result: RunResult = { runId, betterThanPercent: percent, totalRuns: total };
  return json(201, result);
}

/** GET /api/ranking?period=all|day — top 50. POST /api/ranking — põe o apelido na partida. */
export async function handleRanking(req: Request, store: Store | null): Promise<Response> {
  if (!store) return unavailable();

  if (req.method === 'GET') {
    if (await limited(store, req, 'read')) return json(429, { error: 'too_many_requests' });
    const period: RankingPeriod = new URL(req.url).searchParams.get('period') === 'day' ? 'day' : 'all';
    const entries = await store.topRanking(period, today(), 50);
    return json(200, { period, entries }, 'public, s-maxage=10, stale-while-revalidate=30');
  }

  if (req.method === 'POST') {
    if (await limited(store, req, 'ranking')) return json(429, { error: 'too_many_requests' });
    const body = (await readJson(req)) as { runId?: unknown; name?: unknown } | null;
    const name = checkName(body?.name);
    if (!name.ok) return json(400, { error: name.reason });
    if (typeof body?.runId !== 'string') return json(400, { error: 'invalid_run' });
    const score = await store.takeTicket(body.runId);
    if (score === null) return json(410, { error: 'run_expired' });
    const { position, best } = await store.submitRanking(name.key, name.name, score, today());
    return json(201, { position, best, score, name: name.name });
  }

  return json(405, { error: 'method_not_allowed' });
}

/** GET /api/stats — estatísticas gerais. */
export async function handleStats(req: Request, store: Store | null): Promise<Response> {
  if (req.method !== 'GET') return json(405, { error: 'method_not_allowed' });
  if (!store) return unavailable();
  if (await limited(store, req, 'read')) return json(429, { error: 'too_many_requests' });
  const stats = buildStats(await store.rawStats());
  return json(200, stats, 'public, s-maxage=15, stale-while-revalidate=60');
}
