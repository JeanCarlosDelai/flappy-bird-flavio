/**
 * Motor de áudio: um AudioContext para o jogo todo, com volumes separados para
 * música e efeitos. Navegadores só liberam som depois do primeiro toque/tecla.
 */
import { onSettingsChange, settings } from '@/systems/settings';

export type SoundMode = 'tudo' | 'efeitos' | 'mudo';

const KEY = 'jatinho-do-flavio:som';
const MODES: SoundMode[] = ['tudo', 'efeitos', 'mudo'];
// música e efeitos mais baixos; as falas reais têm canal próprio e ficam em destaque
const MUSIC_VOLUME = 0.3;
const SFX_VOLUME = 0.48;
const VOICE_VOLUME = 1.0;

let ctx: AudioContext | null = null;
/** Contexto de gravação (OfflineAudioContext), usado só para exportar amostras. */
let offline: BaseAudioContext | null = null;
let offlineMusic: GainNode;
let offlineSfx: GainNode;
/** Desloca o "agora" dos efeitos na gravação, para tocar um depois do outro. */
let offlineClock = 0;
let master: GainNode;
let musicBus: GainNode;
let sfxBus: GainNode;
let voiceBus: GainNode;
let mode: SoundMode = loadMode();
let ducked = false;
/** Multiplicador da música para trocar de faixa suavemente (0 a 1). */
let musicFade = 1;
const unlockListeners: (() => void)[] = [];

function loadMode(): SoundMode {
  try {
    const saved = localStorage.getItem(KEY) as SoundMode | null;
    return saved && MODES.includes(saved) ? saved : 'tudo';
  } catch {
    return 'tudo';
  }
}

function applyVolumes(): void {
  if (!ctx) return;
  const t = ctx.currentTime;
  const music = mode === 'tudo' ? MUSIC_VOLUME * settings.musicVolume * (ducked ? 0.35 : 1) * musicFade : 0;
  musicBus.gain.setTargetAtTime(music, t, musicFade < 1 ? 0.25 : 0.4);
  sfxBus.gain.setTargetAtTime(mode === 'mudo' ? 0 : SFX_VOLUME * settings.sfxVolume, t, 0.03);
  voiceBus.gain.setTargetAtTime(mode === 'mudo' ? 0 : VOICE_VOLUME * settings.voiceVolume, t, 0.03);
}
onSettingsChange(applyVolumes);

/** Roda quem estava esperando o áudio ficar pronto (só quando está tocando de fato). */
function flushIfRunning(): void {
  if (ctx?.state !== 'running') return;
  for (const fn of unlockListeners.splice(0)) fn();
}

/**
 * Cria/retoma o áudio. Precisa rodar dentro de um gesto que o navegador aceite:
 * no celular isso é soltar o dedo (pointerup/touchend/click), não encostar.
 */
export function unlockAudio(): void {
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  if (!ctx) {
    // iPhone: tratar como mídia para tocar mesmo com a chave de silencioso ligada
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session) {
      try {
        session.type = 'playback';
      } catch {
        // navegador sem suporte
      }
    }
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
    musicBus = ctx.createGain();
    sfxBus = ctx.createGain();
    voiceBus = ctx.createGain();
    musicBus.connect(master);
    sfxBus.connect(master);
    voiceBus.connect(master);
    musicBus.gain.value = 0;
    sfxBus.gain.value = 0;
    voiceBus.gain.value = 0;
    ctx.addEventListener('statechange', flushIfRunning);
    applyVolumes();
  }
  if (ctx.state !== 'running') {
    // iOS antigo só destrava tocando algo dentro do gesto: um instante de silêncio
    const silent = ctx.createBufferSource();
    silent.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    silent.connect(ctx.destination);
    silent.start(0);
    void ctx.resume().then(flushIfRunning, () => undefined);
  }
  flushIfRunning();
}

/** Roda `fn` quando o áudio estiver tocando (agora, se já estiver). */
export function onUnlock(fn: () => void): void {
  if (ctx?.state === 'running') fn();
  else if (!unlockListeners.includes(fn)) unlockListeners.push(fn);
}

export const audio = {
  get ctx(): BaseAudioContext | null {
    if (offline) return offline;
    return ctx && ctx.state === 'running' ? ctx : null;
  },
  /** "Agora" para agendar efeitos. */
  get now(): number {
    if (offline) return offlineClock;
    return ctx?.currentTime ?? 0;
  },
  get music(): GainNode {
    return offline ? offlineMusic : musicBus;
  },
  get sfx(): GainNode {
    return offline ? offlineSfx : sfxBus;
  },
  /** Canal das falas reais (volume próprio, mais alto que os efeitos). */
  get voice(): GainNode {
    return offline ? offlineSfx : voiceBus;
  }
};

/** Liga a gravação num OfflineAudioContext (ferramenta de exportação). */
export function useOfflineContext(c: BaseAudioContext): void {
  offline = c;
  const out = c.createGain();
  out.gain.value = 0.9;
  out.connect(c.destination);
  offlineMusic = c.createGain();
  offlineMusic.gain.value = MUSIC_VOLUME;
  offlineSfx = c.createGain();
  offlineSfx.gain.value = SFX_VOLUME;
  offlineMusic.connect(out);
  offlineSfx.connect(out);
}

export function setOfflineClock(t: number): void {
  offlineClock = t;
}

export function getSoundMode(): SoundMode {
  return mode;
}

/** Tudo → só efeitos → sem som → tudo. */
export function cycleSoundMode(): SoundMode {
  mode = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    // sem storage
  }
  applyVolumes();
  return mode;
}

/** Some/volta com a música devagar (troca de faixa). */
export function fadeMusic(level: number): void {
  musicFade = level;
  applyVolumes();
}

/** Abaixa a música (pausa) sem parar. */
export function duckMusic(on: boolean): void {
  ducked = on;
  applyVolumes();
}

// libera o som no primeiro gesto e pausa o áudio quando a aba some
if (typeof window !== 'undefined') {
  // gestos que os navegadores aceitam para liberar som (no toque: ao soltar o dedo)
  for (const type of ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown']) {
    window.addEventListener(type, unlockAudio, { capture: true });
  }
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) void ctx.suspend();
    else void ctx.resume().then(flushIfRunning, () => undefined);
  });
}

/** Estado do áudio, para depuração em desenvolvimento. */
if (import.meta.env?.DEV && typeof window !== 'undefined') {
  let analyser: AnalyserNode | null = null;
  Object.assign(window, {
    __audioState: () => ctx?.state ?? 'none',
    /** Volume (RMS) saindo agora, 0 = silêncio. */
    __audioLevel: () => {
      if (!ctx) return 0;
      if (!analyser) {
        analyser = ctx.createAnalyser();
        master.connect(analyser);
      }
      const data = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(data);
      return Math.sqrt(data.reduce((s, v) => s + v * v, 0) / data.length);
    }
  });
}
