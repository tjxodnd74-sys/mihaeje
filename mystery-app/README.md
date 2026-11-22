# 미해제 안드로이드 앱

웹 게임(mystery-site)을 그대로 앱 안에 넣은 안드로이드 앱입니다

- 게임 파일이 앱 안에 들어 있어서 **인터넷 없이도 실행**돼요 (의견 보내기·바깥 링크만 인터넷 사용)
- 웹을 고치면 앱은 **앱 업데이트**로 바뀌어요 (main 에 올리면 GitHub 가 새 앱 파일을 자동으로 만들어 줌)
- 앱 진행 저장은 앱 안에만 남아요 (웹 사이트에서 하던 진행과 이어지지 않음)

---

## 사용자가 할 일 (순서대로)

### 1. 테스트 앱 휴대폰에 깔아 보기 (무료, 지금 바로)

1. GitHub 저장소 → 위쪽 **Actions** 탭 → 왼쪽 **Android app**
   - 아직 한 번도 안 돌았으면 오른쪽 **Run workflow** 버튼으로 돌리기 (10분 안팎)
2. 맨 위 초록 체크 실행을 누르고 → 아래 **Artifacts** 의 `mihaeje-debug-apk` 받기
3. 받은 zip 을 풀면 `app-debug.apk` 가 나와요 → 휴대폰으로 옮기기 (카톡 나에게 보내기, 구글 드라이브 등)
4. 휴대폰에서 apk 누르기 → "출처를 알 수 없는 앱 설치" 허용 → 설치
   - 테스트용이라 플레이 프로텍트가 경고할 수 있어요 → "무시하고 설치"

확인해 볼 것: 뒤로 버튼(창이 닫히는지), 가로로 돌리기, 비행기 모드에서 켜지는지, 플레이 중 화면이 안 꺼지는지

### 2. 구글 플레이 개발자 계정 만들기

1. https://play.google.com/console 에서 가입 (등록비 25달러, 한 번만)
2. 계정 종류 고르기
   - **개인**: 바로 가능 · 대신 처음 출시 전에 테스터 12명이 14일 동안 비공개 테스트를 해야 해요
   - **조직(넥서스 사업자)**: D-U-N-S 번호(무료 신청, 몇 주 걸림)가 필요 · 테스터 12명 조건 없음
3. 신분증·전화번호 확인까지 끝내기

### 3. 앱 id 정하기 (한 번 올리면 영원히 못 바꿈)

- 지금 임시 값: `kr.nexus.mihaeje` ("넥서스" 상호 기준)
- 바꾸려면 **`mystery-app/app-info.json` 의 `appId` 한 줄만** 고치면 돼요 (앱 이름·버전·바탕색도 여기)
- 플레이 콘솔에 처음 올리기 **전에** 정해 주세요

### 4. 서명 키 만들고 GitHub 에 등록하기 (플레이 스토어에 올리려면 필수)

서명 키 = "이 앱은 내가 만든 것" 도장 파일이에요 · **절대 저장소에 올리지 말고**, 파일과 비밀번호를 안전한 곳(USB, 비밀번호 관리 앱 등)에 따로 보관하세요

**① 키 파일 만들기** (윈도우 · Android Studio 나 자바(JDK)가 깔려 있어야 함)

명령 프롬프트(cmd)를 열고:

```
keytool -genkeypair -v -keystore mihaeje-upload.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000
```

- 비밀번호 두 번, 이름·조직 등 질문이 나와요 (이름 정도만 쓰고 나머지는 엔터로 넘겨도 됨)
- `keytool` 을 못 찾는다고 나오면 Android Studio 안의 것을 쓰세요:
  `"C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe"` 를 `keytool` 자리에

**② 키 파일을 글자로 바꾸기** (PowerShell)

```
[Convert]::ToBase64String([IO.File]::ReadAllBytes("mihaeje-upload.jks")) | Set-Content key-base64.txt
```

**③ GitHub Secrets 에 4개 등록**

저장소 → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| 이름 | 넣을 값 |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | key-base64.txt 안의 글자 전부 |
| `ANDROID_KEYSTORE_PASSWORD` | ①에서 정한 비밀번호 |
| `ANDROID_KEY_ALIAS` | `upload` |
| `ANDROID_KEY_PASSWORD` | ①에서 정한 비밀번호 (따로 안 물었으면 같은 것) |

- 등록하고 나면 key-base64.txt 는 지워도 돼요 (jks 파일은 보관)
- 다음 빌드부터 Artifacts 이름이 `mihaeje-release-aab` (서명됨)으로 나와요 · Secrets 가 없으면 `mihaeje-release-aab-unsigned`

### 5. 플레이 콘솔에 올리기

1. 플레이 콘솔 → **앱 만들기** (이름 미해제, 게임, 무료)
2. **테스트 → 내부 테스트**(또는 비공개 테스트) → 새 버전 만들기 → Artifacts 의 `.aab` 올리기
   - 처음 올릴 때 "Play 앱 서명" 사용에 동의 (키를 잃어버려도 구글에 재설정 요청 가능)
3. 스토어 등록정보에 필요한 그림 (임시로 만들어 둠, `mystery-app/store/`)
   - 앱 아이콘 512×512: `play-icon-512.png`
   - 그래픽 이미지 1024×500: `feature-graphic-1024x500.png`
   - 휴대폰 스크린샷 2장 이상: 앱을 깔고 직접 찍기
4. 콘솔이 묻는 것들
   - 개인정보처리방침 주소 (웹 페이지 하나 필요 — 진행은 기기 안에만 저장, 의견 보내기에 적은 글·연락처는 구글 폼으로 전송)
   - 데이터 보안 양식 · 콘텐츠 등급 설문 · 타깃 연령 · 광고 없음

### 6. 그다음부터 (업데이트)

- 웹(mystery-site/web) 이나 앱(mystery-app) 을 고쳐서 main 에 올리면 → 자동으로 새 APK·AAB 가 만들어져요
- 새 AAB 를 플레이 콘솔에 올리면 업데이트 끝
- 버전 번호(versionCode)는 GitHub 가 알아서 올려요 · 화면에 보이는 버전(versionName, 예: 1.0.1)만 `app-info.json` 에서 바꾸세요

---

## 개발 메모 (Claude·개발자용)

### 구조

- `app-info.json` — 앱 id·이름·버전·바탕색 (capacitor.config.js 와 android/app/build.gradle 이 같이 읽음)
- `capacitor.config.js` — Capacitor 설정
- `scripts/copy-web.mjs` — `../mystery-site/dist/client` → `www/` 복사 (`MIHAEJE_WEB_DIR` 로 바꿀 수 있음)
- `scripts/make-icons.py` — 아이콘·스플래시·스토어 그림 만들기 (PIL)
  - `mystery-site/web/assets/app-icons/icon-foreground.png`(투명 배경 정사각)가 생기면 그걸 쓰고, 없으면 로고의 문 모양으로 임시
- `android/` — 안드로이드 프로젝트 (Capacitor 8) · 앱에서만 하는 일은 `MainActivity.java` 한 곳
- `.github/workflows/android.yml` (저장소 루트) — 빌드

### 앱에서만 하는 일 (웹은 안 건드림)

- **뒤로 버튼** → 웹 history 로 (`WebView.goBack()`) · 웹이 창을 열 때 `history.pushState` 해 두고 `popstate` 에서 닫으면 뒤로 = 창 닫기 · 더 갈 곳이 없으면 앱 종료
- **화면 꺼짐 방지** → `play.html` 에 있을 때만 `FLAG_KEEP_SCREEN_ON` · 10분 동안 손대지 않으면 풀림
  - 웹 Wake Lock API 대신 이렇게 한 이유: 웹을 고치지 않아도 되고, 앱이 뒤로 가면 시스템이 알아서 풀어 줌
- **상태바·내비게이션바** → 웹 화면을 바 안쪽으로 줄이고 바 자리는 `backgroundColor`(#141a22) · 아이콘은 밝게
  - 웹 CSS 에 safe-area 처리가 없어도 바 밑에 글자가 깔리지 않음 (앱 안에서 `env(safe-area-inset-*)` 는 0)
- **가로·세로** 둘 다 (`screenOrientation="fullUser"`, 돌려도 화면을 다시 불러오지 않음)
- **진동** → `VIBRATE` 권한만 넣음 · 웹에서 `navigator.vibrate()` 를 부르면 됨
- **바깥 링크** → 앱 주소(`https://localhost`)가 아닌 링크는 Capacitor 가 바깥 브라우저로 엶
- **앱인지 알기** → `navigator.userAgent` 에 `MihaejeApp/1.0.0` 이 붙음 (예: "이 브라우저에 저장" 문구를 앱에선 "이 기기에"로)

### 로컬에서 빌드하려면

Android SDK 가 있는 곳에서 (Android Studio 설치한 PC 등):

```
cd mystery-site && npm ci && npm run build
cd ../mystery-app && npm ci && npm run sync
cd android && ./gradlew assembleDebug        # 윈도우는 gradlew.bat assembleDebug
```

결과: `android/app/build/outputs/apk/debug/app-debug.apk` · Android Studio 로 열려면 `npx cap open android`
