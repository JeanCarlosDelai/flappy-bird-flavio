import { WORLD } from '@/core/config';
import { rand } from '@/core/random';
import { attackSprite } from '@/entities/attacks';
import { drawSprite, PixelGrid, PX } from '@/render/pixel';
import { pixelText } from '@/render/pixel-font';
import type { Rect } from './collision';

/**
 * EVENTOS ALEATÓRIOS (prévia, só no Modo teste por enquanto).
 * Cada evento tem aviso de 2 s e depois dura alguns segundos, somando-se aos obstáculos.
 */
export type EventId = 'fraldas' | 'constituicao' | 'gravidade' | 'apagao' | 'moedas';

export const EVENTS: Record<EventId, { name: string; warning: string; seconds: number; good?: boolean }> = {
  fraldas: { name: 'Chuva de fraldas', warning: 'Chuva de fraldas!', seconds: 8 },
  constituicao: { name: 'Chuva de Constituição', warning: 'Chuva de Constituição!', seconds: 8 },
  gravidade: { name: 'Gravidade suspensa por liminar', warning: 'Gravidade suspensa por liminar!', seconds: 6 },
  apagao: { name: 'Apagão', warning: 'Apagão!', seconds: 7 },
  moedas: { name: 'Chuva de moedas', warning: 'Chuva de moedas!', seconds: 6, good: true }
};
export const EVENT_IDS = Object.keys(EVENTS) as EventId[];

const OUT = '#1b1420';
const cache = new Map<string, HTMLCanvasElement>();

/** Fralda com nome (LULA ou FLÁVIO). */
export function diaperSprite(name: string): HTMLCanvasElement {
  let c = cache.get(name);
  if (!c) {
    const g = new PixelGrid(30, 16);
    g.rect(1, 1, 28, 8, '#f7f7f7').rect(3, 9, 24, 2, '#f7f7f7').rect(7, 11, 16, 3, '#f7f7f7');
    g.rect(1, 1, 3, 3, '#7fb2ff').rect(26, 1, 3, 3, '#7fb2ff').rect(2, 8, 26, 1, '#dfe6ee');
    pixelText(g, name, Math.round(15 - (name.length * 4 - 1) / 2), 3, '#2f6fd6');
    c = g.outline(OUT).toCanvas();
    cache.set(name, c);
  }
  return c;
}

/** Algo caindo do céu e balançando (fralda, Constituição). */
export class FallingThing {
  done = false;
  private time = 0;
  private readonly sway = 0.8 + rand() * 1.2;

  constructor(
    private x: number,
    private y: number,
    private vy: number,
    private sprite: () => HTMLCanvasElement,
    private size: [number, number]
  ) {}

  get hitbox(): Rect {
    const [w, h] = this.size;
    return { x: this.x - w * 0.38, y: this.y - h * 0.35, w: w * 0.76, h: h * 0.7 };
  }

  update(dt: number, speed: number): void {
    this.time += dt;
    this.y += this.vy * dt;
    this.x += Math.sin(this.time * 3 * this.sway) * 40 * dt - speed * 0.25 * dt;
    if (this.y > WORLD.height - WORLD.groundHeight + 30) this.done = true;
  }

  render(ctx: CanvasRenderingContext2D): void {
    drawSprite(ctx, this.sprite(), Math.round(this.x), Math.round(this.y), PX);
  }
}

/** Uma "onda" de coisas caindo do evento (posição à frente do jatinho). */
export function spawnWave(id: 'fraldas' | 'constituicao'): FallingThing[] {
  const count = 2 + Math.floor(rand() * 2);
  return Array.from({ length: count }, () => {
    const x = 150 + rand() * 230;
    const y = -30 - rand() * 80;
    const vy = 130 + rand() * 90;
    return id === 'fraldas'
      ? new FallingThing(x, y, vy, (rand() < 0.5 ? () => diaperSprite('LULA') : () => diaperSprite('FLÁVIO')), [60, 32])
      : new FallingThing(x, y, vy, () => attackSprite.constituicao(), [28, 32]);
  });
}

/** Escuridão do apagão, com um círculo de luz em volta/à frente do jatinho. */
export function drawBlackout(ctx: CanvasRenderingContext2D, jetX: number, jetY: number, strength: number): void {
  ctx.save();
  ctx.fillStyle = `rgba(4, 6, 16, ${0.93 * strength})`;
  ctx.beginPath();
  ctx.rect(0, 0, WORLD.width, WORLD.height);
  // luz em "degraus" (pixel): vários círculos quase iguais
  ctx.moveTo(jetX + 40 + 95, jetY);
  ctx.arc(jetX + 40, jetY, 95, 0, Math.PI * 2, true);
  ctx.fill('evenodd');
  ctx.restore();
}
