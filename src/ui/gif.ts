/**
 * Codificador de GIF animado mínimo (sem biblioteca), para o replay.
 * Paleta fixa de 252 cores (6 níveis de vermelho × 7 de verde × 6 de azul): boa para pixel art.
 */
const R = 6;
const G = 7;
const B = 6;

function palette(): Uint8Array {
  const p = new Uint8Array(256 * 3);
  let i = 0;
  for (let r = 0; r < R; r++)
    for (let g = 0; g < G; g++)
      for (let b = 0; b < B; b++) {
        p[i++] = Math.round((r * 255) / (R - 1));
        p[i++] = Math.round((g * 255) / (G - 1));
        p[i++] = Math.round((b * 255) / (B - 1));
      }
  return p;
}

/** RGBA → índices da paleta. */
export function quantize(rgba: Uint8ClampedArray): Uint8Array {
  const out = new Uint8Array(rgba.length / 4);
  for (let i = 0, j = 0; j < out.length; i += 4, j++) {
    const r = Math.round((rgba[i] * (R - 1)) / 255);
    const g = Math.round((rgba[i + 1] * (G - 1)) / 255);
    const b = Math.round((rgba[i + 2] * (B - 1)) / 255);
    out[j] = r * G * B + g * B + b;
  }
  return out;
}

/** Compressão LZW do GIF (código mínimo de 8 bits), já em sub-blocos de 255 bytes. */
function lzw(indices: Uint8Array): number[] {
  const min = 8;
  const clear = 1 << min;
  const eoi = clear + 1;
  let codeSize = min + 1;
  let next = eoi + 1;
  let dict = new Map<number, number>();
  const bytes: number[] = [];
  let acc = 0;
  let bits = 0;
  const emit = (code: number) => {
    acc |= code << bits;
    bits += codeSize;
    while (bits >= 8) {
      bytes.push(acc & 0xff);
      acc >>>= 8;
      bits -= 8;
    }
  };
  emit(clear);
  let prefix = indices[0];
  for (let i = 1; i < indices.length; i++) {
    const k = indices[i];
    const key = (prefix << 8) | k;
    const found = dict.get(key);
    if (found !== undefined) {
      prefix = found;
      continue;
    }
    emit(prefix);
    if (next === 4096) {
      emit(clear);
      dict = new Map();
      next = eoi + 1;
      codeSize = min + 1;
    } else {
      if (next >= 1 << codeSize) codeSize++;
      dict.set(key, next++);
    }
    prefix = k;
  }
  emit(prefix);
  emit(eoi);
  if (bits > 0) bytes.push(acc & 0xff);
  // sub-blocos
  const out: number[] = [min];
  for (let i = 0; i < bytes.length; i += 255) {
    const chunk = bytes.slice(i, i + 255);
    out.push(chunk.length, ...chunk);
  }
  out.push(0);
  return out;
}

/** Monta o GIF animado (em loop). `delay` em centésimos de segundo por quadro. */
export function encodeGif(frames: Uint8ClampedArray[], width: number, height: number, delay = 10): Uint8Array {
  const parts: number[] = [];
  const word = (n: number) => parts.push(n & 0xff, (n >> 8) & 0xff);
  for (const ch of 'GIF89a') parts.push(ch.charCodeAt(0));
  word(width);
  word(height);
  parts.push(0xf7, 0, 0); // paleta global de 256 cores
  parts.push(...palette());
  // repetir para sempre
  parts.push(0x21, 0xff, 0x0b, ...[...'NETSCAPE2.0'].map((c) => c.charCodeAt(0)), 0x03, 0x01, 0, 0, 0);
  for (const frame of frames) {
    parts.push(0x21, 0xf9, 0x04, 0x00);
    word(delay);
    parts.push(0, 0);
    parts.push(0x2c);
    word(0);
    word(0);
    word(width);
    word(height);
    parts.push(0);
    const data = lzw(quantize(frame));
    for (let i = 0; i < data.length; i += 8192) parts.push(...data.slice(i, i + 8192));
  }
  parts.push(0x3b);
  return Uint8Array.from(parts);
}
