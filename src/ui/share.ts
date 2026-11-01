import { WORLD } from '@/core/config';
import { chaserById, drawChaser } from '@/entities/chaser';
import { VARIANTS } from '@/entities/chaser-sprites';
import { jetSprite } from '@/entities/jet';
import { Background } from '@/render/background';
import { drawRouteMap } from '@/render/map';
import { drawSprite, PX } from '@/render/pixel';
import { STAGES, stageIndexForScore } from '@/render/stages';
import { outlinedText, plainText } from '@/render/text';
import type { RunSummary } from '@/systems/session';
import { CAUSE_LABEL } from './messages';

const SITE = 'jatinho-do-flavio.vercel.app';

/** Desenha o cartão do resultado (formato story 9:16, em pixel art). */
export function resultCard(summary: RunSummary): HTMLCanvasElement {
  const { run } = summary;
  const scale = 3;
  const c = document.createElement('canvas');
  c.width = WORLD.width * scale;
  c.height = WORLD.height * scale;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.scale(scale, scale);

  new Background().render(ctx, run.score);
  ctx.fillStyle = 'rgba(11, 13, 30, 0.55)';
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  outlinedText(ctx, 'JATINHO', WORLD.width / 2, 48, 6, '#ffd23f');
  outlinedText(ctx, 'DO FLÁVIO', WORLD.width / 2, 84, 4, '#ffffff');
  drawSprite(ctx, jetSprite(-0.3, 1), 70, 140, PX * 1.5);

  outlinedText(ctx, String(run.score), 220, 140, 10, '#ffffff');
  plainText(ctx, 'PONTOS', 220, 182, 2, '#c9d1e3');

  const stage = STAGES[stageIndexForScore(run.score)];
  const line = run.cause === 'fuga' ? 'FUGA CONCLUÍDA!' : `${CAUSE_LABEL[run.cause]}`;
  outlinedText(ctx, line, WORLD.width / 2, 222, 3, run.cause === 'fuga' ? '#7bd389' : '#ff8a8a');
  plainText(ctx, `em ${stage.name}`, WORLD.width / 2, 246, 2, '#ffffff');

  drawRouteMap(ctx, 62, 270, 236, 236, { revealUpTo: stageIndexForScore(run.score), score: run.score });

  if (run.cause !== 'chao' && run.cause !== 'fuga') {
    const profile = chaserById(run.cause);
    const variant = VARIANTS[profile.id].find((v) => v.id === run.variant) ?? VARIANTS[profile.id][0];
    drawChaser(ctx, profile, variant, 50, 470, PX * 1.2);
  }

  plainText(ctx, `Batidas: ${run.hits}   Moedas: ${run.coins ?? 0}`, WORLD.width / 2, 540, 2, '#ffd23f');
  outlinedText(ctx, 'Consegue fugir mais longe?', WORLD.width / 2, 572, 2, '#ffffff');
  plainText(ctx, SITE, WORLD.width / 2, 600, 2, '#7ef2ff');
  plainText(ctx, 'Jogo de humor e sátira', WORLD.width / 2, 620, 1, '#c9d1e3');
  return c;
}

/** Compartilha a imagem (WhatsApp, Instagram…) ou baixa, se o aparelho não deixar. */
export async function shareResult(summary: RunSummary): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const canvas = resultCard(summary);
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
