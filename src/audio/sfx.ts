import { audio } from './engine';
import { burst, kick, midiToHz, tone } from './synth';

/** Efeitos sonoros em chiptune. Nenhum faz nada se o som ainda não foi liberado. */

const now = () => audio.now;

function arpeggio(notes: number[], step: number, volume = 0.22, voice: 'pulse' | 'square' | 'triangle' = 'pulse') {
  const t = now();
  notes.forEach((n, i) => tone({ freq: midiToHz(n), start: t + i * step, duration: step * 1.1, volume, voice }));
}

export const sfx = {
  /** Toque para subir: "fuu" curto subindo. */
  flap() {
    tone({ freq: 330, to: 620, duration: 0.09, volume: 0.13, voice: 'square' });
  },
  /** Passou um obstáculo: moedinha. */
  point() {
    const t = now();
    tone({ freq: midiToHz(83), start: t, duration: 0.06, volume: 0.16 });
    tone({ freq: midiToHz(88), start: t + 0.06, duration: 0.12, volume: 0.16 });
  },
  /** Bateu: ruído + queda de tom. */
  hit() {
    burst({ duration: 0.25, volume: 0.4, lowpass: 2200 });
    tone({ freq: 220, to: 70, duration: 0.25, volume: 0.25, voice: 'square' });
  },
  /** Radar te viu: bip-bip agudo. */
  radar() {
    const t = now();
    for (const d of [0, 0.12]) tone({ freq: 1760, start: t + d, duration: 0.07, volume: 0.12, voice: 'square' });
  },
  /** Novo perseguidor: sirene sobe e desce. */
  chaser() {
    const t = now();
    tone({ freq: 600, to: 900, start: t, duration: 0.22, volume: 0.13, voice: 'square' });
    tone({ freq: 900, to: 600, start: t + 0.22, duration: 0.22, volume: 0.13, voice: 'square' });
    tone({ freq: 600, to: 900, start: t + 0.44, duration: 0.22, volume: 0.13, voice: 'square' });
  },
  /** Perigo alto: batida de coração. */
  danger() {
    const t = now();
    kick(t, 'sfx', 0.5);
    kick(t + 0.16, 'sfx', 0.35);
  },
  /** Nova região: fanfarra curta. */
  region() {
    arpeggio([72, 76, 79, 84, 79, 84], 0.09, 0.18);
  },
  /** Pausa / volta. */
  pause(paused: boolean) {
    arpeggio(paused ? [84, 79, 72] : [72, 79, 84], 0.06, 0.14, 'square');
  },
  /** Moeda. */
  coin() {
    const t = now();
    tone({ freq: midiToHz(88), start: t, duration: 0.05, volume: 0.12, voice: 'square' });
    tone({ freq: midiToHz(95), start: t + 0.05, duration: 0.09, volume: 0.12, voice: 'square' });
  },
  /** Power-up. */
  powerUp() {
    arpeggio([72, 79, 84, 91], 0.05, 0.16, 'square');
  },
  /** Escudo quebrou (batida absorvida). */
  shield() {
    tone({ freq: 900, to: 300, duration: 0.25, volume: 0.18, voice: 'triangle' });
    burst({ duration: 0.12, volume: 0.15, highpass: 3000 });
  },
  /** Passou raspando. */
  nearMiss() {
    tone({ freq: 500, to: 1400, duration: 0.12, volume: 0.1, voice: 'sawtooth' });
  },
  /** Ataque lançado (whoosh). */
  attack() {
    burst({ duration: 0.18, volume: 0.12, highpass: 2000 });
  },
  /** Chefe chegou / foi vencido. */
  boss(start: boolean) {
    arpeggio(start ? [60, 63, 66, 69, 72] : [72, 76, 79, 84, 88], 0.08, 0.18, 'square');
  },
  /** Novidade na coleção: "pegou item". */
  discover() {
    arpeggio([79, 83, 86, 91], 0.07, 0.16, 'square');
  },
  /** Botões e trocas de som. */
  click() {
    tone({ freq: 1200, duration: 0.04, volume: 0.1, voice: 'square' });
  },
  /** Fim de jogo: descida triste. */
  gameOver(caught: boolean) {
    const t = now();
    if (!caught) {
      tone({ freq: 700, to: 90, start: t, duration: 0.6, volume: 0.2, voice: 'square' });
      burst({ start: t + 0.55, duration: 0.5, volume: 0.45, lowpass: 900 });
    } else {
      burst({ start: t, duration: 0.15, volume: 0.25, highpass: 1500 });
    }
    [67, 66, 65, 64].forEach((n, i) =>
      tone({ freq: midiToHz(n), start: t + 0.7 + i * 0.22, duration: i === 3 ? 0.6 : 0.2, volume: 0.2 })
    );
    tone({ freq: midiToHz(40), start: t + 1.36, duration: 0.6, volume: 0.25, voice: 'triangle' });
  },
  /** Recorde novo: fanfarra feliz. */
  record() {
    const t = now() + 1.9;
    [72, 76, 79, 84].forEach((n, i) => tone({ freq: midiToHz(n), start: t + i * 0.1, duration: 0.12, volume: 0.18 }));
    tone({ freq: midiToHz(88), start: t + 0.4, duration: 0.5, volume: 0.2 });
    tone({ freq: midiToHz(48), start: t + 0.4, duration: 0.5, volume: 0.22, voice: 'triangle' });
  }
};
