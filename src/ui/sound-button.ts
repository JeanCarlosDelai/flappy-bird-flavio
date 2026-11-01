import { cycleSoundMode, getSoundMode, type SoundMode } from '@/audio/engine';
import { sfx } from '@/audio/sfx';
import { WORLD } from '@/core/config';
import { SOUND_BUTTON } from '@/core/input';
import { drawPixelText } from '@/render/pixel-font';
import { PX } from '@/render/pixel';

const LABEL: Record<SoundMode, string> = {
  tudo: 'Som: tudo ligado',
  efeitos: 'Som: só efeitos',
  mudo: 'Som: desligado'
};

let toastUntil = 0;

/** Troca o modo de som (botão ou tecla M) e mostra um aviso rápido. */
export function toggleSound(): void {
  cycleSoundMode();
  sfx.click();
  toastUntil = performance.now() + 1400;
}

/** Botão de som em pixel: alto-falante com ondas, só uma onda (efeitos) ou X (mudo). */
export function drawSoundButton(ctx: CanvasRenderingContext2D): void {
  const b = SOUND_BUTTON;
  const p = PX;
  ctx.fillStyle = '#1b1420';
  ctx.fillRect(b.x + p, b.y, b.w - 2 * p, b.h);
  ctx.fillRect(b.x, b.y + p, b.w, b.h - 2 * p);
  ctx.fillStyle = '#24406f';
  ctx.fillRect(b.x + p, b.y + p, b.w - 2 * p, b.h - 2 * p);
  ctx.fillStyle = '#33528a';
  ctx.fillRect(b.x + p, b.y + p, b.w - 2 * p, p);

  // alto-falante
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(b.x + 8, b.y + 16, 6, 8);
  for (let i = 0; i < 4; i++) ctx.fillRect(b.x + 14 + i * p, b.y + 14 - i * p, p, 12 + i * 2 * p);

  const mode = getSoundMode();
  if (mode === 'mudo') {
    ctx.fillStyle = '#ff5a5a';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(b.x + 24 + i * p, b.y + 15 + i * p, p, p);
      ctx.fillRect(b.x + 32 - i * p, b.y + 15 + i * p, p, p);
    }
  } else {
    ctx.fillRect(b.x + 25, b.y + 17, p, 6);
    if (mode === 'tudo') {
      ctx.fillRect(b.x + 29, b.y + 14, p, 12);
      ctx.fillRect(b.x + 27, b.y + 12, p, p);
      ctx.fillRect(b.x + 27, b.y + 26, p, p);
    }
  }

  if (performance.now() < toastUntil) {
    drawPixelText(ctx, LABEL[mode], WORLD.width / 2, 560, 3, '#ffffff', { align: 'center', outline: '#1b1420' });
  }
}
