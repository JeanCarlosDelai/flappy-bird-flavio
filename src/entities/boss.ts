import { WORLD } from '@/core/config';
import { rand } from '@/core/random';
import { drawSprite, drawSpriteAt, PixelGrid, PX } from '@/render/pixel';
import { drawPixelText, pixelText } from '@/render/pixel-font';
import type { RegionId } from '@/render/stages';
import { Projectile, attackSprite, diagonalDrop, launchAttack, type Attack } from './attacks';
import { VARIANTS, variantSprite } from './chaser-sprites';
import type { ChaserId } from '@server/types';

/**
 * CHEFES: no fim de cada parada um personagem gigante entra pela direita, atrás de uma
 * bancada da parada, e ataca de lá por alguns segundos. Vence quem sobreviver.
 */
export interface BossInfo {
  name: string;
  chaser: ChaserId;
  variant: string;
  desk: string;
  deskColor: string;
}

export const BOSSES: Record<RegionId, BossInfo> = {
  brasilia: { name: 'Xandão gigante', chaser: 'xandao', variant: 'caneta', desk: 'STF', deskColor: '#191920' },
  iguazu: { name: 'Haddad da alfândega', chaser: 'haddad', variant: 'maquininha', desk: 'ADUANA', deskColor: '#2b5f8a' },
  guayaquil: { name: 'Gonet do carimbo', chaser: 'gonet', variant: 'carimbo', desk: 'PGR', deskColor: '#5a3a22' },
  miami: { name: 'Interpol em peso', chaser: 'interpol', variant: 'cartaz', desk: 'INTERPOL', deskColor: '#0b2b5a' }
};

const OUT = '#1b1420';
const cache = new Map<string, HTMLCanvasElement>();

/** Bancada na frente do chefe, com o nome do órgão. */
function deskSprite(info: BossInfo): HTMLCanvasElement {
  let c = cache.get(info.desk);
  if (!c) {
    const g = new PixelGrid(46, 18);
    g.rect(1, 2, 44, 15, info.deskColor).rect(0, 0, 46, 3, '#e0b23a');
    g.rect(3, 5, 40, 9, '#00000033');
    pixelText(g, info.desk, Math.round(23 - (info.desk.length * 4 - 1) / 2), 7, '#ffd23f');
    c = g.outline(OUT).toCanvas();
    cache.set(info.desk, c);
  }
  return c;
}

const SCALE = 4;
const groundY = WORLD.height - WORLD.groundHeight;

export class BossFigure {
  private time = 0;
  readonly info: BossInfo;

  constructor(readonly stage: RegionId, private duration: number) {
    this.info = BOSSES[stage];
  }

  /** Posição do centro do chefe (entra e sai pela direita). */
  private get x(): number {
    const enter = Math.min(1, this.time / 0.9);
    const leave = Math.max(0, (this.time - (this.duration - 0.8)) / 0.8);
    return WORLD.width - 78 + (1 - enter) * 180 + leave * 200;
  }

  private get y(): number {
    return 300 + Math.sin(this.time * 1.6) * 40;
  }

  update(dt: number): void {
    this.time += dt;
  }

  /** Ataque próprio do chefe, saindo da direita na direção do jatinho. */
  attack(jetY: number): Attack[] {
    const x = this.x - 50;
    const y = this.y - 20;
    switch (this.stage) {
      case 'brasilia': // canetadas da direita, em leque
        return [-0.25, 0, 0.25].map((a) => new Projectile(x, y, -Math.cos(a) * 330, Math.sin(a) * 330 + (jetY - y) * 0.5, () => attackSprite.caneta(), [36, 12]));
      case 'iguazu': // caixas da taxa em arco para trás
        return [0, 1].map((i) => new Projectile(x, y - 20, -200 - i * 60, -300 - rand() * 120, () => attackSprite.taxa(), [36, 28], 600));
      case 'guayaquil': // carimbos em diagonal, com aviso
        return [0, 1].map((i) => diagonalDrop(240 + i * 90 + rand() * 50, () => attackSprite.carimbo(), [28, 32], 0.6 + i * 0.35));
      case 'miami': // alertas vermelhos
        return launchAttack('interpol', 0, 0, Math.max(60, Math.min(groundY - 80, jetY + (rand() - 0.5) * 120)));
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const variant = VARIANTS[this.info.chaser].find((v) => v.id === this.info.variant)!;
    const sprite = variantSprite(this.info.chaser, variant);
    // espelhado: o chefe olha para a esquerda (para o jatinho)
    ctx.save();
    ctx.translate(Math.round(this.x), 0);
    ctx.scale(-1, 1);
    drawSprite(ctx, sprite, 0, Math.round(this.y), SCALE);
    ctx.restore();
    const desk = deskSprite(this.info);
    drawSpriteAt(ctx, desk, Math.round(this.x - (desk.width * PX * 1.5) / 2), Math.round(this.y + 34), PX * 1.5);
  }

  /** Barra do chefe no alto: vai esvaziando até ele desistir. */
  renderBar(ctx: CanvasRenderingContext2D): void {
    const left = Math.max(0, 1 - this.time / this.duration);
    const x = 40;
    const y = 112;
    const w = WORLD.width - 80;
    ctx.fillStyle = OUT;
    ctx.fillRect(x - PX, y - PX, w + PX * 2, 10 + PX * 2);
    ctx.fillStyle = '#3a1020';
    ctx.fillRect(x, y, w, 10);
    ctx.fillStyle = '#ff3b3b';
    ctx.fillRect(x, y, Math.round((w * left) / PX) * PX, 10);
    drawPixelText(ctx, this.info.name.toUpperCase(), WORLD.width / 2, y + 16, 1.5, '#ffffff', { align: 'center', outline: OUT });
  }
}

/** Miniatura para a Coleção: o chefe atrás da bancada. */
export function bossIcon(stage: RegionId): HTMLCanvasElement {
  const info = BOSSES[stage];
  const variant = VARIANTS[info.chaser].find((v) => v.id === info.variant)!;
  const sprite = variantSprite(info.chaser, variant);
  const desk = deskSprite(info);
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 48;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.save();
  ctx.translate(32 + sprite.width / 2, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(sprite, 0, 2);
  ctx.restore();
  ctx.drawImage(desk, Math.round(32 - desk.width / 2), 30);
  return c;
}
