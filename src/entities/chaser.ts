import { CHASER, JET, WORLD } from '@/core/config';

export interface ChaserProfile {
  name: string;
  /** Ataque planejado para a fase de "profundidade" do roadmap. */
  attack: string;
  skin: string;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

/** Caricaturas desenhadas com formas simples, nada de foto. */
export const CHASERS: ChaserProfile[] = [
  {
    name: 'Lula',
    attack: 'decretos',
    skin: '#e8b48f',
    draw: (ctx) => {
      ctx.fillStyle = '#bdbdbd'; // barba e cabelo grisalhos
      ctx.beginPath();
      ctx.arc(0, 8, 19, 0, Math.PI);
      ctx.fill();
      ctx.fillRect(-18, -14, 36, 6);
    }
  },
  {
    name: 'Xandão',
    attack: 'canetadas',
    skin: '#e3a982',
    draw: (ctx) => {
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; // careca brilhando
      ctx.beginPath();
      ctx.ellipse(-6, -12, 7, 4, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111'; // toga
      ctx.fillRect(-20, 18, 40, 12);
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-10, -4);
      ctx.lineTo(-3, -1);
      ctx.moveTo(10, -4);
      ctx.lineTo(3, -1);
      ctx.stroke();
      ctx.lineWidth = 1;
    }
  },
  {
    name: 'Renan Santos',
    attack: 'drone',
    skin: '#f0c4a0',
    draw: (ctx) => {
      ctx.fillStyle = '#3b2a1e'; // cabelo
      ctx.beginPath();
      ctx.arc(0, -8, 18, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = '#222'; // óculos
      ctx.lineWidth = 2;
      ctx.strokeRect(-12, -5, 9, 7);
      ctx.strokeRect(3, -5, 9, 7);
      ctx.lineWidth = 1;
    }
  }
];

/**
 * Perseguidor na borda esquerda. `threat` vai de 0 (longe) a 1 (te pegou).
 * Cada erro empurra ele para frente; voar limpo faz ele recuar devagar.
 */
export class Chaser {
  threat = 0;
  private time = 0;
  private shown = 0;

  constructor(public profile: ChaserProfile) {}

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
    const x = -30 + this.shown * (JET.x - 20 + 30);
    const y = Math.max(60, Math.min(WORLD.height - WORLD.groundHeight - 40, targetY)) + Math.sin(this.time * 4) * 6;

    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = this.profile.skin;
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();
    this.profile.draw(ctx);
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(-7, -2, 2.5, 0, Math.PI * 2);
    ctx.arc(7, -2, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

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

export function chaserForScore(score: number): ChaserProfile {
  return CHASERS[Math.floor(score / CHASER.pointsPerChaser) % CHASERS.length];
}
