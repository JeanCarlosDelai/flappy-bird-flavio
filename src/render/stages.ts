import { STAGE_LENGTH as DEFAULT_STAGE_LENGTH, type ChaserId } from '@server/types';
import { testMode } from '@/systems/test-mode';

/** Pontos por parada (MODO TESTE pode mudar). */
const STAGE_LENGTH = testMode?.stageLength ?? DEFAULT_STAGE_LENGTH;

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
  /** Quem fica na cola nesta parada (revezam ao longo da fase). */
  chasers: ChaserId[];
}

/**
 * Paradas na ordem do trajeto noticiado em 27–28/out/2026:
 * Brasília → (van) Foz do Iguaçu/Puerto Iguazú → (jato) Guayaquil → Miami.
 * O cenário mostra a cidade onde o jatinho está; no mapa ele voa até a próxima.
 */
export const STAGES: Stage[] = [
  { id: 'brasilia', name: 'Brasília', short: 'BRASÍLIA', country: 'Brasil', fromScore: 0 * STAGE_LENGTH, mapColor: '#2fa34f', lon: -47.9, lat: -15.8, chasers: ['lula', 'xandao', 'janja', 'gleisi', 'lindbergh', 'boulos', 'erika'] },
  { id: 'iguazu', name: 'Puerto Iguazú', short: 'IGUAZÚ', country: 'Argentina', fromScore: 1 * STAGE_LENGTH, mapColor: '#6cb4ee', lon: -54.6, lat: -25.6, chasers: ['pf', 'renan', 'kim', 'haddad'] },
  { id: 'guayaquil', name: 'Guayaquil', short: 'GUAYAQUIL', country: 'Equador', fromScore: 2 * STAGE_LENGTH, mapColor: '#ffd23f', lon: -79.9, lat: -2.2, chasers: ['gonet', 'dino'] },
  { id: 'miami', name: 'Miami', short: 'MIAMI', country: 'EUA', fromScore: 3 * STAGE_LENGTH, mapColor: '#ff5a8a', lon: -80.2, lat: 25.8, chasers: ['interpol', 'lula', 'xandao', 'janja', 'pf', 'renan', 'gonet', 'dino', 'gleisi', 'haddad', 'lindbergh', 'boulos', 'erika', 'kim'] }
];

/** Pontos para atravessar cada parada (fase). */
export { STAGE_LENGTH };

/** Pontos para cruzar o mapa inteiro. */
export const ROUTE_LENGTH = STAGES.length * STAGE_LENGTH;

/**
 * Parada atual. Depois de Miami a rota recomeça (só acontece no modo sem fim; no normal a
 * partida acaba ao chegar a Miami).
 */
export function stageIndexForScore(score: number): number {
  return Math.floor(Math.max(0, score) / STAGE_LENGTH) % STAGES.length;
}

export function stageForScore(score: number): Stage {
  return STAGES[stageIndexForScore(score)];
}

/** Pontos feitos dentro da parada atual (0 ao chegar). */
export const scoreInStage = (score: number) => Math.max(0, score) % STAGE_LENGTH;

/** Volta da rota (1 = primeira; no modo sem fim passa de 1). */
export const lapForScore = (score: number) => Math.floor(Math.max(0, score) / ROUTE_LENGTH) + 1;
