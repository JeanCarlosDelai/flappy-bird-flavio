import { PixelGrid } from '@/render/pixel';

/**
 * Perseguidores em pixel art (meio corpo, 36x34 pixels).
 * Caricaturas propositalmente vagas: só os traços marcantes (cabelo, barba,
 * careca, roupa) e o objeto da variante. Nada de retrato.
 */

const C = {
  outline: '#1b1420',
  skin: '#e8b48f',
  skinShade: '#c98f6b',
  skinLight: '#f1c7a5',
  gray: '#c9c9c9',
  grayDark: '#9b9b9b',
  white: '#f7f7f7',
  paperLine: '#9aa3b5',
  eye: '#231a22',
  mouth: '#7a3b33',
  navy: '#24304f',
  navyLight: '#33426b',
  red: '#d33a2c',
  black: '#191920',
  blackLight: '#2c2c38',
  brown: '#5a3a22',
  brownLight: '#8a5a33',
  hairDark: '#3b2a1e',
  green: '#2e6b4a',
  greenLight: '#3d8a60',
  yellow: '#ffd23f',
  yellowDark: '#c99a10',
  blue: '#2f6fd6',
  blueLight: '#7fb2ff',
  gold: '#e0b23a',
  meat: '#a3402e',
  meatFat: '#f0d9c4',
  steel: '#b8c0cc',
  guitar: '#c8322a',
  guitarLight: '#e85a4a',
  stink: '#7bbf3a'
} as const;

const HEAD = { cx: 15, cy: 11, rx: 6, ry: 7 };

type Hair = 'grisalho' | 'careca' | 'escuro';
type Outfit = 'terno' | 'toga' | 'camiseta';

function base(hair: Hair, outfit: Outfit): PixelGrid {
  const g = new PixelGrid(36, 34);

  // corpo (ombros arredondados)
  const body = outfit === 'terno' ? C.navy : outfit === 'toga' ? C.black : C.green;
  const bodyLight = outfit === 'terno' ? C.navyLight : outfit === 'toga' ? C.blackLight : C.greenLight;
  g.rect(6, 21, 19, 12, body).rect(7, 20, 17, 1, body);
  g.rect(7, 21, 2, 11, bodyLight); // luz no ombro esquerdo
  if (outfit === 'terno') {
    g.rect(14, 20, 3, 4, C.white).rect(15, 21, 1, 7, C.red).rect(14, 21, 3, 1, C.red); // camisa + gravata
    g.px(13, 21, C.navyLight).px(17, 21, C.navyLight); // lapelas
  } else if (outfit === 'toga') {
    g.rect(12, 20, 7, 2, C.white).rect(13, 22, 5, 1, C.white).px(15, 23, C.white); // gola
  } else {
    g.rect(13, 20, 5, 1, C.greenLight); // gola da camiseta
  }

  // pescoço e cabeça
  g.rect(13, 17, 5, 3, C.skinShade);
  g.ellipse(HEAD.cx, HEAD.cy, HEAD.rx, HEAD.ry, C.skin);
  g.px(8, 11, C.skin).px(22, 11, C.skin).px(8, 12, C.skinShade).px(22, 12, C.skinShade); // orelhas
  g.rect(18, 7, 2, 7, C.skinLight); // luz lateral

  // olhos
  g.px(12, 11, C.eye).px(18, 11, C.eye);

  if (hair === 'grisalho') {
    // cabelo ralo nas laterais e topo, barba cheia
    g.rect(10, 4, 11, 2, C.gray).px(9, 6, C.gray).px(21, 6, C.gray);
    g.rect(9, 7, 1, 4, C.gray).rect(21, 7, 1, 4, C.gray);
    g.rect(11, 9, 3, 1, C.grayDark).rect(17, 9, 3, 1, C.grayDark); // sobrancelhas
    for (let y = 13; y <= 18; y++) for (let x = 8; x <= 22; x++) g.paintOver(x, y, C.gray);
    g.rect(11, 18, 9, 1, C.gray).rect(12, 19, 7, 1, C.gray); // queixo da barba
    g.rect(12, 13, 7, 1, C.grayDark); // bigode
    g.rect(14, 15, 3, 1, C.mouth);
  } else if (hair === 'careca') {
    // careca brilhando, sobrancelhas grossas e bravas
    g.rect(12, 5, 2, 1, C.white).px(12, 6, C.white).px(16, 4, C.skinLight);
    g.px(11, 9, C.eye).px(12, 9, C.eye).px(13, 10, C.eye);
    g.px(19, 9, C.eye).px(18, 9, C.eye).px(17, 10, C.eye);
    g.rect(13, 15, 5, 1, C.mouth).px(12, 16, C.mouth).px(18, 16, C.mouth); // boca fechada, séria
    g.rect(10, 13, 1, 2, C.skinShade).rect(20, 13, 1, 2, C.skinShade);
  } else {
    // cabelo escuro curto com franja, barba por fazer
    g.ellipse(15, 5, 7, 3, C.hairDark).rect(8, 6, 2, 4, C.hairDark).rect(21, 6, 2, 4, C.hairDark);
    g.rect(10, 7, 4, 1, C.hairDark).px(17, 7, C.hairDark);
    g.rect(11, 9, 3, 1, C.hairDark).rect(17, 9, 3, 1, C.hairDark);
    for (let y = 14; y <= 17; y++) for (let x = 9; x <= 21; x++) if ((x + y) % 2 === 0) g.paintOver(x, y, C.skinShade);
    g.rect(13, 15, 4, 1, C.mouth).px(17, 14, C.mouth); // meio sorriso
  }
  return g;
}

const hand = (g: PixelGrid, x: number, y: number) => g.rect(x, y, 2, 2, C.skin).px(x, y + 1, C.skinShade);

// ---------- variantes ----------

function lulaTerno(): PixelGrid {
  const g = base('grisalho', 'terno');
  hand(g, 24, 25); // aceno discreto
  g.rect(24, 21, 2, 4, C.navy);
  return g.outline(C.outline);
}

function lulaDecreto(): PixelGrid {
  const g = base('grisalho', 'terno');
  g.rect(23, 8, 9, 11, C.white); // papel
  for (const y of [10, 12, 14]) g.rect(24, y, 7, 1, C.paperLine);
  g.rect(24, 16, 4, 1, C.paperLine);
  g.rect(28, 16, 3, 2, C.red); // carimbo
  g.rect(23, 20, 2, 4, C.navy);
  hand(g, 23, 18);
  return g.outline(C.outline);
}

function lulaPicanha(): PixelGrid {
  const g = base('grisalho', 'terno');
  g.line(23, 23, 32, 4, C.steel); // espeto
  g.rect(25, 9, 5, 4, C.meat).rect(25, 10, 5, 1, C.meatFat); // pedaços de carne
  g.rect(26, 14, 4, 3, C.meat).rect(26, 14, 4, 1, C.meatFat);
  g.rect(23, 21, 2, 4, C.navy);
  hand(g, 22, 20);
  return g.outline(C.outline);
}

function xandaoToga(): PixelGrid {
  const g = base('careca', 'toga');
  // braços cruzados
  g.rect(9, 25, 13, 3, C.blackLight);
  hand(g, 9, 25);
  hand(g, 20, 25);
  return g.outline(C.outline);
}

function xandaoCaneta(): PixelGrid {
  const g = base('careca', 'toga');
  g.line(23, 21, 31, 4, C.blue, 2); // caneta gigante
  g.line(30, 6, 32, 2, C.gold, 2); // tampa dourada
  g.line(25, 17, 27, 13, C.blueLight); // brilho
  g.rect(22, 22, 2, 3, C.black); // ponta saindo por baixo da mão
  hand(g, 22, 20);
  return g.outline(C.outline);
}

function xandaoMartelo(): PixelGrid {
  const g = base('careca', 'toga');
  g.line(23, 22, 27, 11, C.brownLight, 2); // cabo
  g.rect(23, 6, 9, 5, C.brown).rect(26, 6, 2, 5, C.gold); // cabeça do martelo
  g.rect(23, 20, 2, 4, C.black);
  hand(g, 23, 19);
  return g.outline(C.outline);
}

function renanLivro(): PixelGrid {
  const g = base('escuro', 'camiseta');
  g.rect(9, 21, 13, 10, C.yellow); // livro amarelo na frente do peito
  g.rect(9, 21, 2, 10, C.yellowDark); // lombada
  g.rect(12, 24, 8, 1, C.black).rect(12, 26, 6, 1, C.yellowDark);
  hand(g, 7, 25);
  hand(g, 21, 25);
  return g.outline(C.outline);
}

function renanGuitarra(): PixelGrid {
  const g = base('escuro', 'camiseta');
  g.line(16, 25, 31, 10, C.brownLight, 2); // braço da guitarra
  g.rect(30, 6, 3, 5, C.black); // mão da guitarra
  g.ellipse(12, 27, 5, 4, C.guitar).ellipse(16, 24, 3, 3, C.guitar); // corpo
  g.rect(10, 26, 3, 2, C.black).px(13, 25, C.white); // captador
  g.px(8, 25, C.guitarLight).px(9, 24, C.guitarLight);
  hand(g, 24, 16); // mão no braço
  hand(g, 13, 28); // mão na palheta
  return g.outline(C.outline);
}

function renanFralda(): PixelGrid {
  const g = base('escuro', 'camiseta');
  g.rect(23, 10, 10, 5, C.white).rect(24, 15, 8, 2, C.white).rect(26, 17, 4, 2, C.white); // fralda
  g.rect(23, 10, 2, 2, C.blueLight).rect(31, 10, 2, 2, C.blueLight); // fitas
  g.rect(25, 12, 6, 1, '#dfe6ee');
  // cheirinho
  g.px(25, 7, C.stink).px(26, 6, C.stink).px(25, 5, C.stink);
  g.px(30, 7, C.stink).px(31, 6, C.stink).px(30, 5, C.stink);
  g.rect(22, 21, 2, 4, C.green);
  hand(g, 22, 19);
  return g.outline(C.outline);
}

export interface ChaserVariant {
  id: string;
  /** Nome curto para documentação e frases. */
  label: string;
  build: () => PixelGrid;
}

export const VARIANTS: Record<'lula' | 'xandao' | 'renan', ChaserVariant[]> = {
  lula: [
    { id: 'terno', label: 'de terno', build: lulaTerno },
    { id: 'decreto', label: 'com o decreto', build: lulaDecreto },
    { id: 'picanha', label: 'com a picanha', build: lulaPicanha }
  ],
  xandao: [
    { id: 'toga', label: 'de braços cruzados', build: xandaoToga },
    { id: 'caneta', label: 'com a caneta', build: xandaoCaneta },
    { id: 'martelo', label: 'com o martelo', build: xandaoMartelo }
  ],
  renan: [
    { id: 'livro', label: 'com o livro amarelo', build: renanLivro },
    { id: 'guitarra', label: 'guitarrista', build: renanGuitarra },
    { id: 'fralda', label: 'com a fralda', build: renanFralda }
  ]
};

const cache = new Map<string, HTMLCanvasElement>();

/** Sprite pronto (gerado uma vez e reaproveitado). */
export function variantSprite(chaserId: string, variant: ChaserVariant): HTMLCanvasElement {
  const key = `${chaserId}:${variant.id}`;
  let sprite = cache.get(key);
  if (!sprite) {
    sprite = variant.build().toCanvas();
    cache.set(key, sprite);
  }
  return sprite;
}
