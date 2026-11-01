import { WORLD } from '@/core/config';
import { rand } from '@/core/random';
import { drawSprite, PixelGrid, PX } from '@/render/pixel';
import { pixelText } from '@/render/pixel-font';
import type { Rect } from '@/systems/collision';
import type { ChaserId } from '@server/types';

/**
 * Ataques dos perseguidores. Cada um lança "coisas" que o jatinho precisa desviar.
 * Bater num ataque conta como batida (o perseguidor avança), menos o drone, que empurra.
 */
const OUT = '#1b1420';
const groundY = WORLD.height - WORLD.groundHeight;
const cache = new Map<string, HTMLCanvasElement>();
const cached = (key: string, build: () => PixelGrid) => {
  let c = cache.get(key);
  if (!c) {
    c = build().outline(OUT).toCanvas();
    cache.set(key, c);
  }
  return c;
};

const SPRITES = {
  decreto: () =>
    cached('decreto', () => {
      const g = new PixelGrid(14, 12);
      g.rect(1, 1, 12, 10, '#f7f7f7');
      for (const y of [3, 5, 7]) g.rect(3, y, 8, 1, '#9aa3b5');
      g.rect(8, 8, 4, 2, '#d33a2c');
      return g;
    }),
  caneta: () =>
    cached('caneta', () => {
      const g = new PixelGrid(18, 6);
      g.rect(2, 2, 12, 2, '#2f6fd6').rect(14, 2, 2, 2, '#e0b23a').px(1, 2, '#191920').px(0, 3, '#191920');
      return g;
    }),
  constituicao: () =>
    cached('constituicao', () => {
      const g = new PixelGrid(14, 16);
      g.rect(1, 1, 12, 14, '#1f3f8a').rect(1, 1, 2, 14, '#173170');
      pixelText(g, 'CF', 5, 5, '#ffd23f');
      return g;
    }),
  algema: (f: number) =>
    cached(`algema:${f}`, () => {
      const g = new PixelGrid(18, 12);
      g.ellipse(4, 6, 3, 3, '#b8c0cc').ellipse(4, 6, 1, 1, '#00000000');
      g.ellipse(13, 6, 3, 3, '#b8c0cc');
      g.rect(7, 5 + f, 3, 1, '#8a94a3');
      g.px(4, 6, '#3c444f').px(13, 6, '#3c444f');
      return g;
    }),
  carimbo: () =>
    cached('carimbo', () => {
      const g = new PixelGrid(14, 16);
      g.rect(5, 1, 4, 6, '#5a3a22').ellipse(7, 2, 3, 2, '#7a522a').rect(1, 7, 12, 5, '#3c444f').rect(1, 12, 12, 2, '#d33a2c');
      return g;
    }),
  codigo: () =>
    cached('codigo', () => {
      const g = new PixelGrid(16, 14);
      g.rect(1, 1, 14, 12, '#7a1f2b').rect(1, 1, 2, 12, '#5a1520');
      pixelText(g, 'CP', 6, 4, '#ffd23f');
      return g;
    }),
  drone: (f: number) =>
    cached(`drone:${f}`, () => {
      const g = new PixelGrid(26, 12);
      g.rect(8, 5, 10, 4, '#3c444f').rect(11, 9, 4, 1, '#191920').px(13, 7, '#ff3b3b');
      g.rect(f ? 1 : 3, 3, f ? 8 : 4, 1, '#8a94a3').rect(f ? 17 : 19, 3, f ? 8 : 4, 1, '#8a94a3');
      g.rect(5, 3, 1, 3, '#3c444f').rect(20, 3, 1, 3, '#3c444f');
      return g;
    })
};

export abstract class Attack {
  done = false;
  protected time = 0;
  /** Áreas que contam como batida. */
  abstract get hitboxes(): Rect[];
  abstract render(ctx: CanvasRenderingContext2D): void;
  update(dt: number, _jetY: number): void {
    this.time += dt;
  }
  /** Empurrão vertical no jatinho (drone). */
  push(_jetY: number): number {
    return 0;
  }
}

/** Objeto arremessado (reto ou em arco), com aviso opcional antes de aparecer. */
class Projectile extends Attack {
  constructor(
    private x: number,
    private y: number,
    private vx: number,
    private vy: number,
    private sprite: (t: number) => HTMLCanvasElement,
    private size: [number, number],
    private gravity = 0,
    private warn = 0
  ) {
    super();
  }

  get hitboxes(): Rect[] {
    if (this.time < this.warn) return [];
    const [w, h] = this.size;
    return [{ x: this.x - w * 0.35, y: this.y - h * 0.35, w: w * 0.7, h: h * 0.7 }];
  }

  update(dt: number): void {
    this.time += dt;
    if (this.time < this.warn) return;
    this.vy += this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.x > WORLD.width + 60 || this.x < -80 || this.y > groundY + 20 || this.y < -200) this.done = true;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.time < this.warn) {
      // aviso piscando onde vai aparecer
      if (Math.floor(this.time * 8) % 2 === 0) {
        ctx.fillStyle = '#ff3b3b';
        const wx = Math.max(6, Math.min(WORLD.width - 18, this.x - 6));
        const wy = Math.max(6, Math.min(groundY - 18, this.y));
        ctx.fillRect(wx + 4, wy, 4, 8);
        ctx.fillRect(wx + 4, wy + 10, 4, 4);
      }
      return;
    }
    drawSprite(ctx, this.sprite(this.time), Math.round(this.x), Math.round(this.y), PX);
  }
}

/** Faixa de "alerta vermelho": pisca e depois varre a tela naquela altura. */
class RedAlert extends Attack {
  private readonly warnTime = 1.2;
  private readonly activeTime = 0.45;

  constructor(private y: number, private h = 44) {
    super();
  }

  get active(): boolean {
    return this.time >= this.warnTime && this.time < this.warnTime + this.activeTime;
  }

  get hitboxes(): Rect[] {
    return this.active ? [{ x: 0, y: this.y, w: WORLD.width, h: this.h }] : [];
  }

  update(dt: number): void {
    this.time += dt;
    if (this.time > this.warnTime + this.activeTime) this.done = true;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.active) {
      ctx.fillStyle = 'rgba(255, 59, 59, 0.75)';
      ctx.fillRect(0, this.y, WORLD.width, this.h);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(0, this.y + this.h / 2 - PX, WORLD.width, PX * 2);
    } else if (Math.floor(this.time * 10) % 2 === 0) {
      ctx.fillStyle = 'rgba(255, 59, 59, 0.35)';
      for (let x = 0; x < WORLD.width; x += 16) ctx.fillRect(x, this.y, 8, this.h);
    }
  }
}

/** Drone do Renan: persegue a altura do jatinho e empurra para baixo quando perto. */
class Drone extends Attack {
  private x = -40;
  private y: number;

  constructor(jetY: number) {
    super();
    this.y = jetY - 60;
  }

  get hitboxes(): Rect[] {
    return [];
  }

  update(dt: number, jetY: number): void {
    this.time += dt;
    const targetX = this.time < 3.5 ? 104 : WORLD.width + 80;
    this.x += (targetX - this.x) * Math.min(1, dt * (this.time < 3.5 ? 2 : 1.2));
    this.y += (jetY - 34 - this.y) * Math.min(1, dt * 3);
    if (this.time > 6) this.done = true;
  }

  push(jetY: number): number {
    const near = Math.abs(this.x - 110) < 40 && Math.abs(this.y + 34 - jetY) < 40 && this.time < 3.5;
    return near ? 520 : 0;
  }

  render(ctx: CanvasRenderingContext2D): void {
    drawSprite(ctx, SPRITES.drone(Math.floor(this.time * 16) % 2), Math.round(this.x), Math.round(this.y), PX);
    if (this.push(this.y + 34) && Math.floor(this.time * 12) % 2) {
      ctx.fillStyle = 'rgba(207, 232, 255, 0.7)';
      for (let i = 0; i < 3; i++) ctx.fillRect(this.x - 10 + i * 10, this.y + 18 + i * 4, 4, 8);
    }
  }
}

/** Cria o ataque do perseguidor. (x, y) = posição do perseguidor; jetY = altura do jatinho. */
export function launchAttack(chaser: ChaserId, x: number, y: number, jetY: number): Attack[] {
  const at = (dx: number, dy: number) => [x + 20 + dx, y + dy] as const;
  switch (chaser) {
    case 'lula': // decretos voando em linha
      return [0, 1, 2].map((i) => {
        const [px, py] = at(-i * 34, (i - 1) * 40);
        return new Projectile(px, py, 300, 0, () => SPRITES.decreto(), [28, 24]);
      });
    case 'xandao': // canetadas em leque
      return [-0.32, 0, 0.32].map((a) => {
        const [px, py] = at(0, 0);
        return new Projectile(px, py, Math.cos(a) * 340, Math.sin(a) * 340 + (jetY - y) * 0.6, () => SPRITES.caneta(), [36, 12]);
      });
    case 'janja': // Constituições jogadas em arco
      return [0, 1].map((i) => {
        const [px, py] = at(-i * 20, 20);
        return new Projectile(px, py, 230 + i * 40, -360 - i * 60, () => SPRITES.constituicao(), [28, 32], 620);
      });
    case 'pf': // algemas em arco
      return [0, 1].map((i) => {
        const [px, py] = at(0, -10);
        return new Projectile(px, py, 260 + i * 70, -300 + i * 120, (t) => SPRITES.algema(Math.floor(t * 10) % 2), [36, 24], 560);
      });
    case 'renan':
      return [new Drone(jetY)];
    case 'gonet': // carimbos caindo do alto, com aviso antes
      return [0, 1].map((i) => new Projectile(150 + i * 70 + rand() * 30, -30, -40, 360, () => SPRITES.carimbo(), [28, 32], 300, 0.7 + i * 0.25));
    case 'dino': {
      // Código Penal mirado na altura do jatinho
      const [px, py] = at(0, 0);
      const dy = jetY - py;
      return [new Projectile(px, py, 380, dy * 0.9, () => SPRITES.codigo(), [32, 28])];
    }
    case 'interpol':
      return [new RedAlert(Math.max(40, Math.min(groundY - 60, jetY - 22)))];
  }
}

/** Ícone do ataque (para a Coleção/documentação). */
export const attackSprite = SPRITES;
