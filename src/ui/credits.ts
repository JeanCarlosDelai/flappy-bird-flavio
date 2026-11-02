import './credits.css';

declare const __APP_VERSION__: string;

/** Versão do jogo (package.json). */
export const APP_VERSION = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev';

/** Linha pequenininha só com a versão do jogo. */
export function creditsLine(className = ''): HTMLElement {
  const p = document.createElement('p');
  p.className = `credits ${className}`.trim();
  p.textContent = `v${APP_VERSION}`;
  return p;
}

/** Nas páginas com rodapé (landing, ranking, coleção…), coloca a versão no fim do rodapé. */
export function addCreditsToFooter(): void {
  const footer = document.querySelector('footer');
  if (footer && !footer.querySelector('.credits')) footer.append(creditsLine());
}
