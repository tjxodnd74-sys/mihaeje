// 앱 이름·id·버전·배경색은 app-info.json 한 곳에서 바꾼다 (안드로이드 gradle 도 같은 파일을 읽는다)
const info = require('./app-info.json');

/** @type {import('@capacitor/cli').CapacitorConfig} */
module.exports = {
  appId: info.appId,
  appName: info.appName,
  // scripts/copy-web.mjs 가 ../mystery-site/dist/client 를 여기로 복사한다
  webDir: 'www',
  backgroundColor: info.backgroundColor,
  // 앱 안 주소는 https://localhost/ (같은 출처라 localStorage 저장이 앱을 껐다 켜도 남는다)
  server: { androidScheme: 'https' },
  // 웹에서 앱인지 알 수 있게: navigator.userAgent 에 'MihaejeApp/버전' 이 붙는다
  appendUserAgent: `MihaejeApp/${info.versionName}`,
  android: {
    // 웹 디버깅(chrome://inspect)은 기본값대로 디버그 APK 에서만 켜진다
    allowMixedContent: false,
  },
  plugins: {
    // 상태바·내비게이션바: 바 영역은 MainActivity 가 직접 비워 두고(웹이 바 밑으로 들어가지 않게)
    // 아이콘 색만 밝게(어두운 배경용)
    SystemBars: { insetsHandling: 'disable', style: 'DARK' },
  },
};
