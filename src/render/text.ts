import { WORLD } from '@/core/config';
import { drawPixelText, textWidth, wrapPixelText } from './pixel-font';
import { PX } from './pixel';

const OUTLINE = '#1b1420';

/** Texto pixelado centrado em (x, y) com contorno. `size` = tamanho do pixel da fonte. */
export function outlinedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  color = '#ffffff'
): void {
  drawPixelText(ctx, text, x, y - (5 * size) / 2, size, color, { align: 'center', outline: OUTLINE, shadow: true });
}

/** Texto simples (sem contorno), alinhado ao centro. */
export function plainText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color: string): void {
  drawPixelText(ctx, text, x, y - (5 * size) / 2, size, color, { align: 'center' });
}

/** Várias linhas centradas, quebrando pela largura. Devolve a altura usada. */
export function paragraph(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  size: number,
  color: string
): number {
  const lines = wrapPixelText(text, maxWidth, size);
  lines.forEach((line, i) => plainText(ctx, line, x, y + i * size * 8, size, color));
  return lines.length * size * 8;
}

/** Painel com cantos "mordidos" e borda amarela, estilo pixel. */
export function panel(ctx: CanvasRenderingContext2D, y: number, h: number, x = 32, w = WORLD.width - 64): void {
  const p = PX;
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(x + p, y, w - 2 * p, h);
  ctx.fillRect(x, y + p, w, h - 2 * p);
  ctx.fillStyle = '#ffd23f';
  ctx.fillRect(x + 2 * p, y + p, w - 4 * p, h - 2 * p);
  ctx.fillRect(x + p, y + 2 * p, w - 2 * p, h - 4 * p);
  ctx.fillStyle = '#0b1d3a';
  ctx.fillRect(x + 3 * p, y + 2 * p, w - 6 * p, h - 4 * p);
  ctx.fillRect(x + 2 * p, y + 3 * p, w - 4 * p, h - 6 * p);
  ctx.fillStyle = '#13294f';
  ctx.fillRect(x + 3 * p, y + 2 * p, w - 6 * p, p);
}

export { textWidth };
