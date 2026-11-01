/**
 * Motor de áudio: um AudioContext para o jogo todo, com volumes separados para
 * música e efeitos. Navegadores só liberam som depois do primeiro toque/tecla.
 */
export type SoundMode = 'tudo' | 'efeitos' | 'mudo';

const KEY = 'jatinho-do-flavio:som';
const MODES: SoundMode[] = ['tudo', 'efeitos', 'mudo'];
const MUSIC_VOLUME = 0.5;
const SFX_VOLUME = 0.8;

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
let mode: SoundMode = loadMode();
let ducked = false;
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
  const music = mode === 'tudo' ? MUSIC_VOLUME * (ducked ? 0.35 : 1) : 0;
  musicBus.gain.setTargetAtTime(music, t, 0.08);
  sfxBus.gain.setTargetAtTime(mode === 'mudo' ? 0 : SFX_VOLUME, t, 0.03);
}

/** Cria/retoma o áudio. Chamado no primeiro toque ou tecla. */
export function unlockAudio(): void {
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  if (!ctx) {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
    musicBus = ctx.createGain();
    sfxBus = ctx.createGain();
    musicBus.connect(master);
    sfxBus.connect(master);
    musicBus.gain.value = 0;
    sfxBus.gain.value = 0;
    applyVolumes();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  for (const fn of unlockListeners.splice(0)) fn();
}

export function onUnlock(fn: () => void): void {
  if (ctx && ctx.state !== 'closed') fn();
  else unlockListeners.push(fn);
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

/** Abaixa a música (pausa) sem parar. */
export function duckMusic(on: boolean): void {
  ducked = on;
  applyVolumes();
}

// libera o som no primeiro gesto e pausa o áudio quando a aba some
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', unlockAudio, { capture: true });
  window.addEventListener('keydown', unlockAudio, { capture: true });
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) void ctx.suspend();
    else void ctx.resume();
  });
}
