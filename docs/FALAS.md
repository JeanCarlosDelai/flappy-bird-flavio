# Falas reais dos personagens

O jogo toca **trechos curtos de falas reais** (discursos, entrevistas e sessões públicas) quando um
perseguidor pega o Flávio, e uma fala do Flávio na fuga completa. Na tela aparecem a **legenda** e a
**fonte**. Dá para desligar em Mais → Ajustes → "Falas reais dos personagens".

## Regras

- Só o que a pessoa **realmente disse**, sem cortar de um jeito que mude o sentido.
- Fontes oficiais ou com licença de reuso, **sempre com crédito**:
  - **Radioagência Nacional / Agência Brasil (EBC)** e canais do **Planalto** (falas do Lula);
  - **Rádio Senado / TV Senado / Agência Senado** (falas do Flávio e de senadores);
  - **Rádio Câmara / TV Câmara** (deputados).
  Confira a licença na página de cada áudio antes de usar.
- Nada de voz imitada ou gerada por IA.
- Trechos curtos (1 a 4 segundos).

## Como adicionar uma fala

1. Baixe o áudio/vídeo original da fonte oficial.
2. Recorte o trecho:
   ```bash
   bash tools/cortar-fala.sh original.mp4 00:12:03.4 00:12:06.9 lula-exemplo
   ```
   (sai em `public/falas/lula-exemplo.mp3`, mono, volume normalizado.)
3. Adicione em `src/audio/voices.ts` (`VOICE_LINES`):
   ```ts
   {
     id: 'lula-exemplo',
     who: 'lula',            // ou 'flavio', 'xandao', 'kim'…
     when: 'captura',        // 'fuga' para o Flávio na chegada a Miami
     text: 'transcrição exata do trecho',
     source: 'Radioagência Nacional (EBC), 12/03/2026',
     sourceUrl: 'https://...',            // página da fonte (ou transcrição oficial)
     originalUrl: 'https://...&t=73s',    // trecho original, já no minuto certo
     at: '1:13–1:16',                     // onde no original
     context: 'sobre o que a pessoa falava'
   }
   ```
4. Atualize a tabela de `docs/FALAS-CATALOGO.md` (fala, quem, quando aciona, link do original, contexto).
5. `npm test` confere arquivo, texto, fonte, link do original, trecho e contexto.

## Lista para escolher (preencha com os links)

| Quem | Quando toca | Frase desejada | Link da fonte | Início–fim |
| --- | --- | --- | --- | --- |
| Lula | captura | | | |
| Flávio | fuga | | | |
