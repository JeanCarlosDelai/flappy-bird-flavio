import { WORLD } from '@/core/config';
import { rand } from '@/core/random';
import { attackSprite } from '@/entities/attacks';
import { jetSprite } from '@/entities/jet';
import { coinSprite } from '@/entities/pickups';
import { drawSprite, PixelGrid, PX } from '@/render/pixel';
import { drawPixelText, pixelText } from '@/render/pixel-font';
import type { Rect } from './collision';

/**
 * EVENTOS ALEATÓRIOS: um a cada 45–60 s (nunca na viagem nem no chefe).
 * Cada evento tem aviso de 2 s e depois dura alguns segundos, somando-se aos obstáculos.
 * Enquanto dura, os perseguidores não atacam (para não ficar difícil demais).
 */
export type EventId = 'fraldas' | 'constituicao' | 'gravidade' | 'apagao' | 'moedas' | 'greve' | 'ocupacao' | 'live';

export const EVENTS: Record<EventId, { name: string; warning: string; seconds: number; detail: string; good?: boolean }> = {
  fraldas: { name: 'Chuva de fraldas', warning: 'Chuva de fraldas!', seconds: 8, detail: 'Evento: fraldas "LULA" e "FLÁVIO" caem do céu por 8 s.' },
  constituicao: { name: 'Chuva de Constituição', warning: 'Chuva de Constituição!', seconds: 8, detail: 'Evento: livrinhos da Constituição caem do céu por 8 s.' },
  gravidade: { name: 'Gravidade suspensa por liminar', warning: 'Gravidade suspensa por liminar!', seconds: 6, detail: 'Evento: por 6 s o jatinho cai para cima.' },
  apagao: { name: 'Apagão', warning: 'Apagão!', seconds: 7, detail: 'Evento: por 7 s só dá para ver em volta do jatinho.' },
  moedas: { name: 'Chuva de moedas', warning: 'Chuva de moedas!', seconds: 6, good: true, detail: 'Evento bom: chovem moedas por 6 s.' },
  greve: { name: 'Greve geral', warning: 'Greve geral!', seconds: 8, detail: 'Evento: bandeiras vermelhas atravessam a tela e rajadas de vento sacodem o jatinho.' },
  ocupacao: { name: 'Ocupação relâmpago', warning: 'Ocupação relâmpago!', seconds: 8, detail: 'Evento: barracas tomam o chão e o espaço de baixo fica menor.' },
  live: { name: 'Live ao vivo', warning: 'Live ao vivo!', seconds: 8, detail: 'Evento: comentários sobem pela tela e atrapalham a visão.' }
};

/** Coisas de evento: com hitbox (bandeira, fralda) ou só visuais (comentário da live). */
export interface Hazard {
  done: boolean;
  readonly hitbox: Rect | null;
  update(dt: number, speed: number): void;
  render(ctx: CanvasRenderingContext2D): void;
}

/** Altura das barracas da ocupação (em px do jogo). */
export const TENTS_HEIGHT = 64;

/** Segundos até o próximo evento no jogo normal (o Modo teste usa o intervalo dele). */
export const nextEventIn = (first = false) => (first ? 35 : 45) + rand() * 15;
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
export class FallingThing implements Hazard {
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
  // 1 por onda (às vezes 2, em lados opostos), caindo devagar e com área de batida menor
  const count = rand() < 0.25 ? 2 : 1;
  return Array.from({ length: count }, (_, i) => {
    const x = count === 1 ? 160 + rand() * 200 : i === 0 ? 150 + rand() * 70 : 290 + rand() * 80;
    const y = -30 - rand() * 50;
    const vy = 90 + rand() * 50;
    return id === 'fraldas'
      ? new FallingThing(x, y, vy, rand() < 0.5 ? () => diaperSprite('LULA') : () => diaperSprite('FLÁVIO'), [44, 22])
      : new FallingThing(x, y, vy, () => attackSprite.constituicao(), [22, 26]);
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

// ---------- eventos dos partidos ----------

export const flagSprite = (f: number) => {
  const key = `flag:${f}`;
  let c = cache.get(key);
  if (!c) {
    const g = new PixelGrid(26, 30);
    g.rect(2, 0, 2, 30, '#8a6a4a');
    for (let x = 4; x < 25; x++) {
      const wave = Math.round(Math.sin(x / 3 + f * Math.PI) * 1.5);
      g.rect(x, 2 + wave, 1, 14, '#d33a2c');
    }
    g.ellipse(13, 9, 3, 3, '#ffd23f');
    c = g.outline(OUT).toCanvas();
    cache.set(key, c);
  }
  return c;
};

/** Bandeira da greve atravessando a tela da direita para a esquerda. */
export class Flag implements Hazard {
  done = false;
  private time = 0;
  private x = WORLD.width + 30;
  private readonly baseY = 70 + rand() * (WORLD.height - WORLD.groundHeight - 170);

  get y(): number {
    return this.baseY + Math.sin(this.time * 2.5) * 30;
  }

  get hitbox(): Rect {
    return { x: this.x - 18, y: this.y - 22, w: 36, h: 30 };
  }

  update(dt: number, speed: number): void {
    this.time += dt;
    this.x -= (speed + 90) * dt;
    if (this.x < -40) this.done = true;
  }

  render(ctx: CanvasRenderingContext2D): void {
    drawSprite(ctx, flagSprite(Math.floor(this.time * 6) % 2), Math.round(this.x), Math.round(this.y), PX);
  }
}

const COMMENTS = ['KKKKKK', 'FUGIU!', 'CADÊ ELE?', 'OLHA O JATINHO', 'VOLTA!', 'AO VIVO', 'PRINTA', 'SEGUE O FIO', 'COMPARTILHA', 'É FAKE?', 'MIAMI??', 'TÁ CAINDO'];

/** Comentário da live subindo pela tela (só atrapalha a visão). */
export class Comment implements Hazard {
  done = false;
  readonly hitbox = null;
  private y = WORLD.height - WORLD.groundHeight;
  private readonly x = 20 + rand() * (WORLD.width - 150);
  private readonly text = COMMENTS[Math.floor(rand() * COMMENTS.length)];
  private readonly color = ['#2f6fd6', '#ff8a00', '#7a2a8a', '#2fa34f'][Math.floor(rand() * 4)];
  private readonly vy = 70 + rand() * 50;

  update(dt: number): void {
    this.y -= this.vy * dt;
    if (this.y < 40) this.done = true;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const w = (this.text.length * 4 + 6) * PX;
    ctx.fillStyle = OUT;
    ctx.fillRect(this.x - PX, this.y - PX, w + PX * 2, 26 + PX * 2);
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(this.x, this.y, w, 26);
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, PX * 3, 26);
    drawPixelText(ctx, this.text, this.x + 5 * PX, this.y + 4 * PX, PX, '#1b1420');
  }
}

/** Fileira de barracas da ocupação no chão (sobe no começo e desce no fim). */
export function drawTents(ctx: CanvasRenderingContext2D, height: number, offset: number): void {
  if (height <= 0) return;
  const top = WORLD.height - WORLD.groundHeight - height;
  for (let x = -((offset % 48) + 48); x < WORLD.width + 48; x += 48) {
    for (let r = 0; r < height; r += PX) {
      const half = Math.round(((r / TENTS_HEIGHT) * 24) / PX) * PX;
      const band = Math.floor(x / 48) % 2 === 0;
      ctx.fillStyle = r < PX ? OUT : band ? '#2f6fd6' : '#c8323e';
      ctx.fillRect(x + 24 - half, top + r, half * 2, PX);
      ctx.fillStyle = OUT;
      ctx.fillRect(x + 24 - half - PX, top + r, PX, PX);
      ctx.fillRect(x + 24 + half, top + r, PX, PX);
    }
    if (height > 30) {
      ctx.fillStyle = '#1b1420';
      ctx.fillRect(x + 18, top + height - 22, 12, 22);
    }
  }
}

/** Ícone do evento para a Coleção (em pixels da arte). */
export function eventIcon(id: EventId): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 40;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  const put = (s: HTMLCanvasElement, x: number, y: number) => ctx.drawImage(s, Math.round(x - s.width / 2), Math.round(y - s.height / 2));
  if (id === 'fraldas') {
    put(diaperSprite('LULA'), 22, 12);
    put(diaperSprite('FLÁVIO'), 42, 28);
  } else if (id === 'constituicao') {
    const s = attackSprite.constituicao();
    put(s, 18, 14);
    put(s, 44, 22);
    put(s, 28, 32);
  } else if (id === 'gravidade') {
    ctx.save();
    ctx.translate(0, c.height);
    ctx.scale(1, -1);
    put(jetSprite(0, 0), 32, 18);
    ctx.restore();
    ctx.fillStyle = '#ffd23f';
    ctx.fillRect(8, 6, 3, 10);
    ctx.fillRect(6, 8, 7, 2);
    ctx.fillRect(7, 7, 5, 1);
    ctx.fillRect(53, 6, 3, 10);
    ctx.fillRect(51, 8, 7, 2);
    ctx.fillRect(52, 7, 5, 1);
  } else if (id === 'apagao') {
    ctx.fillStyle = '#060814';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = '#3a6fc4';
    ctx.beginPath();
    ctx.arc(32, 20, 15, 0, Math.PI * 2);
    ctx.fill();
    put(jetSprite(0, 0), 30, 20);
  } else if (id === 'greve') {
    put(flagSprite(0), 18, 18);
    put(flagSprite(1), 44, 22);
  } else if (id === 'ocupacao') {
    ctx.save();
    ctx.scale(0.5, 0.5);
    ctx.translate(0, -(WORLD.height - WORLD.groundHeight) + 80);
    drawTents(ctx, TENTS_HEIGHT, 0);
    ctx.restore();
  } else if (id === 'live') {
    ctx.fillStyle = '#ff3b3b';
    ctx.fillRect(4, 4, 30, 9);
    drawPixelText(ctx, 'AO VIVO', 6, 6, 1, '#ffffff');
    for (const [x, y, t] of [[10, 18, 'KKKK'], [26, 29, 'FUGIU!']] as const) {
      ctx.fillStyle = '#f7f7f7';
      ctx.fillRect(x, y, t.length * 4 + 4, 8);
      drawPixelText(ctx, t, x + 2, y + 2, 1, '#1b1420');
    }
  } else {
    put(coinSprite(0), 16, 12);
    put(coinSprite(1), 34, 26);
    put(coinSprite(0), 48, 10);
    put(coinSprite(2), 22, 32);
  }
  return c;
}
