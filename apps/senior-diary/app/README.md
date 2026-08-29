# 하루담 (Harudam) — 앱

시니어 하루 한 질문 자서전. RN + Expo(SDK 57, managed) + Expo Router + TypeScript.
**서버 없이 폰 한 대에서 전체 플로우가 실동작하는 체험형 MVP.** 모든 화면이 라우트로
렌더되고, 데이터는 **local-first**(온디바이스 영속화)로 흐른다 — 부모가 녹음하면 저장되고,
모의 STT가 텍스트로 정리하고, 자녀가 읽고 응원하면 부모 화면에 반영된다. 나중에 실서버
(Firebase)를 **같은 인터페이스로** 끼울 수 있게 설계했다(`docs/BE_CONTRACT.md`).

> 이 디렉터리(`apps/senior-diary/app/`)만 클라이언트 코드다. 설계 원본은 상위
> `design/`·`docs/`(읽기 전용). 토큰·화면 명세가 어긋나면 그 문서가 이긴다.

---

## 화면 (전부 구현됨)

| 코드 | 이름 | 라우트 | 레퍼런스 |
|---|---|---|---|
| — | 둘러보기(점검용 인덱스) | `/` | 개발/점검 전용 |
| G1 | 랜딩·사전예약 | `/landing` | PRD §9-2 |
| P0 | 초대 진입 (부모) | `/parent/invite` | §9-4 P0 |
| P1 | 오늘 (부모 홈) ★ | `/parent/today` | stitch/P1-today |
| P2 | 녹음 오버레이 (부모) ★ | `/parent/record` | stitch/P2-record |
| P3 | 지난 이야기 (부모) | `/parent/archive` | stitch/P3-archive |
| C1 | 신청·프로필 (자녀, 2단계) | `/child/profile` | stitch/C1-profile |
| C2 | 초대 보내기·대기 (자녀) | `/child/invite-wait` | §9-4 C2 |
| C3 | 홈 (자녀) | `/child/home` | §9-4 C3 |
| C4 | 이야기 읽기·응원 (자녀) ★ | `/child/story` | stitch/C4-read-cheer |
| C5 | 모아보기/서재 (자녀) | `/child/library` | stitch/C5-library |
| C6 | 책 미리보기 (자녀) | `/child/book` | stitch/C6-book-preview |

각 화면은 주요 상태(빈·정리중·성공 등)를 §9 상태 명세대로 최소 반영. 실제 플로우 전이도
연결됨: P1↔P2↔P3, C1→C2→C3↔C4→C5→C6.

### 점검 네비게이션
앱 진입(`/`)은 **둘러보기(점검용)** 인덱스다. IA상 프로덕션 진입은 역할=진입경로
(P0 초대링크 / C1 신청)라 역할선택 화면이 없지만, 폰에서 모든 화면을 둘러볼 수 있도록
점검용 인덱스를 뒀다. **이 화면은 개발/점검 전용이며 프로덕션 진입 흐름과 별개**임을
화면에 명시("점검용 화면 · 프로덕션 진입 흐름과 별개").

---

## 데이터·BE (local-first) — 서버 없이 도는 루프

전체 계약·실패 모드·멱등 보장·Firebase 이관은 **`docs/BE_CONTRACT.md`**. 요약:

- **도메인 모델** `src/domain/` — IA §4 개체를 타입으로(가족·프로필·질문뱅크·답변·응원·책).
- **저장소 인터페이스** `src/services/repository.ts`(`DiaryRepository`) — 유일한 저장 경계(seam).
  구현 2종: `local/localRepository.ts`(AsyncStorage, 지금) · `firebase/firestoreRepository.ts`
  (**미배선 스텁** — 실 Firebase는 PO 영역). **교체는 `src/services/index.ts` 한 줄.**
- **온디바이스 영속화** `src/services/local/storage.ts` — AsyncStorage(Expo Go 기본 번들 + 웹
  localStorage 폴백). 앱을 껐다 켜도 데이터 유지.
- **파이프라인** `src/services/pipeline/` — 질문 분기 엔진(`branching`, 룰 기반·AI 아님) ·
  모의 STT(`stt`, 질문별 정리본·원음 메타 보존 R7) · 밤사이 정리(`nightly`, 멱등+순서 가드) ·
  책 조립(`book`, 답변→챕터→C6).
- **공유 스토어** `src/state/StoreProvider.tsx` — 부모·자녀 두 세계가 한 기기에서 **같은 로컬
  상태**를 공유한다(점검 인덱스에서 오가면 즉시 반영). 화면은 셀렉터 훅만 소비한다.
- **질문 뱅크 시드** `src/data/seed/` — 32문항·7챕터(실제 시드) + 분기 룰(서울 치환·배우자 챕터
  대체 등) + 모의 STT 정리본.

### 체험 시나리오 (이 순서로 눌러보세요)

앱을 열면 **둘러보기(점검) 인덱스**가 나온다. 여기서 부모/자녀를 자유로이 오간다.

1. **부모: 오늘 이야기 남기기** — `P1 오늘` → 질문("처음 서울에 올라오던 날…") 아래
   **[눌러서 이야기해 주세요]** → `P2 녹음`에서 잠깐 말하고(기기면 실녹음, 아니면 목 타이머)
   **[다 했어요]** → **[오늘은 여기까지]**. P1이 "밤사이 글로 정리해 드릴게요"로 바뀐다.
2. **밤사이 정리 돌리기(데모)** — 녹음 후 **5초 뒤 자동**으로 정리된다. 기다리기 싫으면 인덱스
   맨 아래 **데모 도구 → 🌙 지금 정리하기**를 누른다(수동 트리거).
3. **자녀: 읽고 응원하기** — 인덱스 → `C4 이야기 읽기·응원`. 방금 부모가 남긴 이야기가 정리 전이면
   "🌙 정리 중"(원음만), 정리 후면 **글 + 원음**으로 보인다. 하트 칩/한마디 → **[↑ 보내기]**.
4. **부모: 응원 확인** — `P1 오늘` 상단에 자녀가 방금 보낸 **응원 배너(💛)**가 떠 있다. 루프 완성.
5. **쌓임 보기** — 자녀 `C5 모아보기`(진행감 "N번째 / 365") → **[책으로 미리보기]** → `C6`
   (표지·목차=챕터·펼침면). 분기 체험: `C1 신청·프로필`에서 고향에 "서울"을 넣고 초대장을 만들면
   P1 오늘의 질문이 "어릴 적 살던 동네"로 치환된다(룰 분기).

### 데이터 초기화

점검 인덱스 → **데모 도구 → ↺ 데이터 초기화**. 저장소를 비우고 시드("이미 살아온 며칠")로
되돌린다. 코드로는 `repository.clearAll()` → `buildSeed()`.

### local ↔ Firebase 교체 지점

`src/services/index.ts` 한 줄만 바꾼다:

```ts
// 지금 (local-first)
export const repository: DiaryRepository = new LocalRepository();
// 이관 시 (PO가 Firebase 프로비저닝 후)
export const repository: DiaryRepository = new FirestoreRepository({ projectId: '...' });
```

화면·스토어는 `DiaryRepository`에만 의존하므로 이 파일 외에는 손대지 않는다. 서버 구현이 지킬
BE 규칙(멱등·순서 가드·orderBy·익명 인증 스위치 등)은 `firestoreRepository.ts` 헤더와
`docs/BE_CONTRACT.md` §6에 박아뒀다.

### 무엇을 검증했나 (BE 로직)

- `tsc --noEmit` 0 · `expo export` ios·android·web 3플랫폼 0(AsyncStorage 번들 확인).
- 순수 파이프라인 헤드리스 실행 **22/22 pass**: 분기 치환·챕터 대체·스킵 대체 · 밤사이 정리
  **멱등**(2회 실행 결과 동일, 2번째 `nightly.run outcome:noop`) · 책 조립(사별 시 배우자 장
  대체명) · 진행감 투영.
- **미검증(실기기·런타임)**: AsyncStorage 실영속·앱 재실행 유지 · 자동 정리 타이머(5s) 실동작 ·
  실마이크 캡처/원음 재생. 이들은 기기/dev-build에서만 확인된다 — 분리 보고.

---

## 브랜드 에셋 (로고·아이콘·스플래시)

- **로고(인앱)**: `src/components/Logo.tsx` — 고운바탕(명조) 워드마크 "하루담"(BRAND §4-2,
  산스 로고 금지). 크기·색 토큰화.
- **앱 아이콘·스플래시**: `assets/{icon,splash-icon,favicon,android-icon-foreground}.png`를
  **브랜드 심볼로 교체**했다 — BRAND §4-3 주 방향 "담기고 쌓이는 하루"(열린 그릇 + 켜켜이
  쌓인 획 + 위의 해). 이미지 변환 툴이 이 환경에 없어 `scripts/gen-brand-assets.cjs`
  (순수 Node, zlib PNG 인코더 + 슈퍼샘플링 AA)로 직접 생성했다 — 지어낸 게 아니라 문서화된
  심볼 방향을 그린 것. 크림 배경 `#fff8f3` + 먹 그릇 + 놀 해.
  재생성: `node scripts/gen-brand-assets.cjs`.
- **네이티브 스플래시**: expo-splash-screen 플러그인, 크림 배경 + 중앙 심볼(위 splash-icon).
- ⚠️ **정밀 아트는 BRAND 후속**: 위 심볼은 개발 단계 온브랜드 자산이다. 최종 아이콘/키비주얼
  실제 시안은 BRAND가 확정(§4-3, 대외 발행 전 PO 승인).

---

## 폰트 (BRAND §4-2 정본 서체)

- **이야기의 목소리(serif) = 고운바탕(Gowun Batang)** — 질문·이야기·로고·책.
- **손잡이(sans) = Noto Sans KR** — 버튼·내비·상태·자녀 UI.
- 로딩은 `expo-font` `useFonts`, 준비 전 네이티브 스플래시 유지. 실패해도 시스템 폴백으로 계속.
- 타이포 토큰(`src/theme/tokens.ts`)의 serif/sans role이 이 실폰트로 연결됨(`src/theme/fonts.ts`).

### ⚖️ 번들 용량 — 정직한 수치 + off-switch (하네스 규칙: 대용량 폰트 경계)
번들한 4종 페이스의 export 자산 크기(측정치):

| 서체 | 파일 |
|---|---|
| Gowun Batang 400 | 8.1MB |
| Gowun Batang 700 | 7.9MB |
| Noto Sans KR 400 | 6.0MB |
| Noto Sans KR 700 | 5.9MB |
| **합계** | **≈28MB** |

- 지시된 5종(sans 400/500/700)에서 **sans 500(Medium)을 뺐다**(500→400 매핑, -6MB).
- **하네스 규칙("폰트 대용량 번들 금지")과의 긴장**: 28MB는 시니어 셀룰러 다운로드에 부담.
  코디네이터의 명시 지시(정본 서체 번들, serif가 1순위 정서 자산)에 따라 번들했고, 수치를
  정직히 노출한다. **되돌릴 수 있는 off-switch:**
  1. Noto Sans KR 제거 → UI를 시스템 한글 산스로(iOS Apple SD Gothic Neo / Android Noto CJK,
     한글 렌더 우수) = **약 12MB 절감**. `src/theme/fonts.ts`에서 Noto 로드 제거 + resolver의
     sans를 `undefined`(시스템)로 되돌리면 됨.
  2. Gowun Batang 700 제거(제목도 400) = 약 8MB 절감(제목 볼드 상실 — 비권장).
  3. 온디맨드 다운로드(`Font.loadAsync` 원격 uri) = 앱 다운로드에서 폰트 분리(오프라인·CSP 고려).
- serif(고운바탕)는 앱 정서의 핵심이라 유지가 기본값.

---

## 로컬 셋업 · 실행

```bash
cd apps/senior-diary/app
npm install
npx expo start            # Expo Go 또는 dev build로 열기 (--ios / --android / --web)
```
앱을 열면 둘러보기(점검용) 인덱스가 나오고, 거기서 모든 화면으로 이동할 수 있다.

> ⚠️ 실제 마이크 녹음(expo-audio)은 네이티브 모듈이라 Expo Go에서 제한될 수 있고,
> 권한·녹음은 **실기기(dev build)에서만** 완전 검증된다. 미지원/권한거부 시 목 녹음(타이머만)
> 폴백이라 흐름 자체는 어디서든 확인 가능.

### 검증 게이트 (종료코드로 판정)
```bash
npm run typecheck                                    # tsc --noEmit — 0
npx expo export --platform ios --platform android    # 네이티브 번들 — 0
npx expo export --platform web                        # 웹 정적 번들 — 0
```

---

## EAS 빌드 절차 (구조만 — 실행은 RM/PO 승인 영역)

`eas.json`에 development·preview·production 프로파일. **빌드는 실행하지 않았다**(비가역·예산).

```bash
npm i -g eas-cli && eas login && eas init   # projectId → app.config.ts extra
eas build --profile development --platform ios
eas build --profile preview --platform android
# 제출은 별도 승인: eas submit --profile production
```
빌드 전 확정 필요: `app.config.ts`의 `IOS_BUNDLE_ID`/`ANDROID_PACKAGE`(자리표시자),
상표 "하루담" 정식 승격(GROWTH 게이트).

---

## 배포 경로 판정 (OTA vs 네이티브 빌드) — APP 역할 산출물

**첫 배포는 네이티브 빌드 필요(OTA 불가).** 네이티브 모듈(expo-audio·expo-font·
expo-splash-screen·router/screens/safe-area)과 `scheme`·마이크 권한 문구는 네이티브에 박힌다.
빌드 이후: 화면 로직·문구·목 데이터 변경은 JS-only → OTA 가능(`expo-updates` 도입 후).
새 네이티브 모듈/권한·scheme·아이콘 변경은 새 빌드. `runtimeVersion`은 `appVersion` 정책
(최상위 하나) — 네이티브 모듈을 바꾸면 `app.config.ts`의 `version`을 올린다(하네스 규칙).

---

## 무엇을 실제로 검증했나 / 무엇은 미검증인가

**검증됨 (이 컨테이너, 종료코드):**
- `tsc --noEmit` 종료코드 **0**.
- `expo export` ios·android·web 3플랫폼 모두 종료코드 **0**.
- 브랜드 아이콘/스플래시 PNG는 유효 PNG로 생성·크기 확인(1024², 96²).

**미검증 (실기기·런타임 필요 — 정직히 표기):**
- **고운바탕 한글 글리프의 실제 표시**·자간·행간 — 코드상 연결됐으나 실기기(dev build) 육안만.
- 실제 마이크 캡처·파일 저장·장시간 녹음·원음 재생 — expo-audio 네이티브 동작.
- 앱 아이콘/스플래시의 실기기 표시(마스킹·해상도) — 시뮬레이터/기기 미확인.
- 다크 모드 실대비, iPad 전폭 레이아웃, reduced-motion, **텍스트 입력 화면(C1·C4·G1)의
  키보드 회피**(하네스 규칙: 플랫폼별 검증 대상 — edge-to-edge Android에서 adjustResize 무효).
- OTA: `expo-updates` 미도입(빌드 전용). runtimeVersion appVersion 정책은 준비됨.

---

## 이번 라운드 결정(지시와의 차이 — 근거)

1. **expo-av → expo-audio** (SDK 57 실제 API). **reanimated 제거 → RN Animated**(네이티브 표면 축소).
2. **폰트 4종만 번들**(지시 5종에서 sans 500 제외, -6MB) + off-switch 문서화(위 참고).
3. **아이콘/스플래시는 실 생성 브랜드 심볼**(BRAND §4-3 방향) — 툴 부재로 순수 Node PNG 인코더 사용.
   정밀 아트는 BRAND 후속으로 명시(지어내지 않음).
4. **점검용 인덱스(`/`)** 추가 — 프로덕션 진입 흐름과 별개임을 화면·코드에 명시.

## 남은 TODO
- ✅ `// TODO(BE)` 해소: 질문 시퀀스·답변 상태(밤사이 정리)·응원 수신·프로필 저장을 local-first로
  구현(`docs/BE_CONTRACT.md`). 실 Firebase 배선은 스텁까지(PO 프로비저닝 대기).
- BRAND: 최종 앱 아이콘·키비주얼 실제 시안(현재 개발 단계 심볼).
- `expo-updates` 도입 시 OTA 채널·runtimeVersion 연결.
- 텍스트 입력 화면 키보드 회피 플랫폼별 검증(dev build).
