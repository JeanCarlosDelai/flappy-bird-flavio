import { Redis } from '@upstash/redis';
import { withPositions, type RankingPeriod, type RawStats, type Store } from './store.js';
import type { RankingEntry, RunReport } from './types.js';

const P = 'jdf:';
const K = {
  totals: `${P}totals`,
  deaths: `${P}deaths`,
  histogram: `${P}hist`,
  hitsBy: `${P}hitsby`,
  names: `${P}names`,
  rankAll: `${P}rank:all`,
  rankDay: (day: string) => `${P}rank:day:${day}`,
  ticket: (id: string) => `${P}run:${id}`,
  counter: (bucket: string) => `${P}rl:${bucket}`
};

const toNumbers = (h: Record<string, unknown> | null) =>
  Object.fromEntries(Object.entries(h ?? {}).map(([k, v]) => [k, Number(v) || 0]));

/** Banco de produção: Upstash Redis (instalado pelo Marketplace da Vercel). */
export class RedisStore implements Store {
  constructor(private redis: Redis) {}

  /** Lê as variáveis que a integração do Upstash cria no projeto. */
  static fromEnv(): RedisStore | null {
    const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) return null;
    return new RedisStore(new Redis({ url, token }));
  }

  async recordRun(r: RunReport) {
    const tx = this.redis.multi();
    tx.hincrby(K.totals, 'runs', 1);
    tx.hincrby(K.totals, 'scoreSum', r.score);
    tx.hincrby(K.totals, 'flightMs', r.durationMs);
    tx.hincrby(K.totals, 'hits', r.hits);
    tx.hincrby(K.deaths, r.cause, 1);
    tx.hincrby(K.histogram, String(r.score), 1);
    for (const [k, v] of Object.entries(r.hitsByObstacle)) if (v) tx.hincrby(K.hitsBy, k, v);
    tx.hgetall(K.histogram);
    const results = await tx.exec();
    return toNumbers(results[results.length - 1] as Record<string, unknown>);
  }

  async saveTicket(runId: string, score: number) {
    await this.redis.set(K.ticket(runId), score, { ex: 3600 });
  }

  async takeTicket(runId: string) {
    const v = await this.redis.getdel<number>(K.ticket(runId));
    return v === null || v === undefined ? null : Number(v);
  }

  async submitRanking(key: string, name: string, score: number, day: string) {
    const tx = this.redis.multi();
    tx.hset(K.names, { [key]: name });
    tx.zadd(K.rankAll, { gt: true }, { score, member: key });
    tx.zadd(K.rankDay(day), { gt: true }, { score, member: key });
    tx.expire(K.rankDay(day), 3 * 24 * 3600);
    tx.zscore(K.rankAll, key);
    await tx.exec();
    const best = Number(await this.redis.zscore(K.rankAll, key)) || score;
    // posição = quantos têm pontuação maior + 1 (empates dividem a posição)
    const above = await this.redis.zcount(K.rankAll, `(${best}`, '+inf');
    return { position: above + 1, best };
  }

  async topRanking(period: RankingPeriod, day: string, limit: number): Promise<RankingEntry[]> {
    const key = period === 'all' ? K.rankAll : K.rankDay(day);
    const flat = await this.redis.zrange<(string | number)[]>(key, 0, limit - 1, { rev: true, withScores: true });
    const pairs: { key: string; score: number }[] = [];
    for (let i = 0; i < flat.length; i += 2) pairs.push({ key: String(flat[i]), score: Number(flat[i + 1]) });
    if (!pairs.length) return [];
    const names = await this.redis.hmget<Record<string, string>>(K.names, ...pairs.map((p) => p.key));
    return withPositions(pairs.map((p) => ({ name: names?.[p.key] ?? p.key, score: p.score })));
  }

  async rawStats(): Promise<RawStats> {
    const tx = this.redis.multi();
    tx.hgetall(K.totals);
    tx.hgetall(K.deaths);
    tx.hgetall(K.histogram);
    tx.hgetall(K.hitsBy);
    tx.zcard(K.rankAll);
    const [totals, deaths, histogram, hitsBy, ranked] = await tx.exec();
    return {
      totals: toNumbers(totals as Record<string, unknown>),
      deaths: toNumbers(deaths as Record<string, unknown>),
      histogram: toNumbers(histogram as Record<string, unknown>),
      hitsBy: toNumbers(hitsBy as Record<string, unknown>),
      rankedPlayers: Number(ranked) || 0
    };
  }

  async hit(bucket: string, windowSeconds: number) {
    const key = K.counter(bucket);
    const tx = this.redis.multi();
    tx.incr(key);
    tx.expire(key, windowSeconds);
    const [count] = await tx.exec();
    return Number(count) || 0;
  }
}
