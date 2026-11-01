import { CHASER, JET } from '@/core/config';
import type { Rect } from '@/systems/collision';
import { applyGravity, flap, type Body } from '@/systems/physics';
import { drawSprite, PX } from '@/render/pixel';
import { loadProgress } from '@/systems/progress';
import { skinGrid } from './skins';

const OUTLINE = '#1b1420';
/** Inclinações pré-desenhadas (radianos); usa a mais próxima. */
const ANGLES = [-0.45, -0.3, -0.15, 0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9];

const spriteCache = new Map<string, HTMLCanvasElement>();

/** Sprite do jatinho na skin equipada, na inclinação mais próxima. */
export function jetSprite(angle: number, flame: number, skin = currentSkin()): HTMLCanvasElement {
  const nearest = ANGLES.reduce((a, b) => (Math.abs(b - angle) < Math.abs(a - angle) ? b : a));
  const key = `${skin}:${nearest}:${flame}`;
  let sprite = spriteCache.get(key);
  if (!sprite) {
    sprite = skinGrid(skin, flame).rotated(nearest).outline(OUTLINE).toCanvas();
    spriteCache.set(key, sprite);
  }
  return sprite;
}

let equipped: string | null = null;
/** Skin equipada no Hangar (lida uma vez por página). */
export function currentSkin(): string {
  if (equipped === null) equipped = loadProgress().skin;
  return equipped;
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

  /** 1 normal; -1 com a gravidade invertida (evento). */
  gravitySign = 1;

  flap(): void {
    flap(this, this.gravitySign);
  }

  hit(): void {
    this.invulnerable = CHASER.invulnerableSeconds;
  }

  update(dt: number): void {
    this.time += dt;
    this.invulnerable = Math.max(0, this.invulnerable - dt);
    applyGravity(this, dt, this.gravitySign);
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
