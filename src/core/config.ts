/** Todas as constantes de ajuste do jogo ficam aqui (unidades: px lógicos e segundos). */
export const WORLD = {
  width: 360,
  height: 640,
  groundHeight: 56
} as const;

export const JET = {
  x: 110,
  width: 46,
  height: 22,
  gravity: 1500,
  flapImpulse: -430,
  maxFallSpeed: 620
} as const;

export const OBSTACLES = {
  baseSpeed: 150,
  speedPerPoint: 2.5,
  maxSpeed: 260,
  baseInterval: 1.65,
  minInterval: 1.15,
  gapStart: 190,
  gapMin: 140,
  width: 64
} as const;

export const CHASER = {
  /** Quanto o perseguidor avança a cada erro (0..1). */
  hitThreat: 0.34,
  /** Quanto ele recua por segundo enquanto você voa limpo. */
  recoverPerSecond: 0.025,
  /** Tempo de invencibilidade depois de uma batida. */
  invulnerableSeconds: 1.2,
  pointsPerChaser: 15
} as const;

export const STORAGE_KEYS = {
  best: 'jatinho-do-flavio:best'
} as const;
