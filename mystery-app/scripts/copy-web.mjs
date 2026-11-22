// mystery-site 빌드 결과(dist/client)를 앱에 넣을 www/ 로 복사한다
// 웹 쪽은 고치지 않는다 — 앱에서만 필요한 일은 MainActivity(안드로이드)에서 한다
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(here, '..');
const src = path.resolve(appDir, process.env.MIHAEJE_WEB_DIR || '../mystery-site/dist/client');
const out = path.join(appDir, 'www');

// 앱에는 필요 없는 것 (운영자용 의견 관리 화면은 서버 /api 가 있어야 돌아간다)
const SKIP = new Set(['feedback-admin.js']);

if (!fs.existsSync(path.join(src, 'index.html'))) {
  console.error(`웹 빌드 결과가 없습니다: ${src}\n먼저 mystery-site 폴더에서 npm run build 를 하세요`);
  process.exit(1);
}

fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(src, out, {
  recursive: true,
  filter: (p) => {
    const name = path.basename(p);
    return !SKIP.has(name) && name !== '.DS_Store';
  },
});

let files = 0, bytes = 0;
for (const f of fs.readdirSync(out, { recursive: true })) {
  const st = fs.statSync(path.join(out, f));
  if (st.isFile()) { files++; bytes += st.size; }
}
console.log(`www/ 준비 완료: 파일 ${files}개, ${(bytes / 1048576).toFixed(1)}MB (${path.relative(appDir, src)})`);
