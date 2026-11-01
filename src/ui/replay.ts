import { WORLD } from '@/core/config';
import { encodeGif } from './gif';

/**
 * REPLAY: guarda os últimos segundos da partida (em meia resolução, 10 quadros por segundo)
 * para virar um GIF no fim de jogo.
 */
const W = WORLD.width / 2;
const H = WORLD.height / 2;
const MAX_FRAMES = 45;
const EVERY_MS = 100;

let frames: Uint8ClampedArray[] = [];
let last = 0;
let small: CanvasRenderingContext2D | null = null;

export function resetReplay(): void {
  frames = [];
  last = 0;
}

/** Chamado a cada desenho da partida; só guarda 1 quadro a cada 100 ms. */
export function captureReplay(source: HTMLCanvasElement): void {
  const now = performance.now();
  if (now - last < EVERY_MS) return;
  last = now;
  if (!small) {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    small = c.getContext('2d', { willReadFrequently: true });
    if (!small) return;
    small.imageSmoothingEnabled = false;
  }
  small.drawImage(source, 0, 0, W, H);
  frames.push(small.getImageData(0, 0, W, H).data);
  if (frames.length > MAX_FRAMES) frames.shift();
}

export const hasReplay = () => frames.length > 5;

/** Monta o GIF dos últimos segundos (pode levar um instante). */
export async function replayGif(): Promise<Blob | null> {
  if (!hasReplay()) return null;
  await new Promise((r) => setTimeout(r, 30)); // deixa a tela mostrar "gerando…"
  const bytes = encodeGif(frames, W, H, 10);
  return new Blob([bytes.buffer as ArrayBuffer], { type: 'image/gif' });
}
