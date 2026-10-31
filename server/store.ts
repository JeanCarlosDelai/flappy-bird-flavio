import {
  DEATH_CAUSES,
  OBSTACLE_KINDS,
  STAGE_COUNT,
  STAGE_LENGTH,
  type DeathCause,
  type GlobalStats,
  type ObstacleKind,
  type RankingEntry,
  type RunReport
} from './types.js';

export type RankingPeriod = 'all' | 'day';

/** Dados crus guardados no banco; as contas ficam em funções puras abaixo. */
export interface RawStats {
  totals: Record<string, number>;
  deaths: Record<string, number>;
  histogram: Record<string, number>;
  hitsBy: Record<string, number>;
  rankedPlayers: number;
}

export interface Store {
  /** Soma a partida nas estatísticas e devolve o histograma já atualizado. */
  recordRun(report: RunReport): Promise<Record<string, number>>;
  /** Guarda por 1 h a pontuação de uma partida, para o jogador pôr o nome depois. */
  saveTicket(runId: string, score: number): Promise<void>;
  /** Lê e apaga o ticket (cada partida entra no ranking uma vez só). */
  takeTicket(runId: string): Promise<number | null>;
  /** Grava a melhor pontuação do apelido; devolve posição e melhor pontuação dele. */
  submitRanking(key: string, name: string, score: number, day: string): Promise<{ position: number; best: number }>;
  topRanking(period: RankingPeriod, day: string, limit: number): Promise<RankingEntry[]>;
  rawStats(): Promise<RawStats>;
  /** Conta uma requisição; devolve quantas já houve nesta janela. */
  hit(bucket: string, windowSeconds: number): Promise<number>;
}

const n = (v: unknown) => Number(v) || 0;

/** Posição de cada um: 1 + quantos têm pontuação maior (empate divide a posição). */
export function withPositions(rows: { name: string; score: number }[]): RankingEntry[] {
  return rows.map((r, i) => {
    let position = i + 1;
    while (position > 1 && rows[position - 2].score === r.score) position--;
    return { position, name: r.name, score: r.score };
  });
}

/**
 * % das OUTRAS partidas que esta igualou ou superou.
 * O histograma já inclui a própria partida, por isso ela é descontada.
 */
export function betterThanPercent(histogram: Record<string, number>, score: number): { percent: number; total: number } {
  let total = 0;
  let atMost = 0;
  for (const [k, v] of Object.entries(histogram)) {
    total += n(v);
    if (Number(k) <= score) atMost += n(v);
  }
  const others = total - 1;
  return { percent: others > 0 ? Math.round(((atMost - 1) / others) * 100) : 100, total };
}

const BUCKET_SIZE = 5;
const BUCKET_LAST = 40;

export function buildStats(raw: RawStats): GlobalStats {
  const runs = n(raw.totals.runs);
  const reachedStage = Array.from({ length: STAGE_COUNT }, () => 0);
  const buckets = Array.from({ length: BUCKET_LAST / BUCKET_SIZE + 1 }, (_, i) => ({
    label: i * BUCKET_SIZE >= BUCKET_LAST ? `${BUCKET_LAST}+` : `${i * BUCKET_SIZE}–${i * BUCKET_SIZE + BUCKET_SIZE - 1}`,
    count: 0
  }));
  let bestScore = 0;

  for (const [k, v] of Object.entries(raw.histogram)) {
    const score = Number(k);
    const count = n(v);
    bestScore = Math.max(bestScore, score);
    for (let s = 0; s < STAGE_COUNT; s++) if (score >= s * STAGE_LENGTH) reachedStage[s] += count;
    buckets[Math.min(buckets.length - 1, Math.floor(score / BUCKET_SIZE))].count += count;
  }

  return {
    runs,
    rankedPlayers: raw.rankedPlayers,
    bestScore,
    averageScore: runs ? Math.round((n(raw.totals.scoreSum) / runs) * 10) / 10 : 0,
    totalFlightMs: n(raw.totals.flightMs),
    totalHits: n(raw.totals.hits),
    deaths: Object.fromEntries(DEATH_CAUSES.map((c) => [c, n(raw.deaths[c])])) as Record<DeathCause, number>,
    reachedStage,
    scoreBuckets: buckets,
    hitsByObstacle: Object.fromEntries(OBSTACLE_KINDS.map((k) => [k, n(raw.hitsBy[k])])) as Record<ObstacleKind, number>
  };
}

/** Banco em memória: desenvolvimento local e testes. */
export class MemoryStore implements Store {
  private totals: Record<string, number> = {};
  private deaths: Record<string, number> = {};
  private histogram: Record<string, number> = {};
  private hitsBy: Record<string, number> = {};
  private tickets = new Map<string, number>();
  private names = new Map<string, string>();
  private rankAll = new Map<string, number>();
  private rankDay = new Map<string, Map<string, number>>();
  private counters = new Map<string, number>();

  private add(map: Record<string, number>, key: string, by: number) {
    map[key] = (map[key] ?? 0) + by;
  }

  async recordRun(r: RunReport) {
    this.add(this.totals, 'runs', 1);
    this.add(this.totals, 'scoreSum', r.score);
    this.add(this.totals, 'flightMs', r.durationMs);
    this.add(this.totals, 'hits', r.hits);
    this.add(this.deaths, r.cause, 1);
    this.add(this.histogram, String(r.score), 1);
    for (const [k, v] of Object.entries(r.hitsByObstacle)) this.add(this.hitsBy, k, v ?? 0);
    return { ...this.histogram };
  }

  async saveTicket(runId: string, score: number) {
    this.tickets.set(runId, score);
  }

  async takeTicket(runId: string) {
    const score = this.tickets.get(runId);
    this.tickets.delete(runId);
    return score ?? null;
  }

  async submitRanking(key: string, name: string, score: number, day: string) {
    this.names.set(key, name);
    const daily = this.rankDay.get(day) ?? new Map<string, number>();
    this.rankDay.set(day, daily);
    for (const board of [this.rankAll, daily]) board.set(key, Math.max(board.get(key) ?? -1, score));
    const best = this.rankAll.get(key)!;
    const position = [...this.rankAll.values()].filter((s) => s > best).length + 1;
    return { position, best };
  }

  async topRanking(period: RankingPeriod, day: string, limit: number) {
    const board = period === 'all' ? this.rankAll : (this.rankDay.get(day) ?? new Map());
    return withPositions(
      [...board.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([key, score]) => ({ name: this.names.get(key) ?? key, score }))
    );
  }

  async rawStats() {
    return {
      totals: { ...this.totals },
      deaths: { ...this.deaths },
      histogram: { ...this.histogram },
      hitsBy: { ...this.hitsBy },
      rankedPlayers: this.rankAll.size
    };
  }

  async hit(bucket: string) {
    const v = (this.counters.get(bucket) ?? 0) + 1;
    this.counters.set(bucket, v);
    return v;
  }
}
