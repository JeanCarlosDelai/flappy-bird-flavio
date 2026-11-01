import { pixelText } from '@/render/pixel-font';
import { PixelGrid } from '@/render/pixel';

/** Sprites dos obstáculos em pixel art (1 pixel da arte = 2 do jogo). */

const OUT = '#1b1420';
const cache = new Map<string, HTMLCanvasElement>();
const cached = (key: string, build: () => PixelGrid) => {
  let c = cache.get(key);
  if (!c) {
    c = build().outline(OUT).toCanvas();
    cache.set(key, c);
  }
  return c;
};

/**
 * Toga pendurada (de cima), retangular: corpo de 32 px, mangas em bloco dos lados,
 * gola branca, botões dourados e barra reta com faixa dourada na ponta.
 * Grade com 4 px de margem de cada lado para as mangas.
 */
export const TOGA_MARGIN = 5;
export function togaSprite(height: number): HTMLCanvasElement {
  return cached(`toga:${height}`, () => {
    const body = 32;
    const m = TOGA_MARGIN;
    const g = new PixelGrid(body + m * 2, height + 1);
    g.rect(m, 0, body, height, '#17171f');
    for (let x = 5; x < body - 2; x += 6) g.rect(m + x, 0, 2, height - 3, '#262634'); // pregas retas
    // mangas em bloco (do alto até ~60% ou até 34 px)
    const sleeve = Math.max(6, Math.min(34, Math.round(height * 0.6)));
    g.rect(0, Math.max(0, height - sleeve - 3), m + 1, sleeve, '#17171f');
    g.rect(m + body - 1, Math.max(0, height - sleeve - 3), m + 1, sleeve, '#17171f');
    g.rect(0, height - 4, m + 1, 1, '#262634').rect(m + body - 1, height - 4, m + 1, 1, '#262634');
    // gola branca quadrada e botões (só aparecem se a toga for alta)
    if (height > 24) g.rect(m + 10, 0, 12, 5, '#f2f2f2').rect(m + 13, 5, 6, 3, '#f2f2f2');
    for (let y = 12; y < height - 6; y += 8) g.rect(m + 15, y, 2, 2, '#e0b23a');
    // barra reta com faixa dourada
    g.rect(m, height - 3, body, 2, '#e0b23a').rect(m, height - 1, body, 1, '#17171f');
    return g;
  });
}

/** Pilha de processos (de baixo): pastas coloridas empilhadas, levemente tortas. */
export function processSprite(height: number, seed: number): HTMLCanvasElement {
  return cached(`proc:${height}:${seed}`, () => {
    const g = new PixelGrid(40, height + 1);
    const colors = [['#e8d9a8', '#cdb97c'], ['#9cc3e6', '#6d9cc9'], ['#f2b9a0', '#d88f70'], ['#d9e6b0', '#aec27a']];
    let y = height;
    let i = seed;
    while (y > 0) {
      const h = 5 + (i % 3);
      const w = 30 + ((i * 7) % 5);
      const x = 2 + ((i * 5) % 5);
      const [c, d] = colors[i % colors.length];
      const top = Math.max(0, y - h);
      g.rect(x, top, w, y - top, c).rect(x, y - 1, w, 1, d);
      if (y - top > 2) g.rect(x + 2, top + 1, w - 4, 1, '#ffffff');
      if (h > 5 && y - top > 3) g.rect(x + w - 8, top + 2, 4, 1, '#b33a3a');
      y = top;
      i++;
    }
    return g;
  });
}

export const BALLOON_COLORS = ['#e53935', '#fb8c00', '#8e24aa'];

/** Balão da CPI com brilho e cordinha. Centro do balão em (r + 2, r + 1). */
export function balloonSprite(color: string, r: number): HTMLCanvasElement {
  return cached(`balloon:${color}:${r}`, () => {
    const g = new PixelGrid(r * 2 + 4, r * 2 + 12);
    const cx = r + 2;
    g.line(cx, r * 2 + 2, cx + 1, r * 2 + 10, '#e8eef7');
    g.ellipse(cx, r + 1, r - 1, r, color);
    g.px(cx - r + 3, r - 3, '#ffffff').px(cx - r + 4, r - 4, '#ffffff');
    g.rect(cx - 1, r * 2 + 1, 3, 1, color);
    pixelText(g, 'CPI', cx - 5, r - 1, '#ffffff');
    return g;
  });
}

/** Helicóptero da PF (52x26), dois quadros para a hélice e a luz. */
export function helicopterSprite(frame: number): HTMLCanvasElement {
  return cached(`heli:${frame}`, () => {
    const g = new PixelGrid(52, 26);
    const blade = frame ? 22 : 16;
    for (let x = 20 - blade; x <= 20 + blade; x++) if (x % 2 === 0 || Math.abs(x - 20) < 6) g.px(x, 2, '#5b6573');
    g.rect(19, 3, 3, 3, '#3c444f');
    g.ellipse(18, 12, 12, 7, '#1f2b3d').rect(28, 10, 20, 4, '#1f2b3d').rect(45, 5, 4, 9, '#1f2b3d');
    g.rect(8, 8, 8, 5, '#7fd3ff').rect(8, 8, 3, 2, '#c4ecff');
    pixelText(g, 'PF', 18, 10, '#ffd23f');
    g.rect(10, 21, 20, 1, '#5b6573').px(14, 20, '#5b6573').px(24, 20, '#5b6573');
    g.rect(3, 13, 2, 2, frame ? '#ffffff' : '#ff3b3b');
    return g;
  });
}

/** Torre do radar treliçada com prato (26 de largura; torre de x=7 a x=18). */
export const RADAR_DISH = 14;
export function radarSprite(towerHeight: number, frame: number): HTMLCanvasElement {
  return cached(`radar:${towerHeight}:${frame}`, () => {
    const g = new PixelGrid(26, towerHeight + RADAR_DISH);
    const top = RADAR_DISH;
    const dish = frame ? 11 : 8;
    g.ellipse(13, top - 6, dish, 4, '#d0d6de').rect(13 - dish, top - 6, dish * 2 + 1, 2, '#a7b0bd');
    g.rect(12, top - 3, 3, 4, '#8a94a3');
    g.px(13, top - 12, frame ? '#ff3b3b' : '#7a1010');
    g.rect(7, top, 12, towerHeight, '#5b6573');
    for (let y = top; y < top + towerHeight; y += 8) {
      g.line(7, y, 18, y + 7, '#3c444f').line(18, y, 7, y + 7, '#3c444f').rect(7, y, 12, 1, '#3c444f');
    }
    return g;
  });
}
