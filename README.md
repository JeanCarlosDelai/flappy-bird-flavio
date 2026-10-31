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

## Controles

Toque na tela, clique, Espaço, ↑ ou W para voar. Esc, P ou o botão ⏸ pausam e mostram o mapa.

## Publicação

O workflow `.github/workflows/pages.yml` gera o build e publica no GitHub Pages a cada push.
Uma vez só: em **Settings → Pages → Build and deployment → Source**, escolha **GitHub Actions**.
O jogo fica em https://jeancarlosdelai.github.io/flappy-bird-flavio/
