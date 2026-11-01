import { WORLD } from '@/core/config';
import { PX } from './pixel';
import { ART_W, TRAVEL_TO, scenery, type SceneId, type SceneryLayers } from './scenery';
import { stageForScore, STAGES, type RegionId, type Stage } from './stages';

interface Transition {
  from: RegionId;
  via: SceneId;
  to: RegionId;
  time: number;
  duration: number;
}

const ease = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * Fundo em pixel art com camadas em parallax (ver scenery.ts).
 * Na troca de parada a "câmera" anda: cidade antiga → trecho de viagem → cidade nova,
 * com o céu mudando aos poucos.
 */
export class Background {
  private offset = 0;
  private region: RegionId = 'brasilia';
  private transition: Transition | null = null;

  update(dt: number, speed: number): void {
    this.offset += speed * dt;
    if (this.transition) {
      this.transition.time += dt;
      if (this.transition.time >= this.transition.duration) {
        this.region = this.transition.to;
        this.transition = null;
      }
    }
  }

  /** Começa a viagem até a parada `to`. */
  travelTo(to: RegionId, duration: number): void {
    this.transition = { from: this.region, via: TRAVEL_TO[to] ?? to, to, time: 0, duration };
  }

  get traveling(): boolean {
    return this.transition !== null;
  }

  /** 0 → 1 durante a viagem (1 sem viagem). */
  get travelProgress(): number {
    return this.transition ? this.transition.time / this.transition.duration : 1;
  }

  render(ctx: CanvasRenderingContext2D, score?: number, options: { sun?: boolean } = {}): Stage {
    if (!this.transition && score !== undefined) this.region = stageForScore(score).id;
    const smoothing = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;

    if (!this.transition) {
      this.drawScene(ctx, scenery(this.region), 0, options.sun !== false, 1);
    } else {
      const t = this.transition;
      const W = WORLD.width;
      const camera = ease(clamp01(t.time / t.duration)) * 2 * W;
      const scenes: [SceneryLayers, number][] = [
        [scenery(t.from), -camera],
        [scenery(t.via), W - camera],
        [scenery(t.to), 2 * W - camera]
      ];
      // céu: vai mudando de um para o outro conforme o que ocupa a tela
      const wFrom = clamp01(1 - camera / W);
      const wTo = clamp01((camera - W) / W);
      this.drawSky(ctx, scenes[0][0], 1);
      this.drawSky(ctx, scenes[1][0], 1 - wFrom);
      this.drawSky(ctx, scenes[2][0], wTo);
      for (const [layers, x] of scenes) {
        if (x >= W || x <= -W) continue;
        ctx.save();
        ctx.beginPath();
        ctx.rect(Math.round(x), 0, W, WORLD.height);
        ctx.clip();
        this.drawScene(ctx, layers, Math.round(x / PX) * PX, options.sun !== false, 0);
        ctx.restore();
      }
    }
    ctx.imageSmoothingEnabled = smoothing;
    return STAGES.find((s) => s.id === this.region) ?? STAGES[0];
  }

  private drawSky(ctx: CanvasRenderingContext2D, layers: SceneryLayers, alpha: number): void {
    if (alpha <= 0) return;
    ctx.globalAlpha = alpha;
    ctx.drawImage(layers.sky, 0, 0, layers.sky.width * PX, layers.sky.height * PX);
    ctx.globalAlpha = 1;
  }

  /** Desenha uma cena deslocada `x` na horizontal (`skyAlpha` 0 = sem céu). */
  private drawScene(ctx: CanvasRenderingContext2D, layers: SceneryLayers, x: number, sun: boolean, skyAlpha: number): void {
    const tileW = ART_W * PX;
    if (skyAlpha > 0) this.drawSky(ctx, layers, skyAlpha);
    if (layers.sun && sun) ctx.drawImage(layers.sun, x, 0, layers.sun.width * PX, layers.sun.height * PX);
    for (const { canvas, factor } of layers.layers) {
      const shift = (Math.floor((this.offset * factor) / PX) % ART_W) * PX;
      ctx.drawImage(canvas, x - shift, 0, tileW, canvas.height * PX);
      ctx.drawImage(canvas, x + tileW - shift, 0, tileW, canvas.height * PX);
    }
  }
}
