# Equilíbrio (robô de teste)

Um robô joga cada parada acelerado (só em desenvolvimento): mira a passagem do próximo obstáculo e
**não desvia de ataques de propósito**. Mede quantas vezes cada coisa acerta o jatinho.

```bash
npm run dev
node tools/balance.cjs 400 3   # segundos por parada, repetições
```

Ganchos usados: `jogar.html?bot&pontos=N`, `window.__play()`, `window.__fast(segundos)` e
`window.__balance()` (só existem no `npm run dev`).

## O que mudou depois da medição

| Origem | Antes (acertos por lançamento) | Depois | Ajuste |
| --- | :-: | :-: | --- |
| Erika Hilton | 83% (Miami) / 38% geral | ~28% | 1 papel em vez de 2, mais lento, zigue-zague menor |
| Kim (thread) | 47–61% | ~30% | 3 balões em vez de 4, aviso maior |
| Lindbergh | 57–75% | ~50% (amostra pequena) | 3 papéis em vez de 4, mais lentos |
| Boulos | 50% | ~35% | 2 barracas em vez de 3 |
| Dino | 44% | ~36% | mira mais suave, mais lento |
| Chefe de Miami | 62% | ~40% | faixas de alerta mais finas, ataques a cada 1 s |
| Helicóptero de lona / Aerolula | 46–50% | ~40% | soltam menos coisas |
| Greve geral | 1,4 batida por evento | ~0,6 | menos bandeiras, menores, vento mais fraco |
| Carimbos (Gonet e chefe) | 50% | ~50% | área menor e aviso maior (o robô não desvia; com as setas dá para fugir) |

Os obstáculos ficaram parecidos entre si dentro de cada tipo (os "de cima e de baixo" batem
igual em todas as paradas), então não precisaram de ajuste.
