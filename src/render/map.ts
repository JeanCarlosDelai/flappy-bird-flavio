import { STAGE_LENGTH, STAGES, ROUTE_LENGTH, stageIndexForScore } from './stages';

export interface MapOptions {
  /** Região mais distante que pode aparecer com nome (as outras viram "???"). */
  revealUpTo: number;
  /** Mostrar o jatinho na posição desta pontuação. */
  score?: number;
}

/**
 * Mapa da rota de fuga: Brasília → ... em um caminho tracejado.
 * Regiões ainda não alcançadas aparecem como "???" para não dar spoiler.
 */
export function drawRouteMap(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  options: MapOptions
): void {
  // "papel" do mapa
  ctx.save();
  ctx.fillStyle = '#f3e6c4';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 12);
  ctx.fill();
  ctx.strokeStyle = '#8a6d3b';
  ctx.lineWidth = 2;
  ctx.stroke();

  const pad = 34;
  const n = STAGES.length;
  // pontos das regiões em zigue-zague
  const points = STAGES.map((_, i) => ({
    px: x + pad + (i * (w - pad * 2)) / (n - 1),
    py: y + h * (i % 2 === 0 ? 0.58 : 0.38)
  }));

  // caminho tracejado
  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = '#8a6d3b';
  ctx.beginPath();
  points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.px, p.py) : ctx.lineTo(p.px, p.py)));
  ctx.stroke();
  ctx.setLineDash([]);

  // regiões
  STAGES.forEach((stage, i) => {
    const p = points[i];
    const known = i <= options.revealUpTo;
    ctx.fillStyle = known ? stage.skyTop : '#b9ab8c';
    ctx.strokeStyle = '#5a4526';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.px, p.py, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#3d2e17';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (!known) ctx.fillText('?', p.px, p.py + 1);
    ctx.fillText(known ? stage.name : '???', p.px, p.py + (i % 2 === 0 ? 26 : -26));
  });

  // jatinho na posição atual
  if (options.score !== undefined) {
    const progress = Math.min(options.score, ROUTE_LENGTH - 1) / STAGE_LENGTH;
    const i = Math.min(n - 2, Math.floor(progress));
    const t = Math.min(1, progress - i);
    const a = points[i];
    const b = points[i + 1];
    const jx = a.px + (b.px - a.px) * t;
    const jy = a.py + (b.py - a.py) * t;
    ctx.translate(jx, jy - 18);
    ctx.fillStyle = '#ff3b3b';
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(-8, -2);
    ctx.arc(0, -4, 8, Math.PI * 0.85, Math.PI * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, -4, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function routeStatus(score: number): string {
  const i = stageIndexForScore(score);
  const stage = STAGES[i];
  if (i === STAGES.length - 1) return `${stage.name}: reta final`;
  const left = (i + 1) * STAGE_LENGTH - score;
  return `${stage.name}: faltam ${left} para a próxima região`;
}
