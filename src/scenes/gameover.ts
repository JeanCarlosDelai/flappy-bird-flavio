import { WORLD } from '@/core/config';
import { Background } from '@/render/background';
import { outlinedText, panel } from '@/render/text';
import type { FrameInput } from '@/core/input';
import type { GameResult, Scene, SceneManager } from './scene';

export class GameOverScene implements Scene {
  private background = new Background();
  private time = 0;

  constructor(private manager: SceneManager, private result: GameResult) {}

  update(dt: number, input: FrameInput): void {
    const { pressed } = input;
    this.time += dt;
    // pequena trava para o toque que causou a batida não reiniciar na hora
    if (pressed && this.time > 0.6) this.manager.goToPlay();
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.background.render(ctx, this.result.score);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);

    const title = this.result.caughtBy ? 'PEGO!' : 'CAIU!';
    outlinedText(ctx, title, WORLD.width / 2, 150, 56, '#ff5a5a');
    const subtitle = this.result.caughtBy
      ? `${this.result.caughtBy} alcançou o jatinho`
      : 'O jatinho foi ao chão';
    outlinedText(ctx, subtitle, WORLD.width / 2, 200, 17);

    panel(ctx, 250, 170);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#c9d1e3';
    ctx.font = '600 14px system-ui, sans-serif';
    ctx.fillText('PONTOS', WORLD.width / 2 - 70, 280);
    ctx.fillText('RECORDE', WORLD.width / 2 + 70, 280);
    outlinedText(ctx, String(this.result.score), WORLD.width / 2 - 70, 320, 40);
    outlinedText(ctx, String(this.result.best), WORLD.width / 2 + 70, 320, 40, '#ffdf00');
    if (this.result.newRecord) outlinedText(ctx, 'NOVO RECORDE!', WORLD.width / 2, 385, 20, '#7CFC00');

    if (this.time > 0.6 && Math.floor(this.time * 2) % 2 === 0) {
      outlinedText(ctx, 'TOQUE PARA TENTAR DE NOVO', WORLD.width / 2, 500, 18);
    }
  }
}
