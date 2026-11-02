import { WORLD } from '@/core/config';
import { rand } from '@/core/random';
import { drawSpriteAt, PixelGrid, PX } from '@/render/pixel';
import { drawPixelText, pixelText } from '@/render/pixel-font';
import type { Rect } from '@/systems/collision';
import type { ChaserId } from '@server/types';
import { Attack, Projectile, attackSprite } from './attacks';

/**
 * Veículos dos partidos: de vez em quando substituem o ataque do perseguidor.
 * - Aerolula (PT): cruza a tela por cima soltando decretos.
 * - Helicóptero de lona (PSOL): cruza soltando barracas.
 * - Dirigível do Missão: para no meio da tela com um telão que tampa parte da visão.
 */
export type VehicleId = 'aerolula' | 'helilona' | 'dirigivel';

export const VEHICLES: Record<VehicleId, { name: string; detail: string }> = {
  aerolula: { name: 'Aerolula', detail: 'Veículo do PT: cruza a tela por cima soltando decretos.' },
  helilona: { name: 'Helicóptero de lona', detail: 'Veículo do PSOL: remendado com lona, solta barracas.' },
  dirigivel: { name: 'Dirigível do Missão', detail: 'Veículo do Missão: o telão "AO VIVO" tampa parte da tela.' }
};
export const VEHICLE_IDS = Object.keys(VEHICLES) as VehicleId[];

/** Qual veículo cada perseguidor pode chamar. */
const GROUP: Partial<Record<ChaserId, VehicleId>> = {
  lula: 'aerolula',
  gleisi: 'aerolula',
  haddad: 'aerolula',
  lindbergh: 'aerolula',
  boulos: 'helilona',
  erika: 'helilona',
  renan: 'dirigivel',
  kim: 'dirigivel'
};
export const vehicleFor = (chaser: ChaserId): VehicleId | undefined => GROUP[chaser];

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

export const aerolulaSprite = () =>
  cached('aerolula', () => {
    const g = new PixelGrid(72, 22);
    g.rect(6, 8, 58, 9, '#f7f9fc').rect(64, 10, 5, 6, '#f7f9fc').rect(69, 12, 2, 3, '#f7f9fc');
    g.rect(6, 15, 60, 2, '#c9d1e3');
    g.rect(4, 1, 8, 8, '#f7f9fc').rect(6, 0, 5, 2, '#f7f9fc'); // cauda
    g.rect(6, 3, 5, 3, '#d33a2c');
    g.ellipse(9, 4, 1, 1, '#ffd23f');
    g.rect(10, 12, 52, 2, '#d33a2c'); // faixa
    for (let x = 18; x < 60; x += 4) g.rect(x, 10, 2, 2, '#7aa7d9'); // janelas
    g.rect(62, 10, 4, 2, '#4fc3f7');
    pixelText(g, 'LULA', 26, 4 + 0, '#d33a2c');
    g.rect(28, 17, 18, 3, '#b8c2d6').rect(32, 20, 8, 2, '#b8c2d6'); // asa
    g.rect(30, 19, 6, 2, '#5a6170'); // turbina
    return g;
  });

export const heliLonaSprite = (f: number) =>
  cached(`helilona:${f}`, () => {
    const g = new PixelGrid(54, 26);
    g.rect(f ? 6 : 14, 1, f ? 42 : 26, 1, '#3c444f').rect(26, 2, 2, 4, '#3c444f'); // hélice
    g.ellipse(32, 13, 13, 7, '#2f6fd6').rect(40, 9, 6, 6, '#7fd3ff');
    g.rect(6, 11, 16, 4, '#2f6fd6').rect(2, f ? 6 : 9, 3, f ? 10 : 5, '#3c444f');
    g.rect(26, 9, 5, 4, '#c8323e').rect(34, 15, 4, 3, '#ffd23f').rect(14, 12, 3, 2, '#f7f7f7'); // remendos
    g.rect(24, 21, 1, 3, '#5a6170').rect(38, 21, 1, 3, '#5a6170').rect(20, 24, 24, 1, '#5a6170');
    return g;
  });

export const blimpSprite = (f: number) =>
  cached(`dirigivel:${f}`, () => {
    const g = new PixelGrid(110, 54);
    g.ellipse(55, 20, 52, 18, '#ff8a00').ellipse(55, 14, 46, 8, '#ffa53a');
    g.rect(2, 8, 8, 6, '#c96a00').rect(2, 26, 8, 6, '#c96a00'); // lemes
    pixelText(g, 'MISSÃO', 64, 4, '#1b1420');
    // telão pendurado
    g.rect(22, 36, 66, 17, '#1b1420').rect(24, 38, 62, 13, f ? '#2b3a6b' : '#24325c');
    g.rect(26, 40, 3, 3, '#ff3b3b');
    pixelText(g, 'AO VIVO', 31, 39, '#ffffff');
    g.rect(48, 34, 14, 3, '#5a6170');
    return g;
  });

/** Veículo que cruza a tela da esquerda para a direita soltando coisas. */
class Crosser extends Attack {
  private x = -150;
  private drop = 0.25;
  private readonly children: Projectile[] = [];

  constructor(
    private y: number,
    private vx: number,
    private every: number,
    private sprite: (t: number) => HTMLCanvasElement,
    private box: [number, number, number, number],
    private spawn: (x: number, y: number) => Projectile
  ) {
    super();
  }

  get hitboxes(): Rect[] {
    const [bx, by, bw, bh] = this.box;
    return [{ x: this.x + bx, y: this.y + by, w: bw, h: bh }, ...this.children.flatMap((c) => c.hitboxes)];
  }

  override update(dt: number, jetY: number): void {
    this.time += dt;
    this.x += this.vx * dt;
    this.drop -= dt;
    if (this.drop <= 0 && this.x > 20 && this.x < WORLD.width - 60) {
      this.drop = this.every;
      this.children.push(this.spawn(this.x + 60, this.y + 40));
    }
    for (const c of this.children) c.update(dt);
    for (let i = this.children.length - 1; i >= 0; i--) if (this.children[i].done) this.children.splice(i, 1);
    if (this.x > WORLD.width + 20 && !this.children.length) this.done = true;
    void jetY;
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (const c of this.children) c.render(ctx);
    drawSpriteAt(ctx, this.sprite(this.time), Math.round(this.x), this.y, PX);
  }
}

/** Dirigível: entra pela direita, para um tempo tampando a tela com o telão e sai pela esquerda. */
class Blimp extends Attack {
  override readonly front = false;
  private x = WORLD.width + 10;
  private readonly stopX = 70 + rand() * 30;
  private readonly y = 120 + Math.round(rand() * 120);
  private readonly comments = ['KKKK', 'FUGIU!', 'CADÊ?', 'AO VIVO', 'OLHA ELE', 'VOLTA!'];

  get hitboxes(): Rect[] {
    return [];
  }

  override update(dt: number): void {
    this.time += dt;
    const hover = this.time > 1.4 && this.time < 5.4;
    this.x += (hover ? 0 : -160) * dt;
    if (!hover && this.time < 1.4) this.x = Math.max(this.stopX, this.x);
    if (this.x < -240) this.done = true;
  }

  render(ctx: CanvasRenderingContext2D): void {
    drawSpriteAt(ctx, blimpSprite(Math.floor(this.time * 4) % 2), Math.round(this.x), this.y, PX);
    // comentários correndo no telão
    const text = this.comments[Math.floor(this.time * 1.5) % this.comments.length];
    drawPixelText(ctx, text, Math.round(this.x + 31 * PX), this.y + 45 * PX, PX, '#ffd23f');
  }
}

export function launchVehicle(id: VehicleId): Attack {
  switch (id) {
    case 'aerolula':
      return new Crosser(56, 190, 0.42, () => aerolulaSprite(), [8, 8, 128, 30], (x, y) =>
        new Projectile(x, y, 40 + rand() * 40, 40, () => attackSprite.decreto(), [28, 24], 520)
      );
    case 'helilona':
      return new Crosser(80, 150, 0.65, (t) => heliLonaSprite(Math.floor(t * 14) % 2), [8, 10, 92, 34], (x, y) =>
        new Projectile(x, y, -120, 80, () => attackSprite.barraca(), [44, 32], 380)
      );
    case 'dirigivel':
      return new Blimp();
  }
}

/** Miniatura para a Coleção. */
export function vehicleIcon(id: VehicleId): HTMLCanvasElement {
  const sprite = id === 'aerolula' ? aerolulaSprite() : id === 'helilona' ? heliLonaSprite(1) : blimpSprite(0);
  return sprite;
}

