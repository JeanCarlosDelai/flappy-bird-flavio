import { rand } from '@/core/random';
import { WORLD } from '@/core/config';
import { drawSpriteAt, PixelGrid, PX } from '@/render/pixel';
import { drawPixelText, pixelText } from '@/render/pixel-font';
import type { Rect } from '@/systems/collision';
import type { ObstacleKind } from '@server/types';
import { Obstacle } from './obstacles';
import { PIECE_H } from './obstacle-sprites-extra';

/**
 * Obstáculos "dos partidos" (PT, PSOL e Missão). Só aparecem em Brasília.
 * Peças de cima/de baixo seguem o padrão do Gate (desenhadas altas, posicionadas pela ponta).
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

// ---------- peças de cima/de baixo ----------

/** Caixas de encomenda da "taxa das blusinhas" (empilhadas). */
export const blusinhasPiece = (fromTop: boolean) =>
  cached(`blusinhas:${fromTop}`, () => {
    const g = new PixelGrid(36, PIECE_H);
    for (let i = 0; i * 14 < PIECE_H; i++) {
      const y = fromTop ? PIECE_H - 14 - i * 14 : i * 14;
      const x = 2 + ((i * 5) % 6);
      g.rect(x, y, 30, 13, i % 2 ? '#c9945f' : '#b8834f').rect(x, y, 30, 2, '#a8743f').rect(x + 14, y, 2, 13, '#a8743f');
      if (i === 0) {
        g.rect(x + 2, y + 4, 11, 7, '#f7f7f7');
        pixelText(g, 'TAXA', x + 17, y + 5, '#b8202e');
        pixelText(g, '%', x + 5, y + 5, '#5a3a1a');
      }
    }
    return g;
  });

/** Picanha no espeto (de cima) e churrasqueira (de baixo). */
export const picanhaPiece = (fromTop: boolean) =>
  cached(`picanha:${fromTop}`, () => {
    const g = new PixelGrid(36, PIECE_H);
    if (fromTop) {
      g.rect(17, 0, 2, PIECE_H - 2, '#b8c0cc'); // espeto
      for (let i = 0; i < 3; i++) {
        const y = PIECE_H - 30 + i * 9;
        g.rect(9, y, 18, 7, '#a3402e').rect(9, y, 18, 2, '#f0d9c4').px(12, y + 4, '#7a2a1e').px(22, y + 3, '#7a2a1e');
      }
    } else {
      g.rect(2, 0, 32, 4, '#3c444f'); // grelha
      for (let x = 3; x < 33; x += 3) g.px(x, 1, '#9aa3b5');
      g.rect(4, 4, 28, 10, '#191920');
      for (let x = 6; x < 30; x += 4) g.rect(x, 5, 2, 2, (x / 4) % 2 ? '#ff8a00' : '#ffd23f'); // brasa
      g.rect(6, 14, 4, PIECE_H - 14, '#3c444f').rect(26, 14, 4, PIECE_H - 14, '#3c444f'); // pés
      g.rect(6, 26, 24, 2, '#3c444f');
    }
    return g;
  });

/** Lona do acampamento esticada (de cima) e barracas empilhadas (de baixo). */
export const lonaPiece = (fromTop: boolean) =>
  cached(`lona:${fromTop}`, () => {
    const g = new PixelGrid(38, PIECE_H);
    if (fromTop) {
      g.rect(3, 0, 32, PIECE_H - 6, '#2f6fd6');
      for (let y = 4; y < PIECE_H - 6; y += 8) g.rect(3, y, 32, 1, '#1f4fa6');
      for (let x = 3; x < 35; x += 4) g.rect(x, PIECE_H - 6, 3, 4 + (x % 8 ? 1 : 0), '#2f6fd6'); // barra rasgada
      g.rect(10, PIECE_H - 20, 6, 4, '#7fb2ff').rect(22, PIECE_H - 34, 5, 3, '#c8323e'); // remendos
    } else {
      for (let i = 0; i * 16 < PIECE_H; i++) {
        const y = i * 16;
        for (let r = 0; r < 14; r++) g.rect(19 - r, y + 1 + r, 1 + r * 2, 1, i % 2 ? '#c8323e' : '#2f6fd6');
        g.rect(16, y + 8, 6, 7, '#1b1420');
      }
    }
    return g;
  });

/** Faixas de protesto em mastros. */
export const faixaPiece = (fromTop: boolean) =>
  cached(`faixa:${fromTop}`, () => {
    const g = new PixelGrid(36, PIECE_H);
    g.rect(4, 0, 2, PIECE_H, '#8a6a4a').rect(30, 0, 2, PIECE_H, '#8a6a4a');
    const labels = fromTop ? ['ATO', 'GREVE'] : ['GREVE', 'ATO'];
    labels.forEach((text, i) => {
      const y = fromTop ? PIECE_H - 14 - i * 16 : 2 + i * 16;
      g.rect(2, y, 32, 12, i ? '#ffd23f' : '#c8323e');
      pixelText(g, text, Math.round(18 - (text.length * 4 - 1) / 2), y + 4, i ? '#c8323e' : '#ffffff');
    });
    return g;
  });

/** Outdoor do Missão (placa num poste). */
export const outdoorPiece = (fromTop: boolean) =>
  cached(`outdoor:${fromTop}`, () => {
    const g = new PixelGrid(40, PIECE_H);
    const by = fromTop ? PIECE_H - 22 : 0;
    g.rect(18, 0, 4, PIECE_H, '#5a6170');
    g.rect(1, by, 38, 20, '#ff8a00').rect(2, by + 1, 36, 18, '#1b1420');
    pixelText(g, 'MISSÃO', 8, by + 4, '#ff8a00');
    g.rect(6, by + 12, 28, 2, '#ffd23f');
    return g;
  });

/** Pilha do livro amarelo. */
export const livrosPiece = (fromTop: boolean) =>
  cached(`livros:${fromTop}`, () => {
    const g = new PixelGrid(36, PIECE_H);
    for (let i = 0; i * 7 < PIECE_H; i++) {
      const y = fromTop ? PIECE_H - 7 - i * 7 : i * 7;
      const x = 3 + ((i * 3) % 5);
      g.rect(x, y, 28, 6, i % 3 ? '#ffd23f' : '#f2c21a').rect(x, y, 2, 6, '#c99a10').rect(x + 6, y + 2, 14, 1, '#1b1420');
    }
    return g;
  });

// ---------- giratórios: estrela do PT e sol do PSOL ----------

/** Estrela vermelha girando: só passa entre as pontas, por cima ou por baixo. */
export class Spinner extends Obstacle {
  readonly width: number;
  private readonly cy: number;

  constructor(
    x: number,
    readonly kind: ObstacleKind,
    private style: 'estrela' | 'sol'
  ) {
    super(x);
    this.width = style === 'estrela' ? 160 : 168;
    this.cy = snap(200 + rand() * 160);
  }

  private get center(): [number, number] {
    return [this.x + this.width / 2, this.cy];
  }

  /** Comprimento de cada braço agora (os raios do sol pulsam). */
  private armLength(i: number): number {
    if (this.style === 'estrela') return 74;
    return 34 + (Math.sin(this.time * 2.4 + (i % 2) * Math.PI) * 0.5 + 0.5) * 48;
  }

  private get arms(): number {
    return this.style === 'estrela' ? 5 : 8;
  }

  private angle(i: number): number {
    const speed = this.style === 'estrela' ? 0.9 : 0.35;
    return this.time * speed + (i / this.arms) * Math.PI * 2;
  }

  private get core(): number {
    return this.style === 'estrela' ? 20 : 26;
  }

  /** Por cima ou por baixo, onde tiver mais espaço. */
  override get safeY(): number {
    const [, cy] = this.center;
    return cy > groundY / 2 ? Math.max(70, cy - 120) : Math.min(groundY - 60, cy + 120);
  }

  get hitboxes(): Rect[] {
    const [cx, cy] = this.center;
    const boxes: Rect[] = [{ x: cx - this.core, y: cy - this.core, w: this.core * 2, h: this.core * 2 }];
    for (let i = 0; i < this.arms; i++) {
      const a = this.angle(i);
      const len = this.armLength(i);
      for (let d = this.core; d <= len; d += 12) {
        const half = this.style === 'estrela' ? Math.max(4, 12 * (1 - d / len)) : 7;
        boxes.push({ x: cx + Math.cos(a) * d - half, y: cy + Math.sin(a) * d - half, w: half * 2, h: half * 2 });
      }
    }
    return boxes;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const [cx, cy] = this.center;
    const fill = this.style === 'estrela' ? ['#d33a2c', '#ff5a4a'] : ['#ff8a00', '#ffd23f'];
    // braços em pixels, do centro para a ponta
    for (let i = 0; i < this.arms; i++) {
      const a = this.angle(i);
      const len = this.armLength(i);
      const nx = -Math.sin(a);
      const ny = Math.cos(a);
      for (let d = 0; d <= len; d += PX) {
        const half = this.style === 'estrela' ? 22 * (1 - d / len) : 6;
        for (let s = -half; s <= half; s += PX) {
          ctx.fillStyle = s < -half + PX * 2 || s > half - PX * 2 ? OUT : s < 0 ? fill[0] : fill[1];
          ctx.fillRect(snap(cx + Math.cos(a) * d + nx * s), snap(cy + Math.sin(a) * d + ny * s), PX, PX);
        }
      }
    }
    // miolo
    const r = this.core;
    for (let y = -r; y <= r; y += PX) {
      for (let x = -r; x <= r; x += PX) {
        const d = Math.hypot(x, y);
        if (d > r) continue;
        ctx.fillStyle = d > r - PX * 1.5 ? OUT : this.style === 'estrela' ? '#d33a2c' : '#ffd23f';
        ctx.fillRect(snap(cx + x), snap(cy + y), PX, PX);
      }
    }
    const label = this.style === 'estrela' ? 'PT' : 'PSOL';
    const color = this.style === 'estrela' ? '#ffffff' : '#c8323e';
    drawPixelText(ctx, label, snap(cx - (label.length * 4 - 1) * PX / 2), snap(cy - 5), PX, color);
  }
}

// ---------- enxame de drones do Missão ----------

/** Pilha de drones de cima a baixo, com uma brecha que sobe e desce. */
export class DroneSwarm extends Obstacle {
  readonly kind = 'drones';
  readonly width = 56;
  private readonly step = 34;

  constructor(x: number, private center: number, private gap: number) {
    super(x);
  }

  private get gapCenter(): number {
    const c = this.center + Math.sin(this.time * 1.3) * 60;
    return Math.max(50 + this.gap / 2, Math.min(groundY - 50 - this.gap / 2, c));
  }

  override get safeY(): number {
    return this.gapCenter;
  }

  private get drones(): number[] {
    const out: number[] = [];
    const gc = this.gapCenter;
    for (let y = 16; y < groundY - 10; y += this.step) if (Math.abs(y - gc) > this.gap / 2 + 12) out.push(y);
    return out;
  }

  get hitboxes(): Rect[] {
    return this.drones.map((y) => ({ x: this.x + 4, y: y - 8, w: this.width - 8, h: 18 }));
  }

  render(ctx: CanvasRenderingContext2D): void {
    const f = Math.floor(this.time * 16) % 2;
    for (const y of this.drones) drawSpriteAt(ctx, droneSprite(f), this.x, snap(y - 12), PX);
  }
}

export const droneSprite = (f: number) =>
  cached(`swarm:${f}`, () => {
    const g = new PixelGrid(28, 12);
    g.rect(8, 5, 12, 5, '#3c444f').rect(10, 6, 8, 3, '#ff8a00').px(14, 7, '#1b1420');
    g.rect(f ? 1 : 3, 3, f ? 9 : 5, 1, '#8a94a3').rect(f ? 18 : 20, 3, f ? 9 : 5, 1, '#8a94a3');
    g.rect(6, 3, 1, 3, '#3c444f').rect(21, 3, 1, 3, '#3c444f');
    g.rect(12, 10, 4, 1, '#191920');
    return g;
  });

// ---------- miniaturas para a Coleção ----------

const BRASILIA_GATES = {
  blusinhas: blusinhasPiece,
  picanha: picanhaPiece,
  lona: lonaPiece,
  faixas: faixaPiece,
  outdoor: outdoorPiece,
  livros: livrosPiece
} as const;

/** Desenha a miniatura (60x60) dos obstáculos de Brasília dos partidos; false se não for daqui. */
export function brasiliaPreview(kind: ObstacleKind, ctx: CanvasRenderingContext2D): boolean {
  const put = (s: HTMLCanvasElement, x: number, y: number) => ctx.drawImage(s, Math.round(x), Math.round(y));
  if (kind in BRASILIA_GATES) {
    const piece = BRASILIA_GATES[kind as keyof typeof BRASILIA_GATES];
    const top = piece(true);
    put(top, (60 - top.width) / 2, 24 - PIECE_H);
    put(piece(false), (60 - top.width) / 2, 38);
    return true;
  }
  if (kind === 'estrela' || kind === 'sol') {
    // desenha numa escala menor (1 px da arte = 1 px aqui)
    ctx.save();
    ctx.scale(0.4, 0.4);
    const s = new Spinner(0, kind, kind === 'estrela' ? 'estrela' : 'sol');
    (s as unknown as { cy: number }).cy = 83;
    s.x = (166 - s.width) / 2;
    if (kind === 'sol') s.update(0.65, 0);
    s.render(ctx);
    ctx.restore();
    return true;
  }
  if (kind === 'drones') {
    for (const [x, y] of [[16, 4], [16, 18], [16, 44]]) put(droneSprite(0), x, y);
    return true;
  }
  return false;
}
