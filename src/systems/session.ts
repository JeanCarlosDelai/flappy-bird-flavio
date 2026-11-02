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
  /** Modo de jogo (normal, sem fim ou hardcore). */
  mode?: 'normal' | 'semfim' | 'hardcore';
  /** Eventos aleatórios que atravessou até o fim sem levar nenhuma batida. */
  eventsClean?: string[];
  /** Mais moedas pegas numa única chuva de moedas. */
  rainCoins?: number;
  /** Quantos obstáculos de cada tipo passou (missões diárias). */
  passedByObstacle?: Partial<Record<string, number>>;
  /** Perseguidores vistos na partida ("kim:rato"...). */
  chasersSeen?: string[];
  /** Quantas vezes pausou. */
  pauses?: number;
  /** Chefes vencidos sem levar nenhuma batida. */
  bossesClean?: string[];
  /** Hora local em que a partida começou (0–23). */
  startHour?: number;
  /** Skin usada. */
  skin?: string;
  /** Jogada em câmera lenta (segredo): não vai para o ranking online. */
  slow?: boolean;
  /** Semente da partida (para desafiar um amigo com a mesma sequência). */
  seed?: number;
  /** Desafio de amigo que esta partida tentava bater. */
  challenge?: { seed: number; target: number; from: string };
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
  /** Recordes dos modos sem fim e hardcore (o `best` é só do modo normal). */
  bestByMode: Partial<Record<'semfim' | 'hardcore', number>>;
  /** Quantas vezes cada variante pegou o Flávio ("kim:rato": 3). */
  variantDeaths: Record<string, number>;
  /** Partidas seguidas terminando com 0 pontos. */
  zeroStreak: number;
  /** Fuga mais rápida (ms) e quantas fugas completas. */
  fastestEscapeMs: number | null;
  /** Primeira partida (para o passaporte). */
  firstRunAt: number | null;
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
  lastName: '',
  bestByMode: {},
  variantDeaths: {},
  zeroStreak: 0,
  fastestEscapeMs: null,
  firstRunAt: null
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
    return { ...base, ...saved, deaths: { ...base.deaths, ...saved.deaths }, bestByMode: { ...saved.bestByMode }, variantDeaths: { ...saved.variantDeaths } };
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
  /** Recorde do modo desta partida (normal, sem fim ou hardcore). */
  best: number;
}

export function recordLocalRun(run: RunStats, persist = true): RunSummary {
  const h = loadHistory();
  const mode = run.mode && run.mode !== 'normal' ? run.mode : null;
  const previousBest = mode ? h.bestByMode[mode] ?? 0 : h.best;
  const previousScore = h.lastScore;
  const stage = stageOf(run.score);
  const newStage = stage > h.farthestStage;

  h.runs++;
  if (mode) h.bestByMode[mode] = Math.max(previousBest, run.score);
  else h.best = Math.max(h.best, run.score);
  h.totalScore += run.score;
  h.totalMs += run.durationMs;
  h.totalHits += run.hits;
  h.deaths[run.cause]++;
  h.farthestStage = Math.max(h.farthestStage, stage);
  h.lastScore = run.score;
  if (run.variant && run.cause !== 'chao' && run.cause !== 'fuga') {
    const key = `${run.cause}:${run.variant}`;
    h.variantDeaths[key] = (h.variantDeaths[key] ?? 0) + 1;
  }
  h.zeroStreak = run.score === 0 ? h.zeroStreak + 1 : 0;
  if (run.cause === 'fuga') h.fastestEscapeMs = Math.min(h.fastestEscapeMs ?? Infinity, run.durationMs);
  h.firstRunAt ??= Date.now();
  h.recent = [{ score: run.score, cause: run.cause, at: Date.now() }, ...h.recent].slice(0, 20);
  if (persist) saveHistory(h);

  const best = mode ? h.bestByMode[mode] ?? 0 : h.best;
  return { run, previousBest, previousScore, newRecord: run.score > previousBest, stage, newStage, history: h, best };
}

export function rememberName(name: string): void {
  const h = loadHistory();
  h.lastName = name;
  saveHistory(h);
}
