export type RegionId = 'brasilia' | 'litoral' | 'oceano' | 'fronteira';

export interface Stage {
  id: RegionId;
  name: string;
  fromScore: number;
  /** Cor da região no mapa da rota. */
  mapColor: string;
}

/** Brasília → litoral → oceano → fronteira. O desenho de cada uma fica em scenery.ts. */
export const STAGES: Stage[] = [
  { id: 'brasilia', name: 'Brasília', fromScore: 0, mapColor: '#4f93e0' },
  { id: 'litoral', name: 'Litoral', fromScore: 20, mapColor: '#ff8a65' },
  { id: 'oceano', name: 'Oceano', fromScore: 40, mapColor: '#1f5f9c' },
  { id: 'fronteira', name: 'Fronteira', fromScore: 60, mapColor: '#5e2d63' }
];

/** Pontos para atravessar cada região do mapa. */
export const STAGE_LENGTH = 20;

/** Pontos para cruzar o mapa inteiro. */
export const ROUTE_LENGTH = STAGES.length * STAGE_LENGTH;

export function stageIndexForScore(score: number): number {
  return Math.min(STAGES.length - 1, Math.floor(score / STAGE_LENGTH));
}

export function stageForScore(score: number): Stage {
  let current = STAGES[0];
  for (const stage of STAGES) if (score >= stage.fromScore) current = stage;
  return current;
}
