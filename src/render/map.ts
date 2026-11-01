import { ROUTE_LEGS } from './americas';
import { countryAt, COUNTRY_COLOR } from './countries';
import { drawPixelText, textWidth } from './pixel-font';
import { PX } from './pixel';
import { STAGE_LENGTH, STAGES, stageIndexForScore } from './stages';

export interface MapOptions {
  /** Parada mais distante que pode aparecer com nome (as outras viram "?"). */
  revealUpTo: number;
  /** Mostrar o avião na posição desta pontuação. */
  score?: number;
}

const OUT = '#1b1420';
const PAPER = '#f1eee6';
/** Recorte do mapa (graus): Alasca ao Cabo Horn. */
const LON: [number, number] = [-170, -30];
const LAT: [number, number] = [-56, 74];
/** Mosaico: cada quadradinho tem TILE de lado e GAP de espaço. */
const TILE = 3;
const GAP = 1;

type Pt = [number, number];

const tileCache = new Map<string, HTMLCanvasElement>();

/** Países em quadradinhos coloridos (cacheado por tamanho). */
function tiles(w: number, h: number): HTMLCanvasElement {
  const key = `${w}x${h}`;
  let c = tileCache.get(key);
  if (c) return c;
  c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);
  const pitch = TILE + GAP;
  for (let y = 1; y + TILE < h; y += pitch) {
    for (let x = 1; x + TILE < w; x += pitch) {
      const lon = LON[0] + ((x + TILE / 2) / w) * (LON[1] - LON[0]);
      const lat = LAT[1] - ((y + TILE / 2) / h) * (LAT[1] - LAT[0]);
      const country = countryAt(lon, lat);
      if (!country) continue;
      ctx.fillStyle = COUNTRY_COLOR[country];
      ctx.fillRect(x, y, TILE, TILE);
    }
  }
  tileCache.set(key, c);
  return c;
}

function along(points: Pt[], t: number): Pt {
  const lens = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
  let d = lens.reduce((a, b) => a + b, 0) * Math.max(0, Math.min(1, t));
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) {
      const f = lens[i] ? d / lens[i] : 0;
      return [points[i][0] + (points[i + 1][0] - points[i][0]) * f, points[i][1] + (points[i + 1][1] - points[i][1]) * f];
    }
    d -= lens[i];
  }
  return points[points.length - 1];
}

/**
 * Mapa das Américas em mosaico, com rota, paradas e aviãozinho.
 * Posição e tamanho em unidades do jogo.
 */
export function drawRouteMap(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, options: MapOptions): void {
  x = Math.round(x);
  y = Math.round(y);
  w = Math.round(w);
  h = Math.round(h);
  const p = ([lon, lat]: Pt): Pt => [
    Math.round(x + ((lon - LON[0]) / (LON[1] - LON[0])) * w),
    Math.round(y + ((LAT[1] - lat) / (LAT[1] - LAT[0])) * h)
  ];
  const dot = (px: number, py: number, color: string, size = PX) => {
    ctx.fillStyle = color;
    ctx.fillRect(px - size / 2, py - size / 2, size, size);
  };

  // moldura + mosaico
  ctx.fillStyle = OUT;
  ctx.fillRect(x - PX, y - PX, w + 2 * PX, h + 2 * PX);
  const smoothing = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tiles(w, h), x, y, w, h);
  ctx.imageSmoothingEnabled = smoothing;

  // progresso
  const score = options.score ?? 0;
  const progress = Math.min(score / STAGE_LENGTH, ROUTE_LEGS.length);
  const leg = Math.min(ROUTE_LEGS.length - 1, Math.floor(progress));
  const frac = progress >= ROUTE_LEGS.length ? 1 : progress - leg;

  // rota: feita em vermelho; próxima perna (revelada) tracejada
  ROUTE_LEGS.forEach((points, i) => {
    if (i > options.revealUpTo) return;
    const steps = 90;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const [px, py] = p(along(points, t));
      const travelled = i < leg || (i === leg && t <= frac);
      if (travelled) dot(px, py, '#e53935', 3);
      else if (s % 6 < 3) dot(px, py, '#6b6358');
    }
  });

  // paradas; nomes à esquerda (no oceano), ligados por linha pontilhada
  STAGES.forEach((stage, i) => {
    const [px, py] = p([stage.lon, stage.lat]);
    const known = i <= options.revealUpTo;
    const label = known ? stage.short : '?';
    const lw = textWidth(label, PX);
    const lx = x + 6;
    const ly = Math.max(y + 3, Math.min(y + h - 13, py - 5));
    ctx.fillStyle = '#8a8274';
    for (let dx = lx + lw + 5; dx < px - 5; dx += 4) ctx.fillRect(dx, py, 2, 1);
    ctx.fillStyle = OUT;
    ctx.fillRect(lx - 2, ly - 2, lw + 4, 14);
    drawPixelText(ctx, label, lx, ly, PX, known ? '#ffffff' : '#b9ab8c');
    ctx.fillStyle = OUT;
    ctx.fillRect(px - 4, py - 4, 8, 8);
    ctx.fillStyle = known ? stage.mapColor : '#b9ab8c';
    ctx.fillRect(px - 2, py - 2, 4, 4);
  });

  // aviãozinho
  if (options.score !== undefined) {
    const [px, py] = p(along(ROUTE_LEGS[leg], frac));
    const plane = [
      [0, -3], [0, -2], [-1, -1], [0, -1], [1, -1], [-3, 0], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [3, 0],
      [0, 1], [0, 2], [-1, 3], [0, 3], [1, 3]
    ];
    for (const [dx, dy] of plane) for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) dot(px + (dx + ox) * PX, py + (dy + oy) * PX, OUT);
    for (const [dx, dy] of plane) dot(px + dx * PX, py + dy * PX, '#ffffff');
  }
}

/** Duas linhas para a pausa: onde está e quanto falta para a próxima parada. */
export function routeStatus(score: number): [string, string] {
  const i = stageIndexForScore(score);
  const here = `${STAGES[i].name} (${STAGES[i].country})`;
  if (i === STAGES.length - 1) return [here, 'Reta final!'];
  const left = (i + 1) * STAGE_LENGTH - score;
  return [here, `Faltam ${left} para a próxima parada`];
}
