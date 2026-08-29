# DESIGN_GUIDE — 하루담(가칭) 디자인 정본

> 작성: PD · 2026-08-29 · 제품명 **하루담**(가칭, DECISIONS #6)
>
> **이 문서는 실구현용 통합 가이드다.** 흩어진 디자인 근거(BRAND §4 · DESIGN_SYSTEM.md ·
> PRD §9 · 실제 코드)를 **하나의 정본**으로 묶는다. 다만 각 항목의 **원본은 따로 있고,
> 이 문서는 파생이다** — 어긋나면 원본이 이긴다:
>
> | 영역 | 원본(이김) | 이 문서의 역할 |
> |---|---|---|
> | 컬러·타이포 원형 | `BRAND.md §4` | 코드 토큰과의 정합 정리 |
> | 라이트 색·타이포 스케일·간격 | `design/DESIGN_SYSTEM.md` front-matter | 코드 반영 확인 |
> | 화면·상태·접근성 수치 | `PRD.md §9` | 컴포넌트가 이를 어떻게 만족하나 |
> | 색·비색 토큰의 코드 진실 | `app/src/theme/*` | 이 파일이 런타임 단일 출처 |
> | 컴포넌트 구현 | `app/src/components/*.tsx` | 카탈로그화(사실대로) |
>
> 근거를 읽은 실제 파일: `app/src/theme/{colors,tokens,typography,fonts,ThemeProvider}.ts` ·
> `app/src/components/*.tsx`(13개) · `app/scripts/gen-brand-assets.cjs` · `app/app.config.ts` ·
> `app/assets/*` · `design/DESIGN_SYSTEM.md` · `docs/BRAND.md §4`.

---

## 1. 디자인 컨셉

### 1-1. 한 줄 — "앱이 아니라 편지, 화면이 아니라 지면"

스타일은 **Tactile Minimalism(촉각적 미니멀리즘)**, 종이의 물성을 은유로 삼는다
(DESIGN_SYSTEM.md · BRAND §4-0). 여는 화면은 앱테크의 대시보드가 아니라 하루치
이야기를 담는 **조용한 그릇**이어야 한다. 정서 목표는 따뜻함·품위·차분함 — 의료
소프트웨어의 차가움도, 복잡한 데이터 관리의 불안도 피한다. 대상은 현대적 디지털
UI에 소외감을 느끼는 시니어(부모 60~75)다.

의미의 결(이름 "하루담"에서): **담다(그릇·켜) + 하루(해·빛) + 쌓임(→책).**

### 1-2. 이 앱이 절대 아닌 것 (안티 무드 — BRAND §4)

- 앱테크의 **다색·네온·채도 경쟁** — 강조색은 화면당 **한 곳**만.
- 배지·스트릭·포인트·랭킹 등 **게임화 압박** — "쌓임"은 켜가 차오르는 진행감으로만.
- 병원/실버케어의 **임상적(clinical) 톤** — 큰 글씨는 쓰되 "노인용"임을 광고하지 않는다.
- 떠 있는 디지털 창(무거운 그림자·모달·팝업) — 깊이는 **톤 레이어**로, 전환은 전체 화면으로.

### 1-3. 세 기둥

| 기둥 | 내용 | 코드에서 |
|---|---|---|
| **종이 은유** | 바탕은 종이, 글은 먹, 카드는 종이 위 종이(그림자 대신 1px 테두리 + 톤) | `StoryCard` tone='flat'/'raised', `colors.outlineVariant` |
| **강조 1점** | 저녁놀 주황은 그 화면에서 가장 중요한 행동 하나에만 | `primaryContainer`를 `PrimaryButton`·`RecordButton`·`ProgressBar`만 사용 |
| **읽는 건 명조, 누르는 건 산스** | 명조=이야기의 목소리(질문·본문·로고·책), 산스=손잡이(버튼·내비·상태) | `type.*.family: 'serif' | 'sans'` |

---

## 2. 아이콘·스플래시

### 2-1. 심볼 — "담기고 쌓이는 하루"(그릇+켜+해)

BRAND §4-3의 **주 방향**을 그대로 구현한다: **열린 그릇(먹)에 하루치 획이 켜켜이
포개지고, 그 위에 작은 해(놀)가 얹힌다** — 담(그릇)+하루(해)+쌓임(켜)이 한 심볼에
들어온다. 강조색 1점 원칙에 따라 **그릇·켜는 먹, 해는 놀(주황) 하나**다.

- 생성 근거·좌표는 코드에 있다: `app/scripts/gen-brand-assets.cjs`의 `symbolAt()` —
  그릇은 하반원 두께 링(중심 0.5/0.46, R=0.30·r=0.205, 위 40% 열림), 켜는 그릇 바닥
  둥근 막대 2겹(y=0.52·0.575), 해는 그릇 입구 위 원(중심 0.5/0.30, r=0.115).
- 합성 우선순위: 해 > 켜 > 그릇. 슈퍼샘플링 4×4로 안티에일리어싱.
- 색상수(코드 상수): 종이 `#fff8f3`(CREAM 배열은 255/248/243) · 먹 `#2a241c` · 놀 `#b4542c`.

### 2-2. 생성물 규격 (실제 산출 — `app/assets/`)

| 파일 | 크기 | 배경 | 심볼 패딩 | 용도 (app.config.ts) |
|---|---|---|---|---|
| `icon.png` | 1024² | 크림 채움 | 0.16 | iOS·공용 앱 아이콘 (`icon`) |
| `android-icon-foreground.png` | 1024² | 투명 | 0.28 | Android 어댑티브 전경 (`android.adaptiveIcon.foregroundImage`) |
| `android-icon-background.png` | 1024² | 크림 단색 | — | Android 어댑티브 배경 (`android.adaptiveIcon.backgroundColor: #FBF7EF`와 정합) |
| `android-icon-monochrome.png` | (assets 존재) | — | — | **IA 관찰: 파일은 있으나 app.config에 미배선** — 테마드 아이콘(Android 13+) 연결은 후속 |
| `splash-icon.png` | 1024² | 투명 | 0.30 | 스플래시 심볼 — `expo-splash-screen` 플러그인이 크림 배경에 얹음 |
| `favicon.png` | 96² | 크림 채움 | 0.14 | 웹 파비콘 (`web.favicon`) |

### 2-3. 스플래시 설정 (app.config.ts)

`expo-splash-screen` 플러그인: `image: splash-icon.png` · `backgroundColor: '#FBF7EF'` ·
`imageWidth: 200`. SDK 57에서 스플래시는 최상위 키가 아니라 이 플러그인으로만 설정한다.

### 2-4. 재생성 방법

```
cd apps/senior-diary/app && node scripts/gen-brand-assets.cjs
# → assets/ 에 6개 PNG 재생성 (icon·android fg/bg·splash·favicon)
```

순수 Node(zlib PNG 인코더)로 픽셀을 직접 합성한다 — 이 환경에 sharp/imagemagick/rsvg가
없어서다. 심볼 형태를 바꾸려면 `symbolAt()`의 정규화 좌표를 수정한다.

### 2-5. 후속 (아트 정교화 — 아직 안 된 것)

- **현재는 코드 생성 기하 도형이다.** app.config.ts에 `TODO(BRAND §4-3)`로 명시됨 —
  "담기고 쌓이는 하루" 심볼의 **정교한 아트 시안은 후속 세션**. BRAND §4-3: 실제 시안은
  후속 제작이고 **대외 유통은 PO 승인 사안**.
- 스플래시 모션("획이 내려앉는 1초" — BRAND §4-3)은 미구현. 구현 시 의미 모션만,
  `reduce-motion` 존중(§9-5).
- monochrome 아이콘 배선(2-2), 예비 방향("파형→글줄")은 주 방향이 상표에서 막힐 때의 대체.

---

## 3. 디자인 시스템

### 3-1. 컬러 토큰 (런타임 원본 = `app/src/theme/colors.ts`)

색은 **화면에서 하드코딩 금지** — `colors.ts`가 단일 출처다. 라이트는
DESIGN_SYSTEM.md front-matter를 그대로 옮겼고, 다크는 BRAND §4-1 4개 아키타입
(종이/먹/놀/흙)을 앵커로 컨테이너 틴트를 파생했다.

**핵심 토큰 (라이트 / 다크):**

| 역할 | 토큰 | 라이트 | 다크 | BRAND 원형 |
|---|---|---|---|---|
| 바탕(종이) | `background`·`surface` | `#fff8f3` | `#211c16` | 종이 |
| 본문(먹) | `onBackground`·`onSurface` | `#201b12` | `#efe8dc` | 먹 (약 13:1 / 12:1) |
| 보조 문장(흙) | `onSurfaceVariant` | `#56423b` | `#a79b89` | 흙 |
| 강조(놀) — 텍스트/외곽 | `primary` | `#943d16` | `#e08a5c` | 놀 |
| 강조(놀) — 채움 | `primaryContainer` | `#b4542c` | `#b4542c` | 놀 (버튼 채움+흰 글자 ≈5:1) |
| 카드(종이 위 종이) | `surfaceContainerLow` | `#fef2e2` | `#2a241c` | — |
| 외곽선 | `outlineVariant` | `#dcc1b7` | `#544944` | — |
| 오류 | `error`·`errorContainer` | `#ba1a1a`·`#ffdad6` | `#ffb4ab`·`#93000a` | 상태색(PD 파생) |

- **강조색 이원화 주의(실제 코드):** `primary`(#943d16, 진한 놀 — 텍스트·로고·외곽)와
  `primaryContainer`(#b4542c, 밝은 놀 — 버튼·녹음·진행 바 **채움**)는 다른 토큰이다.
  버튼 채움에 흰 글자 대비를 확보하려고 채움색은 라이트/다크 동일 `#b4542c`를 유지한다.
- **다크 대비는 파생값이라 재검증 대상**(colors.ts 주석 명시) — 컨테이너 틴트는 종이에서
  단계적으로 밝힌 값이고, PD가 실기기 대비 검증을 아직 안 닫았다.

> **IA 관찰(정합):** 라이트 바탕이 코드는 `#fff8f3`(DESIGN_SYSTEM 원본), BRAND §4-1은
> 종이를 `#FBF7EF`로, 프로토타입도 `#FBF7EF`로 쓴다 — **미세하게 다르다.** colors.ts는
> "DESIGN_SYSTEM이 이긴다"고 선언하므로 코드값(#fff8f3)이 런타임 진실이다. 두 문서의
> 종이값 통일 여부는 BRAND↔PD 정합 항목으로 남긴다(내가 임의로 안 고친다 — 원형은 BRAND 소유).

### 3-2. 타이포 (원본 = `app/src/theme/{tokens,fonts,typography}.ts`)

**서체 (fonts.ts — BRAND §4-2가 지정한 정본):**

| 역할 | 서체 | 번들 웨이트 | 쓰는 곳 |
|---|---|---|---|
| 이야기의 목소리(serif) | **고운바탕 Gowun Batang** | 400·700 | 질문·이야기·로고·책·랜딩 헤드라인 |
| 손잡이(sans) | **Noto Sans KR** | 400·700 | 버튼·내비·상태·자녀 UI |

- **번들 용량 결정(fonts.ts):** serif 400/700(≈16MB) + sans 400/700(≈12MB) = **4종만**.
  지시된 5종에서 **sans 500(Medium)을 뺐다**(500→400 매핑, 34MB→28MB). serif는 정본
  감성의 핵심이라 유지. 더 줄이려면 sans를 시스템 폰트로(≈12MB 절감, off-switch).
- **웨이트 이중적용 방지(typography.ts):** 폰트 로드 시 명명된 웨이트 페이스가 두께를
  담으므로 `fontWeight`를 생략한다(합성 볼드 회피). 폴백일 때만 `fontWeight` 적용.
- **폴백:** serif 미로드 시 시스템 세리프(iOS Georgia/Android serif) — 한글 명조가 시스템에
  없을 수 있어서다. **⚠️ 미검증:** 고운바탕 한글 글리프의 실제 표시·자간은 실기기(dev
  build)에서만 육안 확인 가능(fonts.ts 주석).

> **주의(문서 vs 코드):** DESIGN_SYSTEM.md는 서체를 "Source Serif 4(고운바탕 대체) /
> Noto Sans"로 적었다 — 그건 **Stitch 시안 생성용 대체 표기**다. **실제 앱 코드는 고운바탕 +
> Noto Sans KR**(fonts.ts)이 정본이다.

**타이포 스케일 (tokens.ts — 색 제외, RN TextStyle은 typography.ts가 환산):**

| 토큰 | 크기 | 행간비 | 웨이트 | 계열 | 용도 |
|---|---|---|---|---|---|
| `headlineLg` | 32 | 1.4 | 600 | serif | 질문(큰 화면)·로고 |
| `headlineLgMobile` | 28 | 1.3 | 600 | serif | 질문(모바일) — §9-5 부모 질문 ≥28pt |
| `storyBody` | 22 | 1.7 | 400 | serif | 이야기 본문 — §9-5 부모 본문 행간 ≥1.6 |
| `labelLg` | 18 | 1.2 | 700 | sans | 버튼 라벨(일반) |
| `labelMd` | 16 | 1.2 | 500 | sans | 내비·보조 라벨 |
| `helper` | 14 | 1.4 | 400 | sans | 안내·상태 |
| `parentBody` | 20 | 1.6 | 400 | sans | **부모 화면 본문 상향(§9-5 ≥20pt)** |
| `parentButton` | 22 | 1.2 | 700 | sans | **부모 버튼 라벨 상향(§9-5 22pt)** |

부모용 상향 토큰(`parentBody`·`parentButton`)이 별도로 있는 이유: 일반 토큰(16/18pt)은
§9-5의 부모 최소치(본문 20/버튼 22)에 못 미쳐서다 — 부모 화면은 이 두 토큰을 쓴다.

### 3-3. 간격·모서리 (tokens.ts)

| 간격 토큰 | 값 | 근거 |
|---|---|---|
| `pageMargin` | 32 | 좌우 페이지 여백 — 시니어 그립 안전영역 최소 32px(DESIGN_SYSTEM) |
| `gutterBlock` | 24 | 블록 간 간격·카드 패딩 |
| `stack` | 16 | 수직 스택 기본 |
| `tapTargetMin` | **64** | 부모 화면 모든 탭 타깃 최소(§9-5) |
| `tapGapMin` | 16 | 타깃 간 최소 간격(§9-5) |
| `recordDiameter` | **96** | 녹음 버튼 지름 최소(§9-5) |

| 모서리 | 값 |
|---|---|
| `sm`·`base`·`md`·`lg`·`xl`·`full` | 4·8·12·16·24·9999 |

컨테이너·버튼 기본은 `lg`(16). 원은 프로필 사진과 **녹음 버튼**에만(그 외 버튼은
둥근 사각 — 넓은 히트 영역, DESIGN_SYSTEM Shapes).

### 3-4. 접근성 수치 (§9-5 — 코드가 이를 어떻게 지키나)

| 기준(§9-5) | 값 | 코드 반영 |
|---|---|---|
| 부모 본문 최소 | 20pt(질문 28pt/버튼 22pt) | `parentBody`·`headlineLgMobile`·`parentButton` |
| 대비 | 본문 7:1↑ | 먹/종이 ≈13:1 (`onBackground`/`background`) |
| 탭 타깃 | 64pt↑ (녹음 96pt↑) | `spacing.tapTargetMin`·`recordDiameter` |
| 화면당 주 행동 | 1개 | `PrimaryButton` "화면당 하나" 규칙 |
| 시스템 글자 확대 | 200%까지 파손 없음 | `AppText maxFontSizeMultiplier={2}` + `ScreenContainer scroll` 흡수 |
| 애니메이션 | 의미 전달용만·reduced-motion 존중 | `ThemeProvider.reduceMotion` → `RecordButton`·`Toggle` |
| 색 의존 금지 | 색+문구/아이콘 동반 | `StatusPill`·`CheerBanner`가 글리프+문구 동반 |

### 3-5. 깊이·모션 원칙

- **깊이 = 톤 레이어**(그림자 아님). 카드는 1px 테두리 + 살짝 다른 틴트. 눌림은
  "inset"(약간 어둡게 + scale 0.98) — 물성 피드백.
- **모션은 의미만.** 녹음 중 숨쉬는 링(RecordButton active), Toggle 슬라이드.
  장식 모션 없음. `reduceMotion`이면 전부 정적.

---

## 4. UI 컴포넌트 제작 가이드 (실제 구현 카탈로그)

> 아래는 `app/src/components/*.tsx`를 **열어 확인한 사실**이다. 모든 컴포넌트는
> `useTheme()`로 토큰을 읽고 하드코딩 색·폰트를 쓰지 않는다.

### 4-1. 텍스트·레이아웃 기반

#### AppText — 모든 텍스트의 단일 통로
- **용도:** 앱의 모든 문자. 타이포 토큰 + 색 토큰만 받는다(하드코딩 금지).
- **props:** `token`(TypeName) · `color`(ColorTokens 키, 기본 `onBackground`) · TextProps.
- **토큰:** `typography(token, fontsLoaded)` + `colors[color]`.
- **접근성:** `maxFontSizeMultiplier={2}` — 시스템 확대 존중하되 200% 상한(§9-5).
- **사용 규칙:** 다른 컴포넌트도 텍스트는 반드시 이걸 통한다. 색·폰트를 직접 style로 주지 않는다.

#### ScreenContainer — 종이 배경 + 안전영역
- **용도:** 모든 화면의 바깥 껍데기. 종이 배경 + 좌우 `pageMargin`(32) + 상하 안전영역.
- **props:** `scroll`(넘칠 때 스크롤 흡수 — §9-5 말줄임 금지) · `justify`(기본 space-between,
  헤더/본문/행동 3단) · `footer`(하단 고정 슬롯 — 내비·버튼) · `contentStyle`.
- **토큰:** `colors.background` · `spacing.pageMargin/stack/gutterBlock` · safe-area insets.
- **레이아웃:** 최대폭 520 중앙 정렬(iPad·큰 화면 과확장 방지).
- **사용 규칙:** 화면은 이걸로 시작한다. 하단 고정 요소는 `footer`로(스크롤과 분리).

### 4-2. 행동 컴포넌트

#### PrimaryButton — 주 행동 버튼
- **용도:** 화면의 가장 중요한 행동 하나. 전폭, 놀 채움 + 흰 라벨.
- **상태:** 기본(`primaryContainer`) · 눌림(scale 0.98 + opacity 0.92, "inset" 물성) ·
  비활성(`surfaceContainerHighest` 배경 + `onSurfaceVariant` 라벨).
- **토큰:** `minHeight: tapTargetMin(64)` · `radius.lg` · 라벨 `parentButton`.
- **접근성:** `accessibilityRole="button"` · label · hint · `accessibilityState.disabled`.
- **사용 규칙:** **화면당 하나만.** 두 개 이상이면 주 행동 1개 원칙(§9-5) 위반.

#### RecordButton — 녹음 버튼
- **용도:** 원형 녹음 진입/진행 버튼. 지름 `max(recordDiameter 96, 112)`.
- **상태:** 기본(정적, P1 진입) · `active`(P2 — 숨쉬는 링, 1.4s 왕복, `reduceMotion`이면 정적) ·
  눌림(scale 0.95).
- **토큰:** `primaryContainer` 채움 + `onPrimary` 마이크(`MicGlyph`) · `spacing.recordDiameter`.
- **접근성:** role button · 기본 라벨 "이야기 녹음하기" · hint "누르면 녹음 화면으로".
- **사용 규칙:** 놀(강조)의 대표 사용처. 링 모션은 의미 전달(녹음 중)에만.

#### Toggle — 스위치 (민감 주제)
- **용도:** C1b "여쭈다/빼두다" 민감 주제 스위치. on=여쭘.
- **상태:** on(`primaryContainer` 배경 + 점 우측 26) · off(`surfaceVariant` + 점 좌측 2).
  180ms 슬라이드. **색+위치 둘 다로** 상태 표시(색 의존 금지).
- **접근성:** `role="switch"` · `accessibilityState.checked` · 라벨 "…— 여쭘/빼둠".
- **사용 규칙:** 켜고 끔이 즉시 의미를 바꾸는 자녀 설정용.

#### BackBar — 상단 앱바
- **용도:** 명시적 뒤로 버튼(← 텍스트 라벨) + 가운데 로고/제목. 아이콘 단독 금지.
- **props:** `center`('logo' 또는 제목) · `backLabel`(기본 "뒤로") · `senior`(탭 64px) · `onBack`.
- **토큰:** 라벨 `labelLg`(senior)/`labelMd` · `onSurfaceVariant` · `minHeight` senior 64/48.
- **사용 규칙:** 부모 화면은 `senior` — OS 뒤로 제스처에 기대지 않고 보이는 버튼으로만.

#### ChildBottomNav — 자녀 하단 내비
- **용도:** 자녀 홈·내 서재 2탭(IA §3-2). C3·C5에서만.
- **상태:** 활성 탭 `primary` + 700 굵기 / 비활성 `onSurfaceVariant`.
- **토큰:** `surfaceContainer` 배경 + `outlineVariant` 상단선 + safe-area 하단.
- **사용 규칙:** **자녀 전용.** 부모 화면엔 탭바가 없다(§9-5) — 절대 부모에 쓰지 않는다.

### 4-3. 콘텐츠 표시 컴포넌트

#### StoryCard — 이야기 카드
- **용도:** 질문·답변·정리본 등 "읽는 것"을 감싼다. 종이 위 종이.
- **props:** `tone`('flat'=바탕과 같은 종이+테두리 / 'raised'=`surfaceContainerLow` 틴트).
- **토큰:** `radius.lg` · `gutterBlock` 패딩 · `outlineVariant` 테두리(hairline×2) · 그림자 없음.
- **사용 규칙:** 깊이는 톤+테두리로. 드롭섀도 금지("떠 있는 창" 회피).

#### Logo — 하루담 워드마크
- **용도:** 인앱 워드마크. **명조(고운바탕)** 로고타입(BRAND §4-3: 산스 로고 금지).
- **props:** `size`(sm 22/md 28/lg 40) · `color`(기본 `primary`).
- **토큰:** `headlineLg` + 크기 오버라이드 + letterSpacing −0.5.
- **사용 규칙:** 심볼(그릇+해)은 앱 아이콘/스플래시가, 인앱 이름 표기는 이 컴포넌트가 담당.

#### ProgressBar — 진행감
- **용도:** "쌓인 이야기"의 시각화(23/365). 켜가 차오르는 은유 — 배지·스트릭 대신.
- **props:** `ratio`(0..1, 내부 클램프).
- **토큰:** 트랙 `surfaceVariant` + 채움 `primaryContainer`, `radius.full`, 높이 8.
- **접근성:** `role="progressbar"` + `accessibilityValue{min0 max100 now}`.

#### StatusPill — 답변 상태 배지
- **용도:** 답변 상태 2종. `written`(✓ 정리된 글) / `organizing`(🌙 밤사이 정리 중).
- **상태:** written(`surfaceContainerHigh` 배경 + `primary` 글) / organizing(`secondaryContainer`
  + `secondary` 글). **색+글리프+문구** 동반(§9-5 색 의존 금지).
- **토큰:** `radius.full` · `helper` 텍스트.
- **사용 규칙:** STT 배치 전제(밤사이)의 표면 — "정리 중"은 오류가 아니라 정식 상태.

#### CheerBanner — 응원 도착 배너
- **용도:** P1 응원 도착 표시. 💛 + **자녀가 보낸 문구 그대로**(시스템이 안 다듬음 —
  §9-7 화자 분리).
- **토큰:** `surfaceContainerLow` 배경 + `outlineVariant` 테두리 pill, `labelMd`, 이모지 20pt.
- **접근성:** `role="text"` + "응원 도착: {message}".
- **사용 규칙:** 자녀의 말은 자녀의 사전에서 온다 — 문구를 편집하지 않는다.

### 4-4. 보조 (내부)

#### MicGlyph — 마이크 픽토그램
- **용도:** RecordButton 안의 마이크 그림. **순수 View로 그린다**(아이콘 폰트 번들 회피 —
  하네스 대용량 에셋 경계).
- **props:** `color`(호출부에서 — 장식이 아니라 행동 표식) · `size`(기본 44).
- **접근성:** `accessible={false}`(버튼이 라벨을 가지므로 글리프는 무시).

### 4-5. 컴포넌트 공통 규칙 (전부에 적용)

1. **토큰만 쓴다.** 색·폰트·간격을 리터럴로 박지 않는다 — `useTheme()` 경유.
2. **AppText가 텍스트의 유일 통로.** 원시 `<Text>`에 style로 색·폰트 주지 않는다.
3. **부모/자녀 경계.** `ChildBottomNav`는 자녀만, `senior` 플래그는 부모 탭 타깃 상향.
4. **색 의존 금지.** 상태는 색 + 글리프/문구를 늘 함께(`StatusPill`·`CheerBanner`·`Toggle`).
5. **모션은 의미만 + reduceMotion 존중.**

---

## 5. 미결·경계 (IA 관찰 — 발명하지 않고 넘김)

| # | 관찰 | 넘길 곳 |
|---|---|---|
| G-1 | 앱 아이콘·스플래시가 **코드 생성 기하 도형** — 정교한 아트 시안 미제작(app.config `TODO`, BRAND §4-3) | BRAND(방향)→PD/디자인 후속, 유통은 PO |
| G-2 | 스플래시 "획 내려앉는 1초" 모션 미구현 | PD/APP 후속 |
| G-3 | `android-icon-monochrome.png` 존재하나 app.config 미배선(테마드 아이콘) | APP |
| G-4 | 라이트 종이값 불일치: 코드 `#fff8f3`(DESIGN_SYSTEM) vs BRAND/프로토타입 `#FBF7EF` | BRAND↔PD 정합 |
| G-5 | 다크 컨테이너 틴트 대비 **실기기 재검증 미완**(colors.ts 주석) | PD |
| G-6 | 고운바탕 한글 글리프 실제 표시 **미검증**(실기기 dev build 필요, fonts.ts) | PD/APP |
| G-7 | 상태색(ok/wait/danger)이 BRAND 원형이 아니라 PD 파생 — 대비 검증 후 확정 필요 | PD |

이 문서는 **정본(현행 구현 기준)**이되, G-1~G-7이 닫히기 전까지 그 항목들은 "구현됨
≠ 확정됨"이다. 대외 유통물(아이콘·키비주얼)은 BRAND §4-3·팀 규칙 9조에 따라 **PO 승인** 사안.
