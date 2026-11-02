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
| **FUGA CONCLUÍDA** | chegar a 160 pontos (fim da rota em Miami) | tela de vitória com fanfarra | ✅ |

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
**?** (sem nome, para não dar spoiler). Cada parada dura **40 pontos**: o cenário mostra a cidade de onde
o jatinho saiu, e no mapa ele voa até a próxima.

```
 Brasília ──van──▶ Puerto Iguazú ──jato──▶ Guayaquil ──jato──▶ Miami
  0–39               40–79                   80–119              120–159 (160 = fuga concluída)
```

✅ **Fases longas e transição suave.** Cada parada dura **40 pontos** (rota inteira: 160). Ao completar
uma parada começa uma **viagem de 5 s**: sem obstáculos novos, a "câmera" sai da cidade, passa por um
trecho de viagem e chega à próxima, com o céu e a música mudando aos poucos ("Chegando em …").

| Viagem | Trecho |
| --- | --- |
| Brasília → Puerto Iguazú | estrada no fim de tarde, lavouras, silos e placa "FOZ 640" |
| Puerto Iguazú → Guayaquil | sobrevoo dos Andes nevados, acima das nuvens |
| Guayaquil → Miami | mar do Caribe com ilhas e navio de cruzeiro |

### Brasília (0–39 pontos)
- Visual ✅: Congresso, Catedral, cerrado e terra vermelha. Música ✅: marchinha.
- Na cola ✅: Lula, Xandão, Janja, Gleisi, Lindbergh, Boulos e Erika Hilton (revezam ao longo da fase).
- Obstáculos ✅: toga e processos (0+), balões da CPI (+4), cúpulas do Congresso (+10), helicóptero da PF (+20).
- Obstáculos dos partidos ✅ (**só em Brasília**): caixas da taxa das blusinhas (0+), livro amarelo (+3),
  faixas de protesto (+6), picanha e churrasqueira (+8), outdoor do Missão (+12), acampamento de lona (+14),
  estrela do PT girando (+16), enxame de drones (+18), sol do PSOL (+24).

### Puerto Iguazú, Argentina (40–79 pontos)
- Visual ✅: Cataratas e Ponte Tancredo Neves (metade Brasil, metade Argentina). Música ✅: tango.
- Na cola ✅: agente da PF, Renan Santos, Kim Kataguiri e Haddad (a "taxa" na fronteira).
- Obstáculos ✅: jatos d'água das Cataratas (a passagem sobe e desce), cancela da ponte (abre e fecha),
  Marco das Três Fronteiras, quatis (pulam do chão), tucanos, cuia de chimarrão (rola pelo ar), bote das Cataratas.

### Guayaquil, Equador (80–119 pontos)
- Visual ✅: Andes, Cerro Santa Ana, farol, roda-gigante, rio Guayas. Música ✅: cumbia.
- Na cola ✅: Gonet e Dino.
- Obstáculos ✅: bananas do porto (cacho em cima, caixas embaixo), iguanas (pulam), Torre do Relógio,
  roda-gigante La Perla (passa entre as cabines), atobás-de-pés-azuis, torre de controle (o feixe denuncia),
  chapéu-panamá (pula girando).

### Miami, EUA (120–159 pontos)
- Visual ✅: pôr do sol neon, Brickell, art déco, praia. Música ✅: reta final.
- Na cola ✅: agente da Interpol e **todos os outros** revezando.
- Obstáculos ✅: prédios de Brickell (passagem sobe e desce), pelicanos em V, flamingos, jacaré (salta da água),
  avião com faixa "WELCOME FLAVIO", holofote da imigração (o feixe varre o céu e denuncia), foguete de Cabo Canaveral.
- Final ✅: aos **160 pontos**, tela **"FUGA CONCLUÍDA!"** com fanfarra.

## 5. Perseguidores

✅ Pixel art, meio corpo, **3 variantes sorteadas** de cada. Cada parada tem o seu grupo, que reveza ao
longo da fase; quem chega herda parte da perseguição. Personagens públicos são caricaturas vagas; os
agentes da PF e da Interpol são **genéricos** (não são pessoas reais). Contexto: Moraes mandou entregar os
passaportes; PT e PSOL pediram ao STF prisão e alerta da Interpol; a PF disse que ele não é foragido nem
tem mandado ([Band](https://www.band.com.br/politica/eleicoes/pt-aciona-stf-e-pede-prisao-de-flavio-e-inclusao-de-seu-nome-na-interpol),
[Perfil Multi](https://perfilmulti.com.br/84868/pf-afirma-que-flavio-bolsonaro-nao-e-foragido-nem-alvo-de-mandado-de-prisao/)).

| Perseguidor | Parada | Variantes |
| --- | --- | --- |
| Lula | Brasília | de terno · com o decreto · com a picanha |
| Xandão | Brasília | de braços cruzados · com a caneta · com o martelo |
| Janja | Brasília | com a Constituição aberta · apontando a Constituição · com ela debaixo do braço |
| Agente da PF | Puerto Iguazú | de colete · com o distintivo · com a lanterna |
| Renan Santos | Puerto Iguazú | com o livro amarelo · guitarrista · com a fralda do Lula · com a fralda do Flávio |
| Gonet | Guayaquil | com a pasta da PGR · com o carimbo · de braços cruzados |
| Dino | Guayaquil | de toga · com o Código Penal · no celular |
| Agente da Interpol | Miami | com a lupa · com o alerta vermelho · de binóculo |
| Gleisi (PT) | Brasília | com o megafone · com a planilha · apontando — ataque: notas oficiais em onda |
| Lindbergh (PT) | Brasília | no microfone · com o requerimento · apontando — ataque: requerimentos em leque |
| Boulos (PSOL) | Brasília | de capacete · com a lona · com o megafone — ataque: barracas caindo (ocupação) |
| Erika Hilton (PSOL) | Brasília | com o projeto de lei · no microfone · apontando — ataque: representações em zigue-zague |
| Haddad (PT) | Puerto Iguazú | com a calculadora · com a maquininha · com a caixa da taxa — ataque: caixas em arco |
| Kim Kataguiri (Missão) | Puerto Iguazú | versão rato (o meme) · com o papel · de terno — ataque: "thread" (4 balões em fila) |

Em Miami todos os 14 revezam.

## 6. Obstáculos

✅ **34 obstáculos**: Brasília tem 13 (4 de lá + 9 dos partidos, que só aparecem em Brasília); Iguazú,
Guayaquil e Miami têm 7 cada, todos da própria região. Cada um entra a partir de certa pontuação dentro da fase.
Código: `src/entities/obstacles-extra.ts`, `obstacles-brasilia.ts` e `obstacles-regions.ts`; tabelas em
`src/systems/spawner.ts`.

## 7. Power-ups, moedas, ataques, chefes e mais ✅

| O quê | Como funciona |
| --- | --- |
| 🪙 Moedas | no caminho do avião: 3 dentro da passagem de cada obstáculo (acompanham se ela se mexe) e uma trilha ligando uma passagem à outra; nunca em cima de obstáculo. Raspão, chefes e medalhas também dão |
| 🛡️ Habeas corpus | escudo: a próxima batida não conta |
| 🛂 Passaporte | 5 s atravessando obstáculos e ataques |
| ⛽ Combustível | o perseguidor recua bastante na hora |
| 💥 Ataques | Lula: decretos · Xandão: canetadas em leque · Janja: Constituições em arco · PF: algemas · Renan: drone que empurra · Gonet: carimbos caindo (com aviso) · Dino: Código Penal mirado · Interpol: faixa de alerta vermelho |
| 👑 Chefes | 3 pontos antes do fim de cada parada, 9 s de ataques do grupo da parada: Sessão extraordinária, Operação Fronteira, Denúncia em lote, Alerta vermelho geral (+10 moedas) |
| 😬 Raspão | passar a menos de 14 px de um obstáculo sem bater: combo e moedas |
| 📳 Vibração | ao bater, pegar power-up, chefe e fim de jogo |
| 🏅 Medalhas | 16 metas (ver Coleção), cada uma dá moedas |
| 📅 Desafio do dia | mesma sequência para todo mundo (semente = data de Brasília); melhor do dia salvo no aparelho |
| 📤 Compartilhar | imagem 1080×1920 em pixel art com placar, mapa e quem pegou; WhatsApp/Instagram ou download |
| 🛩️ Hangar | 11 jatinhos para comprar com moedas (clássico, Flávio na janela, verde-amarelo, camuflado, carnaval, avião de papel, dourado, teco-teco, luxo, foguete do Flávio, disco voador) |

Aviso de "novo na coleção" agora é pequeno, no canto de baixo à esquerda.

## 7b. Eventos aleatórios ✅ (5 no jogo)

**No jogo:** chuva de fraldas (LULA/FLÁVIO), chuva de Constituição, gravidade suspensa por liminar,
apagão, chuva de moedas e os dos partidos (greve geral, ocupação relâmpago, live ao vivo); mais os
**veículos dos partidos** (Aerolula, helicóptero de lona, dirigível do Missão) — ver `docs/eventos/EVENTOS.md`. Um a cada 45–60 s (fora da viagem e do
chefe), aviso de 2 s, duração de 6–8 s. **Durante o evento os perseguidores não atacam** e o chefe
espera. Categoria "Eventos" na Coleção e 6 medalhas de eventos (ver `docs/eventos/EVENTOS.md`).

Ideias que ainda podem entrar:

| Evento | Onde | Efeito |
| --- | --- | --- |
| Chuva de Constituição | Brasília | Constituições caindo do céu em ondas |
| Diário Oficial ao vento | Brasília | decretos voando com vento lateral |
| Gravidade suspensa por liminar | qualquer | gravidade invertida por 5 s (tocar faz descer) |
| Apagão | qualquer | tela escura; só a luz do jatinho ilumina à frente |
| Neblina das Cataratas | Puerto Iguazú | névoa: obstáculos aparecem mais tarde |
| Operação surpresa da PF | Puerto Iguazú | helicópteros e holofotes extras |
| Nevasca nos Andes | viagem/Guayaquil | neve e vento que empurra para baixo |
| Revoada de iguanas | Guayaquil | iguanas pulando em sequência |
| Furacão | Miami | vento forte que sobe e desce o jatinho |
| Fogos de artifício | Miami | explosões que bloqueiam faixas da tela |
| Turbulência | qualquer | o jatinho treme; controle mais sensível |
| Coletiva de imprensa | qualquer | microfones gigantes surgem do chão |
| Chuva de moedas (bom) | qualquer | moedas por todo lado por 6 s |
| Recesso do Judiciário (bom) | qualquer | o perseguidor para por 8 s |

## 7d. Modos de jogo e missões diárias ✅

- **Sem fim** (♾️ no menu): ao chegar a Miami a rota recomeça em Brasília ("VOLTA 2"), com os chefes de
  novo e a velocidade no máximo. Recorde próprio, salvo no aparelho.
- **Hardcore** (💀 no menu): qualquer batida pega o Flávio na hora; sem habeas corpus (escudo).
  Recorde próprio, salvo no aparelho. O ranking online continua sendo do modo normal.
- Medalhas: "Volta às Américas" (sem fim, começar a volta 2) e "Sangue frio" (hardcore, chegar a Iguazú).
- **Missões diárias** (🎯 no menu): 3 por dia, iguais para todo mundo (sorteadas pela data de Brasília),
  somando as partidas do dia; cada uma paga moedas ao concluir. Banco de 19 missões em
  `src/systems/missions.ts` (moedas, pontos, raspões, chefes, eventos, desviar de estrelas do PT,
  fugir do Kim rato, hardcore, sem fim…). O progresso aparece no fim de cada partida.

## 7e. Chefes desenhados e clima ✅

- **Chefes**: perto do fim de cada parada entra um personagem gigante pela direita, atrás de uma
  bancada, com barra no alto que esvazia em 9 s. Ele ataca da direita (60%) e o grupo da parada ajuda
  pela esquerda (40%). Brasília: **Xandão gigante** (STF, canetadas em leque); Iguazú: **Haddad da
  alfândega** (ADUANA, caixas da taxa); Guayaquil: **Gonet do carimbo** (PGR, carimbos do alto);
  Miami: **Interpol em peso** (alertas vermelhos). Código: `src/entities/boss.ts`.
- **Clima**: em cada parada, 60% de chance de o tempo fechar uma vez por 15 s (entre 8 e 20 s depois
  de chegar). Brasília: **chuva** (jatinho 12% mais pesado); Iguazú: **névoa** (a direita da tela fica
  branca, os obstáculos surgem de dentro dela); Guayaquil: **ventania dos Andes** (rajadas sobem e
  descem o jatinho); Miami: **tempestade tropical** (chuva forte, raios e rajadas). Código:
  `src/systems/weather.ts`.
- Coleção ganhou **👑 Chefes** e **🌧️ Clima**; medalhas "Todos os chefes" e "Faça chuva ou faça sol".
- Modo teste: "Clima sempre". GIFs em `docs/fase3/`.

## 7f. Passaporte, conquistas secretas e skins do Flávio ✅

- **🛂 Passaporte** (`/passaporte`, link no menu e no fim de jogo): capa com a "foto" do jatinho
  equipado, carimbos de cada país visitado com a data da primeira vez, e a ficha (partidas, fugas
  completas, fuga mais rápida, recordes de cada modo, tempo de voo, batidas, moedas, medalhas,
  coleção, missões de hoje e quem mais te pegou). Print em `docs/passaporte.png`.
- **8 conquistas secretas** (aparecem como "Conquista secreta / Descubra jogando" até ganhar):
  Rato de laboratório, Decolagem cancelada, Fuga de madrugada, Turista, Só mais uma, Ficha corrida,
  Intocável e Vento na cara (as regras ficam só no código, `src/systems/medals.ts`).
- **5 skins do Flávio na janela**: de boné, de férias (chapéu de palha e óculos), da seleção,
  disfarçado (peruca loira, óculos e bigode falso) e aviador.

## 7g. Cenas finais ✅

- **Captura**: quando o perseguidor alcança o jatinho, a tela escurece, ele encosta no avião, caem
  as algemas e aparece "PEGO!" com o nome de quem pegou (1,9 s; um toque pula depois de 1,2 s).
- **Pouso forçado**: fumaça no chão e "POUSO FORÇADO!" (1,1 s).
- **Final em Miami**: o jatinho desce até a pista e freia, aparece a escada, o Flávio desce de
  óculos escuros e acena, e os perseguidores (Interpol, Xandão, Lula e o Kim rato) chegam correndo,
  atrasados; "FUGA CONCLUÍDA!" com confete (7,5 s; dá para pular só depois do "FUGA CONCLUÍDA!").
- Corrigido: ao completar a rota o cenário e o painel diziam Brasília; agora é Miami. O aviso de
  início também mostra a parada certa quando o Modo teste começa em outra.
- GIFs em `docs/fase5/`. Código: `src/entities/cutscene.ts`.

## 7h. Social: desafiar amigo, replay e cartão ✅

- **⚔️ Desafiar um amigo** (fim de jogo, modo normal): toda partida tem uma semente; o link
  `jogar.html?desafio=SEMENTE&alvo=PONTOS&de=NOME` abre o jogo com o aviso "Desafio de NOME" e a
  **mesma sequência** de obstáculos, moedas e perseguidores. Durante a partida aparece o alvo; no fim,
  "Você venceu o desafio" ou quanto faltou. No celular abre o compartilhar; no computador copia o link.
- **🎞️ Replay em GIF**: o jogo guarda os últimos 4,5 s (10 quadros/s, meia resolução, incluindo a
  cena final) e gera um GIF animado na hora, sem biblioteca (`src/ui/gif.ts`, `src/ui/replay.ts`).
  Exemplo em `docs/fase6-replay-exemplo.gif`.
- **Cartão de compartilhamento novo**: selos (recorde, modo, desafio do dia, "VS amigo"), como acabou e
  a frase do fim de jogo, mapa da rota, quem pegou com balão "PEGO!" (ou o Flávio acenando na fuga
  completa), batidas, moedas, raspões e medalhas, com a skin usada.

## 7i. Conforto, equilíbrio e lançamento ✅

- **Setas de aviso**: seta vermelha piscando na borda mostra de onde vai entrar o que é jogado
  (fraldas, Constituições, carimbos, bandeiras, veículos, arcos).
- **Ajustes** (Mais → Ajustes): volume da música e dos efeitos, vibração, reduzir efeitos (sem flashes,
  raios, confete e tremidas), gráficos (automático/completo/leve) e "mostrar o tutorial de novo".
- **Modo leve automático**: se o celular ficar lento por 3 s, menos partículas (chuva, confete, live).
- **Tutorial** na primeira partida: mais devagar e sem ataques nos 6 primeiros pontos, batidas valem
  metade e dicas na hora certa.
- **Equilíbrio**: robô de teste (`tools/balance.cjs`, `docs/EQUILIBRIO.md`) e ataques suavizados.
- **Telas pequenas/iPhone**: nenhuma página passa da largura em 320 px; no fim de jogo o botão de
  jogar de novo fica preso no rodapé; respeita a área segura do iPhone.
- **Prévia no WhatsApp/redes**: `public/og-image.png` (1200×630, `tools/og.html`) e etiquetas Open
  Graph/Twitter em todas as páginas.
- **Vercel Web Analytics**: visitas (sem cookies) e eventos `partida`, `tutorial_concluido` e
  `desafio_aberto` (`src/analytics.ts`). Precisa ligar no painel da Vercel (aba Analytics).

## 7j. Falas na perseguição, segredos e página "Sobre e fontes" ✅

- **Falas na perseguição:** quando um perseguidor entra na cola, 40% das vezes (no máximo 1 a cada
  30 s, nunca em chefe/evento) ele fala uma das frases dele, com legenda e fonte.
- **Segredos** (cada um vale uma conquista secreta com moedas):
  - tocar 10 vezes no "Flávio na janela" do Hangar → skin secreta **Flávio ninja** + conquista
    "Toc toc, Flávio?" (25 moedas);
  - tocar 7 vezes na versão do jogo (rodapé, ex. "v1.0.0") → liga/desliga a **câmera lenta** (jogo 25%
    mais lento; não vai para o ranking online) + conquista "Câmera lenta" (15 moedas). Depois de
    descoberta, a opção também aparece em Ajustes.
- **Sobre e fontes** (`/sobre`): o que é o jogo (sátira), todas as falas reais com contexto, áudio e
  links do original, base legal, fontes dos áudios e como os dados são usados (no aparelho; Vercel
  Analytics sem cookies). Link no menu Mais, nos rodapés e na Coleção.

## 7c. (histórico)

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

## 9b. Coleção (estilo Pokédex) ✅

- Página `/colecao`, salva no navegador (localStorage). **44 itens**: 24 perseguidores (8 × 3 variantes),
  4 paradas da rota e 16 obstáculos. Contagem por categoria ("2 de 9") e total com barra.
- O item é registrado na primeira vez que aparece; mostra desenho, nº, quantas vezes foi visto e desde
  quando. O que falta aparece como silhueta escura com "???" (paradas escurecidas, sem spoiler).
- Durante a partida: aviso **"NOVO NA COLEÇÃO!"** com som; no fim de jogo, lista das novidades e link
  "📖 Coleção (x de 17)". Links também no menu, na landing e no ranking.
- Código: `src/systems/collection.ts` (catálogo e progresso, com testes) e `src/colecao/`.

## 9c. App no celular (PWA) ✅

- Instala na tela de início: botão **📲 Instalar** na landing e no menu (Android/Chrome abre o pedido;
  no iPhone mostra o passo a passo: Safari → Compartilhar → Adicionar à Tela de Início).
- Abre em **tela cheia e em pé**, com ícone em pixel art do jatinho (`public/icons/`, gerados por
  `tools/icons.ts` + `node tools/capture-icons.cjs`).
- **Offline**: o service worker (`sw.js`, gerado no build por `server/pwa-plugin.ts`) guarda todas as
  páginas e arquivos; páginas tentam a rede primeiro (pegam versão nova) e usam o guardado sem
  internet. Só o ranking online precisa de conexão. A cada publicação o celular atualiza sozinho.

## 9d. Modo teste (temporário) ✅

Página `/teste` (link "⚙️ Teste" no menu do jogo), salva no aparelho: liga/desliga, pontos por parada,
parada inicial, duração da viagem, perseguidores (caixas de marcar), velocidade, invencível e se registra
na Coleção. Com o modo ligado aparece "MODO TESTE" e a partida não conta para ranking nem recorde.
**Para remover:** apagar `src/systems/test-mode.ts`, `teste.html`, `src/teste/` e os trechos marcados com
`MODO TESTE` no código (e a linha do `teste.html` em `vite.config.ts`, `vercel.json` e `server/pwa-plugin.ts`).

- **Botão 🧪 Teste dentro do jogo** (só com o Modo teste ligado, canto de baixo à direita): pausa e
  abre o painel "Disparar agora" com o clima da parada, evento aleatório ou qualquer um dos 8
  eventos, o veículo do partido do perseguidor atual, o chefe da parada e o ataque do perseguidor.

## 10. Site

- ✅ **Landing page** (`/`): aviso de sátira, como jogar, mapa inicial (só Brasília revelada) e
  "o que pode acontecer" sem spoilers.
- ✅ **Jogo** (`/jogar`).
- ✅ **Ranking e estatísticas** (`/ranking`); top 5 também na landing.
- ✅ **Coleção** (`/colecao`).
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
8. ✅ Celular: PWA — instala na tela de início, abre em tela cheia e em pé, funciona offline.

## 13. Decisões

| Pergunta | Escolha |
| --- | --- |
| Pixel art ou cartoon? | Pixel art (meia resolução, contorno escuro) |
| Em pé ou deitado? | Em pé (pensado para celular) |
| Ranking online ou recorde local? | Os dois: ranking online + histórico no aparelho |
| Nome | Jatinho do Flávio |
