import { PixelGrid } from '@/render/pixel';

/**
 * Skins do jatinho (Hangar). Cada uma desenha na grade 34x34 (o avião ocupa ~30x16
 * no meio, para caber girado). `flame` alterna 0/1 para animar chama/hélice/luzes.
 */
export interface Skin {
  id: string;
  name: string;
  description: string;
  price: number;
  draw: (p: Painter, flame: number) => void;
}

type Painter = (x: number, y: number, w: number, h: number, c: string) => void;

interface Colors {
  body: string;
  belly: string;
  stripe1: string;
  stripe2: string;
  tail: string;
  wing: string;
  glass: string;
  windows: string;
}

const flameColors = (flame: number) => (flame ? ['#ffd23f', '#ff8a00'] : ['#ff8a00', '#ff4d00']);

/** Jatinho padrão com cores trocáveis. */
function jet(c: Colors, extra?: (p: Painter, flame: number) => void) {
  return (p: Painter, flame: number) => {
    const f = flameColors(flame);
    p(1, 7, 3, 2, f[0]);
    p(0, 7, 1, 2, f[1]);
    p(2, 6, 1, 1, f[1]);
    p(2, 9, 1, 1, f[1]);
    p(5, 2, 3, 5, c.tail);
    p(6, 1, 2, 1, c.tail);
    p(4, 6, 19, 5, c.body);
    p(23, 7, 3, 3, c.body);
    p(26, 8, 1, 1, c.body);
    p(4, 10, 21, 1, c.belly);
    p(6, 8, 16, 1, c.stripe1);
    p(6, 9, 16, 1, c.stripe2);
    p(21, 6, 3, 2, c.glass);
    p(24, 7, 1, 1, c.glass);
    for (const x of [10, 13, 16]) p(x, 7, 1, 1, c.windows);
    p(11, 11, 5, 1, c.wing);
    p(9, 12, 5, 1, c.wing);
    p(8, 13, 4, 1, c.wing);
    extra?.(p, flame);
  };
}

const CLASSIC: Colors = {
  body: '#f7f9fc', belly: '#c9d1e3', stripe1: '#1f9d48', stripe2: '#ffd23f',
  tail: '#d7deea', wing: '#b8c2d6', glass: '#4fc3f7', windows: '#7aa7d9'
};

export const SKINS: Skin[] = [
  { id: 'classico', name: 'Jatinho clássico', description: 'O de sempre, com a faixa verde-amarela.', price: 0, draw: jet(CLASSIC) },
  {
    id: 'flavio-janela',
    name: 'Flávio na janela',
    description: 'Ele pôs a cabeça para fora para sentir o vento.',
    price: 60,
    draw: jet(CLASSIC, (p, flame) => {
      // cabeça saindo da cabine, cabelo voando e óculos escuros
      p(20, 1, 5, 5, '#e8b48f');
      p(19, 0, 6, 2, '#3b2a1e');
      p(16 - flame, 0, 3 + flame, 1, '#3b2a1e');
      p(17, 1, 2, 1, '#3b2a1e');
      p(21, 2, 4, 1, '#191920');
      p(22, 4, 2, 1, '#7a3b33');
      p(19, 5, 1, 1, '#e8b48f');
    })
  },
  {
    id: 'verde-amarelo',
    name: 'Verde-amarelo',
    description: 'Pintura de dia de jogo da seleção.',
    price: 30,
    draw: jet({ ...CLASSIC, body: '#2fa34f', belly: '#1f7a3a', stripe1: '#ffd23f', stripe2: '#2f6fd6', tail: '#ffd23f', wing: '#1f7a3a' })
  },
  {
    id: 'camuflado',
    name: 'Camuflado',
    description: 'Para fugir sem ninguém ver (em tese).',
    price: 50,
    draw: jet({ ...CLASSIC, body: '#6b7a3a', belly: '#4a552a', stripe1: '#4a552a', stripe2: '#8a7a4a', tail: '#5a4632', wing: '#4a552a', windows: '#2b3320' }, (p) => {
      for (const [x, y] of [[7, 6], [12, 7], [17, 6], [9, 9], [15, 9], [20, 8]]) p(x, y, 2, 1, '#3d4520');
    })
  },
  {
    id: 'carnaval',
    name: 'Bloco de carnaval',
    description: 'Confete, purpurina e fuga.',
    price: 40,
    draw: jet({ ...CLASSIC, body: '#ff9ad5', belly: '#d86aa8', stripe1: '#7a3bd6', stripe2: '#ffd23f', tail: '#7a3bd6', wing: '#d86aa8' }, (p) => {
      for (const [x, y, c] of [[8, 6, '#ffd23f'], [12, 10, '#4fc3f7'], [18, 6, '#7bd389'], [15, 7, '#ffffff'], [6, 10, '#ff5a5a']] as const) p(x, y, 1, 1, c);
    })
  },
  {
    id: 'aviao-papel',
    name: 'Avião de papel',
    description: 'Feito com uma folha do processo.',
    price: 40,
    draw: (p) => {
      p(4, 6, 22, 1, '#f7f7f7');
      p(6, 7, 20, 2, '#f7f7f7');
      p(9, 9, 14, 2, '#e3e3e3');
      p(13, 11, 8, 2, '#cfcfcf');
      p(6, 7, 18, 1, '#cfcfcf');
      p(8, 4, 10, 2, '#ededed');
      for (const x of [9, 12, 15]) p(x, 8, 2, 1, '#9aa3b5'); // linhas do texto
    }
  },
  {
    id: 'dourado',
    name: 'Jatinho dourado',
    description: 'Brilha mais que o sol de Miami.',
    price: 80,
    draw: jet({ ...CLASSIC, body: '#ffd23f', belly: '#c99a10', stripe1: '#fff3b0', stripe2: '#e0b23a', tail: '#e0b23a', wing: '#c99a10', windows: '#8a6a10' }, (p, flame) => {
      p(8 + flame * 6, 7, 1, 1, '#ffffff');
    })
  },
  {
    id: 'teco-teco',
    name: 'Teco-teco',
    description: 'Hélice girando e muito barulho.',
    price: 70,
    draw: (p, flame) => {
      p(5, 4, 3, 4, '#d33a2c');
      p(4, 7, 20, 4, '#ffd23f');
      p(24, 8, 2, 2, '#ffd23f');
      p(17, 5, 4, 2, '#4fc3f7');
      p(4, 10, 20, 1, '#c99a10');
      p(10, 11, 10, 2, '#d33a2c'); // asa
      p(26, flame ? 5 : 8, 1, flame ? 8 : 2, '#3c444f'); // hélice
      p(27, 8, 1, 2, '#3c444f');
    }
  },
  {
    id: 'luxo',
    name: 'Jatinho de luxo',
    description: 'Preto, dourado e com champanhe a bordo.',
    price: 120,
    draw: jet({ ...CLASSIC, body: '#191920', belly: '#0b0b10', stripe1: '#e0b23a', stripe2: '#191920', tail: '#e0b23a', wing: '#2c2c38', glass: '#9fd3ff', windows: '#e0b23a' })
  },
  {
    id: 'foguete',
    name: 'Foguete do Flávio',
    description: 'Nem a Interpol alcança. (Alcança, sim.)',
    price: 150,
    draw: (p, flame) => {
      const f = flameColors(flame);
      p(0, 7, 4, 3, f[0]);
      p(0, 6, 2, 1, f[1]);
      p(0, 10, 2, 1, f[1]);
      p(4, 6, 20, 5, '#f7f9fc');
      p(24, 7, 2, 3, '#f7f9fc');
      p(26, 8, 2, 1, '#d33a2c');
      p(22, 6, 2, 5, '#d33a2c');
      p(4, 3, 4, 3, '#d33a2c'); // aleta de cima
      p(4, 11, 4, 3, '#d33a2c'); // aleta de baixo
      p(14, 7, 3, 3, '#4fc3f7');
      p(15, 8, 1, 1, '#ffffff');
      p(8, 8, 4, 1, '#c9d1e3');
    }
  },
  {
    id: 'disco-voador',
    name: 'Disco voador',
    description: 'Fuga de outro planeta.',
    price: 200,
    draw: (p, flame) => {
      p(10, 3, 9, 4, '#9fd3ff');
      p(12, 4, 2, 1, '#ffffff');
      p(4, 7, 22, 3, '#b8c2d6');
      p(6, 10, 18, 2, '#8a94a3');
      for (const x of [7, 12, 17, 22]) p(x, 8, 1, 1, (x + flame * 5) % 2 ? '#ffd23f' : '#7bd389');
      if (flame) p(12, 12, 6, 1, '#7bd389');
    }
  }
];

export const skinById = (id: string) => SKINS.find((s) => s.id === id) ?? SKINS[0];

/** Desenha a skin numa grade 34x34 (deslocada para o centro). */
export function skinGrid(id: string, flame: number): PixelGrid {
  const g = new PixelGrid(34, 34);
  const p: Painter = (x, y, w, h, c) => {
    g.rect(2 + x, 9 + y, w, h, c);
  };
  skinById(id).draw(p, flame);
  return g;
}
