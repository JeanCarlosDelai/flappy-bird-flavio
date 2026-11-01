import { WORLD } from '@/core/config';
import { chaserById, drawChaser } from '@/entities/chaser';
import { VARIANTS } from '@/entities/chaser-sprites';
import { jetSprite } from '@/entities/jet';
import { Background } from '@/render/background';
import { drawRouteMap } from '@/render/map';
import { drawSprite, PX } from '@/render/pixel';
import { ROUTE_LENGTH, STAGES, finalStageIndex, lapForScore } from '@/render/stages';
import { textWidth, wrapPixelText } from '@/render/pixel-font';
import { flavioSprite } from '@/entities/cutscene';
import { outlinedText, plainText } from '@/render/text';
import type { RunSummary } from '@/systems/session';
import { CAUSE_LABEL } from './messages';

const SITE = 'jatinho-do-flavio.vercel.app';

export interface CardExtras {
  /** Frase do fim de jogo (a mesma do painel). */
  line?: string;
  /** Medalhas ganhas nesta partida. */
  medals?: number;
}

/** Selo arredondado em pixel com texto. */
function chip(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, bg: string, fg = '#1b1420'): void {
  const w = textWidth(text, 2) + 16;
  ctx.fillStyle = '#1b1420';
  ctx.fillRect(Math.round(x - w / 2) - 2, y - 2, w + 4, 22);
  ctx.fillStyle = bg;
  ctx.fillRect(Math.round(x - w / 2), y, w, 18);
  plainText(ctx, text, x, y + 10, 2, fg);
}

/** Desenha o cartão do resultado (formato story 9:16, em pixel art). */
export function resultCard(summary: RunSummary, extras: CardExtras = {}): HTMLCanvasElement {
  const { run } = summary;
  const endless = run.mode === 'semfim';
  const scale = 3;
  const c = document.createElement('canvas');
  c.width = WORLD.width * scale;
  c.height = WORLD.height * scale;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.scale(scale, scale);

  new Background().render(ctx, endless ? run.score : Math.min(run.score, ROUTE_LENGTH - 1));
  ctx.fillStyle = 'rgba(11, 13, 30, 0.6)';
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  outlinedText(ctx, 'JATINHO', WORLD.width / 2, 40, 6, '#ffd23f');
  outlinedText(ctx, 'DO FLÁVIO', WORLD.width / 2, 74, 4, '#ffffff');

  // pontos e selos
  drawSprite(ctx, jetSprite(-0.3, 1, run.skin), 74, 128, PX * 1.5);
  outlinedText(ctx, String(run.score), 226, 124, 10, '#ffffff');
  plainText(ctx, 'PONTOS', 226, 162, 2, '#c9d1e3');
  const badges: [string, string][] = [];
  if (summary.newRecord && run.score > 0) badges.push(['RECORDE!', '#ffd23f']);
  if (run.mode === 'semfim') badges.push([`SEM FIM · VOLTA ${lapForScore(run.score)}`, '#7ef2ff']);
  if (run.mode === 'hardcore') badges.push(['HARDCORE', '#ff8a8a']);
  if (run.daily) badges.push(['DESAFIO DO DIA', '#7bd389']);
  if (run.challenge) badges.push([run.score > run.challenge.target ? `VENCEU ${run.challenge.from.toUpperCase()}` : `VS ${run.challenge.from.toUpperCase()}`, '#ff9ad5']);
  badges.slice(0, 2).forEach(([t, color], i) => chip(ctx, t, WORLD.width / 2, 176 + i * 24, color));
  const top = 182 + Math.min(2, badges.length) * 24;

  // como acabou
  const stage = STAGES[finalStageIndex(run.score, endless)];
  const title = run.cause === 'fuga' ? 'FUGA CONCLUÍDA!' : CAUSE_LABEL[run.cause].toUpperCase();
  outlinedText(ctx, title, WORLD.width / 2, top + 10, 3, run.cause === 'fuga' ? '#7bd389' : '#ff8a8a');
  plainText(ctx, `em ${stage.name}`, WORLD.width / 2, top + 32, 2, '#ffffff');
  if (extras.line) {
    wrapPixelText(extras.line, WORLD.width - 40, 1.5).slice(0, 3).forEach((l, i) =>
      plainText(ctx, l, WORLD.width / 2, top + 52 + i * 12, 1.5, '#c9d1e3')
    );
  }

  // mapa da rota
  const mapY = top + 92;
  drawRouteMap(ctx, 90, mapY, 180, 180, {
    revealUpTo: finalStageIndex(run.score, endless),
    score: endless ? run.score % ROUTE_LENGTH : Math.min(run.score, ROUTE_LENGTH)
  });

  // quem pegou (com balão "PEGO!") ou o Flávio acenando
  const figY = mapY + 150;
  if (run.cause !== 'chao' && run.cause !== 'fuga') {
    const profile = chaserById(run.cause);
    const variant = VARIANTS[profile.id].find((v) => v.id === run.variant) ?? VARIANTS[profile.id][0];
    drawChaser(ctx, profile, variant, 48, figY, PX * 1.3);
    chip(ctx, 'PEGO!', 48, figY - 66, '#ffffff', '#d33a2c');
  } else if (run.cause === 'fuga') {
    drawSprite(ctx, flavioSprite(1, true), 44, figY, PX * 1.5);
    chip(ctx, 'TCHAU!', 44, figY - 52, '#ffffff', '#2fa34f');
  }

  // números
  const stats = [`BATIDAS ${run.hits}`, `MOEDAS ${run.coins ?? 0}`, `RASPÕES ${run.nearMisses ?? 0}`];
  if (extras.medals) stats.push(`MEDALHAS +${extras.medals}`);
  plainText(ctx, stats.join('  ·  '), WORLD.width / 2, 548, 1.5, '#ffd23f');

  outlinedText(ctx, run.challenge ? 'Quem foge mais longe?' : 'Consegue fugir mais longe?', WORLD.width / 2, 574, 2, '#ffffff');
  plainText(ctx, SITE, WORLD.width / 2, 600, 2, '#7ef2ff');
  plainText(ctx, 'Jogo de humor e sátira', WORLD.width / 2, 620, 1, '#c9d1e3');
  return c;
}

/** Compartilha a imagem (WhatsApp, Instagram…) ou baixa, se o aparelho não deixar. */
export async function shareResult(summary: RunSummary, extras: CardExtras = {}): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const canvas = resultCard(summary, extras);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) return 'cancelled';
  const file = new File([blob], 'jatinho-do-flavio.png', { type: 'image/png' });
  const text = `Fiz ${summary.run.score} pontos no Jatinho do Flávio! Consegue fugir mais longe? https://${SITE}`;
  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], text, title: 'Jatinho do Flávio' });
      return 'shared';
    } catch {
      return 'cancelled';
    }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'jatinho-do-flavio.png';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  return 'downloaded';
}
