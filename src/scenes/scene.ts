import type { FrameInput } from '@/core/input';
import type { RunStats } from '@/systems/session';

export interface Scene {
  update(dt: number, input: FrameInput): void;
  render(ctx: CanvasRenderingContext2D): void;
}

/** normal: Brasília → Miami; semfim: a rota não acaba (dá voltas); hardcore: uma batida e acabou. */
export type GameMode = 'normal' | 'semfim' | 'hardcore';

export const MODE_NAMES: Record<GameMode, string> = {
  normal: 'Normal',
  semfim: 'Sem fim',
  hardcore: 'Hardcore'
};

/** Desafio de um amigo: mesma semente da partida dele e a pontuação a bater. */
export interface FriendChallenge {
  seed: number;
  target: number;
  from: string;
}

export interface PlayOptions {
  /** Desafio do dia: sequência igual para todo mundo. */
  daily?: boolean;
  mode?: GameMode;
  challenge?: FriendChallenge;
}

/** Lê o desafio do link (?desafio=SEMENTE&alvo=PONTOS&de=NOME). */
export function challengeFromUrl(search = location.search): FriendChallenge | undefined {
  const params = new URLSearchParams(search);
  const seed = Number(params.get('desafio'));
  const target = Number(params.get('alvo'));
  if (!Number.isFinite(seed) || seed <= 0 || !Number.isFinite(target) || target < 0) return undefined;
  const from = (params.get('de') ?? '').replace(/[^\p{L}\p{N} ._-]/gu, '').slice(0, 16) || 'um amigo';
  return { seed: Math.floor(seed) >>> 0, target: Math.floor(target), from };
}

/** Link para desafiar alguém com a mesma partida. */
export function challengeLink(seed: number, score: number, from: string): string {
  const url = new URL('./jogar.html', location.href);
  url.search = new URLSearchParams({ desafio: String(seed), alvo: String(score), de: from || 'um amigo' }).toString();
  return url.toString();
}

export interface SceneManager {
  goToMenu(): void;
  goToPlay(options?: PlayOptions): void;
  goToGameOver(run: RunStats): void;
}
