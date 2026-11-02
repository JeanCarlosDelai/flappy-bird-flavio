import './credits.css';

declare const __APP_VERSION__: string;

/** Versão do jogo (package.json). */
export const APP_VERSION = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev';

const GITHUB = 'https://github.com/JeanCarlosDelai';
const LINKEDIN = 'https://www.linkedin.com/in/jean-carlos-delai-vieceli-9b21a7243/';

/** Linha pequenininha: versão · GitHub · LinkedIn. */
export function creditsLine(className = ''): HTMLElement {
  const p = document.createElement('p');
  p.className = `credits ${className}`.trim();
  const link = (href: string, text: string) => {
    const a = document.createElement('a');
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = text;
    return a;
  };
  p.append(`v${APP_VERSION} · `, link(GITHUB, 'GitHub'), ' · ', link(LINKEDIN, 'LinkedIn'));
  return p;
}

/** Nas páginas com rodapé (landing, ranking, coleção…), coloca a linha no fim do rodapé. */
export function addCreditsToFooter(): void {
  const footer = document.querySelector('footer');
  if (footer && !footer.querySelector('.credits')) footer.append(creditsLine());
}
