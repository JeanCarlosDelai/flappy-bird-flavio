import { AMERICAS, CANADA_ISLANDS, CUBA, HISPANIOLA, insidePolygon } from './americas';

/**
 * Qual país fica em (longitude, latitude) — aproximado, só para pintar o mapa em blocos.
 * Fronteiras do norte por regras simples; América Central e do Sul pelo "vizinho mais
 * próximo" de pontos de referência de cada país (fica bom na resolução do mapa).
 */
export type Country =
  | 'canada' | 'usa' | 'mexico' | 'cuba' | 'hispaniola'
  | 'guatemala' | 'honduras' | 'nicaragua' | 'costarica' | 'panama'
  | 'colombia' | 'venezuela' | 'guianas' | 'ecuador' | 'peru' | 'brazil' | 'bolivia'
  | 'paraguay' | 'uruguay' | 'argentina' | 'chile';

/** Quatro cores alternadas para países vizinhos não ficarem iguais. */
const GREEN = '#4caf50';
const LIME = '#a8c23a';
const PINK = '#e88aa6';
const YELLOW = '#f2c94c';
const BLUE = '#5aa0e0';

export const COUNTRY_COLOR: Record<Country, string> = {
  canada: LIME, usa: GREEN, mexico: PINK, cuba: BLUE, hispaniola: YELLOW,
  guatemala: GREEN, honduras: BLUE, nicaragua: YELLOW, costarica: GREEN, panama: YELLOW,
  colombia: GREEN, venezuela: BLUE, guianas: YELLOW, ecuador: BLUE, peru: YELLOW, brazil: PINK,
  bolivia: BLUE, paraguay: GREEN, uruguay: BLUE, argentina: YELLOW, chile: PINK
};

const lerp = (points: [number, number][], x: number) => {
  if (x <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    if (x <= points[i][0]) {
      const [x0, y0] = points[i - 1];
      const [x1, y1] = points[i];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return points[points.length - 1][1];
};

/** Fronteira EUA–Canadá na região dos Grandes Lagos e do leste. */
const LAKES: [number, number][] = [[-95, 49], [-89, 48], [-84, 46.5], [-82.5, 42], [-79, 43.3], [-76, 44.2], [-71, 45], [-67, 45.2]];
/** Fronteira México–EUA (Rio Grande no trecho do Texas). */
const MEXICO_BORDER: [number, number][] = [[-117, 32.6], [-111, 31.3], [-108.2, 31.3], [-106.5, 31.8], [-104.5, 29.6], [-101.5, 29.8], [-99.5, 27.5], [-97.2, 25.9]];
/** Leste do Chile (Andes), por latitude. */
const ANDES: [number, number][] = [[-55, -68.6], [-50, -72], [-45, -71.7], [-40, -71.6], [-35, -70.3], [-30, -69.9], [-25, -68.5], [-21, -68.2], [-17.5, -69.5]];

const SEEDS: [Country, number, number][] = [
  ['guatemala', -90.3, 15.5], ['honduras', -86.8, 14.8], ['nicaragua', -85, 12.8], ['costarica', -84, 10], ['panama', -80, 8.5],
  ['colombia', -74, 5], ['colombia', -75, 2], ['colombia', -72.5, 7], ['colombia', -71, 3],
  ['venezuela', -66, 7.5], ['venezuela', -63, 6], ['venezuela', -69, 9.5],
  ['guianas', -58.5, 5], ['guianas', -55.5, 4], ['guianas', -53, 4],
  ['ecuador', -78.5, -1.5], ['ecuador', -79.5, -2.5],
  ['peru', -75.5, -9], ['peru', -73, -12], ['peru', -76, -6], ['peru', -71, -15],
  ['brazil', -55, -10], ['brazil', -48, -15], ['brazil', -60, -5], ['brazil', -45, -5], ['brazil', -52, -22],
  ['brazil', -42, -12], ['brazil', -66, -6], ['brazil', -50, -28], ['brazil', -60, -12], ['brazil', -40, -8], ['brazil', -55, -2],
  ['bolivia', -65, -16.5], ['bolivia', -63.5, -20],
  ['paraguay', -58, -23.5], ['paraguay', -60.5, -21.5],
  ['uruguay', -56, -32.8],
  ['argentina', -64, -30], ['argentina', -65, -38], ['argentina', -68, -46], ['argentina', -61.5, -34.5],
  ['argentina', -60, -28], ['argentina', -66, -24.5], ['argentina', -69, -51]
];

function nearestSeed(lon: number, lat: number, filter: (c: Country) => boolean): Country {
  let best: Country = 'brazil';
  let bestD = Infinity;
  for (const [c, x, y] of SEEDS) {
    if (!filter(c)) continue;
    const d = (x - lon) ** 2 + (y - lat) ** 2;
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best;
}

const CENTRAL = new Set<Country>(['guatemala', 'honduras', 'nicaragua', 'costarica', 'panama']);

export function countryAt(lon: number, lat: number): Country | null {
  if (insidePolygon(lon, lat, CUBA)) return 'cuba';
  if (insidePolygon(lon, lat, HISPANIOLA)) return 'hispaniola';
  if (CANADA_ISLANDS.some((p) => insidePolygon(lon, lat, p))) return 'canada';
  if (!insidePolygon(lon, lat, AMERICAS)) return null;

  if (lat > 50 && lon <= -141) return 'usa'; // Alasca
  if (lat >= 49 || (lon > -95 && lon < -67 && lat > lerp(LAKES, lon)) || (lon >= -67 && lat > 44.6)) return 'canada';
  if (lat > lerp(MEXICO_BORDER, lon) && lat > 24.5) return 'usa';
  if (lon < -92.2 || lat > 17.8) return 'mexico';
  if (lat > 7.2 && lon < -77.2) return nearestSeed(lon, lat, (c) => CENTRAL.has(c));
  if (lat < -17.5 && lon < lerp(ANDES, lat)) return 'chile';
  return nearestSeed(lon, lat, (c) => !CENTRAL.has(c));
}
