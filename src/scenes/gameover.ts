import { WORLD } from '@/core/config';
import type { FrameInput } from '@/core/input';
import { Background } from '@/render/background';
import { recordLocalRun, type RunStats } from '@/systems/session';
import { showGameOverPanel } from '@/ui/gameover-panel';
import type { Scene, SceneManager } from './scene';
import { music } from '@/audio/music';
import { sfx } from '@/audio/sfx';
import { toggleSound } from '@/ui/sound-button';

export class GameOverScene implements Scene {
  private background = new Background();
  private time = 0;
  private closePanel: () => void;
  private score: number;

  constructor(private manager: SceneManager, run: RunStats) {
    this.score = run.score;
    const summary = recordLocalRun(run);
    music.stop();
    sfx.gameOver(run.cause !== 'chao');
    if (summary.newRecord && run.score > 0) sfx.record();
    this.closePanel = showGameOverPanel(summary, () => this.retry());
  }

  private retry(): void {
    this.closePanel();
    this.manager.goToPlay();
  }

  update(dt: number, input: FrameInput): void {
    this.time += dt;
    if (input.sound) toggleSound();
    // trava curta para o toque que causou a queda não reiniciar na hora
    if (input.pressed && this.time > 0.8) this.retry();
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.background.render(ctx, this.score);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  }
}
