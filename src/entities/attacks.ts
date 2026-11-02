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
  nota: () =>
    cached('nota', () => {
      const g = new PixelGrid(14, 14);
      g.rect(1, 1, 12, 12, '#f7f7f7').rect(1, 1, 12, 3, '#b8202e');
      for (const y of [6, 8, 10]) g.rect(3, y, 8, 1, '#9aa3b5');
      return g;
    }),
  taxa: () =>
    cached('taxa', () => {
      const g = new PixelGrid(18, 14);
      g.rect(1, 1, 16, 12, '#c9945f').rect(1, 1, 16, 2, '#a8743f').rect(8, 1, 2, 12, '#a8743f');
      pixelText(g, '%', 3, 5, '#5a3a1a');
      pixelText(g, '$', 12, 5, '#5a3a1a');
      return g;
    }),
  requerimento: () =>
    cached('requerimento', () => {
      const g = new PixelGrid(14, 12);
      g.rect(1, 1, 12, 10, '#2f6fd6').rect(1, 1, 12, 2, '#1f4fa6');
      pixelText(g, 'REQ', 1, 4, '#ffffff');
      return g;
    }),
  barraca: () =>
    cached('barraca', () => {
      const g = new PixelGrid(22, 16);
      for (let y = 0; y < 13; y++) g.rect(11 - Math.floor(y * 0.8), 1 + y, 1 + Math.floor(y * 1.6), 1, y % 4 === 0 ? '#c8323e' : '#2f6fd6');
      g.rect(9, 9, 4, 5, '#1b1420').rect(1, 14, 20, 1, '#5a3a22');
      return g;
    }),
  representacao: () =>
    cached('representacao', () => {
      const g = new PixelGrid(14, 14);
      g.rect(1, 1, 12, 12, '#f7f7f7').rect(1, 1, 12, 3, '#7a2a8a');
      for (const y of [6, 8, 10]) g.rect(3, y, 8, 1, '#9aa3b5');
      return g;
    }),
  thread: (n: number) =>
    cached(`thread:${n}`, () => {
      const g = new PixelGrid(22, 14);
      g.rect(1, 1, 20, 10, '#f7f7f7').rect(3, 11, 3, 2, '#f7f7f7').px(3, 13, '#f7f7f7');
      pixelText(g, `${n}/4`, 5, 3, '#2f6fd6');
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
  /** false = desenhado atrás do jatinho (ex.: dirigível que tampa a tela, mas não o avião). */
  readonly front: boolean = true;
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
export class Projectile extends Attack {
  constructor(
    private x: number,
    private y: number,
    private vx: number,
    private vy: number,
    private sprite: (t: number) => HTMLCanvasElement,
    private size: [number, number],
    private gravity = 0,
    private warn = 0,
    /** Ondulação vertical (amplitude, velocidade): papéis voando em zigue-zague. */
    private wave: [number, number] = [0, 0]
  ) {
    super();
  }

  private get drawY(): number {
    return this.y + Math.sin(this.time * this.wave[1]) * this.wave[0];
  }

  get hitboxes(): Rect[] {
    if (this.time < this.warn) return [];
    const [w, h] = this.size;
    return [{ x: this.x - w * 0.35, y: this.drawY - h * 0.35, w: w * 0.7, h: h * 0.7 }];
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
    drawSprite(ctx, this.sprite(this.time), Math.round(this.x), Math.round(this.drawY), PX);
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

/**
 * Coisa caindo na diagonal: entra pelo alto, à direita, e desce para a esquerda.
 * Cruza a linha do jatinho numa altura que dá para prever e desviar subindo ou descendo.
 */
export function diagonalDrop(x: number, sprite: () => HTMLCanvasElement, size: [number, number], warn: number): Projectile {
  return new Projectile(x, -30, -190 - rand() * 40, 210 + rand() * 40, sprite, size, 90, warn);
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
      // carimbos em diagonal (do alto à direita para baixo à esquerda), com aviso antes
      return [0, 1].map((i) => diagonalDrop(250 + i * 80 + rand() * 60, () => SPRITES.carimbo(), [28, 32], 0.7 + i * 0.35));
    case 'dino': {
      // Código Penal mirado na altura do jatinho
      const [px, py] = at(0, 0);
      const dy = jetY - py;
      return [new Projectile(px, py, 380, dy * 0.9, () => SPRITES.codigo(), [32, 28])];
    }
    case 'interpol':
      return [new RedAlert(Math.max(40, Math.min(groundY - 60, jetY - 22)))];
    case 'gleisi': // notas oficiais voando em onda
      return [0, 1, 2].map((i) => {
        const [px, py] = at(-i * 40, (i - 1) * 50);
        return new Projectile(px, py, 260, 0, () => SPRITES.nota(), [28, 28], 0, 0, [26, 5]);
      });
    case 'haddad': // taxinhas (caixas) em arco
      return [0, 1, 2].map((i) => {
        const [px, py] = at(-i * 16, 20);
        return new Projectile(px, py, 200 + i * 50, -330 - i * 50, () => SPRITES.taxa(), [36, 28], 600);
      });
    case 'lindbergh': // requerimentos em leque
      return [-0.4, -0.13, 0.13, 0.4].map((a) => {
        const [px, py] = at(0, 0);
        return new Projectile(px, py, Math.cos(a) * 260, Math.sin(a) * 260 + (jetY - y) * 0.4, () => SPRITES.requerimento(), [28, 24]);
      });
    case 'boulos': // ocupação: barracas caindo do alto, com aviso antes
      return [0, 1, 2].map((i) => diagonalDrop(240 + i * 70 + rand() * 50, () => SPRITES.barraca(), [44, 32], 0.6 + i * 0.35));
    case 'erika': // representações em zigue-zague, miradas no jatinho
      return [0, 1].map((i) => {
        const [px, py] = at(-i * 50, 0);
        return new Projectile(px, py, 300, (jetY - py) * 0.7, () => SPRITES.representacao(), [28, 28], 0, 0, [40, 7 + i * 2]);
      });
    case 'kim': {
      // thread: 4 balões em fila na altura do jatinho (1/4, 2/4...)
      const ty = Math.max(50, Math.min(groundY - 40, jetY));
      return [1, 2, 3, 4].map((n) => new Projectile(-10, ty, 330, 0, () => SPRITES.thread(n), [44, 28], 0, 0.5 + (n - 1) * 0.17));
    }
  }
}

/** Ícone do ataque (para a Coleção/documentação). */
export const attackSprite = SPRITES;
