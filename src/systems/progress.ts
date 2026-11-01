/**
 * Progresso do jogador neste aparelho: moedas, skins compradas e equipada,
 * medalhas e melhor do Desafio do dia.
 */
export interface PlayerProgress {
  coins: number;
  /** Moedas juntadas desde sempre (para medalhas). */
  totalCoins: number;
  skins: string[];
  skin: string;
  medals: Record<string, number>;
  /** Melhor pontuação de cada Desafio do dia (semente → pontos). */
  daily: Record<string, number>;
}

const KEY = 'jatinho-do-flavio:progresso';
const memory = new Map<string, string>();

const empty = (): PlayerProgress => ({ coins: 0, totalCoins: 0, skins: ['classico'], skin: 'classico', medals: {}, daily: {} });

export function loadProgress(): PlayerProgress {
  try {
    const raw = globalThis.localStorage?.getItem(KEY) ?? memory.get(KEY);
    const saved = raw ? (JSON.parse(raw) as Partial<PlayerProgress>) : {};
    const p = { ...empty(), ...saved };
    if (!p.skins.includes('classico')) p.skins.unshift('classico');
    return p;
  } catch {
    return empty();
  }
}

export function saveProgress(p: PlayerProgress): void {
  const raw = JSON.stringify(p);
  memory.set(KEY, raw);
  try {
    globalThis.localStorage?.setItem(KEY, raw);
  } catch {
    // sem storage
  }
}

export function addCoins(n: number): PlayerProgress {
  const p = loadProgress();
  p.coins += n;
  p.totalCoins += Math.max(0, n);
  saveProgress(p);
  return p;
}

/** Compra a skin se tiver moedas. Devolve true se comprou (ou já tinha). */
export function buySkin(id: string, price: number): boolean {
  const p = loadProgress();
  if (p.skins.includes(id)) return true;
  if (p.coins < price) return false;
  p.coins -= price;
  p.skins.push(id);
  p.skin = id;
  saveProgress(p);
  return true;
}

export function equipSkin(id: string): void {
  const p = loadProgress();
  if (!p.skins.includes(id)) return;
  p.skin = id;
  saveProgress(p);
}

/** Registra medalha; devolve true se é nova. */
export function grantMedal(id: string, now = Date.now()): boolean {
  const p = loadProgress();
  if (p.medals[id]) return false;
  p.medals[id] = now;
  saveProgress(p);
  return true;
}

/** Guarda a pontuação do Desafio do dia; devolve o melhor do dia. */
export function recordDaily(seed: number, score: number): number {
  const p = loadProgress();
  const best = Math.max(p.daily[seed] ?? 0, score);
  p.daily[seed] = best;
  saveProgress(p);
  return best;
}

/** Só para testes. */
export function resetProgress(): void {
  saveProgress(empty());
}
