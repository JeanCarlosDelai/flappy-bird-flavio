import type { GlobalStats, RankingEntry, RunResult } from '@server/types';
import type { RunStats } from '@/systems/session';

/** URL da API: mesma origem do site (Vercel). */
const BASE = new URL('./api/', document.baseURI);

async function call<T>(path: string, init?: RequestInit): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(new URL(path, BASE), {
      ...init,
      signal: controller.signal,
      headers: { 'content-type': 'application/json' }
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError(res.status, (body as { error?: string } | null)?.error ?? 'error');
    return body as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    return null; // offline ou API fora do ar: o jogo segue só com dados locais
  } finally {
    clearTimeout(timer);
  }
}

export class ApiError extends Error {
  constructor(public status: number, public code: string) {
    super(code);
  }
}

export const api = {
  reportRun: (run: RunStats) => call<RunResult>('runs', { method: 'POST', body: JSON.stringify(run) }).catch(() => null),
  submitName: (runId: string, name: string) =>
    call<{ position: number; best: number; score: number; name: string }>('ranking', {
      method: 'POST',
      body: JSON.stringify({ runId, name })
    }),
  ranking: (period: 'all' | 'day') =>
    call<{ entries: RankingEntry[] }>(`ranking?period=${period}`).catch(() => null),
  stats: () => call<GlobalStats>('stats').catch(() => null)
};

/** Mensagens de erro do ranking em português. */
export function nameErrorMessage(code: string): string {
  switch (code) {
    case 'name_length':
      return 'O apelido precisa ter de 2 a 16 caracteres.';
    case 'name_chars':
      return 'Use só letras, números, espaço e . _ - !';
    case 'name_blocked':
      return 'Esse apelido não dá. Escolha outro.';
    case 'run_expired':
      return 'Essa partida já entrou no ranking (ou expirou).';
    case 'too_many_requests':
      return 'Calma! Muitas tentativas, espere um minuto.';
    case 'storage_not_configured':
      return 'O ranking online ainda não está ligado.';
    default:
      return 'Não deu para salvar agora. Tente de novo.';
  }
}
