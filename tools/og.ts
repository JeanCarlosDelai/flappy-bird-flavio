import { WORLD } from '@/core/config';
import { CHASERS, drawChaser } from '@/entities/chaser';
import { VARIANTS } from '@/entities/chaser-sprites';
import { jetSprite } from '@/entities/jet';
import { Background } from '@/render/background';
import { drawSprite, PX } from '@/render/pixel';
import { outlinedText, plainText } from '@/render/text';

/** Imagem de prévia (WhatsApp, redes): 1200x630. Gerada por `node tools/capture-og.cjs`. */
const canvas = document.getElementById('og') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
ctx.imageSmoothingEnabled = false;

// cenário de Brasília, em formato deitado: duas telas lado a lado, cortando o céu de cima
const scene = document.createElement('canvas');
scene.width = WORLD.width;
scene.height = WORLD.height;
const sctx = scene.getContext('2d')!;
sctx.imageSmoothingEnabled = false;
new Background().render(sctx, 0);
const scale = 630 / 400;
for (let i = 0; i < 3; i++) ctx.drawImage(scene, 0, 240, WORLD.width, 400, i * WORLD.width * scale, 0, WORLD.width * scale, 630);

ctx.save();
ctx.scale(2, 2); // desenha em 600x315
ctx.fillStyle = 'rgba(11, 13, 30, 0.35)';
ctx.fillRect(0, 0, 600, 315);
outlinedText(ctx, 'JATINHO', 210, 70, 9, '#ffd23f');
outlinedText(ctx, 'DO FLÁVIO', 210, 122, 6, '#ffffff');
drawSprite(ctx, jetSprite(-0.3, 1, 'flavio-praia'), 200, 190, PX * 2);
plainText(ctx, 'Fuja pelas Américas sem ser pego', 210, 250, 2, '#ffffff');
plainText(ctx, 'Jogo de humor e sátira · toque para voar', 210, 272, 2, '#ffd23f');
// perseguidores na cola
const pick: [string, string][] = [['lula', 'decreto'], ['xandao', 'caneta'], ['kim', 'rato']];
pick.forEach(([id, variant], i) => {
  const profile = CHASERS.find((c) => c.id === id)!;
  const v = VARIANTS[profile.id].find((x) => x.id === variant)!;
  drawChaser(ctx, profile, v, 470 + (i % 2) * 70, 80 + i * 78, PX * 1.4);
});
ctx.restore();
document.body.dataset.ready = '1';
