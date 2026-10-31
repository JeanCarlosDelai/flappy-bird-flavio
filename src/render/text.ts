import { WORLD } from '@/core/config';

export function outlinedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  color = '#fff'
): void {
  ctx.font = `900 ${size}px system-ui, -apple-system, Segoe UI, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(3, size / 6);
  ctx.strokeStyle = '#0b1d3a';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

export function panel(ctx: CanvasRenderingContext2D, y: number, h: number): void {
  const x = 34;
  const w = WORLD.width - 68;
  ctx.fillStyle = 'rgba(11, 29, 58, 0.82)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 16);
  ctx.fill();
  ctx.strokeStyle = '#ffdf00';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.lineWidth = 1;
}
