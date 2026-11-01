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

// ---------- Puerto Iguazú (fronteira Brasil–Argentina) ----------

function iguazu(): SceneryLayers {
  const sky = new PixelGrid(W, H);
  skyBands(sky, ['#4f97d6', '#64a8de', '#7db8e6', '#98c9ee', '#b4d9f4', '#d2e9f8'], 0, G);
  const sun = new PixelGrid(W, H).ellipse(36, 70, 8, 8, '#fff3b0').ellipse(36, 70, 6, 6, '#ffe066');

  // cataratas: paredão com quedas d'água e névoa
  const falls = new PixelGrid(W, H);
  tiled((dx) => {
    for (let x = 0; x < W; x++) {
      const top = 196 + Math.round(Math.sin(x / 9) * 3 + Math.sin(x / 23) * 4);
      falls.rect(x + dx, top, 1, 6, '#2f6b3a').rect(x + dx, top + 6, 1, 56, (x >> 2) % 3 ? '#4f5f3e' : '#5f6f48');
    }
    for (const [x, w] of [[4, 16], [26, 10], [42, 22], [70, 12], [88, 24], [118, 10], [134, 18], [158, 14]]) {
      for (let y = 202; y < 258; y++) {
        for (let i = 0; i < w; i++) falls.px(x + i + dx, y, (i + y) % 3 === 0 ? '#cfe8ff' : '#ffffff');
      }
    }
    for (let i = 0; i < 90; i++) falls.px((i * 13) % W + dx, 252 + ((i * 7) % 10), i % 2 ? '#ffffff' : '#e6f3ff'); // névoa
  });

  // Ponte Tancredo Neves: metade verde-amarela (Brasil), metade azul e branca (Argentina)
  const bridge = new PixelGrid(W, H);
  bridge.rect(0, 262, W, 14, '#8a6a3a');
  for (let x = 0; x < W; x += 6) bridge.rect(x, 266 + (x % 12 ? 0 : 2), 3, 1, '#a88352');
  const half = W / 2;
  for (let x = 0; x < W; x++) {
    const br = x < half;
    const deck = br ? (Math.floor(x / 6) % 2 ? '#2fa34f' : '#ffd23f') : Math.floor(x / 6) % 2 ? '#6cb4ee' : '#ffffff';
    bridge.rect(x, 246, 1, 3, deck).px(x, 249, '#3c444f');
    if (x % 8 === 0) bridge.rect(x, 241, 1, 5, '#3c444f');
    // arco embaixo
    const a = Math.round(Math.sqrt(Math.max(0, 1 - ((x - half) / (half - 6)) ** 2)) * 14);
    bridge.px(x, 262 - a, br ? '#2fa34f' : '#6cb4ee').px(x, 263 - a, '#3c444f');
  }
  bridge.rect(0, 240, W, 1, '#3c444f');

  const near = new PixelGrid(W, H);
  near.rect(0, 280, W, 12, '#1f5a2e');
  tiled((dx) => {
    for (const [x, r] of [[10, 9], [34, 7], [70, 10], [104, 8], [140, 11], [170, 7]]) {
      near.ellipse(x + dx, 280, r, 8, '#1f5a2e').ellipse(x + 2 + dx, 277, r - 3, 5, '#2f7a3e');
    }
  });

  return {
    sky: sky.toCanvas(),
    sun: sun.toCanvas(),
    layers: [
      { canvas: clouds([[60, 50, 1], [150, 90, 0.8], [100, 130, 0.6]]), factor: 0.08 },
      { canvas: falls.toCanvas(), factor: 0.15 },
      { canvas: bridge.toCanvas(), factor: 0.3 },
      { canvas: near.toCanvas(), factor: 0.55 },
      { canvas: ground(['#a0522d', '#8a4524', '#7da84f']), factor: 1 }
    ]
  };
}

// ---------- Guayaquil (Equador) ----------

function guayaquil(): SceneryLayers {
  const sky = new PixelGrid(W, H);
  skyBands(sky, ['#2f7fd0', '#4b95da', '#6aabe3', '#8ec2ec', '#b5d8f3', '#f2e4b8'], 0, G);
  const sun = new PixelGrid(W, H).ellipse(140, 58, 9, 9, '#fff3b0').ellipse(140, 58, 7, 7, '#ffd23f');

  // Andes ao longe + Cerro Santa Ana com casinhas coloridas e farol
  const far = new PixelGrid(W, H);
  for (let x = 0; x < W; x++) {
    const a = (x / W) * Math.PI * 2;
    const h = 46 + Math.round(Math.sin(a * 2) * 10 + Math.sin(a * 5 + 1) * 4);
    far.rect(x, 250 - h, 1, h, '#8fb0cf');
    if (h > 52) far.rect(x, 250 - h, 1, 2, '#ffffff'); // neve
  }
  tiled((dx) => {
    far.ellipse(52 + dx, 252, 34, 26, '#4f8a4a');
    const houses = ['#ff6b6b', '#ffd23f', '#6cb4ee', '#ff9ad5', '#ffffff', '#7bd389'];
    for (let i = 0; i < 26; i++) {
      const x = 26 + ((i * 11) % 52);
      const y = 232 + ((i * 7) % 18);
      if (Math.abs(x - 52) / 34 + Math.abs(y - 252) / 26 < 1.05) far.rect(x + dx, y, 3, 3, houses[i % houses.length]).px(x + dx, y + 1, '#3c444f');
    }
    // farol listrado no alto
    for (let y = 212; y < 228; y++) far.rect(50 + dx, y, 5, 1, Math.floor(y / 3) % 2 ? '#2f6fd6' : '#ffffff');
    far.rect(49 + dx, 209, 7, 3, '#ffd23f').rect(51 + dx, 207, 3, 2, '#3c444f');
    // roda-gigante La Perla no Malecón
    const cx = 132 + dx;
    far.ellipse(cx, 230, 16, 16, '#ffffff').ellipse(cx, 230, 15, 15, '#8fc4ea');
    for (let k = 0; k < 8; k++) {
      const ang = (k / 8) * Math.PI * 2;
      far.line(cx, 230, cx + Math.round(Math.cos(ang) * 15), 230 + Math.round(Math.sin(ang) * 15), '#ffffff');
      far.rect(cx + Math.round(Math.cos(ang) * 15) - 1, 230 + Math.round(Math.sin(ang) * 15) - 1, 3, 3, ['#ff6b6b', '#ffd23f', '#6cb4ee'][k % 3]);
    }
    far.line(cx, 230, cx - 8, 252, '#ffffff').line(cx, 230, cx + 8, 252, '#ffffff');
  });

  // rio Guayas
  const river = new PixelGrid(W, H);
  river.rect(0, 252, W, 18, '#5f7f5a');
  tiled((dx) => {
    for (let i = 0; i < 22; i++) river.rect((i * 31) % W + dx, 254 + ((i * 5) % 14), 5, 1, '#8fae84');
  });

  // Malecón: palmeiras e grade
  const near = new PixelGrid(W, H);
  near.rect(0, 272, W, 2, '#ffffff').rect(0, 276, W, 1, '#ffffff');
  for (let x = 0; x < W; x += 6) near.rect(x, 272, 1, 8, '#ffffff');
  tiled((dx) => {
    for (const x of [24, 90, 150]) {
      near.line(x + dx, 291, x + 3 + dx, 252, '#7a5230', 2);
      for (const [ox, oy] of [[-12, 4], [12, 4], [-8, -4], [9, -5], [0, -7]]) near.line(x + 3 + dx, 252, x + 3 + ox + dx, 252 + oy, '#2f8f4e', 2);
    }
  });

  return {
    sky: sky.toCanvas(),
    sun: sun.toCanvas(),
    layers: [
      { canvas: clouds([[40, 60, 1], [120, 100, 0.8]]), factor: 0.08 },
      { canvas: far.toCanvas(), factor: 0.18 },
      { canvas: river.toCanvas(), factor: 0.35 },
      { canvas: near.toCanvas(), factor: 0.55 },
      { canvas: ground(['#cdbb9a', '#b3a07e', '#e6d8bb']), factor: 1 }
    ]
  };
}

// ---------- Miami (EUA) ----------

function miami(): SceneryLayers {
  const sky = new PixelGrid(W, H);
  skyBands(sky, ['#2a1b5e', '#4a237a', '#7a2a8a', '#b8357f', '#e85d75', '#ff9a6b', '#ffc78a'], 0, 250);
  const sun = new PixelGrid(W, H).ellipse(120, 214, 26, 26, '#ffd23f').ellipse(120, 222, 26, 18, '#ff9a3d');
  for (const y of [206, 214, 221, 227, 232]) sun.rect(92, y, 56, y > 220 ? 2 : 1, '#e85d75');
  
  // prédios de Brickell com janelas acesas
  const far = new PixelGrid(W, H);
  tiled((dx) => {
    for (const [x, w, h] of [[2, 14, 70], [18, 10, 96], [30, 16, 60], [50, 12, 110], [64, 18, 80], [88, 10, 66], [150, 14, 90], [166, 12, 74]]) {
      far.rect(x + dx, 250 - h, w, h, '#2b2350');
      for (let wy = 250 - h + 4; wy < 246; wy += 5) for (let wx = x + 2; wx < x + w - 2; wx += 3) if ((wx + wy) % 4) far.px(wx + dx, wy, (wx * wy) % 7 ? '#ff9ad5' : '#7ef2ff');
    }
  });

  // mar azul-turquesa com brilho
  const sea = new PixelGrid(W, H);
  for (let y = 250; y < 268; y++) sea.rect(0, y, W, 1, y % 3 ? '#1aa6b7' : '#23bccc');
  tiled((dx) => {
    for (let i = 0; i < 20; i++) sea.rect((i * 37) % W + dx, 252 + ((i * 7) % 14), 4, 1, '#ffd2a8');
  });

  // orla: hotéis art déco em tons pastel, letreiro neon, palmeiras, posto de salva-vidas
  const near = new PixelGrid(W, H);
  near.rect(0, 268, W, 24, '#f2dcae');
  tiled((dx) => {
    const deco = [[6, 30, 28, '#ffb3c7'], [96, 34, 34, '#9fe7e0']] as const;
    for (const [x, w, h, c] of deco) {
      near.rect(x + dx, 288 - h, w, h, c).rect(x + dx, 288 - h, w, 3, '#ffffff');
      near.rect(x + w / 2 - 2 + dx, 288 - h - 6, 4, 6, c);
      for (let wy = 288 - h + 6; wy < 284; wy += 6) for (let wx = x + 3; wx < x + w - 3; wx += 5) near.rect(wx + dx, wy, 3, 3, '#3c6e8f');
    }
    pixelText(near, 'HOTEL', 10 + dx, 262, '#ff3fa4');
    pixelText(near, 'HOTEL', 102 + dx, 256, '#7ef2ff');
    // salva-vidas
    near.rect(60 + dx, 272, 14, 8, '#ffd23f').rect(60 + dx, 270, 14, 2, '#ff5a5a').rect(62 + dx, 280, 2, 10, '#8a6a4a').rect(70 + dx, 280, 2, 10, '#8a6a4a');
    for (const x of [48, 140, 172]) {
      near.line(x + dx, 291, x + 4 + dx, 246, '#7a5230', 2);
      for (const [ox, oy] of [[-13, 5], [13, 5], [-9, -4], [10, -5], [0, -8]]) near.line(x + 4 + dx, 246, x + 4 + ox + dx, 246 + oy, '#1f8a5a', 2);
    }
  });

  return {
    sky: sky.toCanvas(),
    sun: sun.toCanvas(),
    layers: [
      { canvas: far.toCanvas(), factor: 0.15 },
      { canvas: sea.toCanvas(), factor: 0.3 },
      { canvas: near.toCanvas(), factor: 0.55 },
      { canvas: ground(['#e8cf8f', '#cdb06a', '#f2dcae']), factor: 1 }
    ]
  };
}

const BUILDERS: Record<RegionId, () => SceneryLayers> = { brasilia, iguazu, guayaquil, miami };
const cache = new Map<RegionId, SceneryLayers>();

export function scenery(region: RegionId): SceneryLayers {
  let s = cache.get(region);
  if (!s) {
    s = BUILDERS[region]();
    cache.set(region, s);
  }
  return s;
}
