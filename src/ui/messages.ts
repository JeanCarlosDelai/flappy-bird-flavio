import type { DeathCause } from '@server/types';

const pick = <T>(list: T[]) => list[Math.floor(Math.random() * list.length)];

export const CAUSE_LABEL: Record<DeathCause, string> = {
  chao: 'Caiu no chão',
  lula: 'Pego pelo Lula',
  xandao: 'Pego pelo Xandão',
  renan: 'Pego pelo Renan Santos'
};

/** Frase de fim de jogo conforme quem pegou (tudo humor, nada sério). */
/** Frases extras por variante do perseguidor. */
const VARIANT_LINES: Record<string, string[]> = {
  decreto: ['O decreto da sua captura saiu antes de você.'],
  picanha: ['Parou para a picanha e te alcançou mesmo assim.'],
  terno: ['Companheiro, a fuga foi vetada.'],
  caneta: ['Uma canetada e acabou a fuga.', 'A caneta foi mais rápida que o jatinho.'],
  martelo: ['Martelo batido: fuga encerrada.'],
  toga: ['Fuga indeferida. Despacho publicado.'],
  livro: ['Pego pelo cara do livro amarelo.'],
  guitarra: ['Renan Santos tocou o solo da sua captura.'],
  fralda: ['Pego por alguém segurando uma fralda. Que fase.']
};

export function deathLine(cause: DeathCause, region: string, variant?: string): string {
  if (variant && VARIANT_LINES[variant] && Math.random() < 0.6) return pick(VARIANT_LINES[variant]);
  const lines: Record<DeathCause, string[]> = {
    chao: [
      `Pouso forçado em ${region}.`,
      `O jatinho resolveu conhecer o chão de ${region}.`,
      'Faltou dedo para tanto toque.',
      'A gravidade não aceita recurso.'
    ],
    lula: [
      'O decreto da sua captura saiu antes de você.',
      'Lula chegou primeiro. Publicado no Diário Oficial.',
      'Companheiro, a fuga foi vetada.'
    ],
    xandao: [
      'Canetada certeira do Xandão.',
      'Fuga indeferida. Despacho publicado.',
      'Xandão abriu inquérito e fechou a rota.'
    ],
    renan: [
      'O drone do Renan Santos te achou.',
      'Renan Santos filmou tudo e ainda te alcançou.',
      'Pego ao vivo, com drone e tudo.'
    ]
  };
  return pick(lines[cause]);
}

export const TRY_AGAIN = ['Tente na próxima!', 'Bora de novo!', 'A próxima fuga é a boa.', 'Mais uma?'];
export const tryAgainLine = () => pick(TRY_AGAIN);
