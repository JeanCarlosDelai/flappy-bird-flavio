import { drawSpriteAt, PixelGrid, PX } from '@/render/pixel';
import { pixelText } from '@/render/pixel-font';
import type { Rect } from '@/systems/collision';

/** Coisas para pegar: moedas e power-ups. Andam junto com os obstáculos. */
export type PowerUpKind = 'escudo' | 'passaporte' | 'combustivel';

export const POWERUP_INFO: Record<PowerUpKind, { name: string; detail: string }> = {
  escudo: { name: 'Habeas corpus', detail: 'Escudo: a próxima batida não conta.' },
  passaporte: { name: 'Passaporte', detail: 'Atravessa obstáculos por alguns segundos.' },
  combustivel: { name: 'Combustível', detail: 'O perseguidor fica bem para trás.' }
};

const OUT = '#1b1420';
const cache = new Map<string, HTMLCanvasElement>();
const cached = (key: string, build: () => PixelGrid) => {
  let c = cache.get(key);
  if (!c) {
    c = build().outline(OUT).toCanvas();
    cache.set(key, c);
  }
  return c;
};

/** Moeda girando (4 quadros). */
export const coinSprite = (frame: number) =>
  cached(`coin:${frame}`, () => {
    const g = new PixelGrid(12, 12);
    const w = [5, 3, 1, 3][frame];
    g.ellipse(6, 6, w, 5, '#ffd23f');
    if (w > 1) g.ellipse(6, 6, Math.max(1, w - 2), 3, '#e0b23a').rect(6 - Math.floor(w / 3), 4, 1, 4, '#fff3b0');
    g.px(4, 3, '#ffffff');
    return g;
  });

/** Ícone de power-up dentro de uma bolha. */
export const powerUpSprite = (kind: PowerUpKind) =>
  cached(`pu:${kind}`, () => {
    const g = new PixelGrid(20, 20);
    g.ellipse(10, 10, 9, 9, '#ffffff').ellipse(10, 10, 8, 8, kind === 'escudo' ? '#7bd389' : kind === 'passaporte' ? '#2f6fd6' : '#ff8a00');
    if (kind === 'escudo') {
      g.rect(6, 5, 8, 7, '#f7f7f7').rect(7, 12, 6, 2, '#f7f7f7').rect(8, 14, 4, 1, '#f7f7f7');
      pixelText(g, 'HC', 7, 7, '#1f7a3a');
    } else if (kind === 'passaporte') {
      g.rect(6, 4, 8, 11, '#1f3f8a').rect(6, 4, 1, 11, '#173170').ellipse(10, 9, 2, 2, '#e0b23a');
    } else {
      g.rect(7, 5, 6, 10, '#d33a2c').rect(9, 3, 2, 2, '#3c444f').rect(8, 8, 4, 3, '#ffd23f');
    }
    g.px(5, 5, '#ffffff').px(6, 4, '#ffffff');
    return g;
  });

/** Obstáculo ao qual a moeda está presa (acompanha a passagem, mesmo se ela se mexer). */
interface Anchor {
  readonly x: number;
  readonly safeY: number;
}

export class Pickup {
  taken = false;
  private time = 0;

  constructor(
    public x: number,
    public y: number,
    readonly kind: 'coin' | PowerUpKind,
    private anchor?: { obstacle: Anchor; dx: number; dy: number }
  ) {
    this.follow();
  }

  /** Se estiver presa a um obstáculo, fica no meio da passagem dele. */
  private follow(): void {
    if (!this.anchor) return;
    this.x = this.anchor.obstacle.x + this.anchor.dx;
    this.y = this.anchor.obstacle.safeY + this.anchor.dy - this.size / 2;
  }

  get size(): number {
    return this.kind === 'coin' ? 24 : 40;
  }

  get hitbox(): Rect {
    const s = this.size;
    const bob = Math.round(Math.sin(this.time * 4) * 2) * PX;
    return { x: this.x - 4, y: this.y + bob - 4, w: s + 8, h: s + 8 };
  }

  get offscreen(): boolean {
    return this.x < -this.size - 10;
  }

  update(dt: number, speed: number): void {
    this.time += dt;
    if (this.anchor) this.follow();
    else this.x -= speed * dt;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.taken) return;
    const bob = Math.round(Math.sin(this.time * 4) * 2) * PX;
    const sprite = this.kind === 'coin' ? coinSprite(Math.floor(this.time * 8) % 4) : powerUpSprite(this.kind);
    drawSpriteAt(ctx, sprite, this.x, this.y + bob, PX);
  }
}
