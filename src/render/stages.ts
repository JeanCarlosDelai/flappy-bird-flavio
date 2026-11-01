export type RegionId = 'brasilia' | 'iguazu' | 'guayaquil' | 'miami';

export interface Stage {
  id: RegionId;
  name: string;
  /** Nome curto para o mapa. */
  short: string;
  country: string;
  fromScore: number;
  /** Cor da parada no mapa. */
  mapColor: string;
  /** Posição real (longitude, latitude) para o mapa das Américas. */
  lon: number;
  lat: number;
}

/**
 * Paradas na ordem do trajeto noticiado em 27–28/out/2026:
 * Brasília → (van) Foz do Iguaçu/Puerto Iguazú → (jato) Guayaquil → Miami.
 * O cenário mostra a cidade onde o jatinho está; no mapa ele voa até a próxima.
 */
export const STAGES: Stage[] = [
  { id: 'brasilia', name: 'Brasília', short: 'BRASÍLIA', country: 'Brasil', fromScore: 0, mapColor: '#2fa34f', lon: -47.9, lat: -15.8 },
  { id: 'iguazu', name: 'Puerto Iguazú', short: 'IGUAZÚ', country: 'Argentina', fromScore: 20, mapColor: '#6cb4ee', lon: -54.6, lat: -25.6 },
  { id: 'guayaquil', name: 'Guayaquil', short: 'GUAYAQUIL', country: 'Equador', fromScore: 40, mapColor: '#ffd23f', lon: -79.9, lat: -2.2 },
  { id: 'miami', name: 'Miami', short: 'MIAMI', country: 'EUA', fromScore: 60, mapColor: '#ff5a8a', lon: -80.2, lat: 25.8 }
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
