import { todaySeed } from '@/core/random';
import { STAGE_LENGTH } from '@server/types';
import { addCoins } from './progress';
import type { RunStats } from './session';
import { testMode } from './test-mode';

/**
 * MISSÕES DIÁRIAS: 3 por dia (iguais para todo mundo, sorteadas pela data de Brasília).
 * O progresso soma as partidas do dia; ao completar, a missão paga moedas na hora.
 */
export interface Mission {
  id: string;
  text: string;
  target: number;
  reward: number;
  /** Quanto esta partida conta para a missão. */
  measure: (run: RunStats) => number;
  /** "max": vale a melhor partida (não soma). */
  best?: boolean;
}

const passed = (run: RunStats, kinds: string[]) => kinds.reduce((n, k) => n + (run.passedByObstacle?.[k] ?? 0), 0);
const seen = (run: RunStats, prefix: string) => (run.chasersSeen ?? []).filter((c) => c.startsWith(prefix)).length;

export const MISSION_POOL: Mission[] = [
  { id: 'moedas', text: 'Pegue 40 moedas', target: 40, reward: 20, measure: (r) => r.coins ?? 0 },
  { id: 'pontos-iguazu', text: 'Chegue a Puerto Iguazú numa partida', target: STAGE_LENGTH, reward: 20, measure: (r) => r.score, best: true },
  { id: 'pontos-25', text: 'Faça 25 pontos numa partida', target: 25, reward: 15, measure: (r) => r.score, best: true },
  { id: 'raspao', text: 'Passe raspando 12 vezes', target: 12, reward: 15, measure: (r) => r.nearMisses ?? 0 },
  { id: 'combo', text: 'Faça combo 5 de raspão', target: 5, reward: 20, measure: (r) => r.bestCombo ?? 0, best: true },
  { id: 'chefe', text: 'Sobreviva a um chefe', target: 1, reward: 25, measure: (r) => r.bosses?.length ?? 0 },
  { id: 'evento', text: 'Passe por um evento sem bater', target: 1, reward: 20, measure: (r) => r.eventsClean?.length ?? 0 },
  { id: 'partidas', text: 'Jogue 5 partidas', target: 5, reward: 10, measure: () => 1 },
  { id: 'powerups', text: 'Pegue 3 power-ups', target: 3, reward: 15, measure: (r) => Object.values(r.powerups ?? {}).reduce((a, b) => a + (b ?? 0), 0) },
  { id: 'estrelas', text: 'Desvie de 3 estrelas do PT', target: 3, reward: 15, measure: (r) => passed(r, ['estrela']) },
  { id: 'sol', text: 'Desvie de 2 sóis do PSOL', target: 2, reward: 15, measure: (r) => passed(r, ['sol']) },
  { id: 'blusinhas', text: 'Desvie de 5 caixas da taxa das blusinhas', target: 5, reward: 15, measure: (r) => passed(r, ['blusinhas']) },
  { id: 'drones', text: 'Atravesse 3 enxames de drones', target: 3, reward: 15, measure: (r) => passed(r, ['drones']) },
  { id: 'cataratas', text: "Passe por 5 jatos d'água das Cataratas", target: 5, reward: 15, measure: (r) => passed(r, ['cataratas']) },
  { id: 'kim-rato', text: 'Fuja do Kim versão rato', target: 1, reward: 20, measure: (r) => seen(r, 'kim:rato') },
  { id: 'renan', text: 'Seja perseguido pelo Renan Santos', target: 1, reward: 10, measure: (r) => seen(r, 'renan:') },
  { id: 'limpo', text: 'Faça 15 pontos seguidos sem bater', target: 15, reward: 20, measure: (r) => r.cleanStreak ?? 0, best: true },
  { id: 'hardcore', text: 'Faça 10 pontos no hardcore', target: 10, reward: 25, measure: (r) => (r.mode === 'hardcore' ? r.score : 0), best: true },
  { id: 'semfim', text: 'Faça 30 pontos no modo sem fim', target: 30, reward: 20, measure: (r) => (r.mode === 'semfim' ? r.score : 0), best: true }
];

/** As 3 missões do dia (mesmo sorteio para todo mundo). */
export function dailyMissions(seed = todaySeed()): Mission[] {
  let s = seed >>> 0 || 1;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pool = [...MISSION_POOL];
  const out: Mission[] = [];
  while (out.length < 3) out.push(pool.splice(Math.floor(next() * pool.length), 1)[0]);
  return out;
}

interface SavedMissions {
  seed: number;
  progress: Record<string, number>;
  done: string[];
}

const KEY = 'jatinho-do-flavio:missoes';
const memory = new Map<string, string>();

function load(seed: number): SavedMissions {
  try {
    const raw = globalThis.localStorage?.getItem(KEY) ?? memory.get(KEY);
    const saved = raw ? (JSON.parse(raw) as SavedMissions) : null;
    if (saved && saved.seed === seed) return saved;
  } catch {
    // sem storage
  }
  return { seed, progress: {}, done: [] };
}

function save(data: SavedMissions): void {
  const raw = JSON.stringify(data);
  memory.set(KEY, raw);
  try {
    globalThis.localStorage?.setItem(KEY, raw);
  } catch {
    // sem storage
  }
}

export interface MissionStatus {
  mission: Mission;
  value: number;
  done: boolean;
}

export function missionStatus(seed = todaySeed()): MissionStatus[] {
  const data = load(seed);
  return dailyMissions(seed).map((mission) => ({
    mission,
    value: Math.min(mission.target, data.progress[mission.id] ?? 0),
    done: data.done.includes(mission.id)
  }));
}

/** Soma a partida nas missões do dia; paga e devolve as que acabaram de ser concluídas. */
export function applyRunToMissions(run: RunStats, seed = todaySeed()): Mission[] {
  if (testMode) return []; // MODO TESTE não conta
  const data = load(seed);
  const finished: Mission[] = [];
  for (const mission of dailyMissions(seed)) {
    if (data.done.includes(mission.id)) continue;
    const got = mission.measure(run);
    const before = data.progress[mission.id] ?? 0;
    data.progress[mission.id] = mission.best ? Math.max(before, got) : before + got;
    if (data.progress[mission.id] >= mission.target) {
      data.done.push(mission.id);
      finished.push(mission);
    }
  }
  save(data);
  const reward = finished.reduce((n, m) => n + m.reward, 0);
  if (reward) addCoins(reward);
  return finished;
}

/** Só para testes. */
export function resetMissions(): void {
  memory.delete(KEY);
  try {
    globalThis.localStorage?.removeItem(KEY);
  } catch {
    // sem storage
  }
}
