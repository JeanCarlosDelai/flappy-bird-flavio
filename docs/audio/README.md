# Sons do jogo (amostras)

Tudo é **sintetizado no navegador** (Web Audio), em estilo chiptune: nenhuma música ou efeito usa
arquivo de áudio. Estes MP3 são só para ouvir fora do jogo; gere de novo com
`npm run dev` + `node tools/capture-audio.cjs`.

| Arquivo | O que é |
| --- | --- |
| `01-musica-menu.mp3` | Menu (Dó maior, 128 bpm) |
| `02-musica-brasilia.mp3` | Brasília: marchinha animada (Sol maior, 140 bpm) |
| `03-musica-iguazu.mp3` | Puerto Iguazú: tango/habanera (Ré menor, 118 bpm) |
| `04-musica-guayaquil.mp3` | Guayaquil: cumbia (Mi menor, 100 bpm) |
| `05-musica-miami.mp3` | Miami: reta final, tensa e rápida (Ré menor, 150 bpm) |
| `06-efeitos.mp3` | Efeitos em ordem: voar, ponto, batida, radar, novo perseguidor, perigo, nova região, pausa, volta, caiu, pego, recorde |

As músicas são originais e ficam escritas como texto em `src/audio/music.ts` (16 passos por
compasso: nota, `-` segura, `.` pausa), fáceis de editar.
