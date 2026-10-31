export interface Scene {
  update(dt: number, pressed: boolean): void;
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
