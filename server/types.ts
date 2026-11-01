/** Perseguidores (cada um também é uma forma de a partida acabar). */
export const CHASER_IDS = [
  'lula', 'xandao', 'janja', 'pf', 'renan', 'gonet', 'dino', 'interpol',
  'gleisi', 'haddad', 'lindbergh', 'boulos', 'erika', 'kim'
] as const;
export type ChaserId = (typeof CHASER_IDS)[number];

/** Como a partida terminou: caiu no chão, pego por alguém ou chegou a Miami ("fuga"). */
export type DeathCause = 'chao' | ChaserId | 'fuga';
export const DEATH_CAUSES: DeathCause[] = ['chao', ...CHASER_IDS, 'fuga'];

/**
 * Obstáculos por parada. Brasília tem os de lá e os "dos partidos" (PT, PSOL, Missão);
 * as outras paradas só têm obstáculos da própria região.
 */
export const OBSTACLE_KINDS = [
  'toga', 'cpi', 'cupulas', 'pf',
  'estrela', 'blusinhas', 'picanha', 'lona', 'sol', 'faixas', 'outdoor', 'livros', 'drones',
  'cataratas', 'cancela', 'quati', 'cuia', 'tucanos', 'marco', 'bote',
  'roda', 'iguana', 'bananas', 'radar', 'atobas', 'relogio', 'chapeu',
  'holofote', 'predios', 'pelicanos', 'jacare', 'flamingos', 'aviao-faixa', 'foguete'
] as const;
export type ObstacleKind = (typeof OBSTACLE_KINDS)[number];

/** Quantos pontos dura cada parada (igual ao jogo). */
export const STAGE_LENGTH = 40;
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
