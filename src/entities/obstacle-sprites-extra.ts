import { pixelText } from '@/render/pixel-font';
import { PixelGrid } from '@/render/pixel';

/**
 * Sprites dos obstáculos de cada parada (1 pixel da arte = 2 do jogo).
 * Peças "de cima" e "de baixo" são desenhadas bem altas e posicionadas pela ponta;
 * o que sobra fica fora da tela (assim podem se mexer sem redesenhar).
 */
const OUT = '#1b1420';
const cache = new Map<string, HTMLCanvasElement>();
const cached = (key: string, build: () => PixelGrid, outline = true) => {
  let c = cache.get(key);
  if (!c) {
    const g = build();
    c = (outline ? g.outline(OUT) : g).toCanvas();
    cache.set(key, c);
  }
  return c;
};

/** Altura máxima de uma peça de cima/de baixo (pixels da arte). */
export const PIECE_H = 300;

// ---------- Brasília: Cúpulas do Congresso ----------

/** De cima: duas torres brancas terminando na "tigela" da Câmara (aberta para cima). */
export const cupulaTop = () =>
  cached('cupula-top', () => {
    const g = new PixelGrid(40, PIECE_H);
    g.rect(10, 0, 8, PIECE_H - 12, '#e9edf2').rect(22, 0, 8, PIECE_H - 12, '#e9edf2');
    g.rect(16, 0, 2, PIECE_H - 12, '#c9d1dc').rect(28, 0, 2, PIECE_H - 12, '#c9d1dc');
    for (let y = 6; y < PIECE_H - 14; y += 6) g.rect(10, y, 20, 1, '#9fb0c4'); // janelas
    for (let x = 0; x < 40; x++) {
      const d = Math.round(Math.sqrt(Math.max(0, 1 - ((x - 19.5) / 20) ** 2)) * 10);
      g.rect(x, PIECE_H - 12, 1, Math.max(1, 11 - d + 1), '#f4f6f9');
    }
    g.rect(0, PIECE_H - 12, 40, 2, '#c9d1dc');
    return g;
  });

/** De baixo: pilar com a cúpula do Senado (abobadada) na ponta. */
export const cupulaBottom = () =>
  cached('cupula-bottom', () => {
    const g = new PixelGrid(40, PIECE_H);
    g.ellipse(20, 12, 18, 11, '#f4f6f9').rect(2, 12, 36, 2, '#c9d1dc');
    g.ellipse(14, 7, 3, 2, '#ffffff');
    g.rect(6, 14, 28, PIECE_H - 14, '#e9edf2').rect(30, 14, 4, PIECE_H - 14, '#c9d1dc');
    for (let x = 9; x < 30; x += 5) g.rect(x, 18, 2, PIECE_H - 18, '#d5dce6'); // colunas
    return g;
  });

// ---------- Puerto Iguazú ----------

/** Cortina d'água (de cima), 2 quadros. */
export const waterTop = (frame: number) =>
  cached(`water-top:${frame}`, () => {
    const g = new PixelGrid(36, PIECE_H);
    for (let y = 0; y < PIECE_H; y++) {
      for (let x = 2; x < 34; x++) g.px(x, y, (x + Math.floor((y + frame * 3) / 3)) % 4 === 0 ? '#cfe8ff' : (x % 6 < 3 ? '#ffffff' : '#e6f3ff'));
    }
    for (let x = 0; x < 36; x += 2) g.rect(x, PIECE_H - 4 + ((x + frame) % 4 === 0 ? 1 : 0), 2, 3, '#ffffff'); // espuma
    return g;
  });

/** Pedras com névoa (de baixo). */
export const rocksBottom = () =>
  cached('rocks-bottom', () => {
    const g = new PixelGrid(36, PIECE_H);
    g.rect(2, 8, 32, PIECE_H - 8, '#4f5f3e');
    g.ellipse(10, 9, 9, 6, '#5f6f48').ellipse(26, 8, 9, 7, '#55653f').ellipse(18, 6, 6, 5, '#6b7c50');
    for (let i = 0; i < 30; i++) g.px(3 + ((i * 7) % 30), 16 + ((i * 13) % (PIECE_H - 20)), '#3f4d31');
    for (let x = 0; x < 36; x += 3) g.rect(x, 0, 2, 2, '#ffffff'); // névoa
    return g;
  });

/** Cancela da fronteira (poste listrado com braço), de cima e de baixo. */
export const gatePiece = (fromTop: boolean) =>
  cached(`gate:${fromTop}`, () => {
    const g = new PixelGrid(30, PIECE_H);
    const end = fromTop ? PIECE_H - 1 : 0;
    for (let y = 0; y < PIECE_H; y++) g.rect(11, y, 8, 1, Math.floor(y / 6) % 2 ? '#d33a2c' : '#f7f7f7');
    // braço horizontal na ponta (barreira)
    const by = fromTop ? PIECE_H - 7 : 2;
    for (let x = 0; x < 30; x++) g.rect(x, by, 1, 5, Math.floor(x / 5) % 2 ? '#d33a2c' : '#f7f7f7');
    g.rect(12, fromTop ? end - 12 : 8, 6, 4, '#ffd23f'); // luz
    return g;
  });

/** Quati (pula do chão), 2 quadros. */
export const quatiSprite = (frame: number) =>
  cached(`quati:${frame}`, () => {
    const g = new PixelGrid(30, 18);
    g.ellipse(14, 10, 8, 5, '#9a6b3f').ellipse(22, 8, 4, 3, '#9a6b3f').rect(24, 8, 5, 2, '#9a6b3f');
    g.rect(27, 8, 2, 1, '#2b2118').px(22, 6, '#2b2118').px(21, 4, '#9a6b3f');
    g.rect(16, 11, 6, 2, '#d8c3a0'); // barriga
    for (let i = 0; i < 6; i++) g.rect(2 + i, 4 - (frame ? i % 2 : 0) + i, 2, 2, i % 2 ? '#3b2a1e' : '#c9a476'); // rabo listrado
    const leg = frame ? 1 : 0;
    g.rect(9, 14, 2, 3 - leg, '#3b2a1e').rect(19, 14, 2, 2 + leg, '#3b2a1e');
    return g;
  });

/** Cuia de chimarrão com bomba, em 4 ângulos. */
export const cuiaSprite = (step: number) =>
  cached(`cuia:${step}`, () => {
    const g = new PixelGrid(26, 26);
    g.ellipse(13, 15, 8, 8, '#7a9a3a').ellipse(13, 9, 6, 2, '#5a7a2a').ellipse(13, 9, 5, 1, '#3f5a1a');
    g.rect(6, 13, 14, 2, '#c99a10'); // aro
    g.line(15, 9, 19, 2, '#d0d6de', 2);
    g.ellipse(10, 16, 2, 3, '#9aba5a');
    return g.rotated(step * (Math.PI / 2));
  });

// ---------- Guayaquil ----------

/** Cabine da roda-gigante. */
export const cabinSprite = (color: string) =>
  cached(`cabin:${color}`, () => {
    const g = new PixelGrid(12, 11);
    g.rect(5, 0, 2, 2, '#d0d6de').rect(1, 2, 10, 8, color).rect(2, 3, 8, 3, '#cfe8ff').rect(1, 9, 10, 1, '#3c444f');
    return g;
  });

/** Iguana (pula de baixo), 2 quadros. */
export const iguanaSprite = (frame: number) =>
  cached(`iguana:${frame}`, () => {
    const g = new PixelGrid(34, 14);
    g.ellipse(15, 8, 8, 4, '#4f9a3a').ellipse(25, 6, 4, 3, '#4f9a3a').px(27, 5, '#1b1420');
    for (let x = 9; x < 24; x += 2) g.px(x, 3, '#2f6a22'); // espinhos
    g.rect(24, 9, 3, 2, '#e0a030'); // papo
    for (let i = 0; i < 9; i++) g.px(7 - i, 8 + Math.round(Math.sin(i / 2 + frame) * 1.5), '#3f8a2e'); // rabo
    g.rect(10, 11, 2, frame ? 2 : 3, '#2f6a22').rect(19, 11, 2, frame ? 3 : 2, '#2f6a22');
    return g;
  });

/** Bananas: cacho pendurado (de cima) e caixas empilhadas (de baixo). */
export const bananaPiece = (fromTop: boolean) =>
  cached(`banana:${fromTop}`, () => {
    const g = new PixelGrid(36, PIECE_H);
    if (fromTop) {
      g.rect(17, 0, 2, PIECE_H - 26, '#8a6a4a'); // corda
      for (let r = 0; r < 4; r++) {
        for (let b = 0; b < 5 - Math.abs(r - 1); b++) {
          const x = 6 + r * 1 + b * 5;
          const y = PIECE_H - 26 + r * 6;
          g.rect(x, y, 4, 6, '#ffd23f').px(x, y + 5, '#7a5a20').px(x + 3, y, '#c99a10');
        }
      }
      g.rect(14, PIECE_H - 28, 8, 3, '#5a7a2a');
    } else {
      for (let y = 0; y < PIECE_H; y += 12) {
        g.rect(1, y, 34, 11, '#a8743f').rect(1, y, 34, 1, '#c9945f').rect(1, y + 10, 34, 1, '#7a522a');
        g.rect(17, y, 2, 11, '#7a522a');
        if (y === 0) for (let x = 3; x < 33; x += 5) g.rect(x, -3 + 3, 4, 3, '#ffd23f');
        if (y === 12) pixelText(g, 'EC', 7, y + 3, '#5a3a1a');
      }
      for (let x = 3; x < 33; x += 6) g.rect(x, 0, 5, 3, '#ffd23f').px(x, 2, '#7a5a20');
    }
    return g;
  });

// ---------- Miami ----------

/** Prédio de vidro (de cima ou de baixo). */
export const towerPiece = (fromTop: boolean) =>
  cached(`tower:${fromTop}`, () => {
    const g = new PixelGrid(36, PIECE_H);
    g.rect(2, 0, 32, PIECE_H, '#2b5f8a').rect(2, 0, 4, PIECE_H, '#3d7bb0');
    for (let y = 3; y < PIECE_H - 2; y += 6) for (let x = 8; x < 32; x += 6) g.rect(x, y, 4, 4, (x * y) % 7 ? '#7ec8f2' : '#ffd2a8');
    const edge = fromTop ? PIECE_H - 4 : 0;
    g.rect(0, edge, 36, 4, '#d9e6f2');
    if (!fromTop) g.rect(16, -1 + 1, 4, 3, '#ff3fa4');
    return g;
  });

/** Pelicano em voo, 2 quadros. */
export const pelicanSprite = (frame: number) =>
  cached(`pelican:${frame}`, () => {
    const g = new PixelGrid(26, 16);
    g.ellipse(12, 9, 7, 3, '#e9e4da').ellipse(20, 7, 3, 2, '#e9e4da').rect(22, 7, 4, 2, '#e8a33a').px(20, 6, '#1b1420');
    if (frame) g.rect(6, 2, 10, 2, '#cfc8bb').rect(8, 4, 6, 2, '#cfc8bb');
    else g.rect(6, 11, 10, 2, '#cfc8bb').rect(8, 13, 6, 2, '#cfc8bb');
    return g;
  });

/** Jacaré saltando. */
export const gatorSprite = () =>
  cached('gator', () => {
    const g = new PixelGrid(48, 18);
    g.rect(4, 7, 30, 7, '#3f7a3a').rect(34, 8, 12, 4, '#3f7a3a').rect(34, 12, 12, 2, '#2f5a2a');
    for (let x = 6; x < 32; x += 3) g.px(x, 6, '#2f5a2a');
    for (let x = 36; x < 46; x += 2) g.px(x, 12, '#ffffff'); // dentes
    g.px(37, 8, '#ffd23f');
    for (let i = 0; i < 6; i++) g.rect(3 - i, 9 + Math.floor(i / 2), 2, 2, '#3f7a3a'); // rabo
    g.rect(10, 14, 3, 3, '#2f5a2a').rect(26, 14, 3, 3, '#2f5a2a');
    g.rect(8, 11, 24, 2, '#c9d18a'); // barriga
    return g;
  });

/** Base do holofote (caminhão com refletor). */
export const searchlightBase = () =>
  cached('searchlight', () => {
    const g = new PixelGrid(34, 20);
    g.rect(2, 8, 30, 10, '#e9edf2').rect(2, 8, 30, 2, '#2b5f8a');
    pixelText(g, 'CBP', 6, 11, '#2b5f8a');
    g.ellipse(9, 18, 3, 2, '#1b1420').ellipse(26, 18, 3, 2, '#1b1420');
    g.ellipse(17, 5, 6, 4, '#3c444f').ellipse(17, 4, 4, 2, '#fff3b0');
    return g;
  });
