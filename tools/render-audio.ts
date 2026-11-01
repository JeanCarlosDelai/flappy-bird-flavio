/**
 * Grava músicas e efeitos num OfflineAudioContext e devolve WAV em base64.
 * Usado por `node tools/capture-audio.cjs` para gerar as amostras em docs/audio/.
 */
import { setOfflineClock, useOfflineContext } from '@/audio/engine';
import { compile, music, type TrackName } from '@/audio/music';
import { sfx } from '@/audio/sfx';

const RATE = 44100;

function toWavBase64(buffer: AudioBuffer): string {
  const data = buffer.getChannelData(0);
  const bytes = new ArrayBuffer(44 + data.length * 2);
  const v = new DataView(bytes);
  const str = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF');
  v.setUint32(4, 36 + data.length * 2, true);
  str(8, 'WAVE');
  str(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, RATE, true);
  v.setUint32(28, RATE * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  str(36, 'data');
  v.setUint32(40, data.length * 2, true);
  for (let i = 0; i < data.length; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, data[i])) * 0x7fff, true);
  let bin = '';
  const u8 = new Uint8Array(bytes);
  for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode(...u8.subarray(i, i + 0x8000));
  return btoa(bin);
}

async function renderTrack(name: TrackName, loops: number): Promise<string> {
  const t = compile(name);
  const seconds = t.steps * t.stepDur * loops + 0.6;
  const ctx = new OfflineAudioContext(1, Math.ceil(seconds * RATE), RATE);
  useOfflineContext(ctx);
  music.scheduleLoops(name, 0.05, loops);
  return toWavBase64(await ctx.startRendering());
}

/** Todos os efeitos, um depois do outro, com 0,4 s de silêncio entre eles. */
const SFX_LIST: [string, () => void, number][] = [
  ['voar', () => sfx.flap(), 0.3],
  ['ponto', () => sfx.point(), 0.4],
  ['batida', () => sfx.hit(), 0.5],
  ['radar', () => sfx.radar(), 0.4],
  ['novo perseguidor', () => sfx.chaser(), 0.9],
  ['perigo', () => sfx.danger(), 0.5],
  ['nova região', () => sfx.region(), 0.8],
  ['pausa', () => sfx.pause(true), 0.4],
  ['volta', () => sfx.pause(false), 0.4],
  ['caiu', () => sfx.gameOver(false), 2.3],
  ['pego', () => sfx.gameOver(true), 2.2],
  ['recorde', () => sfx.record(), 3.1]
];

async function renderSfx(): Promise<string> {
  const total = SFX_LIST.reduce((s, [, , d]) => s + d + 0.4, 0.3);
  const ctx = new OfflineAudioContext(1, Math.ceil(total * RATE), RATE);
  useOfflineContext(ctx);
  let t = 0.2;
  for (const [, play, dur] of SFX_LIST) {
    setOfflineClock(t);
    play();
    t += dur + 0.4;
  }
  return toWavBase64(await ctx.startRendering());
}

Object.assign(window, { renderTrack, renderSfx, sfxNames: SFX_LIST.map(([n]) => n) });
document.body.dataset.ready = '1';
