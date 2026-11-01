# Assets do Jatinho do Flávio — pixel art

Tudo no jogo é **pixel art feita em código** (sem arquivos de imagem). A arte é desenhada em
**meia resolução** — 1 pixel da arte = 2 unidades do jogo (tela de 180×320 pixels de arte) — e
ampliada sem borrar. Todos os elementos têm contorno escuro de 1 pixel.

> Para gerar os prints de novo: `npm run dev` e, em outro terminal,
> `node tools/capture-assets.cjs`. A folha com tudo junto fica em
> http://localhost:5173/tools/asset-sheet.html

Em cada item: **onde está no código** e um espaço para a sua opinião.

---

## Novidades: perseguidores dos partidos, obstáculos e aviões

![Novidades](novidades.png)

- **6 perseguidores novos** (3 variantes cada): Gleisi, Haddad, Lindbergh, Boulos, Erika Hilton e
  Kim Kataguiri (incluindo o Kim "versão rato", do meme). Paradas: Gleisi, Lindbergh, Boulos e Erika
  em Brasília; Kim e Haddad (a "taxa" na fronteira) em Puerto Iguazú; todos em Miami.
- **Obstáculos dos partidos só em Brasília**: estrela do PT, caixas da taxa das blusinhas, picanha,
  acampamento de lona, sol do PSOL, faixas de protesto, outdoor do Missão, livro amarelo e drones.
- **Regionais novos**: Iguazú (tucanos, Marco das Três Fronteiras, bote), Guayaquil (atobás,
  Torre do Relógio, chapéu-panamá), Miami (flamingos, avião com faixa, foguete de Cabo Canaveral).
- **7 aviões novos** no Hangar. Prancha gerada por `tools/novidades.html`.

## 1. Telas do jogo

| Menu | Jogando | Pausa | Fim de jogo |
| :-: | :-: | :-: | :-: |
| ![Menu](assets/tela-menu.png) | ![Jogando](assets/tela-jogo.png) | ![Pausa](assets/tela-pausa.png) | ![Fim de jogo](assets/tela-fim-de-jogo.png) |

- Código: `src/scenes/` (menu, jogo, pausa) e `src/ui/` (fim de jogo, em HTML com visual retrô).
- Títulos, placar, avisos e HUD usam a **fonte pixel 3×5** (`src/render/pixel-font.ts`), com
  acentos. Textos longos (fim de jogo, landing, ranking) ficam na fonte normal para ler melhor.
- Sua opinião: ☐ manter ☐ melhorar ☐ refazer — _______________________

## 2. Jatinho

| Reto | Subindo | Caindo |
| :-: | :-: | :-: |
| ![Jatinho reto](assets/jet-neutro.png) | ![Jatinho subindo](assets/jet-subindo.png) | ![Jatinho caindo](assets/jet-caindo.png) |

- Código: `src/entities/jet.ts`. 30×16 pixels, com janelinhas, cabine, faixa verde-amarela e chama
  em 2 quadros. A inclinação usa 10 ângulos pré-desenhados (girados pixel a pixel, sem borrar).
- Sua opinião: ☐ manter ☐ melhorar ☐ refazer — _______________________

## 3. Perseguidores (8, com 3 variantes sorteadas cada)

| | Variante 1 | Variante 2 | Variante 3 |
| --- | :-: | :-: | :-: |
| **Lula** | ![](assets/perseguidor-lula-terno.png)<br>de terno | ![](assets/perseguidor-lula-decreto.png)<br>com o decreto | ![](assets/perseguidor-lula-picanha.png)<br>com a picanha |
| **Xandão** | ![](assets/perseguidor-xandao-toga.png)<br>de braços cruzados | ![](assets/perseguidor-xandao-caneta.png)<br>com a caneta | ![](assets/perseguidor-xandao-martelo.png)<br>com o martelo |
| **Janja** | ![](assets/perseguidor-janja-aberta.png)<br>Constituição aberta | ![](assets/perseguidor-janja-apontando.png)<br>apontando a Constituição | ![](assets/perseguidor-janja-debaixo.png)<br>Constituição debaixo do braço |
| **Agente da PF** | ![](assets/perseguidor-pf-colete.png)<br>de colete | ![](assets/perseguidor-pf-distintivo.png)<br>com o distintivo | ![](assets/perseguidor-pf-lanterna.png)<br>com a lanterna |
| **Renan Santos** | ![](assets/perseguidor-renan-livro.png)<br>com o livro amarelo | ![](assets/perseguidor-renan-guitarra.png)<br>guitarrista | ![](assets/perseguidor-renan-fralda.png)<br>com as fraldas (LULA e FLÁVIO) |
| **Gonet** | ![](assets/perseguidor-gonet-pasta.png)<br>com a pasta da PGR | ![](assets/perseguidor-gonet-carimbo.png)<br>com o carimbo | ![](assets/perseguidor-gonet-cruzado.png)<br>de braços cruzados |
| **Dino** | ![](assets/perseguidor-dino-toga.png)<br>de toga | ![](assets/perseguidor-dino-codigo.png)<br>com o Código Penal | ![](assets/perseguidor-dino-celular.png)<br>no celular |
| **Agente da Interpol** | ![](assets/perseguidor-interpol-lupa.png)<br>com a lupa | ![](assets/perseguidor-interpol-cartaz.png)<br>com o alerta vermelho | ![](assets/perseguidor-interpol-binoculo.png)<br>de binóculo |

![Todas as variantes no tamanho do jogo](assets/perseguidores-no-jogo.png)

- Código: `src/entities/chaser-sprites.ts`. Meio corpo 36×34, semelhança só sugerida; agentes da PF e da
  Interpol são genéricos. Cada parada tem o seu grupo (ver `PLANO.md`).
- Sua opinião: ☐ manter ☐ melhorar ☐ refazer — _______________________

## 4. HUD: barra de perigo

| Baixo | Médio | Alto |
| :-: | :-: | :-: |
| ![](assets/hud-perigo-baixo.png) | ![](assets/hud-perigo-medio.png) | ![](assets/hud-perigo-alto.png) |

- Código: `src/entities/chaser.ts`. Barra com moldura pixel; verde → amarelo → vermelho, com
  brilho no topo; no vermelho o nome treme.
- Sua opinião: ☐ manter ☐ melhorar ☐ refazer — _______________________

## 5. Obstáculos (16, 4 por parada)

| Parada | 1 | 2 | 3 | 4 |
| --- | :-: | :-: | :-: | :-: |
| **Brasília** | ![](assets/obstaculo-toga.png)<br>Toga e processos | ![](assets/obstaculo-cpi.png)<br>Balões da CPI | ![](assets/obstaculo-cupulas.png)<br>Cúpulas do Congresso | ![](assets/obstaculo-pf.png)<br>Helicóptero da PF |
| **Puerto Iguazú** | ![](assets/obstaculo-cataratas.png)<br>Jatos d'água | ![](assets/obstaculo-cancela.png)<br>Cancela da ponte | ![](assets/obstaculo-quati.png)<br>Quatis | ![](assets/obstaculo-cuia.png)<br>Cuia de chimarrão |
| **Guayaquil** | ![](assets/obstaculo-bananas.png)<br>Bananas do porto | ![](assets/obstaculo-iguana.png)<br>Iguanas | ![](assets/obstaculo-roda.png)<br>Roda-gigante La Perla | ![](assets/obstaculo-radar.png)<br>Torre de controle |
| **Miami** | ![](assets/obstaculo-predios.png)<br>Prédios de Brickell | ![](assets/obstaculo-pelicanos.png)<br>Pelicanos | ![](assets/obstaculo-jacare.png)<br>Jacaré | ![](assets/obstaculo-holofote.png)<br>Holofote da imigração |

No jogo, em movimento:

| Roda-gigante | Jatos d'água | Holofote | Pelicanos |
| :-: | :-: | :-: | :-: |
| ![](assets/obstaculo-jogo-roda.png) | ![](assets/obstaculo-jogo-cataratas.png) | ![](assets/obstaculo-jogo-holofote.png) | ![](assets/obstaculo-jogo-pelicanos.png) |

- Código: `src/entities/obstacles.ts` e `obstacles-extra.ts` (comportamento e áreas de batida),
  `obstacle-sprites*.ts` (desenhos), `obstacle-preview.ts` (miniaturas).
- Sua opinião: ☐ manter ☐ melhorar ☐ refazer — _______________________

## 6. Fundos das paradas (rota real)

| Brasília (0+) | Puerto Iguazú (40+) | Guayaquil (80+) | Miami (120+) |
| :-: | :-: | :-: | :-: |
| ![](assets/fundo-1-brasilia.png) | ![](assets/fundo-2-iguazu.png) | ![](assets/fundo-3-guayaquil.png) | ![](assets/fundo-4-miami.png) |

- Código: `src/render/scenery.ts`. Céu fixo, sol e 3–5 camadas que andam em velocidades diferentes.
- **Brasília**: Congresso, Catedral, cerrado e terra vermelha.
- **Puerto Iguazú (Argentina)**: Cataratas, Ponte Tancredo Neves metade verde-amarela e metade azul e
  branca, rio e mata.
- **Guayaquil (Equador)**: Andes, Cerro Santa Ana com casinhas e farol, roda-gigante do Malecón, rio
  Guayas, palmeiras.
- **Miami (EUA)**: pôr do sol neon, prédios de Brickell, mar turquesa, hotéis art déco, palmeiras.
- Sua opinião: ☐ manter ☐ melhorar ☐ refazer — _______________________

### Trechos de viagem (transição entre paradas)

| Estrada até Foz | Sobrevoo dos Andes | Mar do Caribe |
| :-: | :-: | :-: |
| ![](assets/viagem-estrada.png) | ![](assets/viagem-andes.png) | ![](assets/viagem-caribe.png) |

Na troca de parada a câmera passa por: cidade antiga → trecho de viagem → cidade nova (5 s), com o céu
mudando aos poucos.

## 7. Mapa das Américas (pausa e landing)

| Saindo de Brasília | Indo para Guayaquil | Em Miami |
| :-: | :-: | :-: |
| ![](assets/mapa-inicio.png) | ![](assets/mapa-iguazu.png) | ![](assets/mapa-miami.png) |

- Código: `src/render/map.ts` e `src/render/americas.ts` (contorno das Américas e a rota real).
- Oceano azul e continente verde em pixel, recortado na América Latina e no Golfo do México.
  Rota feita em vermelho, próxima perna pontilhada, paradas futuras como "?", nomes ao lado de cada
  parada e aviãozinho na posição. (Testamos um estilo "mosaico" com países coloridos e voltamos para este.)
- Sua opinião: ☐ manter ☐ melhorar ☐ refazer — _______________________

## 8. Site

| Landing (celular) | Landing (computador) | Ranking (celular) |
| :-: | :-: | :-: |
| ![](assets/site-landing-celular.png) | ![](assets/site-landing-computador.png) | ![](assets/site-ranking-celular.png) |

- A landing usa o fundo e o jatinho em pixel no topo e o mapa em pixel; o sol aparece uma vez só
  mesmo em tela larga.
- Sua opinião: ☐ manter ☐ melhorar ☐ refazer — _______________________

---

## Ideias para a próxima rodada

- Animação dos perseguidores (piscar, balançar o objeto) e dos ataques (decreto, caneta, drone).
- Obstáculos próprios de cada região (guarda-sol, gaivotas, navio, holofote na cerca).
- Favicon e imagem de compartilhamento (jatinho com os perseguidores atrás).
