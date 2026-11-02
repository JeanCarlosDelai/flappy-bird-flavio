import { rand } from '@/core/random';
import { CHASER, JET, WORLD } from '@/core/config';
import type { ChaserId } from '@server/types';
import { STAGE_LENGTH, STAGES, scoreInStage, stageIndexForScore } from '@/render/stages';
import { testMode } from '@/systems/test-mode';
import { settings } from '@/systems/settings';
import { drawSprite, PX } from '@/render/pixel';
import { drawPixelText } from '@/render/pixel-font';
import { VARIANTS, variantSprite, type ChaserVariant } from './chaser-sprites';

export interface ChaserProfile {
  id: ChaserId;
  name: string;
  /** Ataque planejado para a fase de "profundidade" do roadmap. */
  attack: string;
}

/** Caricaturas em pixel art (ver chaser-sprites.ts), nada de foto. */
export const CHASERS: ChaserProfile[] = [
  { id: 'lula', name: 'Lula', attack: 'decretos' },
  { id: 'xandao', name: 'Xandão', attack: 'canetadas' },
  { id: 'janja', name: 'Janja', attack: 'Constituição' },
  { id: 'pf', name: 'Agente da PF', attack: 'algemas' },
  { id: 'renan', name: 'Renan Santos', attack: 'drone' },
  { id: 'gonet', name: 'Gonet', attack: 'denúncia' },
  { id: 'dino', name: 'Dino', attack: 'Código Penal' },
  { id: 'interpol', name: 'Agente da Interpol', attack: 'alerta vermelho' },
  { id: 'gleisi', name: 'Gleisi', attack: 'notas oficiais' },
  { id: 'haddad', name: 'Haddad', attack: 'taxinhas' },
  { id: 'lindbergh', name: 'Lindbergh', attack: 'requerimentos' },
  { id: 'boulos', name: 'Boulos', attack: 'ocupação' },
  { id: 'erika', name: 'Erika Hilton', attack: 'representações' },
  { id: 'kim', name: 'Kim Kataguiri', attack: 'thread' }
];

export const chaserById = (id: ChaserId) => CHASERS.find((c) => c.id === id)!;

const SPRITE_SCALE = 2;

const pickVariant = (profile: ChaserProfile) => {
  const list = VARIANTS[profile.id];
  return list[Math.floor(rand() * list.length)];
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

  /** Onde o perseguidor está na tela (de onde saem os ataques). */
  position(targetY: number): [number, number] {
    const x = -12 + this.shown * (JET.x - 24 + 12);
    const y = Math.max(92, Math.min(WORLD.height - WORLD.groundHeight - 40, targetY)) + Math.sin(this.time * 4) * 6;
    return [x, y];
  }

  render(ctx: CanvasRenderingContext2D, targetY: number): void {
    const [x, y] = this.position(targetY);

    // desenhos mais largos (Renan das fraldas) crescem para a esquerda, sem chegar antes no jatinho
    const extra = Math.max(0, variantSprite(this.profile.id, this.variant).width - 36) * PX;
    drawChaser(ctx, this.profile, this.variant, x - extra / 2, y);

    // barra de perigo no topo (pixel)
    const p = PX;
    const x0 = 10;
    const y0 = 12;
    const barW = 132;
    ctx.fillStyle = '#1b1420';
    ctx.fillRect(x0, y0, barW + 2 * p, 6 * p);
    ctx.fillStyle = '#0b1d3a';
    ctx.fillRect(x0 + p, y0 + p, barW, 4 * p);
    const fill = Math.round((barW * this.shown) / p) * p;
    const danger = this.threat > 0.66;
    ctx.fillStyle = danger ? '#ff3b3b' : this.threat > 0.33 ? '#ffb000' : '#4caf50';
    ctx.fillRect(x0 + p, y0 + p, fill, 4 * p);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(x0 + p, y0 + p, fill, p);
    const shake = danger && !settings.reduceEffects && Math.floor(this.time * 20) % 2 ? p : 0;
    drawPixelText(ctx, `${this.profile.name} na cola`, x0 + shake, y0 + 8 * p, p, '#ffffff', { outline: '#1b1420' });
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

/**
 * Quem está na cola: cada parada tem o seu grupo, que reveza ao longo da fase
 * (em Miami, na reta final, aparecem todos).
 */
export function chaserForScore(score: number): ChaserProfile {
  const stage = STAGES[stageIndexForScore(score)];
  let roster = stage.chasers;
  // MODO TESTE: só os perseguidores marcados (se nenhum da parada estiver marcado, usa os marcados)
  if (testMode && testMode.chasers.length) {
    const allowed = roster.filter((c) => testMode!.chasers.includes(c));
    roster = allowed.length ? allowed : testMode.chasers;
  }
  const turn = Math.max(1, Math.floor(STAGE_LENGTH / roster.length));
  const index = Math.floor(scoreInStage(score) / turn) % roster.length;
  return chaserById(roster[index]);
}
