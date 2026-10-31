import { WORLD } from './config';
import type { Rect } from '@/systems/collision';

/** O que aconteceu de entrada desde o último quadro. */
export interface FrameInput {
  /** Toque/clique/espaço: voar ou confirmar. */
  pressed: boolean;
  /** Esc, P ou o botão de pausa na tela. */
  pause: boolean;
}

/** Botão de pausa no canto superior direito (coordenadas do mundo). */
export const PAUSE_BUTTON: Rect = { x: WORLD.width - 50, y: 10, w: 40, h: 40 };

const inside = (x: number, y: number, r: Rect) =>
  x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

/** Junta toque, clique e teclado em sinais simples por quadro. */
export class Input {
  private pressed = false;
  private pause = false;

  constructor(canvas: HTMLCanvasElement) {
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const box = canvas.getBoundingClientRect();
      const x = ((e.clientX - box.left) / box.width) * WORLD.width;
      const y = ((e.clientY - box.top) / box.height) * WORLD.height;
      if (inside(x, y, PAUSE_BUTTON)) this.pause = true;
      else this.pressed = true;
    });
    // toque fora do canvas (barras laterais) também voa
    document.body.addEventListener('pointerdown', (e) => {
      if (e.target !== canvas) {
        e.preventDefault();
        this.pressed = true;
      }
    });
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        this.pause = true;
      } else if (['Space', 'ArrowUp', 'KeyW', 'Enter'].includes(e.code)) {
        e.preventDefault();
        this.pressed = true;
      }
    });
    // trocou de aba/minimizou: pausa sozinho
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.pause = true;
    });
  }

  /** Entrega os sinais acumulados e zera. */
  consume(): FrameInput {
    const frame = { pressed: this.pressed, pause: this.pause };
    this.pressed = false;
    this.pause = false;
    return frame;
  }
}
