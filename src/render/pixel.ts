/**
 * Pixel art em código: desenha numa grade pequena e gera um canvas que é
 * ampliado sem suavização (pixels nítidos). Contorno escuro automático.
 */
export class PixelGrid {
  private cells: (string | null)[];

  constructor(public readonly width: number, public readonly height: number) {
    this.cells = Array(width * height).fill(null);
  }

  px(x: number, y: number, color: string): this {
    x = Math.round(x);
    y = Math.round(y);
    if (x >= 0 && y >= 0 && x < this.width && y < this.height) this.cells[y * this.width + x] = color;
    return this;
  }

  get(x: number, y: number): string | null {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return null;
    return this.cells[y * this.width + x];
  }

  rect(x: number, y: number, w: number, h: number, color: string): this {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, color);
    return this;
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, color: string): this {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x - cx) / (rx + 0.5);
        const dy = (y - cy) / (ry + 0.5);
        if (dx * dx + dy * dy <= 1) this.px(x, y, color);
      }
    }
    return this;
  }

  /** Linha com espessura (em pixels). */
  line(x0: number, y0: number, x1: number, y1: number, color: string, thickness = 1): this {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let s = 0; s <= steps; s++) {
      const x = x0 + ((x1 - x0) * s) / steps;
      const y = y0 + ((y1 - y0) * s) / steps;
      this.rect(Math.round(x - (thickness - 1) / 2), Math.round(y - (thickness - 1) / 2), thickness, thickness, color);
    }
    return this;
  }

  /** Só pinta onde já tem algo (ex.: barba por cima do rosto). */
  paintOver(x: number, y: number, color: string): this {
    if (this.get(Math.round(x), Math.round(y))) this.px(x, y, color);
    return this;
  }

  /** Cópia girada (vizinho mais próximo), para inclinar sprites sem borrar. */
  rotated(angle: number): PixelGrid {
    const out = new PixelGrid(this.width, this.height);
    const cx = (this.width - 1) / 2;
    const cy = (this.height - 1) / 2;
    const cos = Math.cos(-angle);
    const sin = Math.sin(-angle);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const sx = Math.round(cx + (x - cx) * cos - (y - cy) * sin);
        const sy = Math.round(cy + (x - cx) * sin + (y - cy) * cos);
        const c = this.get(sx, sy);
        if (c) out.px(x, y, c);
      }
    }
    return out;
  }

  /** Contorno de 1 pixel ao redor de tudo que foi pintado. */
  outline(color: string): this {
    const add: [number, number][] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.get(x, y)) continue;
        if (this.get(x + 1, y) || this.get(x - 1, y) || this.get(x, y + 1) || this.get(x, y - 1)) add.push([x, y]);
      }
    }
    for (const [x, y] of add) this.px(x, y, color);
    return this;
  }

  toCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext('2d')!;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const c = this.get(x, y);
        if (!c) continue;
        ctx.fillStyle = c;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    return canvas;
  }
}

/** Desenha um sprite pixelado centrado em (x, y), ampliado `scale` vezes. */
export function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: HTMLCanvasElement,
  x: number,
  y: number,
  scale: number
): void {
  const smoothing = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  const w = sprite.width * scale;
  const h = sprite.height * scale;
  ctx.drawImage(sprite, Math.round(x - w / 2), Math.round(y - h / 2), w, h);
  ctx.imageSmoothingEnabled = smoothing;
}

/** Desenha um sprite pelo canto superior esquerdo, ampliado `scale` vezes. */
export function drawSpriteAt(
  ctx: CanvasRenderingContext2D,
  sprite: HTMLCanvasElement,
  x: number,
  y: number,
  scale: number
): void {
  const smoothing = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sprite, Math.round(x), Math.round(y), sprite.width * scale, sprite.height * scale);
  ctx.imageSmoothingEnabled = smoothing;
}

/** Tamanho de 1 pixel da arte no mundo do jogo (arte em meia resolução). */
export const PX = 2;
