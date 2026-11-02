#!/usr/bin/env bash
# Recorta um trecho de áudio/vídeo e salva como fala do jogo (mono, volume normalizado, mp3 leve).
# Uso: bash tools/cortar-fala.sh <arquivo-original> <início> <fim> <id>
# Ex.: bash tools/cortar-fala.sh discurso.mp4 00:12:03.4 00:12:06.9 lula-companheiro
set -euo pipefail
if [ "$#" -ne 4 ]; then
  echo "Uso: bash tools/cortar-fala.sh <arquivo> <início> <fim> <id>" >&2
  exit 1
fi
in="$1"; start="$2"; end="$3"; id="$4"
out="public/falas/${id}.mp3"
mkdir -p public/falas
ffmpeg -loglevel error -y -ss "$start" -to "$end" -i "$in" -vn -ac 1 -ar 32000 \
  -af "highpass=f=80,loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:d=0.04,areverse,afade=t=in:d=0.08,areverse" \
  -b:a 64k "$out"
echo "Salvo em $out — agora adicione a fala em src/audio/voices.ts (VOICE_LINES) com texto e fonte."
