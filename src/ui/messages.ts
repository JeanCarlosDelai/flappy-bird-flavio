import type { DeathCause } from '@server/types';

const pick = <T>(list: T[]) => list[Math.floor(Math.random() * list.length)];

export const CAUSE_LABEL: Record<DeathCause, string> = {
  chao: 'Caiu no chão',
  lula: 'Pego pelo Lula',
  xandao: 'Pego pelo Xandão',
  janja: 'Pego pela Janja',
  pf: 'Pego pela PF',
  renan: 'Pego pelo Renan Santos',
  gonet: 'Pego pelo Gonet',
  dino: 'Pego pelo Dino',
  interpol: 'Pego pela Interpol',
  gleisi: 'Pego pela Gleisi',
  haddad: 'Pego pelo Haddad',
  lindbergh: 'Pego pelo Lindbergh',
  boulos: 'Pego pelo Boulos',
  erika: 'Pego pela Erika Hilton',
  kim: 'Pego pelo Kim Kataguiri',
  fuga: 'Chegou a Miami'
};

/** Frase de fim de jogo conforme quem pegou (tudo humor, nada sério). */
/** Frases extras por variante do perseguidor ("perseguidor:variante"). */
const VARIANT_LINES: Record<string, string[]> = {
  'lula:decreto': ['O decreto da sua captura saiu antes de você.'],
  'lula:picanha': ['Parou para a picanha e te alcançou mesmo assim.'],
  'lula:terno': ['Companheiro, a fuga foi vetada.'],
  'xandao:caneta': ['Uma canetada e acabou a fuga.', 'A caneta foi mais rápida que o jatinho.'],
  'xandao:martelo': ['Martelo batido: fuga encerrada.'],
  'xandao:toga': ['Fuga indeferida. Despacho publicado.'],
  'janja:aberta': ['Leu o artigo certo na hora certa.'],
  'janja:apontando': ['Apontou a Constituição e o jatinho parou.'],
  'janja:debaixo': ['Chegou com a Constituição debaixo do braço.'],
  'pf:colete': ['Colete, boné e uma abordagem de manual.'],
  'pf:distintivo': ['Mostrou o distintivo antes da decolagem.'],
  'pf:lanterna': ['A lanterna achou o jatinho no escuro.'],
  'renan:livro': ['Pego pelo cara do livro amarelo.'],
  'renan:guitarra': ['Renan Santos tocou o solo da sua captura.'],
  'renan:fralda-lula': ['Pego por alguém segurando a fralda do Lula. Que fase.'],
  'renan:fralda-flavio': ['A fralda do Flávio chegou antes do Flávio.', 'Pego pelo Renan com a fralda do Flávio na mão.'],
  'gonet:pasta': ['A pasta da PGR chegou primeiro.'],
  'gonet:carimbo': ['Carimbado e arquivado: fuga encerrada.'],
  'gonet:cruzado': ['Gonet só cruzou os braços e esperou.'],
  'dino:toga': ['Dino estava de toga e de plantão.'],
  'dino:codigo': ['Achou o artigo do Código Penal rapidinho.'],
  'dino:celular': ['Despachou pelo celular mesmo.'],
  'interpol:lupa': ['A lupa achou o jatinho no meio do Caribe.'],
  'interpol:cartaz': ['Alerta vermelho no painel do aeroporto.'],
  'interpol:binoculo': ['Viu o jatinho de longe, de binóculo.'],
  'gleisi:megafone': ['O megafone avisou o país inteiro.'],
  'gleisi:planilha': ['Estava na planilha: fuga não prevista.'],
  'gleisi:apontando': ['Apontou e soltou nota oficial.'],
  'haddad:calculadora': ['Fez as contas: a fuga não fechava.'],
  'haddad:maquininha': ['Passou a maquininha: taxa de embarque cobrada.'],
  'haddad:caixa': ['A encomenda foi taxada. O jatinho também.'],
  'lindbergh:microfone': ['Discurso na tribuna e requerimento aprovado.'],
  'lindbergh:pasta': ['O requerimento chegou antes do jatinho.'],
  'lindbergh:apontando': ['Apontou: "olha ele ali!"'],
  'boulos:capacete': ['De capacete e tudo, ocupou a pista.'],
  'boulos:lona': ['Montou a lona no meio da pista de decolagem.'],
  'boulos:megafone': ['Convocou ato na cabeceira da pista.'],
  'erika:projeto': ['Protocolou um projeto e te alcançou.'],
  'erika:microfone': ['Falou ao vivo e o jatinho parou.'],
  'erika:apontando': ['Apontou o jatinho e protocolou a representação.'],
  'kim:rato': ['Pego pelo Kim versão meme.', 'Era o Kim? Era um rato? Era o Kim.'],
  'kim:papel': ['O Kim leu o papel e a fuga acabou.'],
  'kim:terno': ['O Kim cruzou os braços e esperou na fronteira.']
};

export function deathLine(cause: DeathCause, region: string, variant?: string): string {
  const key = `${cause}:${variant}`;
  if (variant && VARIANT_LINES[key] && Math.random() < 0.6) return pick(VARIANT_LINES[key]);
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
    janja: ['A Janja chegou com a Constituição.', 'Pega pela Constituição, artigo por artigo.'],
    pf: ['A PF estava na cabeceira da pista.', 'Abordagem de rotina, fuga encerrada.'],
    gonet: ['A PGR chegou antes do pouso.', 'Gonet assinou e acabou.'],
    dino: ['Dino chegou de toga e tudo.', 'Decisão monocrática: fuga negada.'],
    interpol: ['A Interpol estava esperando no aeroporto.', 'Alerta vermelho aceso.'],
    gleisi: ['A Gleisi soltou nota: fuga encerrada.', 'Nota oficial publicada antes do pouso.'],
    haddad: ['Taxado na alfândega.', 'O Haddad cobrou a taxa de saída.'],
    lindbergh: ['Requerimento aprovado: fuga negada.', 'O Lindbergh pediu a palavra e te pegou.'],
    boulos: ['Ocupação na pista: nada decola.', 'O Boulos chegou com a lona.'],
    erika: ['A Erika Hilton protocolou a captura.', 'Representação aceita: fuga encerrada.'],
    kim: ['O Kim abriu um fio: 1/4... te peguei.', 'O Kim chegou de terno na fronteira.'],
    fuga: ['Pouso em Miami. Dessa vez o Flávio fugiu!', 'Miami à vista: fuga concluída.'],
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
