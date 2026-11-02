import './credits.css';
import { saveSettings, settings } from '@/systems/settings';
import { tapCounter, toast, unlockSecret } from '@/systems/secrets';

declare const __APP_VERSION__: string;

/** Versão do jogo (package.json). */
export const APP_VERSION = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev';

/** Linha pequenininha só com a versão do jogo (7 toques nela = câmera lenta, segredo). */
export function creditsLine(className = ''): HTMLElement {
  const p = document.createElement('p');
  p.className = `credits ${className}`.trim();
  const paint = () => (p.textContent = `v${APP_VERSION}${settings.slowMotion ? ' · 🐢 câmera lenta' : ''}`);
  paint();
  const tap = tapCounter(7, () => {
    const first = unlockSecret('lento');
    saveSettings({ slowMotion: !settings.slowMotion });
    paint();
    toast(
      settings.slowMotion
        ? `🐢 Câmera lenta ligada${first ? ' · Conquista secreta: Câmera lenta' : ''} (não conta para o ranking)`
        : '🐢 Câmera lenta desligada'
    );
  });
  p.addEventListener('click', (e) => {
    e.stopPropagation();
    tap();
  });
  return p;
}

/** Nas páginas com rodapé (landing, ranking, coleção…), coloca a versão no fim do rodapé. */
export function addCreditsToFooter(): void {
  const footer = document.querySelector('footer');
  if (footer && !footer.querySelector('.credits')) footer.append(creditsLine());
}
