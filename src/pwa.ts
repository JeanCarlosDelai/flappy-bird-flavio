import './analytics';
import { addCreditsToFooter } from './ui/credits';

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addCreditsToFooter);
  else addCreditsToFooter();
}
/**
 * PWA: registra o service worker (offline) e cuida do botão "Instalar".
 * Só liga no site publicado (no `npm run dev` o cache atrapalharia).
 */
interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

export const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.matchMedia('(display-mode: fullscreen)').matches ||
  (navigator as unknown as { standalone?: boolean }).standalone === true;

export const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/** Dá para mostrar o botão "Instalar"? (Android/Chrome com pedido pronto, ou iPhone fora do app.) */
export const canOfferInstall = () => !isStandalone() && (deferred !== null || isIos());

export function onInstallAvailabilityChange(fn: () => void): void {
  listeners.add(fn);
}

/** Abre o pedido de instalação (Android/Chrome) ou o passo a passo (iPhone). */
export async function install(): Promise<void> {
  if (deferred) {
    await deferred.prompt();
    await deferred.userChoice;
    deferred = null;
    notify();
    return;
  }
  showIosHelp();
}

function showIosHelp(): void {
  if (document.getElementById('pwa-help')) return;
  const box = document.createElement('div');
  box.id = 'pwa-help';
  box.innerHTML = `
    <div class="pwa-card" role="dialog" aria-label="Instalar no iPhone">
      <b>📲 Instalar no iPhone</b>
      <ol>
        <li>Abra este site no <b>Safari</b>.</li>
        <li>Toque em <b>Compartilhar</b> (quadrado com seta para cima).</li>
        <li>Escolha <b>Adicionar à Tela de Início</b> e toque em <b>Adicionar</b>.</li>
      </ol>
      <button type="button">Entendi</button>
    </div>`;
  box.addEventListener('click', (e) => {
    if (e.target === box || (e.target as HTMLElement).tagName === 'BUTTON') box.remove();
  });
  document.body.append(box);
}

const style = document.createElement('style');
style.textContent = `
#pwa-help { position: fixed; inset: 0; z-index: 50; background: rgba(5, 10, 25, .7); display: grid; place-items: center; padding: 16px; }
.pwa-card { max-width: 340px; background: #0b1d3a; color: #eef2fb; border: 4px solid #ffd23f; box-shadow: 0 0 0 4px #1b1420, 8px 8px 0 4px #1b1420; padding: 16px 18px; font: 15px/1.5 system-ui, sans-serif; }
.pwa-card b:first-child { color: #ffd23f; font-size: 1.1rem; }
.pwa-card ol { padding-left: 1.2rem; margin: .6rem 0 1rem; }
.pwa-card button { font: inherit; font-weight: 900; width: 100%; padding: 10px; background: #ffd23f; color: #0b1d3a; border: 3px solid #1b1420; cursor: pointer; }
`;
document.head.append(style);

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferred = e as InstallPromptEvent;
  notify();
});
window.addEventListener('appinstalled', () => {
  deferred = null;
  notify();
});

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => undefined);
  });
}
