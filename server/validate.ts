import { DEATH_CAUSES, OBSTACLE_KINDS, type RunReport } from './types.js';

const isInt = (v: unknown, min: number, max: number): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max;

/**
 * Confere se o relatório da partida é plausível. Não é à prova de trapaça,
 * mas barra o óbvio: pontos impossíveis para o tempo voado, números negativos etc.
 */
export function parseRunReport(body: unknown): RunReport | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  if (!isInt(b.score, 0, 5000)) return null;
  if (!isInt(b.durationMs, 0, 3 * 60 * 60 * 1000)) return null;
  if (!isInt(b.hits, 0, 10000) || !isInt(b.radarAlerts, 0, 10000)) return null;
  if (typeof b.cause !== 'string' || !DEATH_CAUSES.includes(b.cause as RunReport['cause'])) return null;

  // o obstáculo mais rápido aparece a cada ~1,15 s; folga para o começo da partida
  const maxScore = Math.floor(b.durationMs / 1000 / 1.1) + 3;
  if (b.score > maxScore) return null;

  const hitsByObstacle: RunReport['hitsByObstacle'] = {};
  if (b.hitsByObstacle && typeof b.hitsByObstacle === 'object') {
    for (const kind of OBSTACLE_KINDS) {
      const n = (b.hitsByObstacle as Record<string, unknown>)[kind];
      if (n === undefined) continue;
      if (!isInt(n, 0, 10000)) return null;
      if (n > 0) hitsByObstacle[kind] = n;
    }
  }

  return {
    score: b.score,
    durationMs: b.durationMs,
    hits: b.hits,
    radarAlerts: b.radarAlerts,
    cause: b.cause as RunReport['cause'],
    hitsByObstacle
  };
}

// lista curta de palavrões e ofensas comuns; comparação sem acento e sem espaço
const BLOCKED = [
  'porra', 'caralho', 'buceta', 'boceta', 'puta', 'viado', 'veado', 'bicha', 'macaco',
  'arrombad', 'fdp', 'cuzao', 'cu', 'piroca', 'pinto', 'rola', 'merda', 'bosta', 'vagabund',
  'retardad', 'nazi', 'hitler', 'estupr', 'pedofil', 'traveco', 'xoxota', 'fuck', 'shit',
  'nigger', 'bitch'
];

const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export type NameCheck = { ok: true; name: string; key: string } | { ok: false; reason: string };

/** Apelido do ranking: 2–16 caracteres, letras/números/espaço e pouca pontuação. */
export function checkName(raw: unknown): NameCheck {
  if (typeof raw !== 'string') return { ok: false, reason: 'invalid_name' };
  const name = raw.replace(/\s+/g, ' ').trim();
  if (name.length < 2 || name.length > 16) return { ok: false, reason: 'name_length' };
  if (!/^[\p{L}\p{N} ._\-!]+$/u.test(name)) return { ok: false, reason: 'name_chars' };

  const flat = normalize(name);
  const compact = flat.replace(/[^a-z0-9]/g, '');
  const words = flat.split(/[^a-z0-9]+/);
  const blocked = BLOCKED.some((w) =>
    w.length <= 3 ? words.includes(w) : compact.includes(w)
  );
  if (blocked) return { ok: false, reason: 'name_blocked' };

  return { ok: true, name, key: flat.replace(/\s+/g, ' ') };
}
