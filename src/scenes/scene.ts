import type { FrameInput } from '@/core/input';
import type { RunStats } from '@/systems/session';

export interface Scene {
  update(dt: number, input: FrameInput): void;
  render(ctx: CanvasRenderingContext2D): void;
}

export interface PlayOptions {
  /** Desafio do dia: sequência igual para todo mundo. */
  daily?: boolean;
}

export interface SceneManager {
  goToMenu(): void;
  goToPlay(options?: PlayOptions): void;
  goToGameOver(run: RunStats): void;
}
