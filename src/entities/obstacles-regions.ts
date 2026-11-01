import { rand } from '@/core/random';
import { WORLD } from '@/core/config';
import { drawSpriteAt, PixelGrid, PX } from '@/render/pixel';
import { pixelText } from '@/render/pixel-font';
import type { Rect } from '@/systems/collision';
import type { ObstacleKind } from '@server/types';
import { Obstacle } from './obstacles';
import { Jumper } from './obstacles-extra';
import { PIECE_H } from './obstacle-sprites-extra';

/**
 * Obstáculos regionais extras: Puerto Iguazú (tucanos, Marco das Três Fronteiras, bote),
 * Guayaquil (atobás-de-pés-azuis, Torre do Relógio, chapéu-panamá) e Miami (flamingos,
 * avião com faixa, foguete de Cabo Canaveral).
 */
const OUT = '#1b1420';
const groundY = WORLD.height - WORLD.groundHeight;
const snap = (v: number) => Math.round(v / PX) * PX;
const cache = new Map<string, HTMLCanvasElement>();
const cached = (key: string, build: () => PixelGrid) => {
  let c = cache.get(key);
  if (!c) {
    c = build().outline(OUT).toCanvas();
    cache.set(key, c);
  }
  return c;
};
const frame2 = (t: number, fps = 6) => Math.floor(t * fps) % 2;

// ---------- aves em bando ----------

export const toucanSprite = (f: number) =>
  cached(`tucano:${f}`, () => {
    const g = new PixelGrid(28, 16);
    g.ellipse(11, 9, 7, 4, '#191920').ellipse(16, 7, 3, 3, '#191920').rect(14, 8, 3, 3, '#f7f7f7');
    g.rect(18, 5, 8, 4, '#ff8a00').rect(18, 7, 8, 1, '#ffd23f').px(25, 8, '#d33a2c'); // bicão
    g.px(16, 6, '#7fd3ff');
    if (f) g.rect(6, 2, 8, 3, '#2c2c38');
    else g.rect(6, 12, 8, 3, '#2c2c38');
    g.rect(2, 9, 4, 2, '#191920');
    return g;
  });

export const boobySprite = (f: number) =>
  cached(`atoba:${f}`, () => {
    const g = new PixelGrid(26, 16);
    g.ellipse(12, 8, 7, 3, '#e9e4da').ellipse(19, 6, 3, 3, '#f7f7f7').rect(22, 6, 4, 1, '#7a8a9a').px(20, 5, OUT);
    g.rect(8, 10, 2, 3, '#4fa3ff').rect(12, 10, 2, 3, '#4fa3ff'); // pés azuis
    if (f) g.rect(6, 1, 10, 3, '#8a7a6a');
    else g.rect(6, 11, 10, 2, '#8a7a6a');
    return g;
  });

export const flamingoSprite = (f: number) =>
  cached(`flamingo:${f}`, () => {
    const g = new PixelGrid(30, 18);
    g.ellipse(12, 9, 7, 3, '#ff7fae').rect(18, 5, 2, 5, '#ff7fae').ellipse(21, 4, 2, 2, '#ff7fae');
    g.rect(23, 4, 3, 2, '#f7f7f7').px(25, 5, OUT).px(21, 3, OUT);
    g.rect(0, 9, 6, 1, '#ff9fc4'); // pernas esticadas para trás
    if (f) g.rect(7, 2, 10, 3, '#ff5a96');
    else g.rect(7, 12, 10, 3, '#ff5a96');
    return g;
  });

/** Bando de aves em formação: sobe e desce junto. */
export class Flock extends Obstacle {
  readonly width: number;

  constructor(
    x: number,
    readonly kind: ObstacleKind,
    private baseY: number,
    private sprite: (f: number) => HTMLCanvasElement,
    private offsets: [number, number][],
    private size: [number, number],
    private wave: [number, number] = [50, 1.4]
  ) {
    super(x);
    this.width = Math.max(...offsets.map(([dx]) => dx)) + size[0];
  }

  override get safeY(): number {
    const y = this.bird(0)[1] + 10;
    return y > groundY / 2 ? Math.max(70, y - 150) : Math.min(groundY - 60, y + 160);
  }

  private bird(i: number): [number, number] {
    const [dx, dy] = this.offsets[i];
    return [this.x + dx, snap(this.baseY + dy + Math.sin(this.time * this.wave[1]) * this.wave[0])];
  }

  get hitboxes(): Rect[] {
    const [w, h] = this.size;
    return this.offsets.map((_, i) => {
      const [x, y] = this.bird(i);
      return { x: x + w * 0.15, y: y + h * 0.25, w: w * 0.7, h: h * 0.55 };
    });
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.offsets.forEach((_, i) => {
      const [x, y] = this.bird(i);
      drawSpriteAt(ctx, this.sprite(Math.floor(this.time * 5 + i) % 2), x, y, PX);
    });
  }
}

const playTop = 40;
const playBottom = groundY - 40;
const flockY = (margin: number) => playTop + margin + rand() * (playBottom - playTop - margin * 2);

/** Tucanos: fila em diagonal. */
export const makeToucans = (x: number) =>
  new Flock(x, 'tucanos', flockY(110), toucanSprite, [[0, -40], [40, 0], [80, 40]], [56, 32], [40, 1.8]);
/** Atobás: dupla fileira. */
export const makeBoobies = (x: number) =>
  new Flock(x, 'atobas', flockY(100), boobySprite, [[0, -30], [0, 30], [48, 0]], [52, 32], [60, 1.2]);
/** Flamingos: fila reta longa. */
export const makeFlamingos = (x: number) =>
  new Flock(x, 'flamingos', flockY(80), flamingoSprite, [[0, 0], [62, 0], [124, 0]], [60, 36], [70, 1.1]);

// ---------- peças de cima/de baixo ----------

/** Marco das Três Fronteiras: obelisco (de baixo) e cipós da mata (de cima). */
export const marcoPiece = (fromTop: boolean) =>
  cached(`marco:${fromTop}`, () => {
    const g = new PixelGrid(34, PIECE_H);
    if (fromTop) {
      for (const x of [5, 12, 20, 27]) {
        const len = PIECE_H - 2 - ((x * 7) % 12);
        g.rect(x, 0, 2, len, '#3f7a3a');
        for (let y = len - 40; y < len; y += 7) g.rect(x - 2, y, 3, 2, '#5fa84a').rect(x + 1, y + 3, 3, 2, '#4f9a3a');
      }
    } else {
      // obelisco em pé, em faixas com as cores dos três países (Brasil, Argentina, Paraguai)
      const bands = [
        ['#2fa34f', '#ffd23f', '#2fa34f'],
        ['#74acdf', '#f7f7f7', '#74acdf'],
        ['#d52b1e', '#f7f7f7', '#0038a8']
      ];
      for (let y = 0; y < PIECE_H; y++) {
        const half = Math.min(10, 2 + Math.floor(y / 3));
        const band = bands[Math.floor(y / 30) % 3];
        const stripe = band[Math.min(2, Math.floor((y % 30) / 10))];
        g.rect(17 - half, y, half * 2, 1, stripe).px(17 - half, y, '#ffffff');
      }
    }
    return g;
  });

/** Torre do Relógio (Torre Morisca) do Malecón. */
export const relogioPiece = (fromTop: boolean) =>
  cached(`relogio:${fromTop}`, () => {
    const g = new PixelGrid(34, PIECE_H);
    g.rect(7, 0, 20, PIECE_H, '#f2e6c9').rect(7, 0, 3, PIECE_H, '#ffffff').rect(24, 0, 3, PIECE_H, '#d8c8a0');
    for (let y = 30; y < PIECE_H; y += 16) g.rect(14, y, 6, 8, '#8a5a33').ellipse(17, y, 3, 2, '#8a5a33'); // janelas mouriscas
    const end = fromTop ? PIECE_H - 24 : 4;
    g.rect(4, end - 2, 26, 22, '#e9dcbc').ellipse(17, end + 9, 8, 8, '#f7f7f7').ellipse(17, end + 9, 7, 7, '#fff8e0');
    g.rect(17, end + 4, 1, 6, OUT).rect(17, end + 9, 4, 1, OUT); // ponteiros
    g.rect(4, fromTop ? end + 20 : end - 4, 26, 2, '#b8202e');
    return g;
  });

// ---------- pulos ----------

export const boatSprite = (f: number) =>
  cached(`bote:${f}`, () => {
    const g = new PixelGrid(40, 20);
    g.rect(2, 10, 36, 6, '#ffd23f').rect(4, 16, 32, 2, '#c99a10').rect(34, 8, 4, 4, '#ffd23f');
    for (const x of [8, 15, 22, 29]) g.ellipse(x, 7, 2, 3, '#ff8a00').px(x, 4, '#e8b48f'); // turistas de colete
    if (f) for (let x = 0; x < 40; x += 4) g.px(x, 19, '#ffffff');
    return g;
  });

export const hatSprite = (step: number) =>
  cached(`chapeu:${step}`, () => {
    const g = new PixelGrid(30, 30);
    g.ellipse(15, 18, 13, 4, '#f2e2b0').ellipse(15, 12, 7, 7, '#f2e2b0').rect(8, 14, 15, 3, '#191920');
    for (let y = 7; y < 18; y += 2) g.rect(9, y, 13, 1, '#d8c48a');
    return g.rotated(step * (Math.PI / 4));
  });

export const makeBoat = (x: number) =>
  new Jumper(x, 'bote', (t) => boatSprite(frame2(t, 8)), [80, 40], { height: 230, speed: 1.6, base: groundY + 16 });
export const makeHat = (x: number) =>
  new Jumper(x, 'chapeu', (t) => hatSprite(Math.floor(t * 8) % 8), [60, 60], { height: 280, speed: 1.4 });

// ---------- Miami: avião com faixa e foguete ----------

export const towPlaneSprite = (f: number) =>
  cached(`aviao-faixa:${f}`, () => {
    const g = new PixelGrid(110, 18);
    // faixa
    g.rect(2, 4, 62, 11, '#f7f7f7');
    pixelText(g, 'WELCOME FLAVIO', 5, 7, '#ff3fa4');
    for (let x = 64; x < 80; x += 2) g.px(x, 9 - Math.floor((x - 64) / 6), '#5a6170'); // cabo
    // aviãozinho
    g.rect(80, 7, 22, 5, '#ffd23f').rect(102, 8, 3, 3, '#ffd23f').rect(80, 3, 3, 4, '#d33a2c');
    g.rect(94, 7, 4, 2, '#4fc3f7').rect(88, 12, 8, 2, '#d33a2c');
    g.rect(106, f ? 4 : 8, 1, f ? 11 : 3, '#3c444f');
    return g;
  });

/** Avião puxando faixa de propaganda: longo, cruzando mais rápido e ondulando. */
export class TowPlane extends Obstacle {
  readonly kind = 'aviao-faixa';
  readonly width = 220;

  constructor(x: number, private baseY: number) {
    super(x);
  }

  override update(dt: number, speed: number): void {
    super.update(dt, speed * 1.25);
  }

  private get y(): number {
    return snap(this.baseY + Math.sin(this.time * 1.5) * 40);
  }

  override get safeY(): number {
    const y = this.y;
    return y > groundY / 2 ? Math.max(70, y - 110) : Math.min(groundY - 60, y + 120);
  }

  get hitboxes(): Rect[] {
    const y = this.y;
    return [
      { x: this.x + 4, y: y + 8, w: 124, h: 22 },
      { x: this.x + 160, y: y + 6, w: 52, h: 18 }
    ];
  }

  render(ctx: CanvasRenderingContext2D): void {
    drawSpriteAt(ctx, towPlaneSprite(frame2(this.time, 14)), this.x, this.y, PX);
  }
}

export const rocketSprite = (f: number) =>
  cached(`foguete:${f}`, () => {
    const g = new PixelGrid(16, 50);
    g.rect(4, 8, 8, 30, '#f7f7f7').rect(4, 8, 2, 30, '#ffffff').rect(10, 8, 2, 30, '#c9d1dc');
    for (let i = 0; i < 4; i++) g.rect(6 - i, 4 - i + 4, 4 + i * 2, 1, '#d33a2c'); // ponta
    g.rect(5, 2, 6, 2, '#d33a2c').rect(7, 0, 2, 2, '#d33a2c');
    pixelText(g, 'USA', 2, 16, '#2b5f8a');
    g.rect(1, 32, 3, 7, '#2b5f8a').rect(12, 32, 3, 7, '#2b5f8a'); // aletas
    g.rect(5, 38, 6, 2, '#3c444f');
    if (f >= 0) for (let y = 40; y < 50; y++) g.rect(8 - Math.floor((50 - y) / 4), y, 1 + Math.floor((50 - y) / 2), 1, (y + f) % 3 ? '#ff8a00' : '#ffd23f');
    return g;
  });

/** Foguete de Cabo Canaveral: fumaça na base e depois sobe rasgando a tela. */
export class Rocket extends Obstacle {
  readonly kind = 'foguete';
  readonly width = 32;
  private readonly delay = 0.6 + rand() * 0.5;

  private get y(): number {
    const t = Math.max(0, this.time - this.delay);
    return snap(groundY - 100 - t * t * 160);
  }

  /** Por cima enquanto está no chão; depois que sobe, a passagem é livre (meio da tela). */
  override get safeY(): number {
    return this.time < this.delay ? 140 : WORLD.height * 0.42;
  }

  get hitboxes(): Rect[] {
    return [{ x: this.x + 6, y: this.y + 6, w: 20, h: 70 }];
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.time < this.delay + 0.4) {
      // fumaça da ignição
      ctx.fillStyle = 'rgba(233, 237, 242, 0.85)';
      for (let i = 0; i < 6; i++) {
        const r = 6 + ((i * 5 + Math.floor(this.time * 12)) % 8);
        ctx.fillRect(snap(this.x - 14 + i * 10), snap(groundY - r), r * 1.5, r);
      }
    }
    drawSpriteAt(ctx, rocketSprite(this.time < this.delay ? -1 : Math.floor(this.time * 12) % 3), this.x, this.y, PX);
  }
}

// ---------- miniaturas ----------

export function regionPreview(kind: ObstacleKind, ctx: CanvasRenderingContext2D): boolean {
  const put = (s: HTMLCanvasElement, x: number, y: number) => ctx.drawImage(s, Math.round(x), Math.round(y));
  const gate = (piece: (top: boolean) => HTMLCanvasElement) => {
    put(piece(true), 13, 22 - PIECE_H);
    put(piece(false), 13, 38);
  };
  switch (kind) {
    case 'tucanos':
      put(toucanSprite(0), 2, 6);
      put(toucanSprite(1), 24, 30);
      return true;
    case 'atobas':
      put(boobySprite(0), 2, 8);
      put(boobySprite(1), 30, 30);
      return true;
    case 'flamingos':
      put(flamingoSprite(0), 0, 10);
      put(flamingoSprite(1), 28, 32);
      return true;
    case 'marco':
      gate(marcoPiece);
      return true;
    case 'relogio':
      gate(relogioPiece);
      return true;
    case 'bote':
      ctx.fillStyle = '#1494a8';
      ctx.fillRect(0, 46, 60, 14);
      put(boatSprite(0), 10, 30);
      return true;
    case 'chapeu':
      put(hatSprite(1), 15, 15);
      return true;
    case 'aviao-faixa':
      ctx.save();
      ctx.scale(0.5, 0.5);
      put(towPlaneSprite(0), 4, 50);
      ctx.restore();
      return true;
    case 'foguete':
      put(rocketSprite(1), 22, 5);
      return true;
    default:
      return false;
  }
}
