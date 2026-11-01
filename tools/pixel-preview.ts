/**
 * PRÉVIA: como o jogo ficaria todo em pixel art. Não está ligado ao jogo.
 * Abrir com `npm run dev` em /tools/pixel-preview.html.
 * Cena em meia resolução (180x320) ampliada sem suavizar.
 */
import { CHASERS } from '@/entities/chaser';
import { VARIANTS, variantSprite } from '@/entities/chaser-sprites';
import { PixelGrid } from '@/render/pixel';
import { pixelText, textWidth } from './pixel-font';

const W = 180;
const H = 320;
const GROUND = 292;
const OUT = '#1b1420';

// ---------- utilidades ----------

/** Céu em faixas com transição pontilhada (dither). */
function skyBands(g: PixelGrid, colors: string[], top: number, bottom: number) {
  const band = (bottom - top) / colors.length;
  for (let y = top; y < bottom; y++) {
    const i = Math.min(colors.length - 1, Math.floor((y - top) / band));
    const inBand = y - top - i * band;
    for (let x = 0; x < W; x++) {
      let c = colors[i];
      if (i < colors.length - 1 && inBand > band - 3 && (x + y) % 2 === 0) c = colors[i + 1];
      g.px(x, y, c);
    }
  }
}

function cloud(g: PixelGrid, x: number, y: number, s: number, light = '#ffffff', shade = '#d6e6f5') {
  g.ellipse(x, y, 6 * s, 3 * s, light).ellipse(x - 6 * s, y + 1, 4 * s, 2 * s, light).ellipse(x + 6 * s, y + 1, 4 * s, 2 * s, light);
  g.rect(x - 9 * s, y + 2 * s, 18 * s, 1, shade);
}

const stamp = (target: CanvasRenderingContext2D, grid: PixelGrid | HTMLCanvasElement, x: number, y: number) =>
  target.drawImage(grid instanceof PixelGrid ? grid.toCanvas() : grid, Math.round(x), Math.round(y));

// ---------- jatinho ----------

function jet(frame = 0): PixelGrid {
  const g = new PixelGrid(30, 16);
  // chama
  const flame = frame % 2 ? ['#ffd23f', '#ff8a00'] : ['#ff8a00', '#ff4d00'];
  g.rect(1, 7, 3, 2, flame[0]).rect(0, 7, 1, 2, flame[1]).px(2, 6, flame[1]).px(2, 9, flame[1]);
  // cauda
  g.rect(5, 2, 3, 5, '#d7deea').rect(6, 1, 2, 1, '#d7deea');
  // fuselagem
  g.rect(4, 6, 19, 5, '#f7f9fc').rect(23, 7, 3, 3, '#f7f9fc').px(26, 8, '#f7f9fc');
  g.rect(4, 10, 21, 1, '#c9d1e3'); // sombra de baixo
  g.rect(6, 8, 16, 1, '#1f9d48').rect(6, 9, 16, 1, '#ffd23f'); // faixa
  g.rect(21, 6, 3, 2, '#4fc3f7').px(24, 7, '#4fc3f7'); // cabine
  for (const x of [10, 13, 16]) g.px(x, 7, '#7aa7d9'); // janelinhas
  // asa
  g.rect(11, 11, 5, 1, '#b8c2d6').rect(9, 12, 5, 1, '#b8c2d6').rect(8, 13, 4, 1, '#b8c2d6');
  return g.outline(OUT);
}

// ---------- obstáculos ----------

/** Toga pendurada (de cima) + pilha de processos (de baixo). */
function togaTop(height: number): PixelGrid {
  // toga pendurada pelo cabide: ombros no alto, corpo abrindo em sino, mangas largas e gola branca
  const g = new PixelGrid(52, height + 4);
  const cx = 26;
  g.rect(cx - 1, 0, 2, 4, '#8f8f8f').rect(cx - 9, 4, 18, 2, '#8f8f8f'); // cabide
  for (let y = 6; y < height; y++) {
    const t = (y - 6) / (height - 6);
    const half = Math.round(12 + t * 8);
    g.rect(cx - half, y, half * 2, 1, '#17171f');
  }
  for (let x = cx - 18; x <= cx + 18; x += 6) g.line(x, 14, x + (x < cx ? -2 : 2), height - 2, '#2a2a38'); // pregas
  g.rect(cx - 25, height - 26, 7, 22, '#17171f').rect(cx + 18, height - 26, 7, 22, '#17171f'); // mangas
  g.rect(cx - 25, height - 6, 7, 2, '#2a2a38').rect(cx + 18, height - 6, 7, 2, '#2a2a38');
  for (let x = cx - 20; x < cx + 20; x++) g.px(x, height - 1 + ((x >> 1) % 2), '#17171f'); // barra ondulada
  g.rect(cx - 6, 6, 12, 5, '#f2f2f2').rect(cx - 3, 11, 6, 4, '#f2f2f2').rect(cx - 1, 15, 2, 2, '#f2f2f2'); // gola
  for (let y = 20; y < height - 4; y += 8) g.rect(cx - 1, y, 2, 2, '#e0b23a'); // botões
  return g.outline(OUT);
}

function processStack(height: number, seed: number): PixelGrid {
  const g = new PixelGrid(44, height + 2);
  const colors = [['#e8d9a8', '#cdb97c'], ['#9cc3e6', '#6d9cc9'], ['#f2b9a0', '#d88f70'], ['#d9e6b0', '#aec27a']];
  let y = height;
  let i = seed;
  while (y > 0) {
    const h = 5 + (i % 3);
    const w = 32 + ((i * 7) % 6);
    const x = 3 + ((i * 5) % 6);
    const [c, d] = colors[i % colors.length];
    const top = Math.max(0, y - h);
    g.rect(x, top, w, y - top, c).rect(x, y - 1, w, 1, d);
    g.rect(x + 2, top + 1, w - 4, 1, '#ffffff'); // folhas
    if (h > 5) g.rect(x + w - 8, top + 2, 4, 1, '#b33a3a'); // etiqueta
    y = top;
    i++;
  }
  return g.outline(OUT);
}

function balloon(color: string, r: number): PixelGrid {
  const g = new PixelGrid(r * 2 + 4, r * 2 + 12);
  const cx = r + 2;
  g.line(cx, r * 2 + 2, cx + 1, r * 2 + 10, '#e8eef7');
  g.ellipse(cx, r + 1, r - 1, r, color);
  g.px(cx - r + 3, r - 3, '#ffffff').px(cx - r + 4, r - 4, '#ffffff');
  g.rect(cx - 1, r * 2 + 1, 3, 1, color);
  pixelText(g, 'CPI', cx - 5, r - 1, '#ffffff');
  return g.outline(OUT);
}

function helicopter(frame = 0): PixelGrid {
  const g = new PixelGrid(52, 26);
  // hélice com borrão de movimento
  const blade = frame % 2 ? 22 : 16;
  for (let x = 20 - blade; x <= 20 + blade; x++) if (x % 2 === 0 || Math.abs(x - 20) < 6) g.px(x, 2, '#5b6573');
  g.rect(19, 3, 3, 3, '#3c444f');
  // corpo, cauda e esqui
  g.ellipse(18, 12, 12, 7, '#1f2b3d').rect(28, 10, 20, 4, '#1f2b3d').rect(45, 5, 4, 9, '#1f2b3d');
  g.rect(8, 8, 8, 5, '#7fd3ff').rect(8, 8, 3, 2, '#c4ecff'); // vidro
  pixelText(g, 'PF', 18, 10, '#ffd23f');
  g.rect(10, 21, 20, 1, '#5b6573').px(14, 20, '#5b6573').px(24, 20, '#5b6573');
  g.rect(3, 13, 2, 2, frame % 2 ? '#ffffff' : '#ff3b3b'); // luz
  return g.outline(OUT);
}

function radar(towerHeight: number, frame = 0): PixelGrid {
  const g = new PixelGrid(40, towerHeight + 80);
  const top = 80;
  // feixe em cone pontilhado
  for (let y = 0; y < top - 10; y++) {
    const half = Math.round(3 + (top - 10 - y) * 0.18);
    for (let x = 20 - half; x <= 20 + half; x++) if ((x + y + frame) % 3 === 0) g.px(x, y, 'rgba(255,70,70,0.75)');
  }
  // prato
  g.ellipse(20, top - 6, 11, 4, '#d0d6de').rect(10, top - 6, 21, 2, '#a7b0bd');
  g.rect(19, top - 3, 3, 4, '#8a94a3');
  g.px(20, top - 12, frame % 2 ? '#ff3b3b' : '#7a1010');
  // torre treliçada
  g.rect(14, top, 12, towerHeight, '#5b6573');
  for (let y = top; y < top + towerHeight; y += 8) {
    g.line(14, y, 25, y + 7, '#3c444f').line(25, y, 14, y + 7, '#3c444f').rect(14, y, 12, 1, '#3c444f');
  }
  return g.outline(OUT);
}

// ---------- fundos ----------

type Region = 'brasilia' | 'litoral' | 'oceano' | 'fronteira';

function background(region: Region): PixelGrid {
  const g = new PixelGrid(W, H);

  if (region === 'brasilia') {
    skyBands(g, ['#3a7bd5', '#4f93e0', '#69a9ea', '#86bff2', '#a6d4f7', '#c6e6fb'], 0, GROUND);
    g.ellipse(150, 40, 9, 9, '#fff3b0').ellipse(150, 40, 7, 7, '#ffe066');
    cloud(g, 40, 60, 1);
    cloud(g, 120, 95, 1);
    cloud(g, 70, 140, 0.7);
    const far = '#86a9cc';
    // Congresso: torres gêmeas, cúpula e "tigela"
    g.rect(20, 262, 90, 6, far);
    g.rect(58, 222, 5, 40, far).rect(65, 222, 5, 40, far);
    g.ellipse(36, 262, 11, 8, far);
    for (let x = 80; x <= 104; x++) {
      const d = Math.round(Math.sqrt(Math.max(0, 1 - ((x - 92) / 13) ** 2)) * 8);
      g.rect(x, 254, 1, d + 2, far);
    }
    // Catedral (coroa)
    for (let i = 0; i < 8; i++) g.line(140 + i * 2, 268, 136 + i * 3, 236, far);
    g.rect(134, 262, 26, 6, far);
    // cerrado
    g.rect(0, 268, W, 24, '#6f9a49');
    for (const x of [8, 52, 118, 168]) {
      g.line(x, 288, x + 2, 274, '#5a3a22', 2).ellipse(x + 3, 271, 6, 4, '#4f7a33').px(x, 270, '#6f9a49');
    }
  }

  if (region === 'litoral') {
    skyBands(g, ['#ff6f61', '#ff8a65', '#ffa270', '#ffbd80', '#ffd796', '#ffe8b0'], 0, 240);
    g.ellipse(90, 238, 22, 22, '#ffd23f');
    for (const y of [228, 233, 237]) g.rect(68, y, 45, 1, '#ffa270');
    cloud(g, 40, 70, 1, '#ffe3c7', '#ffbf99');
    cloud(g, 140, 110, 0.8, '#ffe3c7', '#ffbf99');
    // prédios da orla
    for (const [x, w, h] of [[0, 14, 40], [14, 10, 55], [24, 16, 32], [150, 12, 48], [162, 18, 36]]) {
      g.rect(x, 240 - h, w, h, '#8a5a7a');
      for (let wy = 240 - h + 4; wy < 236; wy += 6) for (let wx = x + 2; wx < x + w - 2; wx += 4) g.px(wx, wy, '#ffd796');
    }
    // mar
    for (let y = 240; y < 270; y++) g.rect(0, y, W, 1, y % 4 === 0 ? '#2f8fb8' : '#2779a3');
    for (let i = 0; i < 18; i++) g.rect((i * 37) % W, 243 + ((i * 11) % 24), 4, 1, '#ffd796');
    // areia e coqueiros
    g.rect(0, 270, W, 22, '#e8cf8f');
    for (let i = 0; i < 40; i++) g.px((i * 29) % W, 272 + ((i * 7) % 18), '#cdb06a');
    for (const x of [20, 150]) {
      g.line(x, 290, x + 6, 250, '#7a5230', 2);
      for (const [dx, dy] of [[-12, 4], [12, 4], [-8, -4], [9, -5], [0, -7]]) g.line(x + 6, 250, x + 6 + dx, 250 + dy, '#2f8f4e', 2);
    }
  }

  if (region === 'oceano') {
    skyBands(g, ['#1e4f91', '#2f6db3', '#4a8ccf', '#6ea9e0', '#9cc8ef'], 0, 210);
    cloud(g, 50, 50, 1);
    cloud(g, 140, 90, 0.8);
    // ilha e navio no horizonte
    g.ellipse(150, 212, 18, 5, '#3c7a4a').line(150, 208, 152, 194, '#7a5230').line(152, 194, 160, 197, '#2f8f4e').line(152, 194, 144, 197, '#2f8f4e');
    g.rect(30, 203, 34, 6, '#4a5566').rect(36, 197, 10, 6, '#4a5566').rect(40, 190, 2, 7, '#4a5566').rect(37, 189, 8, 1, '#c9d1e3');
    // oceano em faixas de onda
    for (let y = 210; y < H; y++) {
      const c = y < 240 ? '#2a6fb0' : y < 270 ? '#1f5f9c' : '#174b80';
      g.rect(0, y, W, 1, c);
    }
    for (let row = 0; row < 8; row++) {
      const y = 214 + row * 12;
      for (let x = (row % 2) * 8; x < W; x += 16) g.rect(x, y, 6, 1, '#6fb4ec').px(x + 2, y - 1, '#cfe8ff');
    }
    g.rect(0, GROUND, W, 2, '#cfe8ff'); // espuma na linha do "chão"
  }

  if (region === 'fronteira') {
    skyBands(g, ['#1d1238', '#2c1848', '#3a1f52', '#5e2d63', '#8a3d64', '#b8535e', '#d9775a'], 0, GROUND);
    for (let i = 0; i < 40; i++) g.px((i * 53) % W, (i * 31) % 120, i % 5 ? '#ffffff' : '#ffd23f');
    g.ellipse(140, 45, 7, 7, '#f4f1e1').ellipse(143, 43, 6, 6, '#2c1848'); // lua
    // montanhas em duas camadas
    for (let x = 0; x < W; x++) {
      const h1 = 70 + Math.round(Math.sin(x / 22) * 18 + Math.sin(x / 9) * 5);
      g.rect(x, GROUND - h1, 1, h1, '#4a2f63');
      const h2 = 40 + Math.round(Math.sin(x / 15 + 1) * 10);
      g.rect(x, GROUND - h2, 1, h2, '#5d3a5e');
    }
    // cerca com arame farpado
    for (let x = 4; x < W; x += 16) g.rect(x, 262, 2, 30, '#8a6a4a');
    for (const y of [266, 274, 282]) for (let x = 0; x < W; x++) g.px(x, y + ((x >> 3) % 2 ? 0 : 0), x % 4 === 0 ? '#c9c9c9' : '#8f8f8f');
    // placa
    g.rect(14, 246, 50, 14, '#2f6b3a').rect(15, 247, 48, 12, '#3d8a4a');
    pixelText(g, 'FRONTEIRA', 16, 250, '#ffffff');
    g.rect(26, 260, 2, 8, '#8a6a4a').rect(50, 260, 2, 8, '#8a6a4a');
  }

  // chão
  if (region !== 'oceano') {
    const ground = { brasilia: ['#a0522d', '#8a4524', '#7da84f'], litoral: ['#e0c27a', '#c9a95f', '#e8cf8f'], fronteira: ['#6b5236', '#57422b', '#7d6a3f'] }[region];
    g.rect(0, GROUND, W, H - GROUND, ground[0]);
    g.rect(0, GROUND, W, 2, ground[2]);
    for (let i = 0; i < 60; i++) g.px((i * 23) % W, GROUND + 4 + ((i * 13) % (H - GROUND - 6)), ground[1]);
  }
  return g;
}

// ---------- HUD ----------

function hud(g: PixelGrid, threat: number, name: string) {
  g.rect(5, 6, 66, 6, OUT).rect(6, 7, 64, 4, '#0b1d3a');
  const fill = threat > 0.66 ? '#ff3b3b' : threat > 0.33 ? '#ffb000' : '#4caf50';
  g.rect(6, 7, Math.round(64 * threat), 4, fill).rect(6, 7, Math.round(64 * threat), 1, '#ffffff55');
  pixelText(g, `${name} NA COLA`, 6, 14, '#ffffff');
  // botão de pausa
  g.rect(160, 5, 15, 15, OUT).rect(161, 6, 13, 13, '#24406f').rect(164, 9, 3, 7, '#ffffff').rect(168, 9, 3, 7, '#ffffff');
}

function score(g: PixelGrid, value: number) {
  const text = String(value);
  const size = 4;
  const x = Math.round(W / 2 - textWidth(text, size) / 2);
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1]]) pixelText(g, text, x + dx, 30 + dy, OUT, size);
  pixelText(g, text, x, 30, '#ffffff', size);
}

// ---------- montagem ----------

function scene(region: Region, opts: { score: number; threat: number; chaser: number; variant: number }): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  stamp(ctx, background(region), 0, 0);

  // obstáculos variam por região
  if (region === 'brasilia') {
    stamp(ctx, togaTop(110), 95, 0);
    stamp(ctx, processStack(GROUND - 200, 1), 99, 200);
  } else if (region === 'litoral') {
    const colors = ['#e53935', '#fb8c00', '#8e24aa'];
    [24, 48, 72].forEach((y, i) => stamp(ctx, balloon(colors[i % 3], 9), 110, y));
    [196, 222, 248].forEach((y, i) => stamp(ctx, balloon(colors[(i + 1) % 3], 9), 112, y));
  } else if (region === 'oceano') {
    stamp(ctx, helicopter(1), 105, 120);
  } else {
    stamp(ctx, radar(GROUND - 190), 110, 110);
  }

  // perseguidor, jatinho, HUD
  const profile = CHASERS[opts.chaser];
  const sprite = variantSprite(profile.id, VARIANTS[profile.id][opts.variant]);
  stamp(ctx, sprite, -6 + opts.threat * 30, 132);
  stamp(ctx, jet(1), 52, 150);

  const top = new PixelGrid(W, H);
  hud(top, opts.threat, profile.name.split(' ')[0]);
  score(top, opts.score);
  stamp(ctx, top, 0, 0);
  return canvas;
}

function menu(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  stamp(ctx, background('brasilia'), 0, 0);
  const t = new PixelGrid(W, H);
  const title = (text: string, y: number, color: string, size: number) => {
    const x = Math.round(W / 2 - textWidth(text, size) / 2);
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [2, 2], [1, 2], [2, 1]]) pixelText(t, text, x + dx, y + dy, OUT, size);
    pixelText(t, text, x, y, color, size);
  };
  title('JATINHO', 50, '#ffd23f', 5);
  title('DO FLÁVIO', 82, '#ffffff', 3);
  // painel
  t.rect(24, 170, 132, 60, OUT).rect(25, 171, 130, 58, '#0b1d3a').rect(26, 172, 128, 1, '#ffd23f');
  const center = (text: string, y: number, color: string) => pixelText(t, text, Math.round(W / 2 - textWidth(text) / 2), y, color);
  center('TOQUE PARA VOAR', 180, '#ffffff');
  center('CADA BATIDA DEIXA', 192, '#c9d1e3');
  center('O PERSEGUIDOR MAIS PERTO', 200, '#c9d1e3');
  center('RECORDE: 12', 216, '#ffd23f');
  const tx = Math.round(W / 2 - textWidth('TOQUE PARA DECOLAR') / 2);
  t.rect(tx - 4, 248, textWidth('TOQUE PARA DECOLAR') + 8, 13, OUT).rect(tx - 3, 249, textWidth('TOQUE PARA DECOLAR') + 6, 11, '#ffd23f');
  pixelText(t, 'TOQUE PARA DECOLAR', tx, 252, '#0b1d3a');
  stamp(ctx, t, 0, 0);
  stamp(ctx, jet(0), 75, 128);
  return canvas;
}

// ---------- página ----------

const sheet = document.getElementById('sheet')!;

function show(id: string, caption: string, canvas: HTMLCanvasElement, scale: number) {
  const fig = document.createElement('figure');
  fig.dataset.asset = id;
  const big = document.createElement('canvas');
  big.width = canvas.width * scale;
  big.height = canvas.height * scale;
  const ctx = big.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(canvas, 0, 0, big.width, big.height);
  const cap = document.createElement('figcaption');
  cap.textContent = caption;
  fig.append(big, cap);
  sheet.append(fig);
}

const asCanvas = (g: PixelGrid) => g.toCanvas();

show('pixel-tela-menu', 'Menu', menu(), 3);
show('pixel-cena-brasilia', 'Brasília: toga pendurada + pilha de processos', scene('brasilia', { score: 7, threat: 0.25, chaser: 0, variant: 1 }), 3);
show('pixel-cena-litoral', 'Litoral: balões da CPI', scene('litoral', { score: 23, threat: 0.5, chaser: 1, variant: 1 }), 3);
show('pixel-cena-oceano', 'Oceano: helicóptero da PF', scene('oceano', { score: 44, threat: 0.4, chaser: 2, variant: 1 }), 3);
show('pixel-cena-fronteira', 'Fronteira: radar', scene('fronteira', { score: 66, threat: 0.8, chaser: 1, variant: 2 }), 3);

show('pixel-jatinho', 'Jatinho (2 quadros da chama)', (() => {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 18;
  const ctx = c.getContext('2d')!;
  stamp(ctx, jet(0), 0, 1);
  stamp(ctx, jet(1), 33, 1);
  return c;
})(), 8);
show('pixel-toga', 'Toga pendurada (de cima)', asCanvas(togaTop(70)), 5);
show('pixel-processos', 'Pilha de processos (de baixo)', asCanvas(processStack(70, 2)), 5);
show('pixel-baloes', 'Balões da CPI', (() => {
  const c = document.createElement('canvas');
  c.width = 72;
  c.height = 34;
  const ctx = c.getContext('2d')!;
  ['#e53935', '#fb8c00', '#8e24aa'].forEach((color, i) => stamp(ctx, balloon(color, 9), i * 24, 2));
  return c;
})(), 6);
show('pixel-helicoptero', 'Helicóptero da PF', asCanvas(helicopter(1)), 6);
show('pixel-radar', 'Radar (torre + feixe em cone)', asCanvas(radar(40)), 4);
for (const r of ['brasilia', 'litoral', 'oceano', 'fronteira'] as Region[]) {
  show(`pixel-fundo-${r}`, `Fundo: ${r}`, asCanvas(background(r)), 2);
}
