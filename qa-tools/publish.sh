#!/usr/bin/env bash
# 빌드 → 소스(main) 와 사이트(gh-pages) 를 GitHub에 올립니다.
# 사용: qa-tools/publish.sh "커밋 메시지"
set -euo pipefail
MSG="${1:-update}"
SRC=/home/claude/mihaeje-src
REPO=/home/claude/mihaeje          # main 체크아웃
PAGES=/home/claude/mihaeje-pages   # gh-pages 워크트리
TRAILER="Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01EmFjZY1gpVcrfc1exiuVhy"

cd "$SRC/mystery-site" && npm run build >/dev/null

# 1) 소스
cd "$REPO"
rm -rf mystery-site qa-tools qa handoff
mkdir -p mystery-site qa handoff
(cd "$SRC/mystery-site" && tar --exclude=./dist --exclude=./node_modules --exclude=./.git -cf - .) | (cd mystery-site && tar -xf -)
cp -r "$SRC/qa-tools" . && cp "$SRC"/qa/*.txt "$SRC"/qa/*.log qa/ 2>/dev/null || true
cp "$SRC"/*.txt handoff/ 2>/dev/null || true
git add -A
git diff --cached --quiet || git commit -qm "$MSG

$TRAILER"
git fetch -q origin main && git push -q origin main

# 2) 사이트
cd "$PAGES"
find . -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -r "$SRC/mystery-site/dist/client/." . && touch .nojekyll
git add -A
git diff --cached --quiet || git commit -qm "사이트: $MSG

$TRAILER"
git fetch -q origin gh-pages && git push -q origin gh-pages
echo "published: https://tjxodnd74-sys.github.io/mihaeje/"
