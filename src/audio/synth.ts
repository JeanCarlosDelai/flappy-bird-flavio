import { audio } from './engine';

/** Blocos de som chiptune: pulso 25%, triângulo, ruído. */

const waves = new WeakMap<BaseAudioContext, PeriodicWave>();

/** Onda de pulso 25% (som clássico de videogame). */
function pulseWave(ctx: BaseAudioContext): PeriodicWave {
  let w = waves.get(ctx);
  if (!w) {
    const n = 32;
    const real = new Float32Array(n);
    const imag = new Float32Array(n);
    const duty = 0.25;
    for (let k = 1; k < n; k++) imag[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty);
    w = ctx.createPeriodicWave(real, imag);
    waves.set(ctx, w);
  }
  return w;
}

let noiseBuffer: AudioBuffer | null = null;
function noise(ctx: BaseAudioContext): AudioBuffer {
  if (!noiseBuffer || noiseBuffer.sampleRate !== ctx.sampleRate) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

export const midiToHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

export type Voice = 'pulse' | 'square' | 'triangle' | 'sawtooth' | 'sine';

export interface ToneOptions {
  freq: number;
  /** Frequência final (desliza até ela). */
  to?: number;
  start?: number;
  duration: number;
  volume?: number;
  voice?: Voice;
  /** Saída: música ou efeitos. */
  bus?: 'music' | 'sfx';
  attack?: number;
  release?: number;
}

export function tone(o: ToneOptions): void {
  const ctx = audio.ctx;
  if (!ctx) return;
  const t = o.start ?? audio.now;
  const osc = ctx.createOscillator();
  if (!o.voice || o.voice === 'pulse') osc.setPeriodicWave(pulseWave(ctx));
  else osc.type = o.voice;
  osc.frequency.setValueAtTime(o.freq, t);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t + o.duration);
  const g = ctx.createGain();
  const vol = o.volume ?? 0.3;
  const attack = o.attack ?? 0.005;
  const release = o.release ?? Math.min(0.08, o.duration * 0.5);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + attack);
  g.gain.setValueAtTime(vol, t + Math.max(attack, o.duration - release));
  g.gain.linearRampToValueAtTime(0, t + o.duration);
  osc.connect(g).connect(o.bus === 'music' ? audio.music : audio.sfx);
  osc.start(t);
  osc.stop(t + o.duration + 0.02);
}

export interface NoiseOptions {
  start?: number;
  duration: number;
  volume?: number;
  /** Filtro: passa-altas (chiado) ou passa-baixas (explosão). */
  highpass?: number;
  lowpass?: number;
  bus?: 'music' | 'sfx';
}

export function burst(o: NoiseOptions): void {
  const ctx = audio.ctx;
  if (!ctx) return;
  const t = o.start ?? audio.now;
  const src = ctx.createBufferSource();
  src.buffer = noise(ctx);
  let node: AudioNode = src;
  if (o.highpass) {
    const f = ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = o.highpass;
    node = node.connect(f);
  }
  if (o.lowpass) {
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = o.lowpass;
    node = node.connect(f);
  }
  const g = ctx.createGain();
  g.gain.setValueAtTime(o.volume ?? 0.3, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + o.duration);
  node.connect(g).connect(o.bus === 'music' ? audio.music : audio.sfx);
  src.start(t, Math.random() * 0.5);
  src.stop(t + o.duration + 0.02);
}

/** Bumbo: seno com queda rápida de tom. */
export function kick(start: number, bus: 'music' | 'sfx' = 'music', volume = 0.55): void {
  tone({ freq: 150, to: 45, start, duration: 0.14, volume, voice: 'sine', bus, release: 0.1 });
}
