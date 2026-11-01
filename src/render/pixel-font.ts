import type { PixelGrid } from '@/render/pixel';

/** Fonte pixelada 3x5 (maiúsculas, números e alguns sinais). */
const GLYPHS: Record<string, string> = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110',
  E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101',
  I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
  M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100',
  Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
  U: '101101101101111', V: '101101101010010', W: '101101111111101', X: '101101010101101',
  Y: '101101010010010', Z: '111001010100111',
  '0': '111101101101111', '1': '010110010010111', '2': '110001010100111', '3': '110001010001110',
  '4': '101101111001001', '5': '111100110001110', '6': '011100111101111', '7': '111001010010010',
  '8': '111101111101111', '9': '111101111001110', '!': '010010010000010', '?': '110001010000010',
  '.': '000000000000010', ':': '000010000010000', '-': '000000111000000', ' ': '000000000000000',
  ',': '000000000010100', '+': '000010111010000', '%': '101001010100101', '/': '001001010100100',
  '(': '010100100100010', ')': '010001001001010', "'": '010010000000000', '·': '000000010000000'
};

/** Acentos: letra base + pontos (dx, dy) relativos ao topo da letra (dy negativo = acima). */
const ACCENTS: Record<string, [string, [number, number][]]> = {
  Á: ['A', [[1, -1], [2, -2]]], É: ['E', [[1, -1], [2, -2]]], Í: ['I', [[1, -1], [2, -2]]],
  Ó: ['O', [[1, -1], [2, -2]]], Ú: ['U', [[1, -1], [2, -2]]],
  Â: ['A', [[0, -1], [1, -2], [2, -1]]], Ê: ['E', [[0, -1], [1, -2], [2, -1]]], Ô: ['O', [[0, -1], [1, -2], [2, -1]]],
  Ã: ['A', [[0, -1], [1, -2], [2, -2]]], Õ: ['O', [[0, -1], [1, -2], [2, -2]]],
  À: ['A', [[1, -1], [0, -2]]], Ç: ['C', [[1, 5], [0, 6]]]
};

/** Pixels (coluna, linha) de um caractere, incluindo acento. */
function glyphPixels(ch: string): [number, number][] {
  const accent = ACCENTS[ch];
  const glyph = GLYPHS[accent ? accent[0] : ch] ?? GLYPHS['?'];
  const out: [number, number][] = [];
  for (let i = 0; i < 15; i++) if (glyph[i] === '1') out.push([i % 3, Math.floor(i / 3)]);
  if (accent) out.push(...accent[1]);
  return out;
}

/** Escreve texto na grade. `size` = tamanho de cada "pixel" da fonte. */
export function pixelText(g: PixelGrid, text: string, x: number, y: number, color: string, size = 1): number {
  let cx = x;
  for (const ch of text.replace(/…/g, '...').toUpperCase()) {
    for (const [px, py] of glyphPixels(ch)) g.rect(cx + px * size, y + py * size, size, size, color);
    cx += 4 * size;
  }
  return cx - x - size;
}

export const textWidth = (text: string, size = 1) => text.length * 4 * size - size;

/** Escreve direto no canvas (cada pixel da fonte vira um quadrado de `size`). */
export function drawPixelText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  color: string,
  options: { align?: 'left' | 'center' | 'right'; outline?: string; shadow?: boolean } = {}
): void {
  const width = textWidth(text, size);
  const left = Math.round(options.align === 'center' ? x - width / 2 : options.align === 'right' ? x - width : x);
  const top = Math.round(y);
  const paint = (dx: number, dy: number, c: string) => {
    ctx.fillStyle = c;
    let cx = left + dx;
    for (const ch of text.replace(/…/g, '...').toUpperCase()) {
      for (const [px, py] of glyphPixels(ch)) ctx.fillRect(cx + px * size, top + dy + py * size, size, size);
      cx += 4 * size;
    }
  };
  if (options.outline) {
    const o = Math.max(2, Math.round(size / 2));
    for (const [dx, dy] of [[-o, 0], [o, 0], [0, -o], [0, o], [-o, -o], [o, o], [-o, o], [o, -o]]) paint(dx, dy, options.outline);
    if (options.shadow) paint(o, o * 2, options.outline);
  }
  paint(0, 0, color);
}

/** Quebra o texto em linhas que caibam na largura. */
export function wrapPixelText(text: string, maxWidth: number, size: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (textWidth(next, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}
