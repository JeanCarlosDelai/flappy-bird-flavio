/**
 * Sorteio do jogo. Normalmente é aleatório; no Desafio do dia usa uma semente,
 * então todo mundo pega a mesma sequência de obstáculos, moedas e perseguidores.
 */
let state: number | null = null;

/** Liga a semente (Desafio do dia) ou volta ao aleatório normal (null). */
export function setSeed(seed: number | null): void {
  state = seed === null ? null : seed >>> 0 || 1;
}

/** Número entre 0 e 1 (como Math.random). */
export function rand(): number {
  if (state === null) return Math.random();
  // mulberry32
  state = (state + 0x6d2b79f5) >>> 0;
  let t = state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export const randInt = (n: number) => Math.floor(rand() * n);
export const pickOne = <T>(list: readonly T[]) => list[randInt(list.length)];

/** Semente do dia (horário de Brasília), ex.: 20261101. */
export function todaySeed(now = new Date()): number {
  const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(now);
  return Number(ymd.replace(/-/g, ''));
}
