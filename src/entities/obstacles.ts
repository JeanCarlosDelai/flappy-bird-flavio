import { OBSTACLES, WORLD } from '@/core/config';
import type { Rect } from '@/systems/collision';
import type { ObstacleKind } from '@server/types';

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

/** "Barreira de toga": painéis pretos de cima e de baixo com uma passagem entre eles. */
export class TogaBarrier extends Obstacle {
  readonly kind = 'toga';
  readonly width = OBSTACLES.width;

  constructor(x: number, private gapCenter: number, private gap: number) {
    super(x);
  }

  get hitboxes(): Rect[] {
    const top = this.gapCenter - this.gap / 2;
    const bottom = this.gapCenter + this.gap / 2;
    return [
      { x: this.x, y: 0, w: this.width, h: top },
      { x: this.x, y: bottom, w: this.width, h: groundY - bottom }
    ];
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (const r of this.hitboxes) {
      const fromTop = r.y === 0;
      // tecido da toga em pregas
      ctx.fillStyle = '#16161d';
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.fillStyle = '#2a2a36';
      for (let i = 8; i < r.w; i += 14) ctx.fillRect(r.x + i, r.y, 4, r.h);
      // gola branca na ponta virada para a passagem
      const edge = fromTop ? r.y + r.h - 14 : r.y;
      ctx.fillStyle = '#f2f2f2';
      ctx.fillRect(r.x - 4, edge, r.w + 8, 14);
      ctx.fillStyle = '#b8a14a';
      ctx.fillRect(r.x + r.w / 2 - 6, fromTop ? edge + 4 : edge + 4, 12, 6);
    }
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
    return Math.sin(this.time * 2.2 + i) * 6;
  }

  get hitboxes(): Rect[] {
    const r = this.radius - 4;
    return this.centers.map((cy, i) => ({ x: this.x + 22 - r, y: cy + this.bob(i) - r, w: r * 2, h: r * 2 }));
  }

  render(ctx: CanvasRenderingContext2D): void {
    const colors = ['#e53935', '#fb8c00', '#8e24aa'];
    this.centers.forEach((cy, i) => {
      const y = cy + this.bob(i);
      const cx = this.x + 22;
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.moveTo(cx, y + this.radius);
      ctx.lineTo(cx + Math.sin(this.time * 3 + i) * 4, y + this.radius + 14);
      ctx.stroke();
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.ellipse(cx, y, this.radius - 2, this.radius, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CPI', cx, y);
    });
  }
}

/** Helicóptero da PF: sobe e desce enquanto atravessa a tela. */
export class Helicopter extends Obstacle {
  readonly kind = 'pf';
  readonly width = 78;

  constructor(x: number, private baseY: number) {
    super(x);
  }

  private get y(): number {
    return this.baseY + Math.sin(this.time * 1.6) * 70;
  }

  get hitboxes(): Rect[] {
    return [
      { x: this.x + 6, y: this.y - 14, w: 44, h: 28 },
      { x: this.x + 46, y: this.y - 5, w: 30, h: 10 }
    ];
  }

  render(ctx: CanvasRenderingContext2D): void {
    const y = this.y;
    ctx.fillStyle = '#1f2b3d';
    ctx.beginPath();
    ctx.ellipse(this.x + 28, y, 26, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(this.x + 46, y - 4, 32, 7);
    ctx.fillRect(this.x + 72, y - 12, 5, 16);
    ctx.fillStyle = '#ffd400';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PF', this.x + 30, y + 2);
    ctx.fillStyle = '#7fd3ff';
    ctx.fillRect(this.x + 6, y - 9, 12, 8);
    // hélice
    const blade = 34 * Math.abs(Math.cos(this.time * 25));
    ctx.fillStyle = '#444';
    ctx.fillRect(this.x + 26, y - 20, 4, 6);
    ctx.fillRect(this.x + 28 - blade, y - 22, blade * 2, 3);
  }
}

/** Radar: a torre bate como obstáculo; o feixe só alerta o perseguidor. */
export class Radar extends Obstacle {
  readonly kind = 'radar';
  readonly width = 40;
  private readonly towerHeight: number;

  constructor(x: number, gap: number) {
    super(x);
    this.towerHeight = 120 + Math.random() * (groundY - gap - 200);
  }

  private get beamY(): number {
    return 60 + (Math.sin(this.time * 1.8) * 0.5 + 0.5) * (groundY - this.towerHeight - 110);
  }

  get hitboxes(): Rect[] {
    return [{ x: this.x + 8, y: groundY - this.towerHeight, w: 24, h: this.towerHeight }];
  }

  override get alertZones(): Rect[] {
    return [{ x: this.x + 14, y: this.beamY, w: 12, h: groundY - this.towerHeight - this.beamY }];
  }

  render(ctx: CanvasRenderingContext2D): void {
    const top = groundY - this.towerHeight;
    const beam = this.alertZones[0];
    ctx.fillStyle = 'rgba(255, 60, 60, 0.28)';
    ctx.fillRect(beam.x - 4, beam.y, beam.w + 8, beam.h);
    ctx.fillStyle = 'rgba(255, 90, 90, 0.7)';
    ctx.fillRect(beam.x + 3, beam.y, beam.w - 6, beam.h);

    ctx.fillStyle = '#5b6573';
    ctx.fillRect(this.x + 8, top, 24, this.towerHeight);
    ctx.strokeStyle = '#3c444f';
    ctx.lineWidth = 2;
    for (let y = top + 10; y < groundY; y += 18) {
      ctx.beginPath();
      ctx.moveTo(this.x + 8, y);
      ctx.lineTo(this.x + 32, y + 18);
      ctx.stroke();
    }
    ctx.lineWidth = 1;
    // antena giratória
    const w = 28 * Math.cos(this.time * 4);
    ctx.fillStyle = '#d0d6de';
    ctx.beginPath();
    ctx.ellipse(this.x + 20, top - 8, Math.abs(w), 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = Math.floor(this.time * 4) % 2 ? '#ff3b3b' : '#7a1010';
    ctx.beginPath();
    ctx.arc(this.x + 20, top - 18, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}
