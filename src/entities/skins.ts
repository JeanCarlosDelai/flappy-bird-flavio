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

interface FlavioLook {
  hair?: string;
  /** null = sem óculos; cor da armação. */
  glasses?: string | null;
  lens?: string;
  hat?: () => void;
  extra?: () => void;
}

/** Cabeça do Flávio saindo da cabine (cabelo voando, óculos) com acessórios. */
function flavio(p: Painter, flame: number, look: FlavioLook): void {
  const hair = look.hair ?? '#3b2a1e';
  p(20, 1, 5, 5, '#e8b48f');
  p(19, 0, 6, 2, hair);
  p(16 - flame, 0, 3 + flame, 1, hair);
  p(17, 1, 2, 1, hair);
  const glasses = look.glasses === undefined ? '#191920' : look.glasses;
  if (glasses) {
    p(21, 2, 4, 1, glasses);
    if (look.lens) p(22, 2, 1, 1, look.lens);
    if (look.lens) p(24, 2, 1, 1, look.lens);
  }
  p(22, 4, 2, 1, '#7a3b33');
  p(19, 5, 1, 1, '#e8b48f');
  look.hat?.();
  look.extra?.();
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
    draw: jet(CLASSIC, (p, flame) => flavio(p, flame, {}))
  },
  {
    id: 'flavio-bone',
    name: 'Flávio de boné',
    description: 'Boné verde-amarelo com a aba para frente.',
    price: 80,
    draw: jet(CLASSIC, (p, flame) =>
      flavio(p, flame, {
        hat: () => {
          p(19, -1, 6, 2, '#2fa34f');
          p(24, 0, 3, 1, '#2fa34f'); // aba
          p(21, -1, 2, 1, '#ffd23f');
        }
      })
    )
  },
  {
    id: 'flavio-praia',
    name: 'Flávio de férias',
    description: 'Chapéu de palha e óculos escuros: já se sente em Miami.',
    price: 100,
    draw: jet(CLASSIC, (p, flame) =>
      flavio(p, flame, {
        hat: () => {
          p(17, 0, 10, 1, '#e8cf8a'); // aba larga
          p(19, -2, 6, 2, '#e8cf8a');
          p(19, -1, 6, 1, '#d33a2c'); // fita
        },
        glasses: '#191920'
      })
    )
  },
  {
    id: 'flavio-selecao',
    name: 'Flávio da seleção',
    description: 'Camisa amarela e cabelo ao vento.',
    price: 90,
    draw: jet(CLASSIC, (p, flame) => {
      flavio(p, flame, { glasses: null });
      p(19, 5, 7, 2, '#ffd23f'); // camisa
      p(21, 5, 3, 1, '#2fa34f'); // gola verde
    })
  },
  {
    id: 'flavio-disfarce',
    name: 'Flávio disfarçado',
    description: 'Peruca loira, óculos de grau e bigode falso. Ninguém vai reconhecer.',
    price: 140,
    draw: jet(CLASSIC, (p, flame) =>
      flavio(p, flame, {
        hair: '#ffd23f',
        glasses: '#3c444f',
        lens: '#9fd3ff',
        extra: () => p(21, 4, 4, 1, '#3b2a1e') // bigode
      })
    )
  },
  {
    id: 'flavio-aviador',
    name: 'Flávio aviador',
    description: 'Gorro de couro e óculos de piloto antigo.',
    price: 120,
    draw: jet(CLASSIC, (p, flame) =>
      flavio(p, flame, {
        hat: () => {
          p(19, -1, 6, 3, '#7a522a');
          p(19, 2, 1, 3, '#7a522a'); // orelheira
          p(16 - flame, 1, 3 + flame, 1, '#f7f7f7'); // cachecol voando
        },
        glasses: '#5a3a22',
        lens: '#7fd3ff'
      })
    )
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
  },
  {
    id: 'jatinho-22',
    name: 'Jatinho 22',
    description: 'Azul e amarelo, com o número na cauda.',
    price: 90,
    draw: jet({ ...CLASSIC, body: '#2f5fbf', belly: '#1f3f8a', stripe1: '#ffd23f', stripe2: '#ffd23f', tail: '#ffd23f', wing: '#1f3f8a', windows: '#ffd23f' }, (p) => {
      // "22" na cauda
      p(5, 2, 1, 1, '#1f3f8a');
      p(6, 2, 1, 2, '#1f3f8a');
      p(5, 4, 1, 1, '#1f3f8a');
      p(5, 5, 2, 1, '#1f3f8a');
    })
  },
  {
    id: 'aerolula',
    name: 'Disfarçado de Aerolula',
    description: 'Branco e vermelho, com bigodinho falso na cabine.',
    price: 160,
    draw: jet({ ...CLASSIC, body: '#f7f9fc', belly: '#c9d1e3', stripe1: '#d33a2c', stripe2: '#d33a2c', tail: '#d33a2c', wing: '#b8c2d6', windows: '#d33a2c' }, (p) => {
      p(22, 8, 3, 1, '#3b2a1e'); // bigode falso
      p(6, 3, 1, 1, '#ffd23f'); // estrelinha na cauda
    })
  },
  {
    id: 'balao',
    name: 'Balão de São João',
    description: 'O Flávio no cestinho, subindo devagar.',
    price: 130,
    draw: (p, flame) => {
      const colors = ['#d33a2c', '#ffd23f', '#2fa34f', '#2f6fd6'];
      for (let i = 0; i < 4; i++) p(9 + i * 3, -6, 3, 14, colors[i]);
      p(8, -4, 1, 10, '#d33a2c');
      p(21, -4, 1, 10, '#2f6fd6');
      p(10, -8, 10, 2, '#ffd23f');
      p(11, 8, 8, 2, '#ffd23f');
      p(13, 10, 4, 1, flame ? '#ffd23f' : '#ff8a00'); // fogo
      p(12, 11, 1, 3, '#8a6a4a');
      p(17, 11, 1, 3, '#8a6a4a');
      p(11, 14, 8, 4, '#a8743f'); // cesto
      p(13, 12, 3, 2, '#e8b48f'); // cabeça do Flávio
      p(13, 11, 3, 1, '#3b2a1e');
    }
  },
  {
    id: 'lona',
    name: 'Jatinho de lona',
    description: 'Remendado com a lona do acampamento.',
    price: 70,
    draw: jet({ ...CLASSIC, body: '#2f6fd6', belly: '#1f4fa6', stripe1: '#7fb2ff', stripe2: '#1f4fa6', tail: '#1f4fa6', wing: '#1f4fa6', windows: '#cfe8ff' }, (p) => {
      p(8, 6, 3, 2, '#c8323e'); // remendos
      p(16, 9, 3, 2, '#ffd23f');
      p(12, 10, 2, 1, '#f7f7f7');
    })
  },
  {
    id: 'caca',
    name: 'Caça da FAB',
    description: 'Cinza, rápido e com a bolinha verde-amarela.',
    price: 180,
    draw: (p, flame) => {
      const f = flameColors(flame);
      p(0, 8, 3, 2, f[0]);
      p(0, 8, 1, 2, f[1]);
      p(3, 7, 22, 4, '#8a94a3');
      p(25, 8, 3, 2, '#8a94a3');
      p(28, 9, 1, 1, '#5a6170');
      p(4, 3, 4, 4, '#6b7480'); // deriva
      p(19, 6, 4, 2, '#4fc3f7'); // cabine
      p(10, 11, 8, 2, '#6b7480'); // asa delta
      p(8, 13, 6, 1, '#6b7480');
      p(13, 8, 2, 2, '#2fa34f'); // cocar da FAB
      p(13, 8, 1, 1, '#ffd23f');
    }
  },
  {
    id: 'hidroaviao',
    name: 'Hidroavião',
    description: 'Pousa até nas Cataratas.',
    price: 110,
    draw: (p, flame) => {
      p(5, 2, 3, 5, '#d33a2c');
      p(4, 6, 20, 4, '#f7f9fc');
      p(24, 7, 2, 2, '#f7f9fc');
      p(18, 6, 4, 2, '#4fc3f7');
      p(4, 9, 20, 1, '#d33a2c');
      p(7, 4, 16, 1, '#c9d1e3'); // asa alta
      p(10, 10, 1, 3, '#5a6170');
      p(19, 10, 1, 3, '#5a6170');
      p(7, 13, 16, 2, '#ffd23f'); // flutuador
      p(26, flame ? 4 : 7, 1, flame ? 8 : 2, '#3c444f'); // hélice
    }
  },
  {
    id: 'helicoptero',
    name: 'Helicóptero',
    description: 'Não é avião, mas foge do mesmo jeito.',
    price: 140,
    draw: (p, flame) => {
      p(flame ? 4 : 8, 1, flame ? 24 : 16, 1, '#3c444f'); // hélice
      p(15, 2, 2, 3, '#3c444f');
      p(11, 5, 13, 7, '#2fa34f');
      p(19, 6, 5, 4, '#4fc3f7');
      p(2, 7, 10, 2, '#2fa34f'); // cauda
      p(1, flame ? 4 : 6, 2, flame ? 6 : 3, '#3c444f'); // rotor de cauda
      p(12, 12, 1, 2, '#5a6170');
      p(21, 12, 1, 2, '#5a6170');
      p(9, 14, 17, 1, '#5a6170'); // esqui
      p(13, 9, 5, 1, '#ffd23f');
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
