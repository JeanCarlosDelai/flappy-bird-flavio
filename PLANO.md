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

O jatinho decola de Brasília e tenta cruzar o país até a fronteira. No caminho aparecem
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
| **FUGA CONCLUÍDA** | chegar a 80 pontos (cruzar a fronteira) | tela de vitória e depois modo infinito | ⬜ |

## 4. O mapa (rota de fuga)

Cada região dura **20 pontos**. Na pausa aparece o mapa com o jatinho (pino vermelho) na posição
atual. Regiões ainda não alcançadas aparecem como **???** para não dar spoiler.

```
 Brasília ──── Litoral ──── Oceano ──── Fronteira ──▶ (fim)
  0–19          20–39        40–59        60–79        80
```

### Brasília (0–19 pontos)
- Visual ✅: céu azul, silhueta do Congresso, cerrado.
- Obstáculos ✅: toga em cima + pilha de processos embaixo (desde o início), balões da CPI (a partir de 3 pontos),
  helicóptero da PF (a partir de 6), radar (a partir de 10).
- Perseguidor ✅: Lula (até 14 pontos), depois Xandão.
- Chefe ⬜: **Sessão extraordinária**. Uma fileira de faixas "URGENTE" desce em ondas e é
  preciso achar a brecha.

### Litoral (20–39 pontos)
- Visual ✅: pôr do sol laranja, morros verdes, areia.
- Obstáculos ✅: os mesmos, mais rápidos.
- Obstáculos novos ⬜: guarda-sol gigante que abre e fecha, gaivotas em bando.
- Perseguidor ✅: Xandão (até 29), depois Renan Santos.
- Chefe ⬜: **Canetada em leque**. Xandão dispara canetas em leque e o jogador passa entre elas.

### Oceano (40–59 pontos)
- Visual ✅: azul profundo, ondas baixas.
- Obstáculos novos ⬜: navio com radar giratório, tempestade (vento empurra o jatinho para baixo).
- Perseguidor ✅: Renan Santos (até 44), depois o ciclo recomeça com Lula.
- Chefe ⬜: **Enxame de drones**. Drones empurram o jatinho na direção dos obstáculos.

### Fronteira (60–79 pontos)
- Visual ✅: céu roxo de entardecer, montanhas.
- Obstáculos novos ⬜: cerca com holofotes (feixe tipo radar, mas que se move).
- Perseguidor ✅: Xandão (até 74), depois Renan Santos.
- Perseguidores ⬜: **os três juntos** na reta final, cada um com o seu ataque.
- Final ⬜: ao chegar a 80, **FUGA CONCLUÍDA**. Depois disso o jogo segue em modo infinito.

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
| Guarda-sol gigante | abre e fecha a passagem | Litoral | ⬜ |
| Gaivotas | bando em formação | Litoral | ⬜ |
| Navio com radar | radar giratório no mar | Oceano | ⬜ |
| Tempestade | vento empurra o jatinho para baixo | Oceano | ⬜ |
| Cerca com holofotes | feixe que se move | Fronteira | ⬜ |

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
| Mudou de região | aviso com o nome da região e o fundo muda | ✅ |
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
  ui/                  # painel de fim de jogo e frases
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
    stages.ts          # regiões do mapa e quantos pontos cada uma dura
    map.ts             # mapa da rota de fuga em pixel art
    text.ts            # texto pixel com contorno e painéis
```

## 12. Roadmap

1. ✅ Configuração: projeto Vite + TS.
2. ✅ Versão mínima jogável: física, colisão, obstáculos, placar, recorde, perseguidor.
3. ✅ Pausa com mapa, landing page e site no ar.
4. ✅ Ranking online, estatísticas e histórico da sessão.
5. ✅ Visual em pixel art: jatinho, perseguidores com variantes, obstáculos, fundos em camadas,
   HUD, mapa e fonte pixel. ⬜ Sons e música.
6. ⬜ Profundidade: ataques dos perseguidores, power-ups, chefes, obstáculos novos por região e
   o final "Fuga concluída".
7. ⬜ Celular: PWA (instalar na tela inicial) e tela cheia.

## 13. Decisões

| Pergunta | Escolha |
| --- | --- |
| Pixel art ou cartoon? | Pixel art (meia resolução, contorno escuro) |
| Em pé ou deitado? | Em pé (pensado para celular) |
| Ranking online ou recorde local? | Os dois: ranking online + histórico no aparelho |
| Nome | Jatinho do Flávio |
