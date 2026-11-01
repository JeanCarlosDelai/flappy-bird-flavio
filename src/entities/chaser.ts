import { CHASER, JET, WORLD } from '@/core/config';
import type { DeathCause } from '@server/types';
import { drawSprite } from '@/render/pixel';
import { VARIANTS, variantSprite, type ChaserVariant } from './chaser-sprites';

export interface ChaserProfile {
  id: Exclude<DeathCause, 'chao'>;
  name: string;
  /** Ataque planejado para a fase de "profundidade" do roadmap. */
  attack: string;
}

/** Caricaturas em pixel art (ver chaser-sprites.ts), nada de foto. */
export const CHASERS: ChaserProfile[] = [
  { id: 'lula', name: 'Lula', attack: 'decretos' },
  { id: 'xandao', name: 'Xandão', attack: 'canetadas' },
  { id: 'renan', name: 'Renan Santos', attack: 'drone' }
];

const SPRITE_SCALE = 2;

const pickVariant = (profile: ChaserProfile) => {
  const list = VARIANTS[profile.id];
  return list[Math.floor(Math.random() * list.length)];
};

/**
 * Perseguidor na borda esquerda. `threat` vai de 0 (longe) a 1 (te pegou).
 * Cada erro empurra ele para frente; voar limpo faz ele recuar devagar.
 */
export class Chaser {
  threat = 0;
  private time = 0;
  private shown = 0;

  /** Variante sorteada (ex.: Xandão com a caneta, Renan guitarrista). */
  readonly variant: ChaserVariant;

  constructor(public profile: ChaserProfile, variant?: ChaserVariant) {
    this.variant = variant ?? pickVariant(profile);
  }

  bump(amount: number): void {
    this.threat = Math.min(1, this.threat + amount);
  }

  get caught(): boolean {
    return this.threat >= 1;
  }

  update(dt: number): void {
    this.time += dt;
    this.threat = Math.max(0, this.threat - CHASER.recoverPerSecond * dt);
    // animação suave até a posição real
    this.shown += (this.threat - this.shown) * Math.min(1, dt * 6);
  }

  render(ctx: CanvasRenderingContext2D, targetY: number): void {
    const x = -12 + this.shown * (JET.x - 24 + 12);
    const y = Math.max(92, Math.min(WORLD.height - WORLD.groundHeight - 40, targetY)) + Math.sin(this.time * 4) * 6;

    drawChaser(ctx, this.profile, this.variant, x, y);

    // barra de perigo no topo
    const barW = 140;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(12, 14, barW, 10);
    ctx.fillStyle = this.threat > 0.66 ? '#ff3b3b' : this.threat > 0.33 ? '#ffb000' : '#4caf50';
    ctx.fillRect(12, 14, barW * this.shown, 10);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`${this.profile.name} na sua cola`, 12, 27);
  }
}

/** Desenha o perseguidor (pixel art ampliada) centrado em (x, y). */
export function drawChaser(
  ctx: CanvasRenderingContext2D,
  profile: ChaserProfile,
  variant: ChaserVariant,
  x: number,
  y: number,
  scale = SPRITE_SCALE
): void {
  drawSprite(ctx, variantSprite(profile.id, variant), x, y, scale);
}

export function chaserForScore(score: number): ChaserProfile {
  return CHASERS[Math.floor(score / CHASER.pointsPerChaser) % CHASERS.length];
}
