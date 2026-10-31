/**
 * Desenha cada asset do jogo isolado, para revisão visual e prints (docs/ASSETS.md).
 * Abrir com `npm run dev` em /tools/asset-sheet.html, ou gerar os PNGs com
 * `node tools/capture-assets.cjs` (precisa do Playwright).
 */
import { WORLD } from '@/core/config';
import { CHASERS, Chaser, drawChaserHead } from '@/entities/chaser';
import { Jet } from '@/entities/jet';
import { Balloons, Helicopter, Radar, TogaBarrier, type Obstacle } from '@/entities/obstacles';
import { Background } from '@/render/background';
import { drawRouteMap } from '@/render/map';
import { STAGES } from '@/render/stages';

const sheet = document.getElementById('sheet')!;

function figure(id: string, caption: string, w: number, h: number, scale: number, draw: (ctx: CanvasRenderingContext2D) => void, checker = true) {
  const fig = document.createElement('figure');
  fig.dataset.asset = id;
  const canvas = document.createElement('canvas');
  if (checker) canvas.className = 'checker';
  canvas.width = w * scale;
  canvas.height = h * scale;
  canvas.style.width = `${w * scale}px`;
  canvas.style.height = `${h * scale}px`;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);
  draw(ctx);
  const cap = document.createElement('figcaption');
  cap.textContent = caption;
  fig.append(canvas, cap);
  sheet.append(fig);
}

// --- jatinho: parado, subindo, caindo
const jetStates: [string, string, number][] = [
  ['jet-neutro', 'Jatinho (reto)', 0],
  ['jet-subindo', 'Jatinho (subindo)', -420],
  ['jet-caindo', 'Jatinho (caindo)', 620]
];
for (const [id, caption, vy] of jetStates) {
  figure(id, caption, 90, 60, 4, (ctx) => {
    const jet = new Jet(30);
    jet.vy = vy;
    ctx.translate(45 - 110, 0); // o jatinho desenha em x = 110
    jet.render(ctx);
  });
}

// --- perseguidores: só a cabeça
for (const profile of CHASERS) {
  figure(`perseguidor-${profile.id}`, `Perseguidor: ${profile.name}`, 60, 60, 4, (ctx) =>
    drawChaserHead(ctx, profile, 30, 30)
  );
}

// --- barra de perigo em três níveis (HUD)
const levels: [string, number][] = [['baixo', 0.2], ['medio', 0.5], ['alto', 0.9]];
for (const [label, threat] of levels) {
  figure(`hud-perigo-${label}`, `HUD: perseguidor e barra de perigo (${label})`, 200, 110, 2, (ctx) => {
    ctx.fillStyle = '#4aa3df';
    ctx.fillRect(0, 0, 200, 110);
    const chaser = new Chaser(CHASERS[0]);
    chaser.bump(threat);
    for (let i = 0; i < 200; i++) chaser.update(1 / 60);
    chaser.threat = threat;
    chaser.render(ctx, 70);
  }, false);
}

// --- obstáculos sobre o fundo de Brasília
const obstacles: [string, string, () => Obstacle][] = [
  ['obstaculo-toga', 'Obstáculo: barreira de toga', () => new TogaBarrier(150, 300, 190)],
  ['obstaculo-cpi', 'Obstáculo: balões da CPI', () => new Balloons(158, 300, 210)],
  ['obstaculo-pf', 'Obstáculo: helicóptero da PF', () => new Helicopter(140, 300)],
  ['obstaculo-radar', 'Obstáculo: radar (torre + feixe)', () => new Radar(160, 190)]
];
for (const [id, caption, make] of obstacles) {
  figure(id, caption, WORLD.width, WORLD.height, 1.5, (ctx) => {
    new Background().render(ctx, 0);
    const o = make();
    o.update(0.35, 0);
    o.render(ctx);
  }, false);
}

// --- fundos das quatro regiões
STAGES.forEach((stage, i) => {
  figure(`fundo-${i + 1}-${stage.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()}`, `Fundo: ${stage.name} (${stage.fromScore}+ pontos)`, WORLD.width, WORLD.height, 1.5, (ctx) => {
    const bg = new Background();
    bg.update(1, 120);
    bg.render(ctx, stage.fromScore);
  }, false);
});

// --- mapa da rota em três momentos
const maps: [string, string, number, number][] = [
  ['mapa-inicio', 'Mapa: início (0 pontos)', 0, 0],
  ['mapa-litoral', 'Mapa: no Litoral (27 pontos)', 27, 1],
  ['mapa-fronteira', 'Mapa: na Fronteira, tudo revelado (70 pontos)', 70, 3]
];
for (const [id, caption, score, reveal] of maps) {
  figure(id, caption, 288, 150, 2, (ctx) => drawRouteMap(ctx, 0, 0, 288, 150, { revealUpTo: reveal, score }));
}
