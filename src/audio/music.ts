import { audio, onUnlock } from './engine';
import { burst, kick, midiToHz, tone } from './synth';

/**
 * Músicas chiptune originais, escritas como texto: cada compasso tem 16 passos
 * (semicolcheias). Nota = "C5", "F#4", "Bb2"; "-" segura a nota anterior; "." = pausa.
 * Bateria: k = bumbo, s = caixa, h = chimbal.
 */
interface Track {
  bpm: number;
  lead: string[];
  bass: string[];
  drums: string[];
}

export type TrackName = 'menu' | 'brasilia' | 'litoral' | 'oceano' | 'fronteira';

const TRACKS: Record<TrackName, Track> = {
  menu: {
    bpm: 128,
    lead: [
      'E5 - G5 - C6 - B5 A5 G5 - E5 - D5 - C5 -',
      'F5 - A5 - C6 - A5 G5 F5 - E5 - D5 - . .',
      'E5 - G5 - C6 - B5 A5 G5 - A5 - B5 - C6 -',
      'D6 - B5 - G5 - E5 F5 G5 - - - . . . .'
    ],
    bass: [
      'C3 . C3 . G2 . G2 . A2 . A2 . E2 . E2 .',
      'F2 . F2 . C3 . C3 . D3 . D3 . G2 . G2 .',
      'C3 . C3 . G2 . G2 . A2 . A2 . F2 . F2 .',
      'G2 . G2 . G2 . G2 . G2 . B2 . D3 . G2 .'
    ],
    drums: ['k . h . s . h . k . h . s . h h']
  },
  brasilia: {
    bpm: 140,
    lead: [
      'G4 - B4 D5 G5 - F#5 E5 D5 - B4 - G4 - A4 -',
      'B4 - D5 G5 B5 - A5 G5 F#5 - E5 - D5 - . .',
      'C5 - E5 G5 C6 - B5 A5 G5 - E5 - C5 - D5 -',
      'D5 - F#5 A5 D6 - C6 A5 G5 - - - . . . .'
    ],
    bass: [
      'G2 . D3 . G2 . D3 . G2 . D3 . G2 . D3 .',
      'E2 . B2 . E2 . B2 . E2 . B2 . E2 . B2 .',
      'C3 . G2 . C3 . G2 . C3 . G2 . C3 . G2 .',
      'D3 . A2 . D3 . A2 . D3 . A2 . D3 . F#2 .'
    ],
    drums: ['k . h . s . h . k . h k s . h .']
  },
  litoral: {
    bpm: 108,
    lead: [
      'A5 . G5 A5 . C6 . A5 G5 . F5 . D5 - . .',
      'C5 . D5 F5 . G5 . A5 - - G5 . F5 - . .',
      'A5 . G5 A5 . C6 . D6 C6 . A5 . G5 - . .',
      'F5 - G5 - A5 - G5 - F5 - - - . . . .'
    ],
    bass: [
      'F2 . . F2 . . C3 . F2 . . F2 . . C3 .',
      'Bb2 . . Bb2 . . F2 . Bb2 . . Bb2 . . F2 .',
      'D3 . . D3 . . A2 . D3 . . D3 . . A2 .',
      'C3 . . C3 . . G2 . C3 . . C3 . . G2 .'
    ],
    drums: ['k . h s . h k . k . h s . h k h']
  },
  oceano: {
    bpm: 112,
    lead: [
      'A4 C5 E5 A5 E5 C5 A4 C5 E5 A5 E5 C5 B4 - . .',
      'F4 A4 C5 F5 C5 A4 F4 A4 C5 F5 C5 A4 G4 - . .',
      'C5 E5 G5 C6 G5 E5 C5 E5 G5 C6 G5 E5 D5 - . .',
      'E4 G#4 B4 E5 B4 G#4 E4 G#4 B4 E5 - - - - . .'
    ],
    bass: [
      'A2 - - - - - - - E2 - - - - - - -',
      'F2 - - - - - - - C3 - - - - - - -',
      'C3 - - - - - - - G2 - - - - - - -',
      'E2 - - - - - - - E2 - - - B2 - - -'
    ],
    drums: ['k . . . h . . . s . . . h . . h']
  },
  fronteira: {
    bpm: 150,
    lead: [
      'D5 . D5 F5 . D5 A5 . G5 . F5 . E5 . C5 .',
      'D5 . D5 F5 . D5 A5 . Bb5 . A5 . G5 - - -',
      'F5 . F5 A5 . F5 C6 . Bb5 . A5 . G5 . E5 .',
      'D5 - - - A4 - - - D5 . . . . . . .'
    ],
    bass: [
      'D2 . D3 . D2 . D3 . D2 . D3 . D2 . D3 .',
      'Bb1 . Bb2 . Bb1 . Bb2 . Bb1 . Bb2 . Bb1 . Bb2 .',
      'F2 . F3 . F2 . F3 . F2 . F3 . F2 . F3 .',
      'A1 . A2 . A1 . A2 . A1 . A2 . C#2 . E2 .'
    ],
    drums: ['k . h k s . h . k k h . s . h h']
  }
};

const NOTE: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** "F#4" → número MIDI. */
export function noteToMidi(name: string): number {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(name);
  if (!m) throw new Error(`Invalid note: ${name}`);
  const acc = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
  return 12 * (Number(m[3]) + 1) + NOTE[m[1]] + acc;
}

interface NoteEvent {
  step: number;
  midi: number;
  length: number;
}

/** Converte os compassos em notas com duração (em passos). */
export function parseBars(bars: string[]): { events: NoteEvent[]; steps: number } {
  const tokens = bars.flatMap((bar) => {
    const t = bar.trim().split(/\s+/);
    if (t.length !== 16) throw new Error(`Bar must have 16 steps: "${bar}" has ${t.length}`);
    return t;
  });
  const events: NoteEvent[] = [];
  tokens.forEach((tok, i) => {
    if (tok === '-' || tok === '.') return;
    let length = 1;
    while (tokens[i + length] === '-') length++;
    events.push({ step: i, midi: noteToMidi(tok), length });
  });
  return { events, steps: tokens.length };
}

export interface Compiled {
  stepDur: number;
  steps: number;
  lead: Map<number, NoteEvent>;
  bass: Map<number, NoteEvent>;
  drums: string[];
}

const compiled = new Map<TrackName, Compiled>();
export function compile(name: TrackName): Compiled {
  let c = compiled.get(name);
  if (!c) {
    const t = TRACKS[name];
    const lead = parseBars(t.lead);
    const bass = parseBars(t.bass);
    const drums = t.drums.join(' ').trim().split(/\s+/);
    c = {
      stepDur: 60 / t.bpm / 4,
      steps: Math.max(lead.steps, bass.steps),
      lead: new Map(lead.events.map((e) => [e.step, e])),
      bass: new Map(bass.events.map((e) => [e.step, e])),
      drums
    };
    compiled.set(name, c);
  }
  return c;
}

/** Toca a faixa em loop, agendando um pouco à frente (sem engasgar). */
class Sequencer {
  private current: TrackName | null = null;
  private wanted: TrackName | null = null;
  private step = 0;
  private nextTime = 0;
  private timer: number | null = null;

  private readonly startFn = () => this.start();

  play(name: TrackName): void {
    this.wanted = name;
    onUnlock(this.startFn);
  }

  stop(): void {
    this.wanted = null;
    this.current = null;
    if (this.timer !== null) clearInterval(this.timer);
    this.timer = null;
  }

  private start(): void {
    const ctx = audio.ctx;
    if (!ctx || !this.wanted || this.wanted === this.current) return;
    this.current = this.wanted;
    this.step = 0;
    this.nextTime = ctx.currentTime + 0.08;
    if (this.timer === null) this.timer = window.setInterval(() => this.tick(), 25);
  }

  private tick(): void {
    const ctx = audio.ctx;
    if (!ctx) return;
    if (this.wanted !== this.current) this.start();
    if (!this.current) return;
    const track = compile(this.current);
    // se a aba ficou parada, não tenta "recuperar" notas atrasadas
    if (this.nextTime < ctx.currentTime - 0.2) this.nextTime = ctx.currentTime + 0.05;
    while (this.nextTime < ctx.currentTime + 0.12) {
      this.schedule(track, this.step, this.nextTime);
      this.nextTime += track.stepDur;
      this.step = (this.step + 1) % track.steps;
    }
  }

  /** Agenda `loops` voltas completas a partir de `start` (exportação). */
  scheduleLoops(name: TrackName, start: number, loops: number): number {
    const track = compile(name);
    let t = start;
    for (let i = 0; i < track.steps * loops; i++) {
      this.schedule(track, i % track.steps, t);
      t += track.stepDur;
    }
    return t - start;
  }

  private schedule(track: Compiled, step: number, t: number): void {
    const lead = track.lead.get(step);
    if (lead) tone({ freq: midiToHz(lead.midi), start: t, duration: lead.length * track.stepDur * 0.95, volume: 0.16, bus: 'music' });
    const bass = track.bass.get(step);
    if (bass) tone({ freq: midiToHz(bass.midi), start: t, duration: bass.length * track.stepDur * 0.9, volume: 0.3, voice: 'triangle', bus: 'music' });
    const hit = track.drums[step % track.drums.length];
    if (hit === 'k') kick(t, 'music', 0.45);
    else if (hit === 's') burst({ start: t, duration: 0.12, volume: 0.22, highpass: 1200, bus: 'music' });
    else if (hit === 'h') burst({ start: t, duration: 0.03, volume: 0.1, highpass: 7000, bus: 'music' });
  }
}

export const music = new Sequencer();
export const TRACK_NAMES = Object.keys(TRACKS) as TrackName[];
