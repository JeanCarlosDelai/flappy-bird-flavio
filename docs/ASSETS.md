# Assets do Jatinho do Flávio — pixel art

Tudo no jogo é **pixel art feita em código** (sem arquivos de imagem). A arte é desenhada em
**meia resolução** — 1 pixel da arte = 2 unidades do jogo (tela de 180×320 pixels de arte) — e
ampliada sem borrar. Todos os elementos têm contorno escuro de 1 pixel.

> Para gerar os prints de novo: `npm run dev` e, em outro terminal,
> `node tools/capture-assets.cjs`. A folha com tudo junto fica em
> http://localhost:5173/tools/asset-sheet.html

Em cada item: **onde está no código** e um espaço para a sua opinião.

---

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

## 3. Perseguidores (variantes sorteadas)

| | Variante 1 | Variante 2 | Variante 3 |
| --- | :-: | :-: | :-: |
| **Lula** | ![](assets/perseguidor-lula-terno.png)<br>de terno | ![](assets/perseguidor-lula-decreto.png)<br>com o decreto | ![](assets/perseguidor-lula-picanha.png)<br>com a picanha |
| **Xandão** | ![](assets/perseguidor-xandao-toga.png)<br>de braços cruzados | ![](assets/perseguidor-xandao-caneta.png)<br>com a caneta | ![](assets/perseguidor-xandao-martelo.png)<br>com o martelo |
| **Renan Santos** | ![](assets/perseguidor-renan-livro.png)<br>com o livro amarelo | ![](assets/perseguidor-renan-guitarra.png)<br>guitarrista | ![](assets/perseguidor-renan-fralda.png)<br>com a fralda |

![Todas as variantes no tamanho do jogo](assets/perseguidores-no-jogo.png)

- Código: `src/entities/chaser-sprites.ts`. Meio corpo 36×34, semelhança só sugerida.
- A variante é sorteada cada vez que o perseguidor entra; aparece no aviso ("Xandão com a caneta
  na cola!") e pode mudar a frase do fim de jogo.
- Sua opinião: ☐ manter ☐ melhorar ☐ refazer — _______________________

## 4. HUD: barra de perigo

| Baixo | Médio | Alto |
| :-: | :-: | :-: |
| ![](assets/hud-perigo-baixo.png) | ![](assets/hud-perigo-medio.png) | ![](assets/hud-perigo-alto.png) |

- Código: `src/entities/chaser.ts`. Barra com moldura pixel; verde → amarelo → vermelho, com
  brilho no topo; no vermelho o nome treme.
- Sua opinião: ☐ manter ☐ melhorar ☐ refazer — _______________________

## 5. Obstáculos

| Toga + processos | Balões da CPI | Helicóptero da PF | Radar |
| :-: | :-: | :-: | :-: |
| ![](assets/obstaculo-toga.png) | ![](assets/obstaculo-cpi.png) | ![](assets/obstaculo-pf.png) | ![](assets/obstaculo-radar.png) |

- Código: `src/entities/obstacle-sprites.ts` (desenhos) e `src/entities/obstacles.ts` (movimento e
  áreas de batida).
- **Toga (em cima)**: retangular — laterais retas, mangas em bloco, gola branca quadrada, botões
  dourados e barra reta com faixa dourada na ponta.
- **Pilha de processos (embaixo)**: pastas coloridas com etiquetas; a pilha muda a cada barreira.
- **Balões da CPI**: com brilho e cordinha, balançando.
- **Helicóptero da PF**: hélice com borrão e luz piscando (2 quadros).
- **Radar**: torre treliçada, prato que gira e feixe em cone pontilhado (não bate, só denuncia).
- Sua opinião: ☐ manter ☐ melhorar ☐ refazer — _______________________

## 6. Fundos das regiões

| Brasília (0+) | Litoral (20+) | Oceano (40+) | Fronteira (60+) |
| :-: | :-: | :-: | :-: |
| ![](assets/fundo-1-brasilia.png) | ![](assets/fundo-2-litoral.png) | ![](assets/fundo-3-oceano.png) | ![](assets/fundo-4-fronteira.png) |

- Código: `src/render/scenery.ts`. Cada região tem céu fixo, sol ou lua e 3–4 camadas que andam em
  velocidades diferentes (nuvens, fundo distante, perto, chão) e emendam sem corte.
- **Brasília**: Congresso, Catedral, cerrado e terra vermelha.
- **Litoral**: pôr do sol no mar, prédios da orla, coqueiros e areia.
- **Oceano**: navio e ilha no horizonte, ondas; o chão é a linha de espuma.
- **Fronteira**: noite com estrelas e lua, montanhas, cerca de arame e placa "FRONTEIRA".
- Sua opinião: ☐ manter ☐ melhorar ☐ refazer — _______________________

## 7. Mapa da rota (pausa e landing)

| Início | No Litoral | Na Fronteira |
| :-: | :-: | :-: |
| ![](assets/mapa-inicio.png) | ![](assets/mapa-litoral.png) | ![](assets/mapa-fronteira.png) |

- Código: `src/render/map.ts`. Papel com borda, caminho pontilhado, regiões coloridas (ou "?"),
  nomes em fonte pixel e pino acima da posição (sem cobrir o nome).
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
