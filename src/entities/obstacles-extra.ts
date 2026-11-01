import { rand } from '@/core/random';
import { WORLD } from '@/core/config';
import { drawSprite, drawSpriteAt, PX } from '@/render/pixel';
import type { Rect } from '@/systems/collision';
import type { ObstacleKind } from '@server/types';
import { Obstacle } from './obstacles';
import {
  PIECE_H,
  bananaPiece,
  cabinSprite,
  cuiaSprite,
  cupulaBottom,
  cupulaTop,
  gatePiece,
  gatorSprite,
  iguanaSprite,
  pelicanSprite,
  quatiSprite,
  rocksBottom,
  searchlightBase,
  towerPiece,
  waterTop
} from './obstacle-sprites-extra';

const groundY = WORLD.height - WORLD.groundHeight;
const snap = (v: number) => Math.round(v / PX) * PX;

export interface GateStyle {
  kind: ObstacleKind;
  width: number;
  top: (time: number) => HTMLCanvasElement;
  bottom: (time: number) => HTMLCanvasElement;
  /** Deslocamento (em px do jogo) do desenho em relação à área de batida. */
  offsetX: number;
  /** A passagem sobe e desce: amplitude e velocidade. */
  move?: [number, number];
  /** A passagem abre e fecha: amplitude e velocidade. */
  open?: [number, number];
}

/** Obstáculo "de cima e de baixo" com passagem (pode mexer a passagem). */
export class Gate extends Obstacle {
  readonly kind: ObstacleKind;
  readonly width: number;

  constructor(x: number, private center: number, private gap: number, private style: GateStyle) {
    super(x);
    this.kind = style.kind;
    this.width = style.width;
  }

  override get safeY(): number {
    return (this.topH + this.bottomY) / 2;
  }

  private get currentCenter(): number {
    const [amp, speed] = this.style.move ?? [0, 0];
    const c = this.center + Math.sin(this.time * speed) * amp;
    return Math.max(40 + this.currentGap / 2, Math.min(groundY - 40 - this.currentGap / 2, c));
  }

  private get currentGap(): number {
    const [amp, speed] = this.style.open ?? [0, 0];
    return this.gap + Math.sin(this.time * speed) * amp;
  }

  private get topH(): number {
    return snap(this.currentCenter - this.currentGap / 2);
  }

  private get bottomY(): number {
    return snap(this.currentCenter + this.currentGap / 2);
  }

  get hitboxes(): Rect[] {
    return [
      { x: this.x, y: 0, w: this.width, h: this.topH },
      { x: this.x, y: this.bottomY, w: this.width, h: groundY - this.bottomY }
    ];
  }

  render(ctx: CanvasRenderingContext2D): void {
    const x = this.x + this.style.offsetX;
    drawSpriteAt(ctx, this.style.top(this.time), x, this.topH - PIECE_H * PX, PX);
    drawSpriteAt(ctx, this.style.bottom(this.time), x, this.bottomY, PX);
  }
}

const frame2 = (t: number, fps = 6) => Math.floor(t * fps) % 2;

export const GATES = {
  cupulas: { kind: 'cupulas', width: 64, offsetX: -8, top: () => cupulaTop(), bottom: () => cupulaBottom() },
  cataratas: { kind: 'cataratas', width: 64, offsetX: -4, top: (t) => waterTop(frame2(t, 8)), bottom: () => rocksBottom(), move: [55, 1.1] },
  cancela: { kind: 'cancela', width: 52, offsetX: -4, top: () => gatePiece(true), bottom: () => gatePiece(false), open: [38, 1.6] },
  bananas: { kind: 'bananas', width: 64, offsetX: -4, top: () => bananaPiece(true), bottom: () => bananaPiece(false) },
  predios: { kind: 'predios', width: 64, offsetX: -4, top: () => towerPiece(true), bottom: () => towerPiece(false), move: [45, 0.8] }
} satisfies Record<string, GateStyle>;

/** Bicho ou objeto que pula do chão em arco (quati, iguana, jacaré, cuia). */
export class Jumper extends Obstacle {
  readonly width: number;
  private readonly phase = rand() * Math.PI;

  constructor(
    x: number,
    readonly kind: ObstacleKind,
    private sprite: (t: number) => HTMLCanvasElement,
    private size: [number, number],
    private jump: { height: number; speed: number; base?: number }
  ) {
    super(x);
    this.width = size[0];
  }

  /** Acima do ponto mais alto do pulo. */
  override get safeY(): number {
    return Math.max(80, (this.jump.base ?? groundY) - this.size[1] - this.jump.height - 70);
  }

  private get y(): number {
    const lift = Math.abs(Math.sin(this.time * this.jump.speed + this.phase)) * this.jump.height;
    return snap((this.jump.base ?? groundY) - this.size[1] - lift);
  }

  get hitboxes(): Rect[] {
    const [w, h] = this.size;
    return [{ x: this.x + w * 0.15, y: this.y + h * 0.2, w: w * 0.7, h: h * 0.65 }];
  }

  render(ctx: CanvasRenderingContext2D): void {
    drawSpriteAt(ctx, this.sprite(this.time), this.x, this.y, PX);
  }
}

export const makeQuati = (x: number) => new Jumper(x, 'quati', (t) => quatiSprite(frame2(t, 8)), [60, 36], { height: 150, speed: 2.4 });
export const makeIguana = (x: number) => new Jumper(x, 'iguana', (t) => iguanaSprite(frame2(t, 6)), [68, 28], { height: 210, speed: 1.9 });
export const makeGator = (x: number) => new Jumper(x, 'jacare', () => gatorSprite(), [96, 36], { height: 260, speed: 1.5, base: groundY + 18 });
export const makeCuia = (x: number) => new Jumper(x, 'cuia', (t) => cuiaSprite(Math.floor(t * 6) % 4), [52, 52], { height: 300, speed: 1.3 });

/** Roda-gigante La Perla: as cabines giram; dá para passar entre elas (os raios não batem). */
export class FerrisWheel extends Obstacle {
  readonly kind = 'roda';
  readonly width = 172;
  private readonly radius = 72;
  private readonly cabins = 8;
  private readonly colors = ['#ff6b6b', '#ffd23f', '#6cb4ee', '#7bd389'];

  /** Por cima da roda. */
  override get safeY(): number {
    return this.center[1] - this.radius - 60;
  }

  private get center(): [number, number] {
    return [this.x + this.width / 2, groundY - this.radius - 40];
  }

  private cabin(i: number): [number, number] {
    const [cx, cy] = this.center;
    const a = this.time * 0.6 + (i / this.cabins) * Math.PI * 2;
    return [snap(cx + Math.cos(a) * this.radius), snap(cy + Math.sin(a) * this.radius)];
  }

  get hitboxes(): Rect[] {
    const boxes: Rect[] = [];
    for (let i = 0; i < this.cabins; i++) {
      const [x, y] = this.cabin(i);
      boxes.push({ x: x - 10, y: y - 4, w: 20, h: 18 });
    }
    const [cx, cy] = this.center;
    boxes.push({ x: cx - 8, y: cy - 8, w: 16, h: 16 }); // eixo
    return boxes;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const [cx, cy] = this.center;
    ctx.fillStyle = '#e9edf2';
    // pés
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      for (const dir of [-1, 1]) ctx.fillRect(snap(cx + dir * t * 50), snap(cy + t * (groundY - cy)), PX * 2, PX * 2);
    }
    // aro e raios
    for (let k = 0; k < 96; k++) {
      const a = (k / 96) * Math.PI * 2;
      ctx.fillRect(snap(cx + Math.cos(a) * this.radius), snap(cy + Math.sin(a) * this.radius), PX, PX);
    }
    ctx.fillStyle = 'rgba(233, 237, 242, 0.8)';
    for (let i = 0; i < this.cabins; i++) {
      const a = this.time * 0.6 + (i / this.cabins) * Math.PI * 2;
      for (let r = 8; r < this.radius; r += 4) ctx.fillRect(snap(cx + Math.cos(a) * r), snap(cy + Math.sin(a) * r), PX, PX);
    }
    ctx.fillStyle = '#3c444f';
    ctx.fillRect(cx - 8, cy - 8, 16, 16);
    for (let i = 0; i < this.cabins; i++) {
      const [x, y] = this.cabin(i);
      drawSprite(ctx, cabinSprite(this.colors[i % this.colors.length]), x, y + 6, PX);
    }
  }
}

/** Pelicanos em V: sobem e descem juntos. */
export class Pelicans extends Obstacle {
  readonly kind = 'pelicanos';
  readonly width = 200;
  private readonly offsets = [[0, 0], [36, -26], [36, 26], [72, -52], [72, 52]];

  constructor(x: number, private baseY: number) {
    super(x);
  }

  /** Acima ou abaixo do bando, onde tiver mais espaço. */
  override get safeY(): number {
    const y = this.bird(0)[1] + 10;
    return y > groundY / 2 ? Math.max(70, y - 150) : Math.min(groundY - 60, y + 160);
  }

  private bird(i: number): [number, number] {
    const [dx, dy] = this.offsets[i];
    return [this.x + dx, snap(this.baseY + dy + Math.sin(this.time * 1.4) * 50)];
  }

  get hitboxes(): Rect[] {
    return this.offsets.map((_, i) => {
      const [x, y] = this.bird(i);
      return { x: x + 8, y: y + 6, w: 36, h: 18 };
    });
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.offsets.forEach((_, i) => {
      const [x, y] = this.bird(i);
      drawSpriteAt(ctx, pelicanSprite(Math.floor(this.time * 5 + i) % 2), x, y, PX);
    });
  }
}

/** Holofote da imigração: o caminhão bate; o feixe varre o céu e denuncia. */
export class Searchlight extends Obstacle {
  readonly kind = 'holofote';
  readonly width = 68;

  private get angle(): number {
    return -Math.PI / 2 + Math.sin(this.time * 0.9) * 0.75;
  }

  private beamPoint(d: number): [number, number] {
    const ox = this.x + 34;
    const oy = groundY - 30;
    return [ox + Math.cos(this.angle) * d, oy + Math.sin(this.angle) * d];
  }

  get hitboxes(): Rect[] {
    return [{ x: this.x + 4, y: groundY - 24, w: 60, h: 24 }];
  }

  override get alertZones(): Rect[] {
    const zones: Rect[] = [];
    for (let d = 40; d < 460; d += 30) {
      const [x, y] = this.beamPoint(d);
      const half = 4 + d * 0.05;
      zones.push({ x: x - half, y: y - half, w: half * 2, h: half * 2 });
    }
    return zones;
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(255, 243, 176, 0.55)';
    for (let d = 20; d < 520; d += PX * 2) {
      const [x, y] = this.beamPoint(d);
      const half = 4 + d * 0.05;
      const nx = -Math.sin(this.angle);
      const ny = Math.cos(this.angle);
      for (let s = -half; s <= half; s += PX * 2) {
        if ((Math.round(d / PX) + Math.round(s / PX)) % 3 === 0) ctx.fillRect(snap(x + nx * s), snap(y + ny * s), PX, PX);
      }
    }
    drawSpriteAt(ctx, searchlightBase(), this.x, groundY - 40, PX);
  }
}
