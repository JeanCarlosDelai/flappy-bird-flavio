/**
 * Frases REAIS (com fonte) usadas nas falas do jogo. A voz é sintetizada pelo
 * aparelho, sem imitar ninguém. Antes de adicionar uma frase, conferir a fonte.
 */
export type Speaker = 'lula' | 'xandao' | 'renan' | 'flavio';

export interface Quote {
  speaker: Speaker;
  text: string;
  source: string;
}

export const QUOTES: Quote[] = [
  { speaker: 'lula', text: 'Nunca antes na história deste país!', source: 'Bordão dos discursos de Lula' },
  { speaker: 'xandao', text: 'A Justiça é cega, mas não é tola.', source: 'Decisão do STF, ago/2025' },
  { speaker: 'xandao', text: 'Nem a pau.', source: 'Ao recusar entrevista em Londres, abr/2024' },
  { speaker: 'renan', text: 'Eu não vou para a batalha pensando em perder.', source: 'Entrevista sobre a eleição de 2026' },
  { speaker: 'renan', text: 'Aceito perder votos pelo que acredito.', source: 'Citado na coluna "Frases da Semana" (Gazeta do Povo)' },
  { speaker: 'flavio', text: 'A esperança vai vencer o medo este ano.', source: 'Evento de campanha, jun/2026' },
  { speaker: 'flavio', text: 'A esperança virou medo.', source: 'Dia do 2º turno, 25/out/2026' }
];
