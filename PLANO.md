# Jatinho do Flávio — plano e roteiro

Jogo original do gênero "toque para voar", de **humor e sátira**. Não é cópia do Flappy Bird:
sem canos, sem passarinho, sem nada do jogo original. Personagens são **caricaturas desenhadas**,
nunca fotos. Tudo é ficção. O jogo não tem propaganda e não pede voto. O ranking guarda só o
apelido escolhido e os números das partidas, nada de dados pessoais.

Legenda: ✅ já está no jogo · ⬜ planejado

Prints de todos os desenhos atuais (jatinho, perseguidores, obstáculos, fundos, mapa e telas):
[docs/ASSETS.md](docs/ASSETS.md).

---

## 1. Premissa

O jatinho sai de Brasília e cruza as Américas até Miami, seguindo a rota noticiada. No caminho aparecem
obstáculos do tema e, sempre na borda esquerda da tela, alguém vem atrás. Cada erro deixa o
perseguidor mais perto. Se ele alcançar o jatinho, ou se o jatinho encostar no chão, acabou.

## 2. Controles

| Ação | Celular | Computador | Status |
| --- | --- | --- | --- |
| Voar (impulso para cima) | tocar na tela | clique, Espaço, ↑, W, Enter | ✅ |
| Pausar e ver o mapa | botão ⏸ no canto superior direito | Esc ou P | ✅ |
| Continuar | tocar na tela ou no ▶ | Esc, P, Espaço ou clique | ✅ |
| Pausa automática | ao trocar de aba ou minimizar | ao trocar de aba ou minimizar | ✅ |

## 3. Regras básicas

- ✅ Gravidade puxa para baixo; cada toque dá um impulso para cima. O teto só segura.
- ✅ Cada obstáculo que fica para trás vale **1 ponto**.
- ✅ **Bater num obstáculo não mata:** o perseguidor avança ~1/3 da barra de perigo, a tela pisca
  em vermelho e o jatinho fica 1,2 s invencível (piscando).
- ✅ **Voar limpo** faz o perseguidor recuar devagar (a barra esvazia sozinha).
- ✅ **Feixe do radar** não bate, mas denuncia: o perseguidor avança um pouco ("Radar te viu!").
- ✅ A velocidade sobe e as passagens ficam mais estreitas conforme a pontuação.
- ✅ Recorde salvo só no aparelho.

### Como o jogo termina

| Final | Quando | Tela | Status |
| --- | --- | --- | --- |
| **CAIU!** | o jatinho encosta no chão | "O jatinho foi ao chão" | ✅ |
| **PEGO!** | a barra de perigo enche | "<perseguidor> alcançou o jatinho" | ✅ |
| **FUGA CONCLUÍDA** | chegar a 80 pontos (Miami) | tela de vitória e depois modo infinito | ⬜ |

## 4. O mapa: a rota de fuga pelas Américas

O trajeto segue a **ordem real noticiada em 27–28/out/2026**: Brasília → de van até Foz do Iguaçu,
cruzando a Ponte Tancredo Neves → **Puerto Iguazú (Argentina)** → jato executivo, desviando do espaço
aéreo brasileiro → **Guayaquil (Equador)** → **Miami (EUA)**, com pouso em Opa-locka.
Fontes: [Band](https://www.band.com.br/politica/van-jato-e-desvio-do-brasil-como-foi-o-plano-de-fuga-de-flavio-aos-eua),
[Brasil de Fato](https://www.brasildefato.com.br/2026/10/28/flavio-bolsonaro-fugiu-pela-argentina-na-noite-de-terca-27-e-fez-escala-no-equador-antes-de-seguir-para-os-eua/),
[A Pública](https://apublica.org/2026/10/em-fuga-flavio-bolsonaro-embarcou-da-argentina-rumo-ao-equador-e-ainda-nao-chegou-aos-eua/),
[Metrópoles](https://www.metropoles.com/mundo/aviao-flavio-bolsonaro-chega-eua-trump).

✅ Na pausa aparece o **mapa das Américas em pixel** com as paradas na ordem, a rota já feita em
vermelho e o **aviãozinho andando** conforme os pontos. Paradas ainda não alcançadas aparecem como
**?** (sem nome, para não dar spoiler). Cada parada dura **20 pontos**: o cenário mostra a cidade de onde
o jatinho saiu, e no mapa ele voa até a próxima.

```
 Brasília ──van──▶ Puerto Iguazú ──jato──▶ Guayaquil ──jato──▶ Miami
  0–19               20–39                   40–59               60+
```

### Brasília (0–19 pontos)
- Visual ✅: céu azul, Congresso e Catedral, cerrado e terra vermelha.
- Obstáculos ✅: toga + processos (desde o início), balões da CPI (3+), helicóptero da PF (6+), radar (10+).
- Música ✅: marchinha (Sol maior).
- Chefe ⬜: **Sessão extraordinária** (faixas "URGENTE" descendo em ondas).

### Puerto Iguazú, Argentina (20–39 pontos)
- Visual ✅: Cataratas do Iguaçu, **Ponte Tancredo Neves** pintada metade verde-amarela (Brasil) e
  metade azul e branca (Argentina), rio e mata.
- Música ✅: tango (habanera, Ré menor).
- Chefe ⬜: **Canetada em leque**.

### Guayaquil, Equador (40–59 pontos)
- Visual ✅: Andes ao fundo, Cerro Santa Ana com casinhas coloridas e farol, roda-gigante do Malecón,
  rio Guayas e palmeiras.
- Música ✅: cumbia (Mi menor).
- Chefe ⬜: **Enxame de drones**.

### Miami, EUA (60+ pontos)
- Visual ✅: pôr do sol neon, prédios de Brickell, mar turquesa, hotéis art déco com letreiro, palmeiras
  e posto de salva-vidas.
- Música ✅: reta final, tensa e rápida (Ré menor).
- Final ⬜: **FUGA CONCLUÍDA** aos 80 pontos (hoje o jogo segue infinito em Miami).

## 5. Perseguidores

Ficam na borda esquerda, seguem a altura do jatinho e avançam a cada erro. ✅ Hoje trocam a cada
15 pontos, em ciclo: Lula → Xandão → Renan Santos → Lula…

✅ Desenhados em **pixel art** (meio corpo), com **variantes sorteadas** cada vez que entram:

| Perseguidor | Variantes | Ataque | Status do ataque |
| --- | --- | --- | --- |
| Lula | de terno · com o decreto · com a picanha | solta **decretos** (papéis que voam em linha reta) | ⬜ |
| Xandão | de braços cruzados · com a caneta · com o martelo | **canetadas em leque** (3 a 5 canetas em ângulo) | ⬜ |
| Renan Santos | com o livro amarelo · guitarrista · com a fralda | **drone** que empurra o jatinho contra os obstáculos | ⬜ |

A variante aparece no aviso ("Xandão com a caneta na cola!") e pode mudar a frase do fim de jogo.

## 6. Obstáculos

| Obstáculo | Comportamento | Entra em | Status |
| --- | --- | --- | --- |
| Toga + processos | toga pendurada em cima e pilha de processos embaixo, com passagem no meio | 0 pontos | ✅ |
| Balões da CPI | coluna de balões balançando, com uma brecha | 3 pontos | ✅ |
| Helicóptero da PF | sobe e desce enquanto atravessa a tela | 6 pontos | ✅ |
| Radar | torre bate; o feixe só denuncia você | 10 pontos | ✅ |
| Cataratas (jatos d'água) | sobem e descem como cortina | Puerto Iguazú | ⬜ |
| Mate gigante e cuia | rolam no ar | Puerto Iguazú | ⬜ |
| Roda-gigante La Perla | gira e só passa na brecha entre as cabines | Guayaquil | ⬜ |
| Iguanas do Parque Seminario | pulam de baixo | Guayaquil | ⬜ |
| Holofote da imigração | feixe que se move (tipo radar) | Miami | ⬜ |

## 7. Power-ups ⬜

| Item | Efeito |
| --- | --- |
| Combustível | o perseguidor recua bastante na hora |
| Habeas corpus | escudo: a próxima batida não conta |
| Passaporte | atravessa um obstáculo sem bater |

## 8. Tudo o que pode acontecer numa partida

| Situação | Resultado | Status |
| --- | --- | --- |
| Passou um obstáculo | +1 ponto | ✅ |
| Bateu num obstáculo | perseguidor avança ~1/3, tela pisca, 1,2 s invencível | ✅ |
| Bateu de novo durante a invencibilidade | nada acontece | ✅ |
| Passou pelo feixe do radar | perseguidor avança um pouco, aviso "Radar te viu!" | ✅ |
| Voou um tempo sem bater | perseguidor recua devagar | ✅ |
| Encostou no teto | o jatinho é segurado ali, sem dano | ✅ |
| Encostou no chão | **CAIU!** fim de jogo | ✅ |
| Barra de perigo encheu | **PEGO!** fim de jogo | ✅ |
| Chegou a uma nova parada | aviso com o nome da cidade, fundo e música mudam | ✅ |
| Trocou o perseguidor | aviso "<nome> entrou na perseguição!" | ✅ |
| Bateu o recorde | "NOVO RECORDE!" no game over | ✅ |
| Pausou | mapa com a posição e quanto falta para a próxima região | ✅ |
| Pegou um power-up | efeito da tabela acima | ⬜ |
| Chegou ao chefe da região | ataque especial do chefe | ⬜ |
| Chegou a 80 pontos | **FUGA CONCLUÍDA** e modo infinito | ⬜ |

## 9. Ranking, sessão e estatísticas ✅

### Fim de jogo
- Título fixo **"Dessa vez o Flávio não fugiu!"** + frase sorteada conforme quem pegou
  (ex.: "Canetada certeira do Xandão.", "Pouso forçado em Brasília.").
- Pontos, região alcançada, recorde, diferença para a última partida, batidas e tempo de voo.
- O que faltou: pontos para a próxima região (sem dizer o nome) ou para bater o recorde.
  "Primeira vez em <região>!" quando chega numa região nova.
- Comparação com todo mundo: "Foi tão longe ou mais que X% das outras N partidas".
- **Apelido no ranking** (2–16 caracteres, palavrões bloqueados). O apelido fica lembrado no
  aparelho. Cada apelido aparece uma vez, com a melhor pontuação.
- Botão "Tente na próxima!" (frase varia) e link para o ranking.

### Ranking (`/ranking`)
- **Geral** e **Hoje** (vira à meia-noite de Brasília), top 50, empates dividem a posição.

### Estatísticas gerais
- Partidas jogadas, pilotos no ranking, recorde geral, média de pontos, tempo de voo somado,
  batidas no total.
- Como as fugas terminaram (chão, Lula, Xandão, Renan Santos).
- Até onde chegaram (% das partidas que alcançou cada região; nome só aparece se você já chegou lá).
- Pontos por partida (faixas de 5).
- O que mais acertou jatinhos (por obstáculo).

### Suas estatísticas (só no aparelho)
- Partidas, recorde, média, tempo de voo, batidas, região mais distante, como suas fugas
  terminaram e as últimas partidas.

### Como funciona por dentro
- Funções da Vercel em `api/` (`runs`, `ranking`, `stats`) com **Upstash Redis**.
- Toda partida é registrada de forma anônima nas estatísticas. O ranking usa um "ticket" da
  partida guardado no servidor por 1 h, então o jogador não escolhe a própria pontuação ao
  colocar o nome.
- Anti-trapaça simples: pontos impossíveis para o tempo de voo são recusados; limite de
  requisições por minuto (o IP vira um hash e não é guardado).
- Sem banco configurado, o jogo funciona igual e mostra só os dados do aparelho.

## 10. Site

- ✅ **Landing page** (`/`): aviso de sátira, como jogar, mapa inicial (só Brasília revelada) e
  "o que pode acontecer" sem spoilers.
- ✅ **Jogo** (`/jogar`).
- ✅ **Ranking e estatísticas** (`/ranking`); top 5 também na landing.
- ✅ No ar na Vercel: https://jatinho-do-flavio.vercel.app

## 11. Stack e estrutura

Vite + TypeScript + Canvas 2D, publicado como site estático.

```
index.html             # landing page
jogar.html             # página do jogo
ranking.html           # ranking e estatísticas
api/                   # funções da Vercel: runs, ranking, stats
server/                # regras do servidor (validação, banco Redis/memória, rotas) + testes
src/
  main.ts              # liga canvas, input, telas e loop do jogo
  landing/             # script e estilo da landing (reusa o fundo, o jatinho e o mapa)
  ranking/             # página de ranking e estatísticas
  net/api.ts           # chamadas à API (falha em silêncio se estiver offline)
  ui/                  # painel de fim de jogo, frases e botão de som
  audio/               # motor de áudio, efeitos, músicas (notação em texto) e sintetizador
  core/
    config.ts          # todas as constantes de ajuste (física, velocidade, dificuldade)
    loop.ts            # loop com passo fixo (física igual em qualquer tela)
    input.ts           # toque, clique, teclado e pausa
    screen.ts          # canvas em pé (9:16), nítido em tela retina
  scenes/              # telas: menu, jogo (com pausa), game over
  entities/
    jet.ts             # o jatinho (pixel art, 10 inclinações)
    chaser-sprites.ts  # perseguidores em pixel art e variantes
    obstacle-sprites.ts# desenhos dos obstáculos em pixel art
    chaser.ts          # perseguidores
    obstacles.ts       # barreira de toga, balões da CPI, helicóptero da PF, radar
  systems/
    physics.ts         # gravidade e impulso
    collision.ts       # colisão por retângulos
    spawner.ts         # sorteio dos obstáculos
    difficulty.ts      # velocidade, intervalo e passagem por pontuação
    session.ts         # histórico no aparelho (recorde, partidas, mortes, região mais longe)
  render/
    pixel.ts           # grade de pixels: formas, contorno, rotação, desenho ampliado
    pixel-font.ts      # fonte pixel 3x5 com acentos
    scenery.ts         # cenários em pixel art por região (camadas)
    background.ts      # desenha as camadas com parallax
    stages.ts          # paradas (cidade, país, coordenadas) e pontos de cada uma
    americas.ts        # contorno das Américas e a rota real (para o mapa)
    map.ts             # mapa das Américas em pixel com rota e aviãozinho
    text.ts            # texto pixel com contorno e painéis
```

## 12. Roadmap

1. ✅ Configuração: projeto Vite + TS.
2. ✅ Versão mínima jogável: física, colisão, obstáculos, placar, recorde, perseguidor.
3. ✅ Pausa com mapa, landing page e site no ar.
4. ✅ Ranking online, estatísticas e histórico da sessão.
5. ✅ Visual em pixel art: jatinho, perseguidores com variantes, obstáculos, fundos em camadas,
   HUD, mapa e fonte pixel.
6. ✅ Som: músicas chiptune originais (menu + uma por região), efeitos sonoros e botão de som
   (tudo / só efeitos / desligado, tecla M). Amostras em `docs/audio/`. ⬜ Falas dos personagens
   (pesquisa de frases reais e opções de voz em `docs/amostra-falas/` e `docs/opcoes-voz-neural/`).
7. ⬜ Profundidade: ataques dos perseguidores, power-ups, chefes, obstáculos novos por região e
   o final "Fuga concluída".
8. ⬜ Celular: PWA (instalar na tela inicial) e tela cheia.

## 13. Decisões

| Pergunta | Escolha |
| --- | --- |
| Pixel art ou cartoon? | Pixel art (meia resolução, contorno escuro) |
| Em pé ou deitado? | Em pé (pensado para celular) |
| Ranking online ou recorde local? | Os dois: ranking online + histórico no aparelho |
| Nome | Jatinho do Flávio |
