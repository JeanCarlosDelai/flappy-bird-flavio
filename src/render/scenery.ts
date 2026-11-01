import { WORLD } from '@/core/config';
import { pixelText } from './pixel-font';
import { PixelGrid, PX } from './pixel';
import type { RegionId } from './stages';

/**
 * Cenários em pixel art, em meia resolução (180x320). Cada região tem camadas que
 * se repetem na horizontal (largura de 1 tela) e andam em velocidades diferentes.
 */
export const ART_W = WORLD.width / PX; // 180
export const ART_H = WORLD.height / PX; // 320
export const ART_GROUND = (WORLD.height - WORLD.groundHeight) / PX; // 292

export interface SceneryLayers {
  /** Fixo: céu e estrelas. */
  sky: HTMLCanvasElement;
  /** Sol ou lua (separado para não repetir quando a tela é larga). */
  sun?: HTMLCanvasElement;
  /** Camadas que rolam, de trás para frente, com a fração da velocidade do jogo. */
  layers: { canvas: HTMLCanvasElement; factor: number }[];
}

const W = ART_W;
const H = ART_H;
const G = ART_GROUND;

/** Repete o desenho em -W, 0 e +W para a camada emendar sem corte. */
const tiled = (draw: (dx: number) => void) => [-W, 0, W].forEach(draw);

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

function cloud(g: PixelGrid, x: number, y: number, s: number, light: string, shade: string) {
  g.ellipse(x, y, 6 * s, 3 * s, light).ellipse(x - 6 * s, y + 1, 4 * s, 2 * s, light).ellipse(x + 6 * s, y + 1, 4 * s, 2 * s, light);
  g.rect(Math.round(x - 9 * s), Math.round(y + 2 * s), Math.round(18 * s), 1, shade);
}

function clouds(spots: [number, number, number][], light = '#ffffff', shade = '#d6e6f5'): HTMLCanvasElement {
  const g = new PixelGrid(W, H);
  tiled((dx) => spots.forEach(([x, y, s]) => cloud(g, x + dx, y, s, light, shade)));
  return g.toCanvas();
}

function ground(colors: [string, string, string]): HTMLCanvasElement {
  const g = new PixelGrid(W, H);
  g.rect(0, G, W, H - G, colors[0]).rect(0, G, W, 2, colors[2]);
  for (let i = 0; i < 70; i++) g.px((i * 23) % W, G + 4 + ((i * 13) % (H - G - 6)), colors[1]);
  for (let x = 0; x < W; x += 12) g.rect(x, G + 2, 6, 1, colors[1]);
  return g.toCanvas();
}

// ---------- Brasília ----------

function brasilia(): SceneryLayers {
  const sky = new PixelGrid(W, H);
  skyBands(sky, ['#3a7bd5', '#4f93e0', '#69a9ea', '#86bff2', '#a6d4f7', '#c6e6fb'], 0, G);
  const sun = new PixelGrid(W, H).ellipse(152, 122, 9, 9, '#fff3b0').ellipse(152, 122, 7, 7, '#ffe066');

  const far = new PixelGrid(W, H);
  const c = '#86a9cc';
  tiled((dx) => {
    far.rect(20 + dx, 262, 90, 6, c);
    far.rect(58 + dx, 222, 5, 40, c).rect(65 + dx, 222, 5, 40, c);
    far.ellipse(36 + dx, 262, 11, 8, c);
    for (let x = 80; x <= 104; x++) {
      const d = Math.round(Math.sqrt(Math.max(0, 1 - ((x - 92) / 13) ** 2)) * 8);
      far.rect(x + dx, 254, 1, d + 2, c);
    }
    for (let i = 0; i < 8; i++) far.line(140 + i * 2 + dx, 268, 136 + i * 3 + dx, 236, c);
    far.rect(134 + dx, 262, 26, 6, c);
  });

  const near = new PixelGrid(W, H);
  near.rect(0, 268, W, 24, '#6f9a49');
  for (let x = 0; x < W; x += 3) near.px(x, 267 + (x % 2), '#7fae55');
  tiled((dx) => {
    for (const x of [8, 52, 118, 160]) {
      near.line(x + dx, 288, x + 2 + dx, 274, '#5a3a22', 2).ellipse(x + 3 + dx, 271, 6, 4, '#4f7a33').px(x + dx, 270, '#6f9a49');
    }
  });

  return {
    sky: sky.toCanvas(),
    sun: sun.toCanvas(),
    layers: [
      { canvas: clouds([[40, 60, 1], [120, 95, 1], [70, 140, 0.7]]), factor: 0.08 },
      { canvas: far.toCanvas(), factor: 0.2 },
      { canvas: near.toCanvas(), factor: 0.5 },
      { canvas: ground(['#a0522d', '#8a4524', '#7da84f']), factor: 1 }
    ]
  };
}

// ---------- Litoral ----------

function litoral(): SceneryLayers {
  const sky = new PixelGrid(W, H);
  skyBands(sky, ['#ff6f61', '#ff8a65', '#ffa270', '#ffbd80', '#ffd796', '#ffe8b0'], 0, 240);
  sky.ellipse(90, 238, 22, 22, '#ffd23f');
  for (const y of [228, 233, 237]) sky.rect(68, y, 45, 1, '#ffa270');
  for (let y = 240; y < G; y++) sky.rect(0, y, W, 1, y % 4 === 0 ? '#2f8fb8' : '#2779a3');

  const far = new PixelGrid(W, H);
  tiled((dx) => {
    for (const [x, w, h] of [[0, 14, 40], [14, 10, 55], [24, 16, 32], [130, 12, 48], [142, 18, 36], [160, 12, 44]]) {
      far.rect(x + dx, 240 - h, w, h, '#8a5a7a');
      for (let wy = 240 - h + 4; wy < 236; wy += 6) for (let wx = x + 2; wx < x + w - 2; wx += 4) far.px(wx + dx, wy, '#ffd796');
    }
    for (let i = 0; i < 18; i++) far.rect((i * 37) % W + dx, 243 + ((i * 11) % 24), 4, 1, '#ffd796');
  });

  const near = new PixelGrid(W, H);
  near.rect(0, 270, W, 22, '#e8cf8f');
  for (let x = 0; x < W; x += 2) near.px(x, 270, '#ffffff');
  tiled((dx) => {
    for (let i = 0; i < 30; i++) near.px((i * 29) % W + dx, 273 + ((i * 7) % 16), '#cdb06a');
    for (const x of [20, 110]) {
      near.line(x + dx, 290, x + 6 + dx, 250, '#7a5230', 2);
      for (const [ox, oy] of [[-12, 4], [12, 4], [-8, -4], [9, -5], [0, -7]]) near.line(x + 6 + dx, 250, x + 6 + ox + dx, 250 + oy, '#2f8f4e', 2);
    }
  });

  return {
    sky: sky.toCanvas(),
    layers: [
      { canvas: clouds([[40, 70, 1], [140, 110, 0.8]], '#ffe3c7', '#ffbf99'), factor: 0.08 },
      { canvas: far.toCanvas(), factor: 0.2 },
      { canvas: near.toCanvas(), factor: 0.5 },
      { canvas: ground(['#e0c27a', '#c9a95f', '#e8cf8f']), factor: 1 }
    ]
  };
}

// ---------- Oceano ----------

function oceano(): SceneryLayers {
  const sky = new PixelGrid(W, H);
  skyBands(sky, ['#1e4f91', '#2f6db3', '#4a8ccf', '#6ea9e0', '#9cc8ef'], 0, 210);
  for (let y = 210; y < H; y++) sky.rect(0, y, W, 1, y < 240 ? '#2a6fb0' : y < 270 ? '#1f5f9c' : '#174b80');

  const far = new PixelGrid(W, H);
  tiled((dx) => {
    far.ellipse(150 + dx, 212, 18, 5, '#3c7a4a').line(150 + dx, 208, 152 + dx, 194, '#7a5230');
    far.line(152 + dx, 194, 160 + dx, 197, '#2f8f4e').line(152 + dx, 194, 144 + dx, 197, '#2f8f4e');
    far.rect(30 + dx, 203, 34, 6, '#4a5566').rect(36 + dx, 197, 10, 6, '#4a5566').rect(40 + dx, 190, 2, 7, '#4a5566');
    far.rect(37 + dx, 189, 8, 1, '#c9d1e3');
  });

  const waves = new PixelGrid(W, H);
  tiled((dx) => {
    for (let row = 0; row < 8; row++) {
      const y = 214 + row * 12;
      for (let x = (row % 2) * 8; x < W; x += 16) waves.rect(x + dx, y, 6, 1, '#6fb4ec').px(x + 2 + dx, y - 1, '#cfe8ff');
    }
  });

  const surface = new PixelGrid(W, H);
  surface.rect(0, G, W, H - G, '#174b80').rect(0, G, W, 2, '#cfe8ff');
  for (let x = 0; x < W; x += 10) surface.rect(x, G + 2, 4, 1, '#6fb4ec').rect(x + 5, G + 6, 3, 1, '#2a6fb0');

  return {
    sky: sky.toCanvas(),
    layers: [
      { canvas: clouds([[50, 50, 1], [140, 90, 0.8]]), factor: 0.08 },
      { canvas: far.toCanvas(), factor: 0.15 },
      { canvas: waves.toCanvas(), factor: 0.5 },
      { canvas: surface.toCanvas(), factor: 1 }
    ]
  };
}

// ---------- Fronteira ----------

function fronteira(): SceneryLayers {
  const sky = new PixelGrid(W, H);
  skyBands(sky, ['#1d1238', '#2c1848', '#3a1f52', '#5e2d63', '#8a3d64', '#b8535e', '#d9775a'], 0, G);
  for (let i = 0; i < 40; i++) sky.px((i * 53) % W, (i * 31) % 120, i % 5 ? '#ffffff' : '#ffd23f');
  const moon = new PixelGrid(W, H).ellipse(140, 45, 7, 7, '#f4f1e1').ellipse(143, 43, 6, 6, '#2c1848');

  const far = new PixelGrid(W, H);
  const near = new PixelGrid(W, H);
  for (let x = 0; x < W; x++) {
    const a = (x / W) * Math.PI * 2;
    const h1 = 70 + Math.round(Math.sin(a * 2) * 18 + Math.sin(a * 5) * 5);
    far.rect(x, G - h1, 1, h1, '#4a2f63');
    const h2 = 40 + Math.round(Math.sin(a * 3 + 1) * 10);
    near.rect(x, G - h2, 1, h2, '#5d3a5e');
  }
  tiled((dx) => {
    for (let x = 4; x < W; x += 16) near.rect(x + dx, 262, 2, 30, '#8a6a4a');
    near.rect(14 + dx, 246, 50, 14, '#2f6b3a').rect(15 + dx, 247, 48, 12, '#3d8a4a');
    pixelText(near, 'FRONTEIRA', 16 + dx, 250, '#ffffff');
    near.rect(26 + dx, 260, 2, 8, '#8a6a4a').rect(50 + dx, 260, 2, 8, '#8a6a4a');
  });
  for (const y of [266, 274, 282]) for (let x = 0; x < W; x++) near.px(x, y, x % 4 === 0 ? '#c9c9c9' : '#8f8f8f');

  return {
    sky: sky.toCanvas(),
    sun: moon.toCanvas(),
    layers: [
      { canvas: far.toCanvas(), factor: 0.12 },
      { canvas: near.toCanvas(), factor: 0.4 },
      { canvas: ground(['#6b5236', '#57422b', '#7d6a3f']), factor: 1 }
    ]
  };
}

const BUILDERS: Record<RegionId, () => SceneryLayers> = { brasilia, litoral, oceano, fronteira };
const cache = new Map<RegionId, SceneryLayers>();

export function scenery(region: RegionId): SceneryLayers {
  let s = cache.get(region);
  if (!s) {
    s = BUILDERS[region]();
    cache.set(region, s);
  }
  return s;
}
