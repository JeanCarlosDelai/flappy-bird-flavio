import { WORLD } from './config';
import type { Rect } from '@/systems/collision';

/** O que aconteceu de entrada desde o último quadro. */
export interface FrameInput {
  /** Toque/clique/espaço: voar ou confirmar. */
  pressed: boolean;
  /** Esc, P ou o botão de pausa na tela. */
  pause: boolean;
  /** M ou o botão de som na tela. */
  sound: boolean;
}

/** Botão de pausa no canto superior direito (coordenadas do mundo). */
export const PAUSE_BUTTON: Rect = { x: WORLD.width - 50, y: 10, w: 40, h: 40 };
/** Botão de som, ao lado do de pausa. */
export const SOUND_BUTTON: Rect = { x: WORLD.width - 96, y: 10, w: 40, h: 40 };

const inside = (x: number, y: number, r: Rect) =>
  x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

/** Junta toque, clique e teclado em sinais simples por quadro. */
export class Input {
  private pressed = false;
  private pause = false;
  private sound = false;

  constructor(canvas: HTMLCanvasElement) {
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const box = canvas.getBoundingClientRect();
      const x = ((e.clientX - box.left) / box.width) * WORLD.width;
      const y = ((e.clientY - box.top) / box.height) * WORLD.height;
      if (inside(x, y, PAUSE_BUTTON)) this.pause = true;
      else if (inside(x, y, SOUND_BUTTON)) this.sound = true;
      else this.pressed = true;
    });
    // toque fora do canvas (barras laterais) também voa
    document.body.addEventListener('pointerdown', (e) => {
      if (e.target === document.body) {
        e.preventDefault();
        this.pressed = true;
      }
    });
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      // digitando o apelido: teclas são do campo, não do jogo
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'BUTTON' || el.tagName === 'A')) return;
      if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        this.pause = true;
      } else if (e.code === 'KeyM') {
        this.sound = true;
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
    const frame = { pressed: this.pressed, pause: this.pause, sound: this.sound };
    this.pressed = false;
    this.pause = false;
    this.sound = false;
    return frame;
  }
}
