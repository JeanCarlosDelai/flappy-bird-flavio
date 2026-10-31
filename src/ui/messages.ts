import type { DeathCause } from '@server/types';

const pick = <T>(list: T[]) => list[Math.floor(Math.random() * list.length)];

export const CAUSE_LABEL: Record<DeathCause, string> = {
  chao: 'Caiu no chão',
  lula: 'Pego pelo Lula',
  xandao: 'Pego pelo Xandão',
  renan: 'Pego pelo Renan Santos'
};

/** Frase de fim de jogo conforme quem pegou (tudo humor, nada sério). */
export function deathLine(cause: DeathCause, region: string): string {
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
