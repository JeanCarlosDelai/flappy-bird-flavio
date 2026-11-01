import { describe, expect, it } from 'vitest';
import { TRACK_NAMES, compile, noteToMidi, parseBars } from '../music';

describe('music notation', () => {
  it('converts note names to MIDI', () => {
    expect(noteToMidi('A4')).toBe(69);
    expect(noteToMidi('C4')).toBe(60);
    expect(noteToMidi('F#4')).toBe(66);
    expect(noteToMidi('Bb1')).toBe(34);
  });

  it('holds notes over "-" and skips "."', () => {
    const { events, steps } = parseBars(['C4 - - . E4 . . . . . . . . . G4 -']);
    expect(steps).toBe(16);
    expect(events).toEqual([
      { step: 0, midi: 60, length: 3 },
      { step: 4, midi: 64, length: 1 },
      { step: 14, midi: 67, length: 2 }
    ]);
  });

  it('rejects bars that are not 16 steps', () => {
    expect(() => parseBars(['C4 - -'])).toThrow(/16 steps/);
  });
});

// garante que todas as músicas estão bem escritas (16 passos por compasso, notas válidas)
describe('tracks', () => {
  it.each(TRACK_NAMES)('%s parses and loops in whole bars', (name) => {
    const track = compile(name);
    expect(track.steps % 16).toBe(0);
    expect(track.lead.size).toBeGreaterThan(0);
    expect(track.bass.size).toBeGreaterThan(0);
  });
});
