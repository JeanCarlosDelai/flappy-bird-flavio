export interface Stage {
  name: string;
  fromScore: number;
  skyTop: string;
  skyBottom: string;
  far: string;
  near: string;
  ground: string;
  /** Desenha a silhueta do fundo distante a partir de um deslocamento x. */
  skyline: (ctx: CanvasRenderingContext2D, offset: number, baseY: number) => void;
}

const hills = (amplitude: number, period: number) =>
  (ctx: CanvasRenderingContext2D, offset: number, baseY: number) => {
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    for (let x = 0; x <= 360; x += 8) {
      ctx.lineTo(x, baseY - amplitude - Math.sin((x + offset) / period) * amplitude);
    }
    ctx.lineTo(360, baseY);
    ctx.fill();
  };

/** Brasília → litoral → oceano → fronteira. */
export const STAGES: Stage[] = [
  {
    name: 'Brasília',
    fromScore: 0,
    skyTop: '#4aa3df',
    skyBottom: '#bfe6ff',
    far: '#8fb3cf',
    near: '#6b8f5e',
    ground: '#8a6d3b',
    skyline: (ctx, offset, baseY) => {
      // silhueta tipo Congresso: duas torres e duas cúpulas, repetindo
      const span = 260;
      for (let i = -1; i < 3; i++) {
        const x = i * span - (offset % span);
        ctx.fillRect(x + 100, baseY - 90, 12, 90);
        ctx.fillRect(x + 116, baseY - 90, 12, 90);
        ctx.fillRect(x + 40, baseY - 22, 160, 22);
        ctx.beginPath();
        ctx.arc(x + 70, baseY - 22, 22, Math.PI, 0);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 170, baseY - 44, 26, 0, Math.PI);
        ctx.fill();
      }
    }
  },
  {
    name: 'Litoral',
    fromScore: 20,
    skyTop: '#ff9a5a',
    skyBottom: '#ffe0a8',
    far: '#3f7f8f',
    near: '#2e8b57',
    ground: '#e8cf8f',
    skyline: hills(28, 40)
  },
  {
    name: 'Oceano',
    fromScore: 40,
    skyTop: '#1f4e8c',
    skyBottom: '#77b4e6',
    far: '#2a6aa8',
    near: '#1b5a96',
    ground: '#14467a',
    skyline: hills(6, 14)
  },
  {
    name: 'Fronteira',
    fromScore: 60,
    skyTop: '#2b1b4a',
    skyBottom: '#c76b5a',
    far: '#4a3a5e',
    near: '#5d4a3a',
    ground: '#6b5236',
    skyline: hills(40, 60)
  }
];

/** Pontos para atravessar cada região do mapa. */
export const STAGE_LENGTH = 20;

/** Pontos para cruzar o mapa inteiro. */
export const ROUTE_LENGTH = STAGES.length * STAGE_LENGTH;

export function stageIndexForScore(score: number): number {
  return Math.min(STAGES.length - 1, Math.floor(score / STAGE_LENGTH));
}

export function stageForScore(score: number): Stage {
  let current = STAGES[0];
  for (const stage of STAGES) if (score >= stage.fromScore) current = stage;
  return current;
}
