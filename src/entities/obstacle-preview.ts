import type { ObstacleKind } from '@server/types';
import { brasiliaPreview } from './obstacles-brasilia';
import { regionPreview } from './obstacles-regions';
import { balloonSprite, helicopterSprite, processSprite, radarSprite, togaSprite } from './obstacle-sprites';
import {
  PIECE_H,
  bananaPiece,
  cabinSprite,
  cuiaSprite,
  cupulaBottom,
  cupulaTop,
  gatePiece,
  gatorSprite,
  iguanaSprite,
  pelicanSprite,
  quatiSprite,
  rocksBottom,
  searchlightBase,
  towerPiece,
  waterTop
} from './obstacle-sprites-extra';

/** Miniatura 60x60 (pixels da arte) de cada obstáculo, para a Coleção e os prints. */
export function obstaclePreview(kind: ObstacleKind): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 60;
  c.height = 60;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  const put = (sprite: HTMLCanvasElement, x: number, y: number) => ctx.drawImage(sprite, Math.round(x), Math.round(y));
  /** Peça "de cima" mostrando só a ponta (até y) e "de baixo" a partir de y2. */
  const gate = (top: HTMLCanvasElement, bottom: HTMLCanvasElement, x: number, y: number, y2: number) => {
    put(top, x, y - PIECE_H);
    put(bottom, x, y2);
  };

  switch (kind) {
    case 'toga':
      put(togaSprite(22), 9, 0);
      put(processSprite(22, 1), 13, 37);
      break;
    case 'cpi':
      put(balloonSprite('#e53935', 10), 6, 4);
      put(balloonSprite('#fb8c00', 10), 30, 20);
      break;
    case 'cupulas':
      gate(cupulaTop(), cupulaBottom(), 10, 24, 36);
      break;
    case 'pf':
      put(helicopterSprite(1), 4, 17);
      break;
    case 'cataratas':
      gate(waterTop(0), rocksBottom(), 12, 26, 40);
      break;
    case 'cancela':
      gate(gatePiece(true), gatePiece(false), 15, 24, 38);
      break;
    case 'quati':
      put(quatiSprite(0), 15, 36);
      break;
    case 'cuia':
      put(cuiaSprite(1), 17, 17);
      break;
    case 'roda': {
      ctx.fillStyle = '#e9edf2';
      for (let k = 0; k < 48; k++) {
        const a = (k / 48) * Math.PI * 2;
        ctx.fillRect(Math.round(30 + Math.cos(a) * 20), Math.round(26 + Math.sin(a) * 20), 1, 1);
      }
      for (let t = 0; t <= 20; t++) {
        ctx.fillRect(Math.round(30 - t * 0.6), 26 + t + 12, 1, 1);
        ctx.fillRect(Math.round(30 + t * 0.6), 26 + t + 12, 1, 1);
      }
      const colors = ['#ff6b6b', '#ffd23f', '#6cb4ee', '#7bd389'];
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        put(cabinSprite(colors[i % 4]), 30 + Math.cos(a) * 20 - 6, 26 + Math.sin(a) * 20 - 3);
      }
      break;
    }
    case 'iguana':
      put(iguanaSprite(0), 13, 40);
      break;
    case 'bananas':
      gate(bananaPiece(true), bananaPiece(false), 12, 28, 40);
      break;
    case 'radar':
      put(radarSprite(32, 1), 17, 10);
      break;
    case 'holofote':
      ctx.fillStyle = 'rgba(255, 243, 176, 0.8)';
      for (let d = 0; d < 34; d += 2) for (let s = -d / 5; s <= d / 5; s += 2) ctx.fillRect(Math.round(30 + d * 0.5 + s), Math.round(36 - d + s * 0.5), 1, 1);
      put(searchlightBase(), 13, 38);
      break;
    case 'predios':
      gate(towerPiece(true), towerPiece(false), 12, 24, 40);
      break;
    case 'pelicanos':
      put(pelicanSprite(0), 2, 22);
      put(pelicanSprite(1), 20, 8);
      put(pelicanSprite(1), 20, 36);
      break;
    case 'jacare':
      ctx.fillStyle = '#1494a8';
      ctx.fillRect(0, 46, 60, 14);
      put(gatorSprite(), 6, 28);
      break;
    default:
      if (!brasiliaPreview(kind, ctx)) regionPreview(kind, ctx);
  }
  return c;
}
