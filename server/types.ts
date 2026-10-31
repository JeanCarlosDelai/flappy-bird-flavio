/** Como a partida terminou. */
export type DeathCause = 'chao' | 'lula' | 'xandao' | 'renan';
export const DEATH_CAUSES: DeathCause[] = ['chao', 'lula', 'xandao', 'renan'];

export type ObstacleKind = 'toga' | 'cpi' | 'pf' | 'radar';
export const OBSTACLE_KINDS: ObstacleKind[] = ['toga', 'cpi', 'pf', 'radar'];

/** Quantos pontos dura cada região (igual ao jogo). */
export const STAGE_LENGTH = 20;
export const STAGE_COUNT = 4;

/** O que o jogo manda ao terminar uma partida. */
export interface RunReport {
  score: number;
  durationMs: number;
  hits: number;
  radarAlerts: number;
  cause: DeathCause;
  hitsByObstacle: Partial<Record<ObstacleKind, number>>;
}

export interface RankingEntry {
  position: number;
  name: string;
  score: number;
}

export interface GlobalStats {
  runs: number;
  rankedPlayers: number;
  bestScore: number;
  averageScore: number;
  totalFlightMs: number;
  totalHits: number;
  deaths: Record<DeathCause, number>;
  /** Partidas que chegaram em cada região (índice 0 = Brasília). */
  reachedStage: number[];
  /** Partidas por faixa de pontos (0–4, 5–9, ...; a última junta 40+). */
  scoreBuckets: { label: string; count: number }[];
  hitsByObstacle: Record<ObstacleKind, number>;
}

export interface RunResult {
  runId: string;
  /** % das partidas que fizeram menos pontos que esta. */
  betterThanPercent: number;
  totalRuns: number;
}
