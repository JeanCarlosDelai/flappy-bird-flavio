import { STORAGE_KEYS } from '@/core/config';

/** Recorde salvo só no aparelho (localStorage). */
export function loadBest(): number {
  try {
    return Number(localStorage.getItem(STORAGE_KEYS.best)) || 0;
  } catch {
    return 0;
  }
}

export function saveBest(score: number): { best: number; newRecord: boolean } {
  const previous = loadBest();
  if (score <= previous) return { best: previous, newRecord: false };
  try {
    localStorage.setItem(STORAGE_KEYS.best, String(score));
  } catch {
    // modo anônimo/sem storage: segue sem salvar
  }
  return { best: score, newRecord: true };
}
