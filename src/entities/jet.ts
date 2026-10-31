import { CHASER, JET } from '@/core/config';
import type { Rect } from '@/systems/collision';
import { applyGravity, flap, type Body } from '@/systems/physics';

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

  flap(): void {
    flap(this);
  }

  hit(): void {
    this.invulnerable = CHASER.invulnerableSeconds;
  }

  update(dt: number): void {
    this.time += dt;
    this.invulnerable = Math.max(0, this.invulnerable - dt);
    applyGravity(this, dt);
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
    ctx.save();
    ctx.translate(JET.x, this.y);
    ctx.rotate(angle);

    // chama da turbina
    ctx.fillStyle = Math.floor(this.time * 20) % 2 ? '#ffb000' : '#ff6a00';
    ctx.beginPath();
    ctx.moveTo(-23, -4);
    ctx.lineTo(-34 - Math.random() * 6, 0);
    ctx.lineTo(-23, 4);
    ctx.fill();

    // fuselagem
    ctx.fillStyle = '#f4f6fb';
    ctx.beginPath();
    ctx.moveTo(-23, -7);
    ctx.lineTo(14, -7);
    ctx.quadraticCurveTo(25, -5, 25, 0);
    ctx.quadraticCurveTo(25, 5, 14, 7);
    ctx.lineTo(-23, 7);
    ctx.closePath();
    ctx.fill();

    // faixa verde-amarela
    ctx.fillStyle = '#009c3b';
    ctx.fillRect(-20, -1, 34, 3);
    ctx.fillStyle = '#ffdf00';
    ctx.fillRect(-20, 2, 34, 2);

    // cabine
    ctx.fillStyle = '#4fc3f7';
    ctx.fillRect(10, -5, 9, 4);

    // asa e cauda
    ctx.fillStyle = '#c9d1e3';
    ctx.beginPath();
    ctx.moveTo(-6, 2);
    ctx.lineTo(4, 2);
    ctx.lineTo(-10, 13);
    ctx.lineTo(-15, 13);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-23, -7);
    ctx.lineTo(-17, -7);
    ctx.lineTo(-23, -16);
    ctx.lineTo(-27, -16);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
