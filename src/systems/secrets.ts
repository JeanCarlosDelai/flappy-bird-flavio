import { MEDALS } from './medals';
import { addCoins, grantMedal, loadProgress, saveProgress } from './progress';

/**
 * SEGREDOS escondidos fora da partida. Cada um dá uma conquista secreta (com moedas).
 * - "janela": tocar 10 vezes no Flávio na janela, no Hangar -> libera a skin secreta "Flávio ninja".
 * - "lento": tocar 7 vezes na versão do jogo (rodapé) -> liga/desliga o modo câmera lenta.
 */
export type SecretId = 'janela' | 'lento';

export const SECRET_MEDAL: Record<SecretId, string> = { janela: 'segredo-janela', lento: 'segredo-lento' };

export const hasSecret = (id: SecretId) => (loadProgress().secrets ?? []).includes(id);

/** Registra o segredo; na primeira vez dá a conquista e as moedas. Devolve true se é novidade. */
export function unlockSecret(id: SecretId, extra?: (p: ReturnType<typeof loadProgress>) => void): boolean {
  const p = loadProgress();
  const secrets = p.secrets ?? [];
  if (secrets.includes(id)) return false;
  p.secrets = [...secrets, id];
  extra?.(p);
  saveProgress(p);
  const medal = MEDALS.find((m) => m.id === SECRET_MEDAL[id]);
  if (medal && grantMedal(medal.id)) addCoins(medal.reward);
  return true;
}

/** Contador de toques rápidos: chama `done` quando chegar a `target` toques sem pausa longa. */
export function tapCounter(target: number, done: () => void, windowMs = 1500): () => number {
  let count = 0;
  let last = 0;
  return () => {
    const now = Date.now();
    count = now - last < windowMs ? count + 1 : 1;
    last = now;
    if (count >= target) {
      count = 0;
      done();
    }
    return count;
  };
}

/** Aviso flutuante simples (páginas HTML). */
export function toast(text: string): void {
  const el = document.createElement('div');
  el.className = 'secret-toast';
  el.textContent = text;
  document.body.append(el);
  setTimeout(() => el.remove(), 3200);
}
