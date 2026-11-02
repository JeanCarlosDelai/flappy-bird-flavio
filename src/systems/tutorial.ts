/**
 * TUTORIAL da primeira partida: o jogo começa mais devagar, sem ataques, e mostra dicas
 * curtas na hora certa. Depois da primeira partida não aparece mais (dá para rever nos ajustes).
 */
const KEY = 'jatinho-do-flavio:tutorial';

export function tutorialDone(): boolean {
  try {
    return globalThis.localStorage?.getItem(KEY) === '1';
  } catch {
    return true;
  }
}

export function setTutorialDone(done: boolean): void {
  try {
    if (done) globalThis.localStorage?.setItem(KEY, '1');
    else globalThis.localStorage?.removeItem(KEY);
  } catch {
    // sem storage
  }
}

/** Pontos em que o tutorial acaba (até lá, mais devagar e sem ataques). */
export const TUTORIAL_POINTS = 6;

export type TutorialTip = 'voar' | 'vao' | 'moeda' | 'batida' | 'pronto';

export const TIPS: Record<TutorialTip, string[]> = {
  voar: ['Toque para subir', 'Solte para descer'],
  vao: ['Passe pelo vão', 'entre as partes do obstáculo'],
  moeda: ['Pegue as moedas', 'e troque no Hangar'],
  batida: ['Cada batida aproxima', 'o perseguidor (barra no alto)'],
  pronto: ['Muito bem!', 'Agora é com você']
};
