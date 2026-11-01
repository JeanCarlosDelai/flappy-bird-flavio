import { describe, expect, it } from 'vitest';
import { handleRanking, handleRuns, handleStats } from '../handlers.js';
import { MemoryStore, withPositions } from '../store.js';
import { checkName, parseRunReport } from '../validate.js';

const run = (over: Record<string, unknown> = {}) => ({
  score: 10,
  durationMs: 20000,
  hits: 2,
  radarAlerts: 1,
  cause: 'lula',
  hitsByObstacle: { toga: 2 },
  ...over
});

const post = (path: string, body: unknown, ip = '1.1.1.1') =>
  new Request(`http://x${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body)
  });
const get = (path: string) => new Request(`http://x${path}`);

describe('parseRunReport', () => {
  it('accepts a plausible run', () => {
    expect(parseRunReport(run())).toMatchObject({ score: 10, cause: 'lula', hitsByObstacle: { toga: 2 } });
  });

  it('rejects impossible score for the flight time', () => {
    expect(parseRunReport(run({ score: 100, durationMs: 10000 }))).toBeNull();
  });

  it('rejects unknown cause and negative numbers', () => {
    expect(parseRunReport(run({ cause: 'bolsonaro' }))).toBeNull();
    expect(parseRunReport(run({ hits: -1 }))).toBeNull();
    expect(parseRunReport(run({ score: 1.5 }))).toBeNull();
  });
});

describe('checkName', () => {
  it('trims and keeps accents, key ignores accents and case', () => {
    expect(checkName('  João   Pé  ')).toEqual({ ok: true, name: 'João Pé', key: 'joao pe' });
  });

  it('blocks bad words and odd characters', () => {
    expect(checkName('seu merda')).toEqual({ ok: false, reason: 'name_blocked' });
    expect(checkName('<script>')).toEqual({ ok: false, reason: 'name_chars' });
    expect(checkName('a')).toEqual({ ok: false, reason: 'name_length' });
  });

  it('does not block names that only contain a short blocked word inside', () => {
    expect(checkName('Curitiba').ok).toBe(true);
  });
});

describe('withPositions', () => {
  it('shares the position on ties', () => {
    expect(
      withPositions([
        { name: 'a', score: 9 },
        { name: 'b', score: 5 },
        { name: 'c', score: 5 },
        { name: 'd', score: 2 }
      ]).map((e) => e.position)
    ).toEqual([1, 2, 2, 4]);
  });
});

describe('API', () => {
  it('records runs, ranks by best score per name and builds stats', async () => {
    const store = new MemoryStore();

    const r1 = await (await handleRuns(post('/api/runs', run({ score: 5, durationMs: 10000 })), store)).json();
    const r2 = await (await handleRuns(post('/api/runs', run({ score: 25, durationMs: 40000, cause: 'chao' })), store)).json();
    expect(r1.betterThanPercent).toBe(100); // primeira partida
    expect(r2.betterThanPercent).toBe(100);
    expect(r2.totalRuns).toBe(2);

    const a = await handleRanking(post('/api/ranking', { runId: r2.runId, name: 'Ana' }), store);
    expect(a.status).toBe(201);
    expect(await a.json()).toMatchObject({ position: 1, best: 25 });

    // pior partida do mesmo nome não derruba o melhor
    const b = await (await handleRanking(post('/api/ranking', { runId: r1.runId, name: 'ana' }), store)).json();
    expect(b).toMatchObject({ position: 1, best: 25, score: 5 });

    // ticket só vale uma vez
    const again = await handleRanking(post('/api/ranking', { runId: r1.runId, name: 'Bia' }), store);
    expect(again.status).toBe(410);

    const top = await (await handleRanking(get('/api/ranking'), store)).json();
    expect(top.entries).toEqual([{ position: 1, name: 'ana', score: 25 }]);

    const stats = await (await handleStats(get('/api/stats'), store)).json();
    expect(stats).toMatchObject({
      runs: 2,
      bestScore: 25,
      averageScore: 15,
      deaths: { chao: 1, lula: 1, xandao: 0, renan: 0, janja: 0, fuga: 0 },
      reachedStage: [2, 0, 0, 0],
      rankedPlayers: 1
    });
    expect(stats.hitsByObstacle.toga).toBe(4);
  });

  it('rate limits run reports per client', async () => {
    const store = new MemoryStore();
    let last = 0;
    for (let i = 0; i < 31; i++) last = (await handleRuns(post('/api/runs', run(), '9.9.9.9'), store)).status;
    expect(last).toBe(429);
  });

  it('answers 503 when storage is not configured', async () => {
    expect((await handleStats(get('/api/stats'), null)).status).toBe(503);
  });
});
