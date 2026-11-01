import { PX } from './pixel';
import { ART_W, scenery } from './scenery';
import { stageForScore, type Stage } from './stages';

/** Fundo em pixel art com camadas em parallax (ver scenery.ts). */
export class Background {
  private offset = 0;

  update(dt: number, speed: number): void {
    this.offset += speed * dt;
  }

  render(ctx: CanvasRenderingContext2D, score: number, options: { sun?: boolean } = {}): Stage {
    const stage = stageForScore(score);
    const { sky, sun, layers } = scenery(stage.id);
    const smoothing = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    const tileW = ART_W * PX;
    ctx.drawImage(sky, 0, 0, sky.width * PX, sky.height * PX);
    if (sun && options.sun !== false) ctx.drawImage(sun, 0, 0, sun.width * PX, sun.height * PX);
    for (const { canvas, factor } of layers) {
      // desloca em pixels inteiros da arte para não "tremer"
      const shift = (Math.floor((this.offset * factor) / PX) % ART_W) * PX;
      ctx.drawImage(canvas, -shift, 0, tileW, canvas.height * PX);
      ctx.drawImage(canvas, tileW - shift, 0, tileW, canvas.height * PX);
    }
    ctx.imageSmoothingEnabled = smoothing;
    return stage;
  }
}
