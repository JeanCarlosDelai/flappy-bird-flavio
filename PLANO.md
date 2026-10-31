# Jatinho do Flávio — plano

Jogo original do gênero "toque para voar". Não é cópia do Flappy Bird: sem canos, sem
passarinho, sem nada do jogo original. Personagens são **caricaturas desenhadas**, nunca fotos.

## Stack

Vite + TypeScript + Canvas 2D. Gera um site estático (Vercel ou GitHub Pages).

## Estrutura

```
src/
  main.ts              # liga canvas, input, telas e loop
  core/
    config.ts          # todas as constantes de ajuste (física, velocidade, dificuldade)
    loop.ts            # loop com passo fixo (física igual em qualquer tela)
    input.ts           # toque, clique e teclado viram um único "apertou"
    screen.ts          # canvas em pé (9:16), nítido em tela retina
  scenes/              # telas: menu, jogo, game over
  entities/
    jet.ts             # o jatinho
    chaser.ts          # perseguidores (Lula, Xandão, Renan Santos)
    obstacles.ts       # barreira de toga, balões de CPI, helicóptero da PF, radar
  systems/
    physics.ts         # gravidade e impulso
    collision.ts       # colisão por retângulos
    spawner.ts         # sorteio dos obstáculos (cada tipo entra a partir de X pontos)
    difficulty.ts      # velocidade, intervalo e passagem por pontuação
    score.ts           # recorde no aparelho (localStorage)
  render/
    background.ts      # fundo em camadas (parallax)
    stages.ts          # fases: Brasília → litoral → oceano → fronteira
    text.ts            # texto com contorno e painéis
```

## Regras atuais

- Toque = impulso para cima; gravidade puxa para baixo.
- Bater em obstáculo **não mata**: o perseguidor avança (barra no topo) e o jatinho fica
  piscando/invencível por 1,2 s. Voando limpo, o perseguidor recua devagar.
- Perseguidor chegou no jatinho = **PEGO!**. Encostou no chão = **CAIU!**.
- Feixe do radar não bate, mas denuncia você (o perseguidor avança um pouco).
- Perseguidor troca a cada 15 pontos: Lula → Xandão → Renan Santos.
- Fases trocam em 20, 40 e 60 pontos.

## Roadmap

1. ✅ Configuração: projeto Vite + TS.
2. ✅ Versão mínima jogável: física, colisão, obstáculos, placar, recorde, perseguidor.
   (desenhos provisórios com formas simples no canvas)
3. ⬜ Tema: sprites cartoon, fundo em camadas mais caprichado, sons e música.
4. ⬜ Profundidade:
   - ataques dos perseguidores: Lula soltando "decretos", Xandão com "canetadas" em leque,
     Renan Santos com drone que empurra o jatinho contra os obstáculos;
   - power-ups: combustível, "habeas corpus" (escudo), "passaporte" (atravessa um obstáculo);
   - chefes no fim de cada fase.
5. ⬜ Publicação: ajustes de celular (PWA, tela cheia) e site no ar.

## Decisões (padrões adotados — dá para trocar)

| Pergunta | Escolha atual |
| --- | --- |
| Pixel art ou cartoon? | Cartoon |
| Em pé ou deitado? | Em pé (pensado para celular) |
| Ranking online ou recorde local? | Recorde local (localStorage) |
| Nome | Jatinho do Flávio |
