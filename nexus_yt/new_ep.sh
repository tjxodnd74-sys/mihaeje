#!/bin/bash
# usage: bash new_ep.sh /home/claude/work/<slug>
set -e; R=$(cd "$(dirname "$0")" && pwd); D=$1; mkdir -p "$D"/ln "$D"/ln2 "$D"/img "$D"/site "$D"/th
cp "$R"/engine/* "$D"/; cp "$R"/engine/template.html "$D"/ep.html
ln -sfn "$R"/assets/fonts "$D"/fonts; ln -sfn "$R"/assets/sfx "$D"/sfx; cp "$R"/assets/music.mp3 "$D"/
cp "$R"/assets/probe.png "$D"/img/; cp "$R"/thumb/* "$D"/th/; ln -sfn "$R"/assets/fonts "$D"/th/../fonts 2>/dev/null || true
echo "ready: $D  (outro wavs: $R/assets/outro/outro1.wav, outro2.wav)"
