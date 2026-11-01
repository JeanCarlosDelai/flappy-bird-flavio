import type { ChaserId } from '@server/types';
import { pixelText, textWidth } from '@/render/pixel-font';
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

type Tone = 'clara' | 'morena' | 'escura';
const TONES: Record<Tone, { skin: string; shade: string; light: string }> = {
  clara: { skin: '#e8b48f', shade: '#c98f6b', light: '#f1c7a5' },
  morena: { skin: '#e2b088', shade: '#c4916a', light: '#eec39f' },
  escura: { skin: '#8a5a3c', shade: '#6e452d', light: '#a06c4a' }
};
/** Tom de pele do desenho em construção (base() define; mãos e detalhes usam). */
let SK = TONES.clara;

type Hair =
  | 'grisalho' | 'careca' | 'escuro' | 'longo' | 'calvo-grisalho' | 'careca-barba' | 'bone' | 'chapeu'
  | 'chanel' | 'grisalho-curto' | 'topete-branco' | 'barba-escura' | 'liso-preto' | 'kim' | 'rato';
type Outfit = 'terno' | 'toga' | 'camiseta' | 'blusa' | 'colete' | 'sobretudo' | 'blazer' | 'camiseta-vermelha' | 'vestido';

const OUTFIT_COLORS: Record<Outfit, [string, string]> = {
  terno: ['#24304f', '#33426b'],
  toga: ['#191920', '#2c2c38'],
  camiseta: ['#2e6b4a', '#3d8a60'],
  blusa: ['#9c2a3a', '#b8404f'],
  colete: ['#1d2230', '#2e3548'],
  sobretudo: ['#b08a5a', '#c9a476'],
  blazer: ['#b8202e', '#d33a3f'],
  'camiseta-vermelha': ['#a8232c', '#c8323e'],
  vestido: ['#7a2a8a', '#9a3fb0']
};

function base(hair: Hair, outfit: Outfit, tone: Tone = 'clara'): PixelGrid {
  SK = TONES[tone];
  const g = new PixelGrid(36, 34);

  // corpo (ombros arredondados)
  const [body, bodyLight] = OUTFIT_COLORS[outfit];
  g.rect(6, 21, 19, 12, body).rect(7, 20, 17, 1, body);
  g.rect(7, 21, 2, 11, bodyLight); // luz no ombro esquerdo
  if (outfit === 'terno') {
    g.rect(14, 20, 3, 4, C.white).rect(15, 21, 1, 7, C.red).rect(14, 21, 3, 1, C.red); // camisa + gravata
    g.px(13, 21, C.navyLight).px(17, 21, C.navyLight); // lapelas
  } else if (outfit === 'toga') {
    g.rect(12, 20, 7, 2, C.white).rect(13, 22, 5, 1, C.white).px(15, 23, C.white); // gola
  } else if (outfit === 'blusa') {
    g.rect(13, 20, 5, 2, SK.skin).px(15, 22, SK.skin); // decote
    g.rect(14, 23, 3, 1, '#ffd23f'); // colar
  } else if (outfit === 'colete') {
    g.rect(13, 20, 5, 1, '#d9dde6'); // gola da camisa
    g.rect(10, 24, 11, 4, '#151925');
    pixelText(g, 'PF', 12, 24, '#ffd23f'); // colete escrito PF
  } else if (outfit === 'sobretudo') {
    g.rect(13, 20, 5, 6, '#e8e1d2').rect(15, 20, 1, 9, '#8a6a45'); // camisa e abotoamento
    g.px(12, 21, '#8a6a45').px(18, 21, '#8a6a45').px(11, 22, '#8a6a45').px(19, 22, '#8a6a45'); // lapela
    g.rect(6, 27, 19, 1, '#8a6a45'); // cinto
  } else if (outfit === 'blazer') {
    g.rect(13, 20, 5, 4, C.white).px(15, 24, C.white); // camisa branca
    g.px(12, 21, '#8a1520').px(18, 21, '#8a1520').px(12, 22, '#8a1520').px(18, 22, '#8a1520'); // lapelas
  } else if (outfit === 'camiseta-vermelha') {
    g.rect(13, 20, 5, 1, '#c8323e');
    g.ellipse(15, 26, 2, 2, '#ffd23f'); // estrelinha amarela na camiseta
  } else if (outfit === 'vestido') {
    g.rect(13, 20, 5, 2, SK.skin).px(15, 22, SK.skin);
    g.px(12, 21, '#ffd23f').px(18, 21, '#ffd23f'); // detalhe dourado
  } else {
    g.rect(13, 20, 5, 1, C.greenLight); // gola da camiseta
  }

  // pescoço e cabeça
  g.rect(13, 17, 5, 3, SK.shade);
  g.ellipse(HEAD.cx, HEAD.cy, HEAD.rx, HEAD.ry, SK.skin);
  g.px(8, 11, SK.skin).px(22, 11, SK.skin).px(8, 12, SK.shade).px(22, 12, SK.shade); // orelhas
  g.rect(18, 7, 2, 7, SK.light); // luz lateral

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
    g.rect(12, 5, 2, 1, C.white).px(12, 6, C.white).px(16, 4, SK.light);
    g.px(11, 9, C.eye).px(12, 9, C.eye).px(13, 10, C.eye);
    g.px(19, 9, C.eye).px(18, 9, C.eye).px(17, 10, C.eye);
    g.rect(13, 15, 5, 1, C.mouth).px(12, 16, C.mouth).px(18, 16, C.mouth); // boca fechada, séria
    g.rect(10, 13, 1, 2, SK.shade).rect(20, 13, 1, 2, SK.shade);
  } else if (hair === 'longo') {
    // cabelo castanho comprido, batom
    const h = '#5a3420';
    g.ellipse(15, 5, 8, 4, h).rect(7, 5, 3, 16, h).rect(21, 5, 3, 16, h).rect(6, 12, 2, 9, h).rect(24, 12, 2, 9, h);
    g.rect(10, 6, 6, 2, h).px(16, 6, h);
    g.rect(11, 9, 3, 1, h).rect(17, 9, 3, 1, h);
    g.px(11, 11, C.eye).px(19, 11, C.eye); // cílios
    g.rect(13, 15, 5, 1, '#c8323e').px(14, 16, '#c8323e').px(16, 16, '#c8323e');
  } else if (hair === 'calvo-grisalho') {
    // calvo no topo, laterais grisalhas, óculos
    g.rect(8, 7, 2, 6, C.gray).rect(21, 7, 2, 6, C.gray).px(13, 4, SK.light).px(14, 4, SK.light);
    g.rect(11, 9, 3, 1, C.grayDark).rect(17, 9, 3, 1, C.grayDark);
    g.rect(10, 10, 5, 3, '#3c444f').rect(16, 10, 5, 3, '#3c444f').rect(15, 11, 1, 1, '#3c444f');
    g.rect(11, 11, 3, 1, '#9fd3ff').rect(17, 11, 3, 1, '#9fd3ff');
    g.rect(13, 15, 5, 1, C.mouth);
  } else if (hair === 'careca-barba') {
    // careca e barba escura bem aparada
    g.px(12, 5, C.white).px(13, 5, C.white).px(12, 6, C.white);
    g.rect(11, 9, 3, 1, C.hairDark).rect(17, 9, 3, 1, C.hairDark);
    for (let y = 13; y <= 18; y++) for (let x = 9; x <= 21; x++) g.paintOver(x, y, '#3b2a1e');
    g.rect(12, 18, 7, 1, '#3b2a1e');
    g.rect(13, 15, 5, 1, C.mouth);
  } else if (hair === 'bone') {
    // boné preto com "PF" e aba
    g.ellipse(15, 5, 8, 3, '#151925').rect(7, 6, 17, 2, '#151925').rect(15, 7, 10, 2, '#151925');
    pixelText(g, 'PF', 12, 3, '#ffd23f');
    g.rect(11, 9, 3, 1, C.hairDark).rect(17, 9, 3, 1, C.hairDark);
    g.rect(13, 15, 5, 1, C.mouth);
  } else if (hair === 'chapeu') {
    // chapéu de detetive e bigode
    g.rect(5, 6, 21, 2, '#5a4632').rect(9, 1, 13, 5, '#5a4632').rect(9, 4, 13, 1, '#2b2118');
    g.rect(11, 9, 3, 1, C.hairDark).rect(17, 9, 3, 1, C.hairDark);
    g.rect(12, 14, 7, 1, C.hairDark).px(11, 15, C.hairDark).px(19, 15, C.hairDark);
  } else if (hair === 'chanel') {
    // cabelo castanho-escuro na altura do queixo, repartido, batom
    const h = '#2b1d16';
    g.ellipse(15, 5, 8, 4, h).rect(7, 5, 3, 13, h).rect(21, 5, 3, 13, h).rect(6, 10, 2, 7, h).rect(24, 10, 2, 7, h);
    g.rect(9, 6, 5, 2, h).rect(17, 6, 4, 1, h);
    g.rect(11, 9, 3, 1, h).rect(17, 9, 3, 1, h);
    g.rect(13, 15, 5, 1, '#b8202e');
  } else if (hair === 'grisalho-curto') {
    // cabelo curto grisalho escuro, sem barba, meio sorriso
    const h = '#7d7f86';
    g.ellipse(15, 5, 7, 3, h).rect(8, 6, 2, 5, h).rect(21, 6, 2, 5, h).rect(10, 6, 9, 1, '#5f6168');
    g.rect(11, 9, 3, 1, '#4a4c52').rect(17, 9, 3, 1, '#4a4c52');
    g.rect(13, 15, 5, 1, C.mouth).px(18, 14, C.mouth);
  } else if (hair === 'topete-branco') {
    // cabelo branco volumoso penteado para trás, sobrancelhas escuras
    const h = '#e3e3e3';
    g.ellipse(15, 4, 8, 4, h).rect(8, 5, 2, 6, h).rect(21, 5, 2, 6, h).rect(11, 2, 8, 1, '#f7f7f7');
    g.rect(11, 9, 3, 1, C.hairDark).rect(17, 9, 3, 1, C.hairDark);
    g.rect(13, 15, 5, 1, C.mouth);
  } else if (hair === 'barba-escura') {
    // cabelo escuro curto e barba cheia escura
    const h = '#2b1d16';
    g.ellipse(15, 5, 7, 3, h).rect(8, 6, 2, 5, h).rect(21, 6, 2, 5, h).rect(10, 6, 5, 1, h);
    g.rect(11, 9, 3, 1, h).rect(17, 9, 3, 1, h);
    for (let y = 13; y <= 18; y++) for (let x = 9; x <= 21; x++) g.paintOver(x, y, h);
    g.rect(12, 18, 7, 1, h);
    g.rect(13, 15, 5, 1, C.mouth);
  } else if (hair === 'liso-preto') {
    // cabelo preto liso e comprido, batom e brincos
    const h = '#151018';
    g.ellipse(15, 5, 8, 4, h).rect(7, 5, 3, 17, h).rect(21, 5, 3, 17, h).rect(6, 11, 2, 11, h).rect(24, 11, 2, 11, h);
    g.rect(10, 6, 7, 2, h);
    g.rect(11, 9, 3, 1, h).rect(17, 9, 3, 1, h);
    g.rect(13, 15, 5, 1, '#d2386a').px(14, 16, '#d2386a').px(16, 16, '#d2386a');
    g.px(9, 14, '#ffd23f').px(21, 14, '#ffd23f');
  } else if (hair === 'kim') {
    // cabelo preto liso com franja repartida de lado
    const h = '#151018';
    g.ellipse(15, 5, 7, 3, h).rect(8, 6, 2, 5, h).rect(21, 6, 2, 4, h);
    g.rect(9, 6, 8, 2, h).rect(9, 8, 3, 1, h);
    g.rect(11, 10, 3, 1, h).rect(17, 10, 3, 1, h);
    g.rect(13, 15, 5, 1, C.mouth);
  } else if (hair === 'rato') {
    // o meme: cabeça de rato (orelhonas, focinho, bigodes e dentinhos)
    const fur = '#9a9aa6';
    const furDark = '#7a7a88';
    g.ellipse(HEAD.cx, HEAD.cy, HEAD.rx, HEAD.ry, fur);
    g.ellipse(8, 4, 4, 4, fur).ellipse(22, 4, 4, 4, fur);
    g.ellipse(8, 4, 2, 2, '#f3a3b8').ellipse(22, 4, 2, 2, '#f3a3b8');
    g.ellipse(15, 15, 4, 3, '#c4c4ce').rect(14, 12, 3, 1, furDark);
    g.rect(14, 13, 3, 2, '#ff7fa0'); // nariz
    g.rect(14, 17, 1, 2, C.white).rect(16, 17, 1, 2, C.white); // dentinhos
    g.px(12, 10, C.eye).px(18, 10, C.eye).px(12, 9, C.white);
    for (const [x, y] of [[6, 14], [7, 15], [8, 16], [22, 14], [23, 15], [24, 16]] as const) g.px(x, y, '#5a5a66'); // bigodes
    g.rect(13, 17, 5, 1, '#5a5a66');
  } else {
    // cabelo escuro curto com franja, barba por fazer
    g.ellipse(15, 5, 7, 3, C.hairDark).rect(8, 6, 2, 4, C.hairDark).rect(21, 6, 2, 4, C.hairDark);
    g.rect(10, 7, 4, 1, C.hairDark).px(17, 7, C.hairDark);
    g.rect(11, 9, 3, 1, C.hairDark).rect(17, 9, 3, 1, C.hairDark);
    for (let y = 14; y <= 17; y++) for (let x = 9; x <= 21; x++) if ((x + y) % 2 === 0) g.paintOver(x, y, SK.shade);
    g.rect(13, 15, 4, 1, C.mouth).px(17, 14, C.mouth); // meio sorriso
  }
  return g;
}

const hand = (g: PixelGrid, x: number, y: number) => g.rect(x, y, 2, 2, SK.skin).px(x, y + 1, SK.shade);

// ---------- objetos de mão reaproveitados ----------

/** Papel com linhas e um título (projeto de lei, requerimento, nota). */
function papel(g: PixelGrid, x: number, y: number, title = '', color = '#d33a2c') {
  g.rect(x, y, 10, 12, C.white);
  if (title) pixelText(g, title, x + 1, y + 1, color);
  for (const ly of [7, 9]) g.rect(x + 1, y + ly, 8, 1, C.paperLine);
}

/** Megafone apontando para a frente. */
function megafone(g: PixelGrid, x: number, y: number) {
  g.rect(x, y + 2, 3, 3, '#3c444f');
  for (let i = 0; i < 6; i++) g.rect(x + 3 + i, y + 2 - Math.floor(i / 2), 1, 3 + Math.floor(i / 2) * 2, i === 5 ? '#e9edf2' : '#f7f7f7');
  g.rect(x + 2, y + 5, 2, 3, '#3c444f'); // pegador
}

/** Microfone de mão. */
function microfone(g: PixelGrid, x: number, y: number) {
  g.ellipse(x + 1, y + 1, 2, 2, '#3c444f').px(x, y, '#9aa3b5');
  g.rect(x, y + 3, 2, 5, '#191920');
}

/** Braço esticado apontando para a frente (direita). */
function apontar(g: PixelGrid, sleeve: string) {
  g.rect(22, 20, 6, 2, sleeve).rect(28, 20, 3, 2, SK.skin).rect(31, 20, 2, 1, SK.skin);
}

/** Braços cruzados na frente do peito. */
function cruzar(g: PixelGrid, sleeve: string) {
  g.rect(9, 25, 13, 3, sleeve);
  hand(g, 9, 25);
  hand(g, 20, 25);
}

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

/** Fralda com nome escrito, centrada em x (largura pelo tamanho do nome). */
function fralda(g: PixelGrid, cx: number, y: number, name: string) {
  const w = Math.max(16, textWidth(name) + 6);
  const x = Math.round(cx - w / 2);
  g.rect(x, y, w, 9, C.white).rect(x + 2, y + 9, w - 4, 2, C.white).rect(x + 5, y + 11, w - 10, 2, C.white);
  g.rect(x, y, 3, 3, C.blueLight).rect(x + w - 3, y, 3, 3, C.blueLight); // fitas
  g.rect(x + 1, y + 8, w - 2, 1, '#dfe6ee');
  pixelText(g, name, x + 3, y + 2, '#2f6fd6');
  // cheirinho
  for (const sx of [x + 3, x + w - 5]) g.px(sx, y - 2, C.stink).px(sx + 1, y - 3, C.stink).px(sx, y - 4, C.stink);
}

/** Renan com uma fralda em cada mão: "LULA" e "FLÁVIO" (desenho mais largo). */
function renanFralda(): PixelGrid {
  const body = base('escuro', 'camiseta');
  const OX = 24; // corpo deslocado para abrir espaço dos dois lados
  const g = new PixelGrid(body.width + OX + 26, body.height + 2);
  for (let y = 0; y < body.height; y++) for (let x = 0; x < body.width; x++) {
    const c = body.get(x, y);
    if (c) g.px(x + OX, y + 2, c);
  }
  // braços abertos segurando as fraldas
  g.rect(OX + 3, 23, 4, 3, C.green).rect(OX + 24, 23, 4, 3, C.green);
  hand(g, OX + 1, 22);
  hand(g, OX + 28, 22);
  fralda(g, 12, 12, 'LULA');
  fralda(g, OX + 41, 12, 'FLÁVIO');
  return g.outline(C.outline);
}

// ---------- Janja ----------

/** Constituição: livro azul com "CF" dourado. */
function constituicao(g: PixelGrid, x: number, y: number, open = false) {
  if (open) {
    g.rect(x, y, 14, 9, '#f7f7f7').rect(x + 7, y, 1, 9, '#c9c9c9');
    for (const ly of [2, 4, 6]) g.rect(x + 1, y + ly, 5, 1, C.paperLine).rect(x + 8, y + ly, 5, 1, C.paperLine);
    g.rect(x - 1, y + 8, 16, 2, '#1f3f8a');
  } else {
    g.rect(x, y, 9, 12, '#1f3f8a').rect(x, y, 1, 12, '#173170');
    pixelText(g, 'CF', x + 2, y + 3, '#ffd23f');
  }
}

function janjaAberta(): PixelGrid {
  const g = base('longo', 'blusa');
  constituicao(g, 9, 22, true);
  hand(g, 8, 26);
  hand(g, 22, 26);
  return g.outline(C.outline);
}

function janjaApontando(): PixelGrid {
  const g = base('longo', 'blusa');
  constituicao(g, 23, 8);
  g.rect(22, 20, 2, 4, '#9c2a3a');
  hand(g, 22, 19);
  g.rect(3, 19, 4, 2, SK.skin).rect(1, 19, 2, 1, SK.skin); // dedo apontando
  return g.outline(C.outline);
}

function janjaDebaixo(): PixelGrid {
  const g = base('longo', 'blusa');
  constituicao(g, 20, 21);
  hand(g, 19, 30);
  return g.outline(C.outline);
}

// ---------- Agente da PF (genérico) ----------

function pfColete(): PixelGrid {
  const g = base('bone', 'colete');
  g.rect(9, 29, 13, 3, '#2e3548');
  hand(g, 9, 29);
  hand(g, 20, 29);
  return g.outline(C.outline);
}

function pfDistintivo(): PixelGrid {
  const g = base('bone', 'colete');
  g.rect(23, 10, 9, 10, '#3b2a1e').ellipse(27, 15, 3, 3, '#ffd23f').px(27, 15, '#c99a10'); // carteira e distintivo
  g.rect(22, 20, 2, 4, '#1d2230');
  hand(g, 22, 19);
  return g.outline(C.outline);
}

function pfLanterna(): PixelGrid {
  const g = base('bone', 'colete');
  g.rect(23, 14, 8, 4, '#3c444f').rect(31, 13, 2, 6, '#d0d6de');
  for (let i = 0; i < 4; i++) g.rect(33 + i, 12 - i, 1, 8 + i * 2, i % 2 ? '#fff3b0' : '#ffe066');
  g.rect(22, 18, 2, 5, '#1d2230');
  hand(g, 22, 17);
  return g.outline(C.outline);
}

// ---------- Gonet ----------

function gonetPasta(): PixelGrid {
  const g = base('calvo-grisalho', 'terno');
  g.rect(22, 10, 11, 13, '#c9a476').rect(22, 10, 11, 2, '#a88352');
  pixelText(g, 'PGR', 23, 14, '#5a3a22');
  g.rect(22, 21, 2, 3, C.navy);
  hand(g, 22, 20);
  return g.outline(C.outline);
}

function gonetCarimbo(): PixelGrid {
  const g = base('calvo-grisalho', 'terno');
  g.rect(25, 8, 4, 6, '#5a3a22').rect(23, 14, 8, 3, '#3c444f').rect(23, 17, 8, 1, '#c8323e');
  g.rect(22, 18, 2, 5, C.navy);
  hand(g, 23, 17);
  return g.outline(C.outline);
}

function gonetCruzado(): PixelGrid {
  const g = base('calvo-grisalho', 'terno');
  g.rect(9, 25, 13, 3, C.navyLight);
  hand(g, 9, 25);
  hand(g, 20, 25);
  return g.outline(C.outline);
}

// ---------- Dino ----------

function dinoToga(): PixelGrid {
  const g = base('careca-barba', 'toga');
  g.rect(9, 25, 13, 3, C.blackLight);
  hand(g, 9, 25);
  hand(g, 20, 25);
  return g.outline(C.outline);
}

function dinoCodigo(): PixelGrid {
  const g = base('careca-barba', 'toga');
  g.rect(22, 7, 11, 14, '#7a1f2b').rect(22, 7, 1, 14, '#5a1520');
  pixelText(g, 'CP', 25, 10, '#ffd23f'); // Código Penal
  g.rect(22, 20, 2, 4, C.black);
  hand(g, 22, 19);
  return g.outline(C.outline);
}

function dinoCelular(): PixelGrid {
  const g = base('careca-barba', 'toga');
  g.rect(23, 9, 6, 10, '#191920').rect(24, 10, 4, 7, '#7fd3ff').px(26, 18, '#3c444f');
  g.rect(22, 19, 2, 4, C.black);
  hand(g, 22, 18);
  return g.outline(C.outline);
}

// ---------- Agente da Interpol (genérico) ----------

function interpolLupa(): PixelGrid {
  const g = base('chapeu', 'sobretudo');
  g.line(23, 21, 27, 15, '#5a3a22', 2);
  g.ellipse(29, 12, 4, 4, '#3c444f').ellipse(29, 12, 3, 3, '#cfe8ff').px(28, 11, '#ffffff');
  hand(g, 22, 20);
  return g.outline(C.outline);
}

function interpolCartaz(): PixelGrid {
  const g = base('chapeu', 'sobretudo');
  g.rect(21, 6, 14, 15, '#f7f7f7').rect(21, 6, 14, 3, '#d33a2c');
  pixelText(g, 'RED', 23, 11, '#d33a2c');
  g.rect(24, 17, 8, 1, C.paperLine);
  g.rect(22, 21, 2, 3, '#b08a5a');
  hand(g, 22, 20);
  return g.outline(C.outline);
}

function interpolBinoculo(): PixelGrid {
  const g = base('chapeu', 'sobretudo');
  g.rect(9, 10, 5, 4, '#191920').rect(16, 10, 5, 4, '#191920').rect(14, 11, 2, 2, '#3c444f');
  g.px(10, 11, '#7fd3ff').px(17, 11, '#7fd3ff');
  g.rect(7, 13, 2, 8, '#b08a5a').rect(22, 13, 2, 8, '#b08a5a');
  hand(g, 8, 12);
  hand(g, 21, 12);
  return g.outline(C.outline);
}

// ---------- Gleisi ----------

function gleisiMegafone(): PixelGrid {
  const g = base('chanel', 'blazer');
  megafone(g, 23, 12);
  g.rect(22, 18, 2, 5, '#b8202e');
  hand(g, 22, 17);
  return g.outline(C.outline);
}

function gleisiPlanilha(): PixelGrid {
  const g = base('chanel', 'blazer');
  g.rect(22, 7, 12, 13, C.white);
  for (let y = 9; y < 19; y += 2) g.rect(23, y, 10, 1, '#7bd389');
  for (let x = 26; x < 33; x += 3) g.rect(x, 8, 1, 11, '#7bd389');
  g.rect(22, 20, 2, 3, '#b8202e');
  hand(g, 22, 19);
  return g.outline(C.outline);
}

function gleisiApontando(): PixelGrid {
  const g = base('chanel', 'blazer');
  apontar(g, '#b8202e');
  return g.outline(C.outline);
}

// ---------- Haddad ----------

function haddadCalculadora(): PixelGrid {
  const g = base('grisalho-curto', 'terno');
  g.rect(23, 8, 10, 13, '#3c444f').rect(24, 9, 8, 3, '#b7e4a8');
  pixelText(g, '%', 28, 9, '#1b1420');
  for (let y = 13; y < 20; y += 2) for (let x = 24; x < 32; x += 2) g.px(x, y, (x + y) % 4 ? '#d0d6de' : '#ff8a00');
  g.rect(22, 20, 2, 3, C.navy);
  hand(g, 22, 19);
  return g.outline(C.outline);
}

function haddadMaquininha(): PixelGrid {
  const g = base('grisalho-curto', 'terno');
  g.rect(24, 9, 8, 12, '#191920').rect(25, 10, 6, 3, '#7fd3ff');
  for (let y = 14; y < 20; y += 2) for (let x = 25; x < 31; x += 2) g.px(x, y, '#d0d6de');
  g.rect(25, 6, 6, 3, C.white); // comprovante saindo
  g.rect(22, 20, 2, 3, C.navy);
  hand(g, 23, 19);
  return g.outline(C.outline);
}

function haddadCaixa(): PixelGrid {
  const g = base('grisalho-curto', 'terno');
  g.rect(8, 21, 15, 11, '#c9945f').rect(8, 21, 15, 2, '#a8743f').rect(15, 21, 1, 11, '#a8743f');
  pixelText(g, 'TAXA', 9, 25, '#5a3a1a');
  hand(g, 6, 26);
  hand(g, 23, 26);
  return g.outline(C.outline);
}

// ---------- Lindbergh ----------

function lindberghMicrofone(): PixelGrid {
  const g = base('topete-branco', 'terno');
  microfone(g, 23, 10);
  g.rect(22, 19, 2, 4, C.navy);
  hand(g, 22, 18);
  return g.outline(C.outline);
}

function lindberghPasta(): PixelGrid {
  const g = base('topete-branco', 'terno');
  g.rect(22, 9, 12, 13, '#2f6fd6').rect(22, 9, 12, 2, '#1f4fa6');
  pixelText(g, 'REQ', 23, 13, C.white);
  g.rect(22, 21, 2, 3, C.navy);
  hand(g, 22, 20);
  return g.outline(C.outline);
}

function lindberghApontando(): PixelGrid {
  const g = base('topete-branco', 'terno');
  apontar(g, C.navy);
  return g.outline(C.outline);
}

// ---------- Boulos ----------

function boulosCapacete(): PixelGrid {
  const g = base('barba-escura', 'camiseta-vermelha');
  g.ellipse(15, 5, 8, 4, '#ffd23f').rect(6, 7, 19, 2, '#ffd23f').rect(14, 1, 3, 6, '#e0b23a'); // capacete de obra
  hand(g, 24, 25);
  g.rect(24, 21, 2, 4, '#a8232c');
  return g.outline(C.outline);
}

function boulosLona(): PixelGrid {
  const g = base('barba-escura', 'camiseta-vermelha');
  g.line(4, 26, 30, 14, '#2f6fd6', 4); // rolo de lona azul no ombro
  for (let i = 0; i < 6; i++) g.px(7 + i * 4, 25 - i * 2, '#7fb2ff');
  hand(g, 6, 27);
  hand(g, 24, 16);
  return g.outline(C.outline);
}

function boulosMegafone(): PixelGrid {
  const g = base('barba-escura', 'camiseta-vermelha');
  megafone(g, 23, 12);
  g.rect(22, 18, 2, 5, '#a8232c');
  hand(g, 22, 17);
  return g.outline(C.outline);
}

// ---------- Erika Hilton ----------

function erikaProjeto(): PixelGrid {
  const g = base('liso-preto', 'vestido', 'escura');
  papel(g, 23, 8, 'PL', '#7a2a8a');
  g.rect(22, 20, 2, 3, '#7a2a8a');
  hand(g, 22, 19);
  return g.outline(C.outline);
}

function erikaMicrofone(): PixelGrid {
  const g = base('liso-preto', 'vestido', 'escura');
  microfone(g, 23, 10);
  g.rect(22, 19, 2, 4, '#7a2a8a');
  hand(g, 22, 18);
  return g.outline(C.outline);
}

function erikaApontando(): PixelGrid {
  const g = base('liso-preto', 'vestido', 'escura');
  apontar(g, '#7a2a8a');
  return g.outline(C.outline);
}

// ---------- Kim Kataguiri ----------

function kimRato(): PixelGrid {
  const g = base('rato', 'terno');
  hand(g, 24, 25);
  g.rect(24, 21, 2, 4, C.navy);
  return g.outline(C.outline);
}

function kimPapel(): PixelGrid {
  const g = base('kim', 'terno');
  papel(g, 23, 8, 'PL');
  g.rect(22, 20, 2, 3, C.navy);
  hand(g, 22, 19);
  return g.outline(C.outline);
}

function kimTerno(): PixelGrid {
  const g = base('kim', 'terno');
  cruzar(g, C.navyLight);
  return g.outline(C.outline);
}

export interface ChaserVariant {
  id: string;
  /** Nome curto para documentação e frases. */
  label: string;
  build: () => PixelGrid;
}

export const VARIANTS: Record<ChaserId, ChaserVariant[]> = {
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
    { id: 'fralda', label: 'com as fraldas', build: renanFralda }
  ],
  janja: [
    { id: 'aberta', label: 'com a Constituição aberta', build: janjaAberta },
    { id: 'apontando', label: 'apontando a Constituição', build: janjaApontando },
    { id: 'debaixo', label: 'com a Constituição debaixo do braço', build: janjaDebaixo }
  ],
  pf: [
    { id: 'colete', label: 'de colete', build: pfColete },
    { id: 'distintivo', label: 'com o distintivo', build: pfDistintivo },
    { id: 'lanterna', label: 'com a lanterna', build: pfLanterna }
  ],
  gonet: [
    { id: 'pasta', label: 'com a pasta da PGR', build: gonetPasta },
    { id: 'carimbo', label: 'com o carimbo', build: gonetCarimbo },
    { id: 'cruzado', label: 'de braços cruzados', build: gonetCruzado }
  ],
  dino: [
    { id: 'toga', label: 'de toga', build: dinoToga },
    { id: 'codigo', label: 'com o Código Penal', build: dinoCodigo },
    { id: 'celular', label: 'no celular', build: dinoCelular }
  ],
  interpol: [
    { id: 'lupa', label: 'com a lupa', build: interpolLupa },
    { id: 'cartaz', label: 'com o alerta vermelho', build: interpolCartaz },
    { id: 'binoculo', label: 'de binóculo', build: interpolBinoculo }
  ],
  gleisi: [
    { id: 'megafone', label: 'com o megafone', build: gleisiMegafone },
    { id: 'planilha', label: 'com a planilha', build: gleisiPlanilha },
    { id: 'apontando', label: 'apontando', build: gleisiApontando }
  ],
  haddad: [
    { id: 'calculadora', label: 'com a calculadora', build: haddadCalculadora },
    { id: 'maquininha', label: 'com a maquininha', build: haddadMaquininha },
    { id: 'caixa', label: 'com a caixa da taxa', build: haddadCaixa }
  ],
  lindbergh: [
    { id: 'microfone', label: 'no microfone', build: lindberghMicrofone },
    { id: 'pasta', label: 'com o requerimento', build: lindberghPasta },
    { id: 'apontando', label: 'apontando', build: lindberghApontando }
  ],
  boulos: [
    { id: 'capacete', label: 'de capacete', build: boulosCapacete },
    { id: 'lona', label: 'com a lona', build: boulosLona },
    { id: 'megafone', label: 'com o megafone', build: boulosMegafone }
  ],
  erika: [
    { id: 'projeto', label: 'com o projeto de lei', build: erikaProjeto },
    { id: 'microfone', label: 'no microfone', build: erikaMicrofone },
    { id: 'apontando', label: 'apontando', build: erikaApontando }
  ],
  kim: [
    { id: 'rato', label: 'versão rato (o meme)', build: kimRato },
    { id: 'papel', label: 'com o papel', build: kimPapel },
    { id: 'terno', label: 'de terno', build: kimTerno }
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
