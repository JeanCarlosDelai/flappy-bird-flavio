import { DEATH_CAUSES, type DeathCause, type ObstacleKind } from '@server/types';
import { STAGE_LENGTH, STAGES } from '@/render/stages';

/** Tudo que o jogo sabe de uma partida que acabou. */
export interface RunStats {
  score: number;
  durationMs: number;
  hits: number;
  radarAlerts: number;
  cause: DeathCause;
  /** Variante do perseguidor que pegou (só para a frase do fim de jogo). */
  variant?: string;
  /** Itens da coleção vistos pela primeira vez nesta partida (nomes). */
  discoveries?: string[];
  /** Moedas pegas na partida (inclui bônus de raspão e chefes). */
  coins?: number;
  /** Quantas vezes passou raspando, e o maior combo. */
  nearMisses?: number;
  bestCombo?: number;
  /** Chefes que sobreviveu (ids das paradas). */
  bosses?: string[];
  /** Power-ups pegos. */
  powerups?: Partial<Record<'escudo' | 'passaporte' | 'combustivel', number>>;
  /** Maior sequência de pontos sem bater. */
  cleanStreak?: number;
  /** Escapou com o perigo no vermelho. */
  closeCall?: boolean;
  /** Partida do Desafio do dia. */
  daily?: boolean;
  hitsByObstacle: Partial<Record<ObstacleKind, number>>;
}

/** Histórico guardado só no aparelho. */
export interface LocalHistory {
  runs: number;
  best: number;
  totalScore: number;
  totalMs: number;
  totalHits: number;
  deaths: Record<DeathCause, number>;
  /** Região mais distante já alcançada (0 = Brasília). */
  farthestStage: number;
  lastScore: number | null;
  recent: { score: number; cause: DeathCause; at: number }[];
  lastName: string;
}

const KEY = 'jatinho-do-flavio:history';
const LEGACY_BEST = 'jatinho-do-flavio:best';

const empty = (): LocalHistory => ({
  runs: 0,
  best: 0,
  totalScore: 0,
  totalMs: 0,
  totalHits: 0,
  deaths: Object.fromEntries(DEATH_CAUSES.map((c) => [c, 0])) as Record<DeathCause, number>,
  farthestStage: 0,
  lastScore: null,
  recent: [],
  lastName: ''
});

export function loadHistory(): LocalHistory {
  try {
    const raw = localStorage.getItem(KEY);
    const base = empty();
    if (!raw) {
      // recorde da versão anterior do jogo
      base.best = Number(localStorage.getItem(LEGACY_BEST)) || 0;
      return base;
    }
    const saved = JSON.parse(raw) as Partial<LocalHistory>;
    return { ...base, ...saved, deaths: { ...base.deaths, ...saved.deaths } };
  } catch {
    return empty();
  }
}

function saveHistory(h: LocalHistory): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(h));
  } catch {
    // sem storage (modo anônimo): segue sem salvar
  }
}

export const stageOf = (score: number) => Math.min(STAGES.length - 1, Math.floor(score / STAGE_LENGTH));

/** Comparações para a tela de fim de jogo. */
export interface RunSummary {
  run: RunStats;
  previousBest: number;
  previousScore: number | null;
  newRecord: boolean;
  stage: number;
  /** Primeira vez que chega nesta região. */
  newStage: boolean;
  history: LocalHistory;
}

export function recordLocalRun(run: RunStats, persist = true): RunSummary {
  const h = loadHistory();
  const previousBest = h.best;
  const previousScore = h.lastScore;
  const stage = stageOf(run.score);
  const newStage = stage > h.farthestStage;

  h.runs++;
  h.best = Math.max(h.best, run.score);
  h.totalScore += run.score;
  h.totalMs += run.durationMs;
  h.totalHits += run.hits;
  h.deaths[run.cause]++;
  h.farthestStage = Math.max(h.farthestStage, stage);
  h.lastScore = run.score;
  h.recent = [{ score: run.score, cause: run.cause, at: Date.now() }, ...h.recent].slice(0, 20);
  if (persist) saveHistory(h);

  return { run, previousBest, previousScore, newRecord: run.score > previousBest, stage, newStage, history: h };
}

export function rememberName(name: string): void {
  const h = loadHistory();
  h.lastName = name;
  saveHistory(h);
}
