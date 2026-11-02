import type { ChaserId } from '@server/types';
import { audio, duckMusic } from './engine';
import { settings } from '@/systems/settings';

/**
 * FALAS REAIS (trechos curtos de discursos e entrevistas públicas, de fontes oficiais).
 * Cada fala precisa de: arquivo em public/falas/, a transcrição exata, a fonte e o link.
 * Recorte com: bash tools/cortar-fala.sh <arquivo-original> <início> <fim> <id>
 * Regras: só o que a pessoa realmente disse, sem editar o sentido; sempre com crédito.
 */
export interface VoiceLine {
  id: string;
  /** Quem fala: um perseguidor ou o próprio Flávio. */
  who: ChaserId | 'flavio';
  /** Transcrição exata do trecho. */
  text: string;
  /** Quando toca: ao pegar o Flávio, na fuga completa (Flávio) ou num ataque especial. */
  when: 'captura' | 'fuga' | 'ataque';
  /** Crédito: veículo/órgão e data (ex.: "Radioagência Nacional (EBC), 12/03/2026"). */
  source: string;
  sourceUrl: string;
  /** Link para o trecho original (já no minuto certo, quando der). */
  originalUrl: string;
  /** Onde no original (ex.: "1:13–1:16"). */
  at: string;
  /** Contexto real da fala (sobre o que a pessoa estava falando). */
  context: string;
}

/** Em que momento do jogo cada tipo de fala toca (para o catálogo). */
export const TRIGGER_TEXT: Record<VoiceLine['when'], string> = {
  captura: 'quando ele pega o Flávio, quando entra na perseguição e de tempos em tempos enquanto está na cola',
  fuga: 'quando o Flávio chega a Miami (fuga completa)',
  ataque: 'no ataque especial "O GROSSO" do Lula (pacotão de decretos)'
};

/** Falas cadastradas (contexto e referências de cada uma em docs/FALAS-CATALOGO.md). */
const ONU_2026 =
  'https://agenciabrasil.ebc.com.br/radioagencia-nacional/internacional/audio/2026-09/na-onu-lula-diz-que-o-brasil-nao-cabe-no-quintal-de-ninguem';

export const VOICE_LINES: VoiceLine[] = [
  {
    id: 'lula-acima-da-lei',
    who: 'lula',
    when: 'captura',
    text: 'Ninguém está acima da lei.',
    source: 'Lula na ONU · Radioagência Nacional (EBC), 22/09/2026',
    sourceUrl: ONU_2026,
    originalUrl: ONU_2026,
    at: '2:37–2:40 da reportagem',
    context: 'Discurso de abertura da Assembleia Geral da ONU, falando do combate ao crime organizado: "Crime organizado e corrupção andam juntos. Ninguém está acima da lei."'
  },
  {
    id: 'lula-quintal',
    who: 'lula',
    when: 'captura',
    text: 'O Brasil não cabe no quintal de ninguém.',
    source: 'Lula na ONU · Radioagência Nacional (EBC), 22/09/2026',
    sourceUrl: ONU_2026,
    originalUrl: ONU_2026,
    at: '1:43–1:47 da reportagem',
    context: 'Mesmo discurso na ONU, sobre a soberania da América Latina diante da maior potência militar do mundo e de "tentações hegemônicas".'
  },
  {
    // ataque especial "O GROSSO": falava das fases do Desenrola Brasil (dívidas de até R$ 5 mil)
    id: 'lula-grosso',
    who: 'lula',
    when: 'ataque',
    text: 'E agora em setembro vai entrar o grosso, vai entrar o grosso',
    source: 'Lula, live Conversa com o Presidente (Planalto), 25/07/2023',
    sourceUrl: 'https://www.gov.br/planalto/pt-br/acompanhe-o-planalto/entrevistas/conversa-com-o-presidente-live-do-dia-25-jul.23',
    originalUrl: 'https://www.youtube.com/watch?v=WW5m2ZLb8EQ&t=73s',
    at: '1:13–1:16 do vídeo (trecho da live publicado pelo Poder360)',
    context: 'Explicando as fases do programa Desenrola Brasil: "o grosso" eram os devedores de até R$ 5 mil no varejo, que entrariam em setembro. A transcrição oficial está no site do Planalto.'
  },
  {
    id: 'moraes-consequencias',
    who: 'xandao',
    when: 'captura',
    text: 'Ninguém vai te censurar previamente, mas suporte as consequências.',
    source: 'Alexandre de Moraes, palestra na FAAP · vídeo UOL, 29/04/2022',
    sourceUrl: 'https://www.youtube.com/watch?v=pAS1EBgk8jM',
    originalUrl: 'https://www.youtube.com/watch?v=pAS1EBgk8jM&t=117s',
    at: '1:59–2:04 do vídeo',
    context: 'Palestra a alunos da FAAP (São Paulo) sobre liberdade de expressão, uma semana após o STF condenar o deputado Daniel Silveira: "Faça o que quiser. Ninguém vai te censurar previamente, mas suporte as consequências."'
  },
  {
    id: 'haddad-sistema',
    who: 'haddad',
    when: 'captura',
    text: 'Aquele que está fora do sistema tem que vir para o sistema.',
    source: 'Fernando Haddad · vídeo CNN Brasil, 30/03/2023',
    sourceUrl: 'https://www.youtube.com/watch?v=IzV4vqRks3g',
    originalUrl: 'https://www.youtube.com/watch?v=IzV4vqRks3g&t=21s',
    at: '0:23–0:26 do vídeo',
    context: 'Falando de arrecadação: "Se quem não paga imposto passar a pagar, todos nós vamos pagar menos juros. (...) Para isso acontecer, aquele que está fora do sistema tem que vir para o sistema."'
  },
  {
    id: 'boulos-cadeira',
    who: 'boulos',
    when: 'captura',
    text: 'Tem que levantar a bunda da cadeira e ajudar na solução do problema.',
    source: 'Guilherme Boulos na COP30 · Radioagência Nacional (EBC), 11/2025',
    sourceUrl: 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/meio-ambiente/audio/2025-11/boulos-esta-na-hora-dos-lideres-mundiais-ouvirem-demandas-do-povo',
    originalUrl: 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/meio-ambiente/audio/2025-11/boulos-esta-na-hora-dos-lideres-mundiais-ouvirem-demandas-do-povo',
    at: '1:35–1:38 da reportagem',
    context: 'Na COP30, em Belém, cobrando os países mais ricos, maiores emissores de carbono: "os grandes líderes globais (...) tem que levantar a bunda da cadeira e ajudar na solução do problema."'
  },
  {
    id: 'gleisi-imposto',
    who: 'gleisi',
    when: 'captura',
    text: 'Poucos ganham muito e pagam pouco imposto. E muitos ganham pouco e pagam muito imposto.',
    source: 'Gleisi Hoffmann na Voz do Brasil · Radioagência Nacional (EBC), 10/2025',
    sourceUrl: 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/politica/audio/2025-10/gleisi-diz-que-o-povo-nao-quer-congresso-que-privilegie-os-mais-ricos',
    originalUrl: 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/politica/audio/2025-10/gleisi-diz-que-o-povo-nao-quer-congresso-que-privilegie-os-mais-ricos',
    at: '0:32–0:39 da reportagem',
    context: 'Entrevista à Voz do Brasil sobre a isenção do Imposto de Renda para quem ganha até R$ 5 mil (justiça tributária).'
  },
  {
    id: 'gonet-precipitadas',
    who: 'gonet',
    when: 'captura',
    text: 'Da Procuradoria-Geral da República, não saem denúncias precipitadas.',
    source: 'Paulo Gonet na sabatina do Senado · Radioagência Nacional (EBC), 11/2025',
    sourceUrl: 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/politica/audio/2025-11/em-sabatina-paulo-gonet-defende-pgr-e-nega-interferencia',
    originalUrl: 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/politica/audio/2025-11/em-sabatina-paulo-gonet-defende-pgr-e-nega-interferencia',
    at: '0:27–0:32 da reportagem',
    context: 'Sabatina no Senado para a recondução ao cargo de procurador-geral, defendendo o trabalho da PGR.'
  },
  {
    id: 'lindbergh-anistia',
    who: 'lindbergh',
    when: 'captura',
    text: 'Novamente não entra anistia e não vai entrar.',
    source: 'Lindbergh Farias · Radioagência Nacional (EBC), 08/2025',
    sourceUrl: 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/politica/audio/2025-08/lideres-da-camara-decidem-nao-votar-foro-privilegiado-nem-anistia',
    originalUrl: 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/politica/audio/2025-08/lideres-da-camara-decidem-nao-votar-foro-privilegiado-nem-anistia',
    at: '0:39–0:41 da reportagem',
    context: 'Como líder do PT na Câmara, sobre a pauta da semana: o projeto de anistia aos acusados do 8 de janeiro não seria votado.'
  },
  {
    id: 'erika-movimento',
    who: 'erika',
    when: 'captura',
    text: 'Não poderão conter a força do movimento organizado que sustenta esta economia nas costas.',
    source: 'Erika Hilton na CCJ da Câmara · Radioagência Nacional (EBC), 04/2026',
    sourceUrl: 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/politica/audio/2026-04/oposicao-pede-vista-e-votacao-da-pec-que-derruba-escala-6x1-e-adiada',
    originalUrl: 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/politica/audio/2026-04/oposicao-pede-vista-e-votacao-da-pec-que-derruba-escala-6x1-e-adiada',
    at: '1:05–1:12 da reportagem',
    context: 'Na CCJ da Câmara, depois do pedido de vista que adiou a votação da PEC do fim da escala 6x1, falando da mobilização dos trabalhadores.'
  },
  {
    id: 'dino-mao-certa',
    who: 'dino',
    when: 'captura',
    text: 'A arma tem que estar na mão certa, a arma não pode estar na mão de qualquer pessoa.',
    source: 'Flávio Dino (então ministro da Justiça) na Rádio Nacional · Radioagência Nacional (EBC), 07/2023',
    sourceUrl: 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/geral/audio/2023-07/entrevista-flavio-dino-defende-que-armas-devem-estar-nas-maos-certas',
    originalUrl: 'https://agenciabrasil.ebc.com.br/radioagencia-nacional/geral/audio/2023-07/entrevista-flavio-dino-defende-que-armas-devem-estar-nas-maos-certas',
    at: '11:38–11:43 da entrevista',
    context: 'Entrevista ao programa Revista Brasil (Rádio Nacional), explicando o decreto que restringiu o acesso a armas: "então a arma tem que estar na mão certa, a arma não pode estar na mão de qualquer pessoa que queira comprar uma arma".'
  }
];

const cache = new Map<string, Promise<AudioBuffer | null>>();

function load(id: string): Promise<AudioBuffer | null> {
  let p = cache.get(id);
  if (!p) {
    p = fetch(`./falas/${id}.mp3`)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
      .then((data) => audio.ctx!.decodeAudioData(data))
      .catch(() => null);
    cache.set(id, p);
  }
  return p;
}

/** Linhas disponíveis para alguém num momento. */
/** Momentos em que uma fala pode tocar. "perseguicao" reaproveita as falas de captura. */
export type VoiceMoment = VoiceLine['when'] | 'perseguicao';

export const linesFor = (who: VoiceLine['who'], when: VoiceMoment) =>
  VOICE_LINES.filter((l) => l.who === who && l.when === (when === 'perseguicao' ? 'captura' : when));

/** Toca uma fala sorteada (se houver, se o som estiver ligado e as falas também). Devolve a fala. */
export function playLine(who: VoiceLine['who'], when: VoiceMoment): VoiceLine | null {
  if (!settings.voices || !audio.ctx) return null;
  const options = linesFor(who, when);
  if (!options.length) return null;
  const line = options[Math.floor(Math.random() * options.length)];
  void load(line.id).then((buffer) => {
    const ctx = audio.ctx;
    if (!buffer || !ctx) return;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = 1.15;
    src.connect(gain).connect(audio.voice);
    duckMusic(true);
    src.onended = () => duckMusic(false);
    src.start();
  });
  return line;
}

/** Baixa antes as falas de quem está na cola (para tocar sem atraso na captura). */
export function preloadLines(who: VoiceLine['who']): void {
  if (!settings.voices || !audio.ctx) return;
  for (const l of VOICE_LINES) if (l.who === who) void load(l.id);
}
