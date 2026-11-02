/**
 * VERCEL WEB ANALYTICS: visitas por página (sem cookies) e alguns eventos do jogo.
 * Só carrega no site publicado; precisa estar ligado no painel da Vercel (aba Analytics).
 * Eventos personalizados só aparecem nos planos que têm esse recurso; nos outros são ignorados.
 */
type Va = (kind: 'event' | 'pageview', data?: Record<string, unknown>) => void;
declare global {
  interface Window {
    va?: Va;
    vaq?: unknown[][];
  }
}

if (typeof window !== 'undefined' && import.meta.env.PROD && !document.querySelector('script[data-va]')) {
  window.va = window.va || ((...args: unknown[]) => (window.vaq = window.vaq || []).push(args));
  const s = document.createElement('script');
  s.defer = true;
  s.src = '/_vercel/insights/script.js';
  s.dataset.va = '1';
  document.head.append(s);
}

/** Registra um evento (nome curto + até 2–3 dados simples). Nunca quebra o jogo. */
export function track(name: string, data?: Record<string, string | number | boolean>): void {
  try {
    window.va?.('event', { name, data });
  } catch {
    // sem analytics
  }
}
