import type { FrameInput } from '@/core/input';

export interface Scene {
  update(dt: number, input: FrameInput): void;
  render(ctx: CanvasRenderingContext2D): void;
}

export interface SceneManager {
  goToMenu(): void;
  goToPlay(): void;
  goToGameOver(result: GameResult): void;
}

export interface GameResult {
  score: number;
  best: number;
  newRecord: boolean;
  caughtBy: string | null;
}
