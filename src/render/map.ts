import { AMERICAS, CUBA, ROUTE_LEGS, insidePolygon } from './americas';
import { pixelText, textWidth } from './pixel-font';
import { PixelGrid, PX, drawSpriteAt } from './pixel';
import { STAGE_LENGTH, STAGES, stageIndexForScore } from './stages';

export interface MapOptions {
  /** Parada mais distante que pode aparecer com nome (as outras viram "?"). */
  revealUpTo: number;
  /** Mostrar o avião na posição desta pontuação. */
  score?: number;
}

const OUT = '#1b1420';
/** Recorte do mapa (graus). */
const LON = [-118, -30];
const LAT = [-56, 34.5];

type Pt = [number, number];

function project(w: number, h: number) {
  return ([lon, lat]: Pt): Pt => [
    Math.round(((lon - LON[0]) / (LON[1] - LON[0])) * (w - 1)),
    Math.round(((LAT[1] - lat) / (LAT[1] - LAT[0])) * (h - 1))
  ];
}

const baseCache = new Map<string, PixelGrid>();

/** Oceano + continente (fica em cache, só a rota e o avião mudam). */
function baseMap(w: number, h: number): PixelGrid {
  const key = `${w}x${h}`;
  const cached = baseCache.get(key);
  if (cached) return cached;
  const g = new PixelGrid(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const lon = LON[0] + (x / (w - 1)) * (LON[1] - LON[0]);
      const lat = LAT[1] - (y / (h - 1)) * (LAT[1] - LAT[0]);
      const land = insidePolygon(lon, lat, AMERICAS) || insidePolygon(lon, lat, CUBA);
      if (land) g.px(x, y, (x * 7 + y * 3) % 11 === 0 ? '#6aa04c' : '#7bb35a');
      else g.px(x, y, (x + y * 2) % 9 === 0 && y % 4 === 0 ? '#3f7fc4' : '#2f6db3');
    }
  }
  // contorno da costa
  const coast: Pt[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (g.get(x, y)?.startsWith('#7bb35a') || g.get(x, y) === '#6aa04c') {
        const water = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
          const c = g.get(x + dx, y + dy);
          return c === '#2f6db3' || c === '#3f7fc4';
        });
        if (water) coast.push([x, y]);
      }
    }
  }
  for (const [x, y] of coast) g.px(x, y, '#3d6b2e');
  baseCache.set(key, g);
  return g;
}

function copy(src: PixelGrid): PixelGrid {
  const g = new PixelGrid(src.width, src.height);
  for (let y = 0; y < src.height; y++) for (let x = 0; x < src.width; x++) {
    const c = src.get(x, y);
    if (c) g.px(x, y, c);
  }
  return g;
}

/** Comprimento de uma linha (em graus) e ponto a uma fração dela. */
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

/** Mapa das Américas em pixel art, numa grade de `w` x `h` pixels da arte. */
export function routeMapGrid(w: number, h: number, options: MapOptions): PixelGrid {
  const g = copy(baseMap(w, h));
  const p = project(w, h);

  // moldura
  g.rect(0, 0, w, 1, OUT).rect(0, h - 1, w, 1, OUT).rect(0, 0, 1, h, OUT).rect(w - 1, 0, 1, h, OUT);

  // progresso: perna atual e fração dela
  const score = options.score ?? 0;
  const progress = Math.min(score / STAGE_LENGTH, ROUTE_LEGS.length);
  const leg = Math.min(ROUTE_LEGS.length - 1, Math.floor(progress));
  const frac = progress >= ROUTE_LEGS.length ? 1 : progress - leg;

  // rota: feita = vermelha contínua; próxima perna (já revelada) = pontilhada clara
  ROUTE_LEGS.forEach((points, i) => {
    if (i > options.revealUpTo) return;
    const done = i < leg || (i === leg && frac >= 1);
    const steps = 60;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const [x, y] = p(along(points, t));
      const travelled = done || (i === leg && t <= frac);
      if (travelled) g.px(x, y, '#ff3b3b');
      else if (s % 4 < 2) g.px(x, y, '#fff3b0');
    }
  });

  // paradas
  STAGES.forEach((stage, i) => {
    const [x, y] = p([stage.lon, stage.lat]);
    const known = i <= options.revealUpTo;
    g.rect(x - 2, y - 2, 5, 5, OUT).rect(x - 1, y - 1, 3, 3, known ? stage.mapColor : '#b9ab8c');
    const label = known ? stage.short : '?';
    const lw = textWidth(label);
    // rótulo do lado com mais espaço (Miami e Guayaquil à direita; Brasil à direita também)
    let lx = x + 4;
    if (lx + lw > w - 2) lx = x - 4 - lw;
    const ly = Math.max(2, Math.min(h - 7, y - 2));
    g.rect(lx - 1, ly - 1, lw + 2, 7, '#0b1d3a');
    pixelText(g, label, lx, ly, known ? '#ffffff' : '#b9ab8c');
  });

  // aviãozinho na posição atual
  if (options.score !== undefined) {
    const [x, y] = p(along(ROUTE_LEGS[leg], frac));
    const plane = [
      [0, -3], [0, -2], [-1, -1], [0, -1], [1, -1], [-3, 0], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [3, 0],
      [0, 1], [0, 2], [-1, 3], [0, 3], [1, 3]
    ];
    for (const [dx, dy] of plane) for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) g.px(x + dx + ox, y + dy + oy, OUT);
    for (const [dx, dy] of plane) g.px(x + dx, y + dy, '#ffffff');
  }
  return g;
}

/** Desenha o mapa no canvas do jogo (posição e tamanho em unidades do jogo). */
export function drawRouteMap(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, options: MapOptions): void {
  drawSpriteAt(ctx, routeMapGrid(Math.round(w / PX), Math.round(h / PX), options).toCanvas(), x, y, PX);
}

/** Duas linhas para a pausa: onde está e quanto falta para a próxima parada. */
export function routeStatus(score: number): [string, string] {
  const i = stageIndexForScore(score);
  const here = `${STAGES[i].name} (${STAGES[i].country})`;
  if (i === STAGES.length - 1) return [here, 'Reta final!'];
  const left = STAGE_LENGTH - (score % STAGE_LENGTH);
  return [here, `Faltam ${left} para a próxima parada`];
}
