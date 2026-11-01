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

export interface PlayOptions {
  /** Desafio do dia: sequência igual para todo mundo. */
  daily?: boolean;
  mode?: GameMode;
}

export interface SceneManager {
  goToMenu(): void;
  goToPlay(options?: PlayOptions): void;
  goToGameOver(run: RunStats): void;
}
