/**
 * Desenha cada asset do jogo isolado, para revisão visual e prints (docs/ASSETS.md).
 * Abrir com `npm run dev` em /tools/asset-sheet.html, ou gerar os PNGs com
 * `node tools/capture-assets.cjs` (precisa do Playwright).
 */
import { WORLD } from '@/core/config';
import { CHASERS, Chaser, drawChaser } from '@/entities/chaser';
import { VARIANTS, variantSprite } from '@/entities/chaser-sprites';
import { Jet } from '@/entities/jet';
import type { Obstacle } from '@/entities/obstacles';
import { FerrisWheel, GATES, Gate, Pelicans, Searchlight } from '@/entities/obstacles-extra';
import { obstaclePreview } from '@/entities/obstacle-preview';
import { scenery } from '@/render/scenery';
import { OBSTACLE_INFO } from '@/systems/collection';
import { OBSTACLE_KINDS } from '@server/types';
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
  figure(id, caption, 76, 76, 4, (ctx) => {
    const jet = new Jet(38);
    jet.vy = vy;
    ctx.translate(38 - 110, 0); // o jatinho desenha em x = 110
    jet.render(ctx);
  });
}

// --- perseguidores: todas as variantes em pixel art (6x)
for (const profile of CHASERS) {
  for (const variant of VARIANTS[profile.id]) {
    const w = variantSprite(profile.id, variant).width + 4;
    figure(`perseguidor-${profile.id}-${variant.id}`, `${profile.name} ${variant.label}`, w, 38, 6, (ctx) =>
      drawChaser(ctx, profile, variant, w / 2, 19, 1)
    );
  }
}

// --- perseguidores no tamanho do jogo, sobre o fundo
figure('perseguidores-no-jogo', 'Todas as variantes no tamanho real do jogo (2x)', WORLD.width, CHASERS.length * 76 + 20, 2, (ctx) => {
  const bg = new Background();
  ctx.save();
  ctx.translate(0, -400);
  bg.render(ctx, 0);
  ctx.restore();
  CHASERS.forEach((profile, row) =>
    VARIANTS[profile.id].forEach((variant, col) => drawChaser(ctx, profile, variant, 60 + col * 120, 45 + row * 76))
  );
}, false);

// --- barra de perigo em três níveis (HUD)
const levels: [string, number][] = [['baixo', 0.2], ['medio', 0.5], ['alto', 0.9]];
for (const [label, threat] of levels) {
  figure(`hud-perigo-${label}`, `HUD: perseguidor e barra de perigo (${label})`, 200, 110, 2, (ctx) => {
    ctx.fillStyle = '#4aa3df';
    ctx.fillRect(0, 0, 200, 110);
    const chaser = new Chaser(CHASERS[0], VARIANTS.lula[1]);
    chaser.bump(threat);
    for (let i = 0; i < 200; i++) chaser.update(1 / 60);
    chaser.threat = threat;
    chaser.render(ctx, 70);
  }, false);
}

// --- obstáculos: miniaturas dos 16 (4 por parada)
for (const kind of OBSTACLE_KINDS) {
  figure(`obstaculo-${kind}`, `Obstáculo: ${OBSTACLE_INFO[kind].name}`, 60, 60, 4, (ctx) => ctx.drawImage(obstaclePreview(kind), 0, 0));
}

// --- obstáculos novos em movimento, no tamanho do jogo
const live: [string, string, () => Obstacle, number][] = [
  ['obstaculo-jogo-roda', 'Roda-gigante La Perla no jogo', () => new FerrisWheel(90), 0.4],
  ['obstaculo-jogo-cataratas', "Jatos d'água no jogo", () => new Gate(150, 300, 220, GATES.cataratas), 0.4],
  ['obstaculo-jogo-holofote', 'Holofote da imigração no jogo', () => new Searchlight(150), 0.5],
  ['obstaculo-jogo-pelicanos', 'Pelicanos no jogo', () => new Pelicans(90, 250), 0.3]
];
for (const [id, caption, make, t] of live) {
  figure(id, caption, WORLD.width, WORLD.height, 1, (ctx) => {
    new Background().render(ctx, STAGES.find((st) => OBSTACLE_INFO[make().kind].detail.startsWith(st.name))?.fromScore ?? 0);
    const o = make();
    o.update(t, 0);
    o.render(ctx);
  }, false);
}

// --- fundos das quatro regiões
for (const [id, name] of [['estrada', 'Viagem: estrada até Foz'], ['andes', 'Viagem: sobrevoo dos Andes'], ['caribe', 'Viagem: mar do Caribe']] as const) {
  figure(`viagem-${id}`, name, WORLD.width, WORLD.height, 1.5, (ctx) => {
    const layers = scenery(id);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(layers.sky, 0, 0, WORLD.width, WORLD.height);
    if (layers.sun) ctx.drawImage(layers.sun, 0, 0, WORLD.width, WORLD.height);
    for (const l of layers.layers) ctx.drawImage(l.canvas, 0, 0, WORLD.width, WORLD.height);
  }, false);
}

STAGES.forEach((stage, i) => {
  figure(`fundo-${i + 1}-${stage.id}`, `Fundo: ${stage.name} (${stage.fromScore}+ pontos)`, WORLD.width, WORLD.height, 1.5, (ctx) => {
    const bg = new Background();
    bg.update(1, 120);
    bg.render(ctx, stage.fromScore);
  }, false);
});

// --- mapa da rota em três momentos
const maps: [string, string, number, number][] = [
  ['mapa-inicio', 'Mapa: saindo de Brasília (10 pontos)', 10, 0],
  ['mapa-iguazu', 'Mapa: voando de Puerto Iguazú para Guayaquil (60 pontos)', 60, 1],
  ['mapa-miami', 'Mapa: em Miami, rota completa (140 pontos)', 140, 3]
];
for (const [id, caption, score, reveal] of maps) {
  figure(id, caption, 236, 236, 2, (ctx) => drawRouteMap(ctx, 0, 0, 236, 236, { revealUpTo: reveal, score }), false);
}
