import { rand } from '@/core/random';
import { OBSTACLES, WORLD } from '@/core/config';
import type { Rect } from '@/systems/collision';
import type { ObstacleKind } from '@server/types';
import { drawSpriteAt, PX } from '@/render/pixel';
import {
  BALLOON_COLORS,
  RADAR_DISH,
  TOGA_MARGIN,
  balloonSprite,
  helicopterSprite,
  processSprite,
  radarSprite,
  togaSprite
} from './obstacle-sprites';

const groundY = WORLD.height - WORLD.groundHeight;

/** Base comum: anda para a esquerda e expõe as hitboxes. */
export abstract class Obstacle {
  passed = false;
  protected time = 0;

  constructor(public x: number) {}


  abstract readonly width: number;
  abstract readonly kind: ObstacleKind;
  abstract get hitboxes(): Rect[];
  /** Áreas que não matam mas denunciam você para o perseguidor (ex.: feixe do radar). */
  get alertZones(): Rect[] {
    return [];
  }
  abstract render(ctx: CanvasRenderingContext2D): void;

  update(dt: number, speed: number): void {
    this.time += dt;
    this.x -= speed * dt;
  }

  get offscreen(): boolean {
    return this.x + this.width < -20;
  }
}

/** "Barreira de toga": toga pendurada em cima e pilha de processos embaixo, com a passagem no meio. */
export class TogaBarrier extends Obstacle {
  readonly kind = 'toga';
  readonly width = OBSTACLES.width;
  private readonly seed = Math.floor(rand() * 4);

  constructor(x: number, private gapCenter: number, private gap: number) {
    super(x);
  }

  private get topH(): number {
    return Math.round((this.gapCenter - this.gap / 2) / PX) * PX;
  }

  private get bottomY(): number {
    return Math.round((this.gapCenter + this.gap / 2) / PX) * PX;
  }

  get hitboxes(): Rect[] {
    return [
      { x: this.x, y: 0, w: this.width, h: this.topH },
      { x: this.x, y: this.bottomY, w: this.width, h: groundY - this.bottomY }
    ];
  }

  render(ctx: CanvasRenderingContext2D): void {
    drawSpriteAt(ctx, togaSprite(this.topH / PX), this.x - TOGA_MARGIN * PX, 0, PX);
    drawSpriteAt(ctx, processSprite((groundY - this.bottomY) / PX, this.seed), this.x - 6, this.bottomY, PX);
  }
}

/** Balões da CPI: uma fileira balançando, com uma brecha. */
export class Balloons extends Obstacle {
  readonly kind = 'cpi';
  readonly width = 44;
  private readonly radius = 20;
  private readonly centers: number[] = [];

  constructor(x: number, gapCenter: number, gap: number) {
    super(x);
    const step = this.radius * 2 + 4;
    for (let y = 30; y < groundY - 10; y += step) {
      if (Math.abs(y - gapCenter) > gap / 2 + this.radius) this.centers.push(y);
    }
  }

  private bob(i: number): number {
    return Math.round(Math.sin(this.time * 2.2 + i) * 3) * PX;
  }

  get hitboxes(): Rect[] {
    const r = this.radius - 4;
    return this.centers.map((cy, i) => ({ x: this.x + 22 - r, y: cy + this.bob(i) - r, w: r * 2, h: r * 2 }));
  }

  render(ctx: CanvasRenderingContext2D): void {
    const r = this.radius / PX;
    this.centers.forEach((cy, i) => {
      const sprite = balloonSprite(BALLOON_COLORS[i % BALLOON_COLORS.length], r);
      drawSpriteAt(ctx, sprite, this.x + 22 - (r + 2) * PX, cy + this.bob(i) - (r + 1) * PX, PX);
    });
  }
}

/** Helicóptero da PF: sobe e desce enquanto atravessa a tela. */
export class Helicopter extends Obstacle {
  readonly kind = 'pf';
  readonly width = 104;

  constructor(x: number, private baseY: number) {
    super(x);
  }

  private get y(): number {
    return Math.round((this.baseY + Math.sin(this.time * 1.6) * 70) / PX) * PX;
  }

  get hitboxes(): Rect[] {
    const y = this.y;
    return [
      { x: this.x + 12, y: y - 14, w: 48, h: 28 },
      { x: this.x + 56, y: y - 4, w: 40, h: 8 },
      { x: this.x + 90, y: y - 14, w: 8, h: 18 }
    ];
  }

  render(ctx: CanvasRenderingContext2D): void {
    drawSpriteAt(ctx, helicopterSprite(Math.floor(this.time * 14) % 2), this.x, this.y - 24, PX);
  }
}

/** Radar: a torre bate como obstáculo; o feixe só alerta o perseguidor. */
export class Radar extends Obstacle {
  readonly kind = 'radar';
  readonly width = 40;
  private readonly towerHeight: number;

  constructor(x: number, gap: number) {
    super(x);
    this.towerHeight = Math.round((120 + rand() * (groundY - gap - 200)) / PX) * PX;
  }

  private get towerTop(): number {
    return groundY - this.towerHeight;
  }

  private get beamY(): number {
    const y = 60 + (Math.sin(this.time * 1.8) * 0.5 + 0.5) * (this.towerTop - 110);
    return Math.round(y / PX) * PX;
  }

  get hitboxes(): Rect[] {
    return [{ x: this.x + 8, y: this.towerTop, w: 24, h: this.towerHeight }];
  }

  override get alertZones(): Rect[] {
    return [{ x: this.x + 14, y: this.beamY, w: 12, h: this.towerTop - this.beamY }];
  }

  render(ctx: CanvasRenderingContext2D): void {
    // feixe em cone pontilhado: estreito na antena, largo em cima
    const frame = Math.floor(this.time * 6) % 3;
    const top = this.beamY;
    const base = this.towerTop - 20;
    const cx = this.x + 20;
    ctx.fillStyle = 'rgba(255, 70, 70, 0.75)';
    for (let y = top; y < base; y += PX) {
      const half = Math.round((6 + (base - y) * 0.16) / PX) * PX;
      for (let x = cx - half; x <= cx + half; x += PX) {
        if (((x + y) / PX + frame) % 3 === 0) ctx.fillRect(x, y, PX, PX);
      }
    }
    drawSpriteAt(
      ctx,
      radarSprite(this.towerHeight / PX, Math.floor(this.time * 4) % 2),
      this.x - 6,
      this.towerTop - RADAR_DISH * PX,
      PX
    );
  }
}
