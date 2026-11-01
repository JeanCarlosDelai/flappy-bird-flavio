import { CHASER, JET } from '@/core/config';
import type { Rect } from '@/systems/collision';
import { applyGravity, flap, type Body } from '@/systems/physics';
import { drawSprite, PixelGrid, PX } from '@/render/pixel';

const OUTLINE = '#1b1420';
/** Inclinações pré-desenhadas (radianos); usa a mais próxima. */
const ANGLES = [-0.45, -0.3, -0.15, 0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9];

/** Jatinho em pixel art (30x16 antes de girar), na grade 34x34 para caber girado. */
function jetGrid(flame: number): PixelGrid {
  const g = new PixelGrid(34, 34);
  const ox = 2;
  const oy = 9;
  const p = (x: number, y: number, w: number, h: number, c: string) => g.rect(ox + x, oy + y, w, h, c);
  const colors = flame ? ['#ffd23f', '#ff8a00'] : ['#ff8a00', '#ff4d00'];
  p(1, 7, 3, 2, colors[0]);
  p(0, 7, 1, 2, colors[1]);
  p(2, 6, 1, 1, colors[1]);
  p(2, 9, 1, 1, colors[1]);
  p(5, 2, 3, 5, '#d7deea');
  p(6, 1, 2, 1, '#d7deea');
  p(4, 6, 19, 5, '#f7f9fc');
  p(23, 7, 3, 3, '#f7f9fc');
  p(26, 8, 1, 1, '#f7f9fc');
  p(4, 10, 21, 1, '#c9d1e3');
  p(6, 8, 16, 1, '#1f9d48');
  p(6, 9, 16, 1, '#ffd23f');
  p(21, 6, 3, 2, '#4fc3f7');
  p(24, 7, 1, 1, '#4fc3f7');
  for (const x of [10, 13, 16]) p(x, 7, 1, 1, '#7aa7d9');
  p(11, 11, 5, 1, '#b8c2d6');
  p(9, 12, 5, 1, '#b8c2d6');
  p(8, 13, 4, 1, '#b8c2d6');
  return g;
}

const spriteCache = new Map<string, HTMLCanvasElement>();

export function jetSprite(angle: number, flame: number): HTMLCanvasElement {
  const nearest = ANGLES.reduce((a, b) => (Math.abs(b - angle) < Math.abs(a - angle) ? b : a));
  const key = `${nearest}:${flame}`;
  let sprite = spriteCache.get(key);
  if (!sprite) {
    sprite = jetGrid(flame).rotated(nearest).outline(OUTLINE).toCanvas();
    spriteCache.set(key, sprite);
  }
  return sprite;
}

/** O jatinho do jogador. Desenho provisório com formas simples. */
export class Jet implements Body {
  y: number;
  vy = 0;
  invulnerable = 0;
  private time = 0;

  constructor(startY: number) {
    this.y = startY;
  }

  get hitbox(): Rect {
    // hitbox um pouco menor que o desenho: perdoa raspões
    return { x: JET.x - JET.width / 2 + 6, y: this.y - JET.height / 2 + 4, w: JET.width - 12, h: JET.height - 8 };
  }

  flap(): void {
    flap(this);
  }

  hit(): void {
    this.invulnerable = CHASER.invulnerableSeconds;
  }

  update(dt: number): void {
    this.time += dt;
    this.invulnerable = Math.max(0, this.invulnerable - dt);
    applyGravity(this, dt);
  }

  /** Flutuação no menu, sem gravidade. */
  idle(dt: number, baseY: number): void {
    this.time += dt;
    this.y = baseY + Math.sin(this.time * 3) * 8;
    this.vy = 0;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.invulnerable > 0 && Math.floor(this.invulnerable * 12) % 2 === 0) return;
    const angle = Math.max(-0.45, Math.min(0.9, this.vy / 700));
    const flame = Math.floor(this.time * 12) % 2;
    drawSprite(ctx, jetSprite(angle, flame), JET.x, this.y, PX);
  }
}
