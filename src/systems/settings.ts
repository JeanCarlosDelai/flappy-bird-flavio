/**
 * AJUSTES do jogador (salvos no aparelho): volume da música e dos efeitos, vibração,
 * "reduzir efeitos" (sem flashes, raios e tremidas) e qualidade gráfica.
 */
export interface Settings {
  /** 0 a 1. */
  musicVolume: number;
  sfxVolume: number;
  vibration: boolean;
  reduceEffects: boolean;
  /** auto: baixa sozinho se o celular ficar lento. */
  quality: 'auto' | 'alta' | 'leve';
  /** Falas reais dos personagens (quando existirem). */
  voices: boolean;
}

const KEY = 'jatinho-do-flavio:ajustes';
export const DEFAULT_SETTINGS: Settings = { musicVolume: 1, sfxVolume: 1, vibration: true, reduceEffects: false, quality: 'auto', voices: true };

function load(): Settings {
  try {
    const saved = JSON.parse(globalThis.localStorage?.getItem(KEY) ?? '{}') as Partial<Settings>;
    const s = { ...DEFAULT_SETTINGS, ...saved };
    const clamp = (v: number) => (Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 1);
    return { ...s, musicVolume: clamp(s.musicVolume), sfxVolume: clamp(s.sfxVolume) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/** Ajustes atuais (o mesmo objeto é atualizado por `saveSettings`). */
export const settings: Settings = load();
const listeners: (() => void)[] = [];

export function saveSettings(patch: Partial<Settings>): void {
  Object.assign(settings, patch);
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify(settings));
  } catch {
    // sem storage
  }
  for (const fn of listeners) fn();
}

export function onSettingsChange(fn: () => void): void {
  listeners.push(fn);
}

/** Vibra só se o jogador deixou. */
export function vibrate(pattern: number | number[]): void {
  if (settings.vibration) navigator.vibrate?.(pattern);
}

// ---------- qualidade automática ----------

let autoLow = false;
let slowTime = 0;
let lastFrame = 0;

/** Chamado a cada desenho da partida: se ficar lento por 3 s, passa para o modo leve. */
export function trackFrame(now = performance.now()): void {
  if (lastFrame) {
    const dt = now - lastFrame;
    if (dt > 26 && dt < 250) slowTime += dt;
    else slowTime = Math.max(0, slowTime - dt * 0.5);
    if (slowTime > 3000) autoLow = true;
  }
  lastFrame = now;
}

/** Gráficos leves (menos partículas): escolhido nos ajustes ou detectado sozinho. */
export const lowQuality = () => settings.quality === 'leve' || (settings.quality === 'auto' && autoLow);
