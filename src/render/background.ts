import { WORLD } from '@/core/config';
import { stageForScore, type Stage } from './stages';

/** Fundo em camadas (parallax): céu, silhueta distante, morros próximos e chão. */
export class Background {
  private offset = 0;

  update(dt: number, speed: number): void {
    this.offset += speed * dt;
  }

  render(ctx: CanvasRenderingContext2D, score: number): Stage {
    const stage = stageForScore(score);
    const groundY = WORLD.height - WORLD.groundHeight;

    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, stage.skyTop);
    sky.addColorStop(1, stage.skyBottom);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, WORLD.width, groundY);

    ctx.fillStyle = stage.far;
    stage.skyline(ctx, this.offset * 0.2, groundY - 30);

    ctx.fillStyle = stage.near;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    for (let x = 0; x <= WORLD.width; x += 10) {
      ctx.lineTo(x, groundY - 18 - Math.sin((x + this.offset * 0.5) / 30) * 8);
    }
    ctx.lineTo(WORLD.width, groundY);
    ctx.fill();

    ctx.fillStyle = stage.ground;
    ctx.fillRect(0, groundY, WORLD.width, WORLD.groundHeight);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    for (let x = -(this.offset % 24); x < WORLD.width; x += 24) ctx.fillRect(x, groundY + 4, 12, 4);

    return stage;
  }
}
