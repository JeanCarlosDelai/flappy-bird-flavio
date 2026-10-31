import { WORLD } from './config';

/** Ajusta o canvas à janela mantendo a proporção em pé (9:16) e nitidez em telas retina. */
export function fitCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D not supported');

  const resize = () => {
    const scale = Math.min(window.innerWidth / WORLD.width, window.innerHeight / WORLD.height);
    const cssW = Math.floor(WORLD.width * scale);
    const cssH = Math.floor(WORLD.height * scale);
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform((cssW * dpr) / WORLD.width, 0, 0, (cssH * dpr) / WORLD.height, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);
  return ctx;
}
