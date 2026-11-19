#!/bin/bash
# 사용: bash reels/fault/setup.sh  → /home/claude/ff/web 준비 (three, Kenney GLB, 폰트, fault.html)
set -e
R=/home/claude/mihaeje/reels
mkdir -p /home/claude/ff/web && cd /home/claude/ff
[ -d node_modules/three ] || (npm init -y >/dev/null && npm i three@0.170.0 --silent)
rm -rf web/three web/glb; cp -r node_modules/three web/three; cp -r $R/fault/glb web/glb
cp $R/pipeline/fonts/*.woff2 web/; cp $R/fault/*.html web/; cp $R/fault/render.js $R/fault/mix.py /home/claude/ff/
echo ready
