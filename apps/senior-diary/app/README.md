# 하루담 (Harudam) — 앱

시니어 하루 한 질문 자서전. RN + Expo(SDK 57, managed) + Expo Router + TypeScript.
이번 슬라이스: **부모 핵심 루프 P1(오늘) ↔ P2(녹음)**, 디자인 토큰 기반, 목 데이터.

> 이 디렉터리(`apps/senior-diary/app/`)만 클라이언트 코드다. 설계 원본은 상위
> `design/`·`docs/`(읽기 전용). 토큰·화면 명세가 어긋나면 그 문서가 이긴다.

---

## 무엇이 들어 있나

| 화면 | 코드 | 상태 |
|---|---|---|
| P1 오늘(홈) | `src/app/index.tsx` | ✅ 구현 — 날짜·순번, 응원 배너, 질문(세리프 28pt+), 원형 녹음 버튼, 스킵(I8), 지난 이야기 링크, 답변완료/휴식 상태 |
| P2 녹음(오버레이) | `src/app/record.tsx` | ✅ 구현 — 질문 유지, 숨쉬는 원(reduced-motion 존중), 경과 시간만, "다 했어요" → 종료(밤사이 정리) |
| P3 지난 이야기 | `src/app/archive.tsx` | 🔲 stub("준비 중") |
| 자녀 세계 C1~C6 | `src/app/child/` | 🔲 stub("준비 중") |

핵심 흐름: P1에서 녹음 버튼 → P2 진입(녹음 시작) → "다 했어요" → 종료 화면 →
"오늘은 여기까지" → P1로 복귀하며 **"밤사이 정리"** 상태로 전환. 스킵은 같은 화면에서
대체 질문으로 치환(하루 1회), 재스킵 시 휴식 상태.

### 구조

```
app.config.ts        앱 이름/식별자/권한/runtimeVersion/scheme (주석에 근거)
eas.json             development·preview·production 프로파일 (구조만 — 빌드 실행 안 함)
babel.config.js      babel-preset-expo (reanimated 플러그인 없음 — 아래 결정 참고)
src/
  app/               Expo Router 파일 기반 라우트(P1·P2·P3·child stub)
  theme/             디자인 토큰 (colors·tokens·typography·fonts·ThemeProvider)
  components/        ScreenContainer·PrimaryButton·RecordButton·StoryCard·CheerBanner·AppText·MicGlyph·StubScreen
  data/mock.ts       목 데이터(질문·응원·가족). // TODO(BE) 지점
  features/recording/useRecorder.ts   expo-audio + 권한거부·미지원 시 목 녹음 폴백
  state/DiaryContext.tsx              P1↔P2 공유 상태(로컬)
```

디자인 토큰 원본은 `../design/DESIGN_SYSTEM.md`(라이트) + `../docs/BRAND.md §4-1`(다크).
화면에서 하드코딩 색 금지 — `useTheme().colors` / `AppText token=...`로만 접근.

---

## 로컬 셋업 · 실행

```bash
cd apps/senior-diary/app
npm install                 # 의존성 설치
npx expo start              # 개발 서버 (Expo Go 또는 dev build로 열기)
# 플랫폼 지정: npx expo start --ios / --android / --web
```

> ⚠️ 실제 마이크 녹음(expo-audio)은 **네이티브 모듈**이라 Expo Go에서 제한될 수 있고,
> 권한·녹음 동작은 **실기기(dev build)에서만** 완전 검증된다. 미지원/권한거부 환경에서는
> 자동으로 목 녹음(타이머만)으로 폴백하므로 흐름 자체는 어디서든 확인 가능하다.

### 검증 게이트 (종료코드로 판정)

```bash
npm run typecheck           # tsc --noEmit — 종료코드 0
npx expo export --platform ios --platform android   # 네이티브 번들 — 종료코드 0
npx expo export --platform web                      # 웹 정적 번들 — 종료코드 0
```

---

## EAS 빌드 절차 (구조만 준비됨 — 실행은 RM/PO 승인 영역)

이 저장소에는 `eas.json`만 있고 **빌드는 실행하지 않았다**(네이티브 빌드는 비가역·예산).
실제 빌드가 필요할 때(RM 협의 후):

```bash
npm i -g eas-cli
eas login
eas init                    # EAS project id 발급 → app.config.ts extra.eas.projectId 채움
eas build --profile development --platform ios      # dev client (시뮬레이터/기기)
eas build --profile preview --platform android      # 내부 배포용 apk
# 스토어 제출은 별도 승인:
# eas submit --profile production
```

빌드 전 확정 필요(현재 자리표시자):
- `app.config.ts`의 `IOS_BUNDLE_ID` / `ANDROID_PACKAGE` — 스토어 앱 ID(한 번 정하면 고정).
- 상표 "하루담" 가칭→정식 승격(GROWTH 게이트) 후 실제 아이콘·스플래시(BRAND §4-3).

---

## 배포 경로 판정 (OTA vs 네이티브 빌드) — APP 역할 산출물

**이번 슬라이스의 첫 배포는 네이티브 빌드가 필요하다(OTA 불가).** 이유:
- 네이티브 모듈을 추가했다: `expo-audio`(마이크), `expo-font`, `expo-splash-screen`,
  `expo-router`/`react-native-screens`/`safe-area-context`(네이티브 뷰).
- `scheme`(`harudam`)·마이크 권한 문구는 **네이티브에 박히는 값** — OTA로 못 바꾼다.

빌드 이후의 변경 경로:
- 화면 로직·문구·목 데이터·**네이티브에 안 박히는** 토큰 값 변경 → JS-only → **OTA 가능**
  (단 `expo-updates` 도입 후. 현재 미도입 — 아래 미검증 참고).
- 새 네이티브 모듈/권한 추가, scheme·권한 문구 변경, 앱 아이콘 → **새 빌드 필요.**
- `runtimeVersion`은 `appVersion` 정책(최상위 하나, 플랫폼별 오버라이드 없음).
  네이티브 모듈을 바꾸면 `app.config.ts`의 `version`을 올려야 옛 빌드가 새 모듈을
  require하는 JS를 OTA로 받지 않는다(하네스 규칙).

---

## 무엇을 실제로 검증했나 / 무엇은 미검증인가

**검증됨 (이 컨테이너, 종료코드):**
- `tsc --noEmit` 종료코드 **0**.
- `expo export` ios·android·web 세 플랫폼 모두 종료코드 **0** (번들 성공).

**미검증 (실기기·런타임 필요 — 정직히 표기):**
- 실제 마이크 캡처·파일 저장·장시간(1~3분) 녹음, 원음 재생 — expo-audio 네이티브 동작.
  코드는 넣었고 폴백(목 녹음)은 명확히 했으나 **실기기에서만 확인 가능**.
- 한글 명조 렌더: Source Serif 4에 한글 글리프가 없어 한글 질문은 시스템 세리프로
  글리프 단위 폴백된다. iOS는 매끄럽지만 **Android 기기별 편차는 실기기 확인 대상**.
- 다크 모드 실제 대비, iPad 전폭 레이아웃, reduced-motion 동작 — 코드상 대응했으나
  실기기/시뮬레이터 육안 확인은 미실시.
- OTA: `expo-updates` **미도입** — OTA 채널은 아직 없다(빌드 전용). 도입 시
  `runtimeVersion` appVersion 정책은 `app.config.ts`에 이미 준비돼 있다.

---

## 이번 슬라이스에서의 결정(태스크 지시와의 차이 — 근거)

1. **expo-av → expo-audio.** 태스크는 expo-av를 지목했으나 SDK 57은 오디오를
   `expo-audio`로 제공한다(expo-av의 Audio는 대체됨). 학습 시점 기억이 아니라 설치된
   SDK의 실제 API를 확인해 `expo-audio`로 구현했다(하네스: 버전별 실제 문서/모듈 우선).
2. **react-native-reanimated 제거 → RN 내장 Animated.** 숨쉬는 원 애니메이션에
   reanimated 4는 `react-native-worklets` + babel 플러그인이라는 네이티브/빌드 표면을
   더한다. 내장 Animated로 충분하고 reduced-motion도 존중하므로 네이티브 표면을 줄였다.
3. **폰트: Source Serif 4만 번들, Noto Sans KR/한국어 명조는 번들 안 함.**
   하네스 규칙(대용량 폰트 번들 금지). UI 한글은 시스템 폰트가 완벽 렌더, 명조 한글은
   시스템 세리프 폴백. 정본 한국어 명조는 온디맨드 다운로드로 후속(BRAND/PD).
4. **웹 타깃용 추가 의존성**: `react-dom`·`react-native-web`·`@expo/metro-runtime`
   (web export용), `babel-preset-expo`를 top-level devDependency로 명시(스캐폴드 과정에서
   nested 되어 babel이 못 찾던 것 해소). 전부 SDK 57 정합 버전으로 핀.

## 남은 TODO

- `// TODO(BE)`: 질문 시퀀스·답변 상태(밤사이 정리)·응원 수신 — 서버 계약 필요.
- `// TODO(BRAND §4-3)`: 앱 아이콘·스플래시 실제 시안(현재 템플릿 자리표시자).
- P3·자녀 C1~C6 실제 구현(현재 stub).
- `expo-updates` 도입 시 OTA 채널·runtimeVersion 정책 연결.
