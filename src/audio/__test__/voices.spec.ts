import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { VOICE_LINES } from '../voices';

describe('falas reais', () => {
  it('toda fala tem arquivo, transcrição, fonte e link', () => {
    const ids = new Set<string>();
    for (const line of VOICE_LINES) {
      expect(ids.has(line.id), `id repetido: ${line.id}`).toBe(false);
      ids.add(line.id);
      expect(existsSync(`public/falas/${line.id}.mp3`), `falta public/falas/${line.id}.mp3`).toBe(true);
      expect(line.text.trim().length).toBeGreaterThan(0);
      expect(line.source.trim().length).toBeGreaterThan(0);
      expect(line.sourceUrl).toMatch(/^https:\/\//);
    }
  });
});
