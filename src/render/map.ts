import { pixelText, textWidth } from './pixel-font';
import { PixelGrid, PX, drawSpriteAt } from './pixel';
import { ROUTE_LENGTH, STAGE_LENGTH, STAGES, stageIndexForScore } from './stages';

export interface MapOptions {
  /** Região mais distante que pode aparecer com nome (as outras viram "???"). */
  revealUpTo: number;
  /** Mostrar o jatinho na posição desta pontuação. */
  score?: number;
}

const OUT = '#1b1420';

/** Mapa da rota em pixel art, numa grade de `w` x `h` pixels da arte. */
export function routeMapGrid(w: number, h: number, options: MapOptions): PixelGrid {
  const g = new PixelGrid(w, h);
  // papel com cantos recortados e borda
  g.rect(1, 0, w - 2, h, '#8a6d3b').rect(0, 1, w, h - 2, '#8a6d3b');
  g.rect(2, 1, w - 4, h - 2, '#f3e6c4').rect(1, 2, w - 2, h - 4, '#f3e6c4');
  for (let i = 0; i < 30; i++) g.px(4 + ((i * 37) % (w - 8)), 4 + ((i * 17) % (h - 8)), '#e6d5a8');

  const pad = 16;
  const n = STAGES.length;
  const pts = STAGES.map((_, i) => ({
    x: Math.round(pad + (i * (w - pad * 2)) / (n - 1)),
    y: Math.round(h * (i % 2 === 0 ? 0.58 : 0.4))
  }));

  // caminho pontilhado
  for (let i = 0; i < n - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const steps = Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
    for (let s = 0; s <= steps; s += 3) g.px(Math.round(a.x + ((b.x - a.x) * s) / steps), Math.round(a.y + ((b.y - a.y) * s) / steps), '#8a6d3b');
  }

  STAGES.forEach((stage, i) => {
    const p = pts[i];
    const known = i <= options.revealUpTo;
    g.ellipse(p.x, p.y, 6, 6, OUT).ellipse(p.x, p.y, 5, 5, known ? stage.mapColor : '#b9ab8c');
    if (known) g.px(p.x - 2, p.y - 2, '#ffffff');
    else pixelText(g, '?', p.x - 1, p.y - 2, '#3d2e17');
    const label = known ? stage.name : '???';
    const lx = Math.max(2, Math.min(w - textWidth(label) - 2, p.x - Math.floor(textWidth(label) / 2)));
    pixelText(g, label, lx, i % 2 === 0 ? p.y + 9 : p.y - 14, '#3d2e17');
  });

  if (options.score !== undefined) {
    const progress = Math.min(options.score, ROUTE_LENGTH - 1) / STAGE_LENGTH;
    const i = Math.min(n - 2, Math.floor(progress));
    const t = Math.min(1, progress - i);
    const jx = Math.round(pts[i].x + (pts[i + 1].x - pts[i].x) * t);
    const jy = Math.round(pts[i].y + (pts[i + 1].y - pts[i].y) * t);
    // pino ao lado da bolinha, para não cobrir o nome
    const py = jy - 13;
    g.rect(jx - 3, py, 7, 6, OUT).rect(jx - 2, py + 1, 5, 4, '#ff3b3b').px(jx, py + 2, '#ffffff');
    g.rect(jx - 1, py + 6, 3, 2, OUT).px(jx, py + 6, '#ff3b3b').px(jx, py + 8, OUT);
  }
  return g;
}

/** Desenha o mapa no canvas do jogo (posição e tamanho em unidades do jogo). */
export function drawRouteMap(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, options: MapOptions): void {
  drawSpriteAt(ctx, routeMapGrid(Math.round(w / PX), Math.round(h / PX), options).toCanvas(), x, y, PX);
}

export function routeStatus(score: number): string {
  const i = stageIndexForScore(score);
  const stage = STAGES[i];
  if (i === STAGES.length - 1) return `${stage.name}: reta final`;
  const left = (i + 1) * STAGE_LENGTH - score;
  return `${stage.name}: faltam ${left} para a próxima`;
}
