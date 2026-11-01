# Jatinho do Flávio

Jogo de "toque para voar" em Vite + TypeScript + Canvas 2D. Plano e roadmap em [PLANO.md](PLANO.md).

## Rodar

Precisa do Node.js LTS.

```bash
npm install
npm run dev       # abre em http://localhost:5173
npm run build     # gera o site estático em dist/
npm run preview   # serve o dist/ para testar o build
```

## Páginas

- `/`: landing page (aviso de sátira, como jogar, mapa inicial)
- `/jogar`: o jogo
- `/ranking`: ranking e estatísticas

## Controles

Toque na tela, clique, Espaço, ↑ ou W para voar. Esc, P ou o botão ⏸ pausam e mostram o mapa.

## Ranking (backend)

As funções em `api/` rodam na Vercel e guardam tudo no **Upstash Redis**. Para ligar:
Vercel → projeto → **Storage** → **Create Database** → **Upstash for Redis** (plano Free) →
conectar ao projeto `jatinho-do-flavio`. A integração cria `KV_REST_API_URL` e
`KV_REST_API_TOKEN`; depois é só publicar de novo.

No `npm run dev` / `npm run preview` a API roda dentro do Vite com um banco em memória
(zera ao reiniciar), para testar sem configurar nada.

```bash
npx vitest run server   # testes do servidor
```

## Publicação

O workflow `.github/workflows/pages.yml` gera o build e publica no GitHub Pages a cada push.
Uma vez só: em **Settings → Pages → Build and deployment → Source**, escolha **GitHub Actions**.
O jogo fica em https://jeancarlosdelai.github.io/flappy-bird-flavio/

## App no celular (PWA)

O site instala na tela de início (botão **📲 Instalar**) e funciona offline. O service worker é gerado no
`npm run build` (`server/pwa-plugin.ts`) e só é registrado no site publicado. Ícones: `public/icons/`
(gerar de novo com `npm run dev` + `node tools/capture-icons.cjs`).
