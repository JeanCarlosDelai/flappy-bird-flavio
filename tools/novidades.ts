import { CHASERS } from '@/entities/chaser';
import { VARIANTS, variantSprite } from '@/entities/chaser-sprites';
import { obstaclePreview } from '@/entities/obstacle-preview';
import { jetSprite } from '@/entities/jet';
import { SKINS } from '@/entities/skins';
import { OBSTACLE_INFO } from '@/systems/collection';
import type { ObstacleKind } from '@server/types';

/** Prancha das novidades (perseguidores, obstáculos e aviões novos). Só desenvolvimento. */
const sheet = document.getElementById('sheet')!;
const NEW_CHASERS = ['gleisi', 'haddad', 'lindbergh', 'boulos', 'erika', 'kim'];
const GROUPS: [string, ObstacleKind[]][] = [
  ['Brasília: obstáculos dos partidos (só aparecem em Brasília)', ['estrela', 'blusinhas', 'picanha', 'lona', 'sol', 'faixas', 'outdoor', 'livros', 'drones']],
  ['Puerto Iguazú: novos', ['tucanos', 'marco', 'bote']],
  ['Guayaquil: novos', ['atobas', 'relogio', 'chapeu']],
  ['Miami: novos', ['flamingos', 'aviao-faixa', 'foguete']]
];
const NEW_SKINS = ['jatinho-22', 'aerolula', 'balao', 'lona', 'caca', 'hidroaviao', 'helicoptero'];

function scaled(src: HTMLCanvasElement, scale: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = src.width * scale;
  c.height = src.height * scale;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(src, 0, 0, c.width, c.height);
  return c;
}

function section(title: string, items: [HTMLCanvasElement, string, boolean?][]): void {
  const h = document.createElement('h2');
  h.textContent = title;
  const grid = document.createElement('div');
  grid.className = 'grid';
  for (const [canvas, label, wide] of items) {
    const fig = document.createElement('figure');
    if (wide) fig.className = 'wide';
    const cap = document.createElement('figcaption');
    cap.textContent = label;
    fig.append(canvas, cap);
    grid.append(fig);
  }
  sheet.append(h, grid);
}

for (const id of NEW_CHASERS) {
  const profile = CHASERS.find((c) => c.id === id)!;
  section(
    `${profile.name} (ataque: ${profile.attack})`,
    VARIANTS[profile.id].map((v) => [scaled(variantSprite(profile.id, v), 3), `${profile.name} ${v.label}`])
  );
}
for (const [title, kinds] of GROUPS) {
  section(title, kinds.map((k) => [scaled(obstaclePreview(k), 2), OBSTACLE_INFO[k].name]));
}
section(
  'Aviões novos (Hangar)',
  NEW_SKINS.map((id) => [scaled(jetSprite(0, 0, id), 3), SKINS.find((s) => s.id === id)!.name])
);
