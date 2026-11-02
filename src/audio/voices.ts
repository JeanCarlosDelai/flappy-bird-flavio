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
}

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
    sourceUrl: ONU_2026
  },
  {
    id: 'lula-quintal',
    who: 'lula',
    when: 'captura',
    text: 'O Brasil não cabe no quintal de ninguém.',
    source: 'Lula na ONU · Radioagência Nacional (EBC), 22/09/2026',
    sourceUrl: ONU_2026
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
export const linesFor = (who: VoiceLine['who'], when: VoiceLine['when']) =>
  VOICE_LINES.filter((l) => l.who === who && l.when === when);

/** Toca uma fala sorteada (se houver, se o som estiver ligado e as falas também). Devolve a fala. */
export function playLine(who: VoiceLine['who'], when: VoiceLine['when']): VoiceLine | null {
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
    gain.gain.value = 1.2;
    src.connect(gain).connect(audio.sfx);
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
