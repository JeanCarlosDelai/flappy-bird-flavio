/**
 * Desenha os ícones do app (PWA) a partir do sprite do jatinho.
 * Gerados por `node tools/capture-icons.cjs` em public/icons/.
 */
import { jetSprite } from '@/entities/jet';
import { drawPixelText } from '@/render/pixel-font';

function icon(id: string, size: number, opts: { maskable?: boolean; text?: boolean } = {}) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  c.dataset.icon = id;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  // fundo azul-noite com faixa de céu e chão em "pixels grandes"
  const p = Math.max(1, Math.round(size / 32));
  ctx.fillStyle = '#0b1d3a';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#4f93e0';
  ctx.fillRect(0, Math.round(size * 0.12), size, Math.round(size * 0.62));
  ctx.fillStyle = '#86bff2';
  ctx.fillRect(0, Math.round(size * 0.5), size, Math.round(size * 0.24));
  ctx.fillStyle = '#7da84f';
  ctx.fillRect(0, Math.round(size * 0.74), size, p * 2);
  ctx.fillStyle = '#a0522d';
  ctx.fillRect(0, Math.round(size * 0.74) + p * 2, size, size);
  // sol
  ctx.fillStyle = '#ffe066';
  ctx.fillRect(Math.round(size * 0.72), Math.round(size * 0.2), p * 4, p * 4);
  // jatinho subindo, grande e centralizado (área segura de 80% no maskable)
  const sprite = jetSprite(-0.3, 1);
  const scale = Math.max(1, Math.floor((size * (opts.maskable ? 0.62 : 0.8)) / sprite.width));
  const w = sprite.width * scale;
  ctx.drawImage(sprite, Math.round((size - w) / 2), Math.round(size * 0.42 - w / 2), w, w);
  if (opts.text) drawPixelText(ctx, 'JATINHO', size / 2, size * 0.8, Math.max(1, Math.round(size / 48)), '#ffd23f', { align: 'center', outline: '#1b1420' });
  document.body.append(c);
}

icon('icon-192', 192);
icon('icon-512', 512);
icon('icon-maskable-512', 512, { maskable: true });
icon('apple-touch-icon', 180);
icon('favicon-32', 32);
icon('og-image', 512, { text: true });
document.body.dataset.ready = '1';
