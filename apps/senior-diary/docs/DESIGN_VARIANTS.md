# DESIGN_VARIANTS — 하루담(가칭) · 디자인 타입 3종 (PO 선택용)

- 작성: BRAND · 2026-08-28 (PO 요청 "디자인 3타입 뽑아 골라보기")
- 용도: **PO가 세 타입의 Stitch 프롬프트로 각각 시안을 생성해 하나를 고른다.**
- 현행 안(`DESIGN_CONCEPT.md` = 크림+주황 "Tactile Minimalism")은 **그대로 두고**,
  이 문서는 **대안 3종**을 병렬로 제시한다. 넷 중 무엇을 골라도 아래 **공통
  가드레일**은 불변이다.
- 원본: `BRAND.md`(에센스·톤·용어집)·`PRD.md §9-5`(접근성 수치). 값 충돌 시 원본이 이긴다.
- ⚠️ Stitch 산출물은 **컨셉 시안**이다. 확정 디자인 토큰은 선택 후 PD가 파생.
  하루담은 **가칭**(상표 정밀 확인 전).

---

## 0. 3종 비교표 — 한눈에 고르기

| | **Type A · 한지·먹** | **Type B · 노을·저녁빛** | **Type C · 맑은 아침** |
|---|---|---|---|
| 무드 | 전통 정갈·서예·에디토리얼 | 포근한 온기·앨범·아늑 | 밝고 생기·통풍·개방 |
| 핵심 배경 | 한지 뉴트럴 `#F4EFE4` | 살구빛 크림 `#FBF1E8` | 오프화이트 `#FBFAF6` |
| 본문색 | 먹 `#23201B` | 짙은 플럼 `#2C2230` | 잉크 그레이 `#262A28` |
| 강조색 | 쪽빛 `#2E4A6B` (단색·절제) | 테라코타 앰버 `#C8622E` | 세이지 그린 `#3E6B54` |
| UI 구조 | **평면·괘선·여백**(카드 최소) | **카드 중심·둥근 모서리·그림자** | **개방형·얇은 선·통풍** |
| 모서리 | 각짐(4px) | 크게 둥긂(20px) | 중간(12px) |
| 타이포 성격 | 세리프 우세(먹글씨) | 세리프+산스 균형(따뜻) | 산스 우세 + 세리프 악센트 |
| 어울리는 사람 | 격조·차분·전통을 좋아하는 자녀/부모 | 정 많고 아늑함을 원하는 가족 | 산뜻·현대·밝음을 원하는 층 |
| 현행(크림+주황) 대비 | 주황을 빼고 **쪽빛 단색 + 평면 서예**로 — 더 정적·격조 | 미색을 **살구+플럼**으로 데우고 **카드·그림자**로 아늑 | 미색을 **더 밝게** 틀고 **세이지+개방형**으로 산뜻 |

세 타입은 서로도, 현행과도 **한눈에 다른 인상**이 되도록 배경·강조·구조를 갈랐다.
공통 가드레일(§1) 덕에 색이 달라도 "시니어가 읽기 쉬운 반(反)앱테크 이야기 앱"이라는
정체성은 유지된다.

---

## 1. 공통 가드레일 (세 타입 절대 불변 — 각 프리앰블에 포함됨)

색·구조가 바뀌어도 아래는 **모든 타입에서 동일**하다.

- **시니어 가독(부모 화면):** 질문 28pt+ · 본문 20pt+ · 버튼 라벨 22pt · 본문 대비
  7:1 · 탭 타깃 64pt+ (녹음 버튼 지름 96pt+) · **화면당 주 행동 1개** · 탭 제스처만
  (탭바·햄버거·숨은 제스처 없음) · 시스템 글자확대 200% 무파손 · 행간 1.6+ ·
  **색만으로 상태 구분 금지**(문구+아이콘 동반).
- **반(反)앱테크:** 포인트·코인·캐시·배지·레벨·랭킹·출석도장·룰렛·숫자 카운터
  애니메이션 **금지**.
- **정서:** 돈의 언어·공포·죄책감 소구 금지. **부모=저자(이야기를 들려주는 사람),
  자녀=첫 독자.** 병원/실버케어 룩·추모(세피아·국화·촛불)·유치한 캐릭터·AI 대시보드
  금지.
- **문구:** 전부 **존대 한국어.** 부모 화면 '자서전' 금지→'이야기', '스킵'→'넘어가다'.
- **타이포 이원:** 질문·이야기 본문은 **세리프(명조) 성격 유지**, UI(버튼·라벨)는
  산세리프. (타입마다 세리프/산스의 비중만 다르고, 질문·이야기의 세리프 성격은 공통.)

더미 콘텐츠(전 타입 공통): 부모 **김순자(68, 대전)** · 자녀 **이지혜(41, 서울)** ·
대표 질문 **"처음 서울에 올라오던 날, 기억나세요?"**

---

## 2. Type A — 한지·먹 (전통 정갈)

**컨셉 한 줄:** *한지 위에 먹으로 쓴 서한.* 서예·에디토리얼의 정적인 격조.
**무드:** 정갈·차분·여백. 낙관(도장) 한 점 같은 절제된 쪽빛 강조.

**팔레트**

| 역할 | 라이트 | 다크 |
|---|---|---|
| 배경(한지) | `#F4EFE4` | `#1C1A15` |
| 본문(먹) | `#23201B` (약 14:1 ✅) | `#ECE6D8` (약 13:1 ✅) |
| 강조(쪽빛) | `#2E4A6B` (버튼 채움+흰 글자 약 7:1 ✅) | `#7C9CC0` |
| 경계·괘선 | `#E0D8C7` | `#33302A` |

**타이포:** 세리프 우세 — 질문·이야기·라벨 상당수까지 명조. 버튼 라벨만 산스.
붓글씨 같은 무게감, 자간 넉넉.
**UI 구조:** **평면.** 카드 테두리·그림자 최소, 얇은 괘선(rule)으로 영역 구분.
각진 모서리(4px). 큰 여백, 중앙 정렬 에디토리얼.
**현행 대비:** 주황 강조를 빼고 **쪽빛 단색 + 평면 서예**로 — 더 정적이고 격조 있다.

### 2-0. 프리앰블 (EN 기본)
```
Brand: Harudam (working name) — an app that asks an elderly parent one life
question each morning, records the spoken answer, and after a year binds it into
a book for their adult child. DESIGN TYPE A — "Hanji & Ink": traditional Korean
stationery calm, like a letter brushed in ink on mulberry paper.

Visual style (Type A):
- Background: hanji cream #F4EFE4 (dark #1C1A15). Flat — minimal cards; separate
  regions with thin hairline rules #E0D8C7, not boxes or shadows.
- Body text: ink #23201B (dark #ECE6D8).
- Single accent: indigo #2E4A6B, used sparingly like a seal stamp (primary button
  fill with white text). No other colors, no gradients, no neon.
- Type: SERIF-dominant (Korean serif like Gowun Batang) for questions, stories,
  and most labels; sans-serif (Noto Sans KR) only for buttons. Brush-like weight,
  generous spacing, line-height 1.6.
- Corners nearly square (4px). Lots of whitespace, centered editorial layout.

MANDATORY GUARDRAILS (all screens):
- Senior legibility on PARENT screens: question 28pt+, body 20pt+, button label
  22pt, contrast 7:1, tap targets 64pt+ (record button 96pt+ diameter), ONE
  primary action per screen, tap only (no tab bar / hamburger / hidden gestures),
  status shown by text+icon (never color alone).
- NEVER: points/coins/badges/levels/rankings/streaks/spin-wheels, neon, animated
  counters, hospital look, sepia/chrysanthemum/candle (funeral), childish
  characters, AI/dashboard/chart aesthetics.
- All in-screen text in KOREAN, warm and honorific; never nagging or guilt-based.
```
### 2-0. 프리앰블 (KR)
```
브랜드: 하루담(가칭) — 부모님께 매일 한 인생 질문을 여쭙고 음성으로 답을 담아
1년 뒤 책으로 엮는 앱. 디자인 타입 A "한지·먹": 한지에 먹으로 쓴 서한 같은 전통의 정갈함.
비주얼(A): 배경 한지 크림 #F4EFE4(다크 #1C1A15). 평면 — 카드 최소, 영역 구분은
얇은 괘선 #E0D8C7으로(상자·그림자 아님). 본문 먹 #23201B(다크 #ECE6D8). 강조는
쪽빛 #2E4A6B을 낙관 도장처럼 절제해 한 곳만(주 버튼 채움+흰 글자). 다색·그라디언트·
네온 금지. 서체: 세리프 우세(명조)로 질문·이야기·대부분 라벨, 버튼만 산세리프.
붓글씨 무게감·넉넉한 자간·행간 1.6. 모서리 각짐(4px), 큰 여백, 중앙 에디토리얼.
[필수 가드레일 — §1 공통: 부모화면 질문28pt+/본문20pt+/버튼22pt/대비7:1/탭64pt+/
녹음버튼96pt+/화면당 주행동1개/탭만/색의존금지 · 반앱테크(포인트·배지·네온·카운터
금지) · 병원/추모/유치/AI대시보드 금지 · 전 텍스트 존대 한국어, 재촉·죄책감 금지.]
```

### 2-A 아이콘
**[EN]**
```
[PASTE TYPE A PREAMBLE FIRST]
App icon, Type A. A near-square rounded tile on hanji cream #F4EFE4. Centered
motif brushed in ink #23201B: a simple open vessel/bowl (representing "담다",
holding) with two or three stacked strokes settling into it (days accumulating),
and a single small indigo #2E4A6B dot/sun above like a seal stamp. Flat, calm,
like an ink seal (낙관). No text, no gradient, no glossy 3D.
```
**[KR]**
```
[타입 A 프리앰블 먼저]
앱 아이콘, 타입 A. 한지 크림 #F4EFE4 바탕의 둥근 정사각 타일. 중앙에 먹 #23201B으로
그린 붓 모티프: 담는 그릇 하나에 두세 획이 켜켜이 내려앉고(하루가 쌓임), 위에 쪽빛
#2E4A6B 점/해 하나를 낙관 도장처럼. 평면·정갈, 낙관 느낌. 글자·그라디언트·번쩍이는 3D 없음.
```

### 2-A 스플래시
**[EN]**
```
[PASTE TYPE A PREAMBLE FIRST]
Splash screen, Type A. Full hanji cream #F4EFE4 background. Centered wordmark
"하루담" in large Korean SERIF ink #23201B, with the small indigo bowl-and-sun
seal motif just above it. A thin hairline rule under the wordmark. Vast calm
whitespace. No tagline needed; optional tiny serif line "하루 한 이야기가 담깁니다".
```
**[KR]**
```
[타입 A 프리앰블 먼저]
스플래시, 타입 A. 한지 크림 #F4EFE4 전면. 중앙에 큰 명조 워드마크 "하루담"(먹 #23201B),
그 위에 작은 쪽빛 그릇·해 낙관 모티프. 워드마크 아래 얇은 괘선. 넓고 고요한 여백.
(선택) 작은 명조 한 줄 "하루 한 이야기가 담깁니다".
```

### 2-A · P1 오늘 (부모 홈)
**[EN]**
```
[PASTE TYPE A PREAMBLE FIRST]
Screen "오늘의 질문" (parent home), Type A editorial/flat.
- Top: small serif label with a hairline rule under it: "8월 26일 화요일 · 스물세 번째 질문".
- Center hero: the question in large Korean SERIF ink #23201B, ~30pt, 2–3 lines,
  framed only by whitespace and thin rules above/below — NO card box:
  "처음 서울에 올라오던 날, 기억나세요?"
- Primary action: a round outlined button, indigo #2E4A6B ring (fill on press),
  96pt diameter, white/indigo mic dot, sans label "눌러서 이야기해 주세요".
- Two low-emphasis serif links: "이 이야기는 넘어갈게요" · "지난 이야기 보기 →".
Flat, centered, roomy. No tab bar. Quiet, like a page in a book.
```
**[KR]**
```
[타입 A 프리앰블 먼저]
화면 "오늘의 질문"(부모 홈), 타입 A 에디토리얼·평면.
- 상단: 작은 명조 라벨 + 아래 얇은 괘선 "8월 26일 화요일 · 스물세 번째 질문".
- 중앙 히어로: 질문을 큰 명조 먹 #23201B, 약 30pt, 2~3줄, 카드 없이 여백과 위아래
  얇은 괘선으로만 감싸기: "처음 서울에 올라오던 날, 기억나세요?".
- 주 행동: 외곽선 원형 버튼, 쪽빛 #2E4A6B 링(누르면 채움), 지름 96pt, 녹음 점 +
  산세리프 라벨 "눌러서 이야기해 주세요".
- 낮은 강조 명조 링크 2개: "이 이야기는 넘어갈게요" · "지난 이야기 보기 →".
평면·중앙·넉넉. 탭바 없음. 책의 한 페이지처럼 고요하게.
```

### 2-A · C4 이야기 읽기·응원 (자녀)
**[EN]**
```
[PASTE TYPE A PREAMBLE FIRST]
Screen "이야기 읽기·응원" (adult child), Type A. Child screen: standard sizing
(~16–17pt body) but keep hanji flat editorial mood, serif for the story.
- Date + question, serif ink: "8월 23일" / "처음 서울에 올라오던 날, 기억나세요?".
- Story as a serif body paragraph, ink #23201B, line-height 1.6, separated by a
  hairline rule (no card): "열아홉에 완행열차를 타고 올라왔어요. 서울역에 내리니 사람이 어찌나 많던지…".
- Audio row as a slim inline element with a thin rule: ▶ "엄마 목소리로 듣기".
- Cheer area: an outlined heart ❤️, one-line input "한마디 남기기", and serif quick
  chips "엄마, 이 얘기 처음 들었어" · "오늘도 고마워요". Send accent = indigo #2E4A6B.
Editorial, calm, letter-like. No dashboard, no stats.
```
**[KR]**
```
[타입 A 프리앰블 먼저]
화면 "이야기 읽기·응원"(자녀), 타입 A. 자녀 화면: 일반 크기(본문 16~17pt), 한지
평면 에디토리얼 무드 유지, 이야기는 세리프.
- 날짜+질문(명조 먹): "8월 23일" / "처음 서울에 올라오던 날, 기억나세요?".
- 이야기를 명조 본문 문단, 먹 #23201B, 행간 1.6, 괘선으로만 구분(카드 없음):
  "열아홉에 완행열차를 타고 올라왔어요. 서울역에 내리니 사람이 어찌나 많던지…".
- 원음 줄: 얇은 괘선의 슬림 인라인 ▶ "엄마 목소리로 듣기".
- 응원: 외곽선 하트 ❤️, 한 줄 입력 "한마디 남기기", 명조 칩 "엄마, 이 얘기 처음
  들었어" · "오늘도 고마워요". 보내기 강조 = 쪽빛 #2E4A6B.
에디토리얼·고요·편지 같게. 대시보드·통계 없음.
```

### 2-A · C6 책 미리보기 (자녀)
**[EN]**
```
[PASTE TYPE A PREAMBLE FIRST]
Screen "책 미리보기" (adult child), Type A. Scroll top-to-bottom like turning a
hanji-bound book. NO order/buy button (free preview).
- Fixed sample label, serif: "미리보기 — 지금까지 담긴 이야기로 미리 엮어봤어요".
- Book cover mockup: a traditional hanji hardcover, ink serif title "김순자 이야기",
  subtitle "딸 이지혜가 묻고, 김순자가 답하다", year "2026", a small indigo seal
  motif in the corner. Understated, like an old bound manuscript.
- Table of contents in serif, hairline-ruled rows, 7 chapters: 어린 시절 / 고향과
  가족 / 배우자를 만나다 / 일과 살림 / 아이들 / 지금의 나날 / 전하고 싶은 말.
- One book spread: chapter title, then a story — date, question (serif), paragraph,
  and a small "🔗 목소리로 듣기" mark. "처음 서울에 올라오던 날 — 열아홉에 완행열차를…".
- Closing serif line: "지금까지 23개의 이야기가 담겼어요 — 이야기가 쌓일수록 책이 두꺼워져요".
Timeless, restrained, ink-on-paper.
```
**[KR]**
```
[타입 A 프리앰블 먼저]
화면 "책 미리보기"(자녀), 타입 A. 한지 장정 책을 넘기듯 위→아래 스크롤. 주문·구매
버튼 없음(무료 미리보기).
- 고정 샘플 라벨(명조): "미리보기 — 지금까지 담긴 이야기로 미리 엮어봤어요".
- 표지 목업: 전통 한지 양장, 먹 명조 제호 "김순자 이야기", 부제 "딸 이지혜가 묻고,
  김순자가 답하다", 연도 "2026", 모서리에 작은 쪽빛 낙관. 절제된 고서 느낌.
- 목차: 명조, 괘선 구분 행, 7장(어린 시절 / 고향과 가족 / 배우자를 만나다 / 일과
  살림 / 아이들 / 지금의 나날 / 전하고 싶은 말).
- 책 펼침면: 장 표제 → 이야기(날짜·질문 명조·문단·"🔗 목소리로 듣기" 마크):
  "처음 서울에 올라오던 날 — 열아홉에 완행열차를…".
- 마무리 명조: "지금까지 23개의 이야기가 담겼어요 — 이야기가 쌓일수록 책이 두꺼워져요".
시간을 타지 않는 절제, 먹빛 지면.
```

---

## 3. Type B — 노을·저녁빛 (포근한 온기)

**컨셉 한 줄:** *저녁 노을빛 앨범.* 하루를 마무리하며 펼치는 따뜻하고 아늑한 기록장.
**무드:** 포근·아늑·정. 살구빛 배경에 플럼 본문, 테라코타 앰버가 온기를 준다.

**팔레트**

| 역할 | 라이트 | 다크 |
|---|---|---|
| 배경(살구 크림) | `#FBF1E8` | `#241920` |
| 본문(플럼) | `#2C2230` (약 13:1 ✅) | `#F0E4DC` (약 13:1 ✅) |
| 강조(테라코타 앰버) | `#C8622E` (버튼 채움+흰 글자 약 4.8:1 ✅ 큰 글자) | `#E39158` |
| 카드 | `#FFFFFF` / 경계 `#EEDBCB` | `#2E2129` / 경계 `#40303A` |

**타이포:** 세리프+산스 균형 — 질문·이야기는 명조(따뜻한 곡선), UI는 산스. 둥근
느낌의 산스 선호.
**UI 구조:** **카드 중심.** 둥근 모서리(20px), 부드러운 그림자, 아늑한 밀도. 요소가
포근한 카드 안에 담긴다.
**현행 대비:** 현행의 미색+단일 주황을 **살구빛+플럼 본문**으로 데우고, 평면 대신
**둥근 카드·그림자**로 앨범처럼 아늑하게. (강조도 주황이 아니라 테라코타 앰버로 미세히 다름.)

### 3-0. 프리앰블 (EN 기본)
```
Brand: Harudam (working name) — an app that asks an elderly parent one life
question each morning, records the answer, and binds a year of answers into a
book for their adult child. DESIGN TYPE B — "Sunset / Evening Warmth": a cozy
album you open at day's end.

Visual style (Type B):
- Background: apricot cream #FBF1E8 (dark #241920). CARD-centric: content sits in
  soft white cards #FFFFFF with border #EEDBCB, large rounded corners (20px), a
  gentle soft shadow. Cozy, warm density.
- Body text: deep plum #2C2230 (dark #F0E4DC).
- Single accent: terracotta amber #C8622E (primary button fill, white text). Warm
  but NOT neon, at most a whisper of gradient. Use in one place per screen.
- Type: balanced serif + sans — Korean serif (Gowun Batang) for questions and
  stories, rounded sans (Noto Sans KR) for UI. Line-height 1.6.

MANDATORY GUARDRAILS (all screens):
- Senior legibility on PARENT screens: question 28pt+, body 20pt+, button label
  22pt, contrast 7:1, tap 64pt+ (record button 96pt+), ONE primary action, tap
  only (no tab bar/hamburger/hidden gestures), status by text+icon (not color).
- NEVER: points/coins/badges/levels/rankings/streaks/spin-wheels, neon, animated
  counters, hospital look, sepia/chrysanthemum/candle, childish characters,
  AI/dashboard aesthetics.
- All in-screen text in KOREAN, warm and honorific; never nagging or guilt-based.
```
### 3-0. 프리앰블 (KR)
```
브랜드: 하루담(가칭) — 매일 한 인생 질문을 여쭙고 답을 담아 1년 뒤 책으로 엮는 앱.
디자인 타입 B "노을·저녁빛": 하루를 마무리하며 펴는 아늑한 앨범.
비주얼(B): 배경 살구 크림 #FBF1E8(다크 #241920). 카드 중심 — 내용은 부드러운 흰
카드 #FFFFFF(경계 #EEDBCB), 크게 둥근 모서리(20px), 은은한 그림자에 담긴다. 포근한
밀도. 본문 짙은 플럼 #2C2230(다크 #F0E4DC). 강조는 테라코타 앰버 #C8622E(주 버튼
채움+흰 글자), 따뜻하되 네온 아님, 그라디언트는 아주 옅게, 화면당 한 곳. 서체:
세리프+산스 균형 — 질문·이야기는 명조, UI는 둥근 산스. 행간 1.6.
[필수 가드레일 — §1 공통: 부모화면 질문28pt+/본문20pt+/버튼22pt/대비7:1/탭64pt+/
녹음96pt+/주행동1개/탭만/색의존금지 · 반앱테크 금지 · 병원/추모/유치/AI 금지 ·
전 텍스트 존대 한국어, 재촉·죄책감 금지.]
```

### 3-B 아이콘
**[EN]**
```
[PASTE TYPE B PREAMBLE FIRST]
App icon, Type B. A rounded-square tile with a warm apricot-to-cream backdrop.
Centered motif: a soft terracotta amber #C8622E bowl/vessel holding a gentle
rising sun, with one or two rounded stacked strokes (days) inside. Cozy, warm,
soft edges, a faint warm glow (not neon). No text, no harsh 3D.
```
**[KR]**
```
[타입 B 프리앰블 먼저]
앱 아이콘, 타입 B. 살구→크림의 따뜻한 배경의 둥근 사각 타일. 중앙 모티프: 부드러운
테라코타 앰버 #C8622E 그릇이 떠오르는 해를 품고, 안에 둥근 켜 한두 개(하루). 아늑·
따뜻·부드러운 모서리, 옅은 온기광(네온 아님). 글자·강한 3D 없음.
```

### 3-B 스플래시
**[EN]**
```
[PASTE TYPE B PREAMBLE FIRST]
Splash, Type B. A soft warm gradient background from cream #FBF1E8 to apricot,
like dusk. Centered wordmark "하루담" in Korean serif, deep plum #2C2230, with the
terracotta amber bowl-and-sun motif above. Optional cozy tagline in sans:
"하루 한 이야기가 담깁니다". Warm, enveloping, gentle.
```
**[KR]**
```
[타입 B 프리앰블 먼저]
스플래시, 타입 B. 크림 #FBF1E8→살구의 부드러운 노을 그라디언트 배경. 중앙 명조
워드마크 "하루담"(짙은 플럼 #2C2230), 위에 테라코타 앰버 그릇·해 모티프. (선택)
아늑한 산스 태그라인 "하루 한 이야기가 담깁니다". 따뜻하게 감싸는 느낌.
```

### 3-B · P1 오늘 (부모 홈)
**[EN]**
```
[PASTE TYPE B PREAMBLE FIRST]
Screen "오늘의 질문" (parent home), Type B card-centric.
- Top small sans label: "8월 26일 화요일 · 스물세 번째 질문".
- (Optional) a cozy cheer chip on a warm tint card: "💛 지혜님이 응원을 보냈어요".
- Center: the question inside a soft white rounded card (20px, gentle shadow),
  Korean serif plum #2C2230, ~30pt, 2–3 lines: "처음 서울에 올라오던 날, 기억나세요?".
- Primary: a big round terracotta amber #C8622E button, 96pt, white mic dot +
  sans label "눌러서 이야기해 주세요".
- Two low-emphasis links: "이 이야기는 넘어갈게요" · "지난 이야기 보기 →".
Cozy, rounded, warm. No tab bar. Feels like an evening keepsake.
```
**[KR]**
```
[타입 B 프리앰블 먼저]
화면 "오늘의 질문"(부모 홈), 타입 B 카드 중심.
- 상단 작은 산스 라벨: "8월 26일 화요일 · 스물세 번째 질문".
- (선택) 따뜻한 톤 카드의 아늑한 응원 칩 "💛 지혜님이 응원을 보냈어요".
- 중앙: 질문을 부드러운 흰 둥근 카드(20px·은은한 그림자) 안에, 명조 플럼 #2C2230,
  약 30pt, 2~3줄: "처음 서울에 올라오던 날, 기억나세요?".
- 주 버튼: 큰 원형 테라코타 앰버 #C8622E, 96pt, 흰 녹음 점 + 산스 "눌러서 이야기해 주세요".
- 낮은 강조 링크 2개: "이 이야기는 넘어갈게요" · "지난 이야기 보기 →".
아늑·둥긂·따뜻. 탭바 없음. 저녁의 소장품 같은 느낌.
```

### 3-B · C4 이야기 읽기·응원 (자녀)
**[EN]**
```
[PASTE TYPE B PREAMBLE FIRST]
Screen "이야기 읽기·응원" (child), Type B. Standard sizing, cozy cards.
- Date + question in serif plum atop a warm card header.
- Story in a soft white rounded card, serif body plum #2C2230, line-height 1.6:
  "열아홉에 완행열차를 타고 올라왔어요. 서울역에 내리니 사람이 어찌나 많던지…".
- A warm audio player card: ▶ "엄마 목소리로 듣기" with a rounded amber play button
  and progress bar.
- Cheer card at bottom: heart ❤️, input "한마디 남기기", rounded quick chips
  "엄마, 이 얘기 처음 들었어" · "오늘도 고마워요". Send in terracotta amber #C8622E.
Cozy album mood, tender.
```
**[KR]**
```
[타입 B 프리앰블 먼저]
화면 "이야기 읽기·응원"(자녀), 타입 B. 일반 크기, 아늑한 카드.
- 날짜+질문(명조 플럼)을 따뜻한 카드 헤더 위에.
- 이야기는 부드러운 흰 둥근 카드, 명조 본문 플럼 #2C2230, 행간 1.6:
  "열아홉에 완행열차를 타고 올라왔어요. 서울역에 내리니 사람이 어찌나 많던지…".
- 따뜻한 원음 플레이어 카드: ▶ "엄마 목소리로 듣기", 둥근 앰버 재생 버튼 + 진행 바.
- 하단 응원 카드: 하트 ❤️, 입력 "한마디 남기기", 둥근 칩 "엄마, 이 얘기 처음 들었어"
  · "오늘도 고마워요". 보내기 테라코타 앰버 #C8622E.
아늑한 앨범 무드, 다정함.
```

### 3-B · C6 책 미리보기 (자녀)
**[EN]**
```
[PASTE TYPE B PREAMBLE FIRST]
Screen "책 미리보기" (child), Type B. Scroll like an album. NO buy button.
- Sample label chip: "미리보기 — 지금까지 담긴 이야기로 미리 엮어봤어요".
- Book cover mockup: a warm hardcover with soft cloth texture in apricot/amber
  tones, serif title "김순자 이야기", subtitle "딸 이지혜가 묻고, 김순자가 답하다",
  "2026". Rounded, cozy, keepsake-like.
- Table of contents inside a rounded card, 7 chapters (어린 시절 / 고향과 가족 /
  배우자를 만나다 / 일과 살림 / 아이들 / 지금의 나날 / 전하고 싶은 말).
- A book spread card: chapter title, story — date, question (serif), paragraph,
  "🔗 목소리로 듣기": "처음 서울에 올라오던 날 — 열아홉에 완행열차를…".
- Closing: "지금까지 23개의 이야기가 담겼어요 — 이야기가 쌓일수록 책이 두꺼워져요".
Warm, huggable, an evening treasure.
```
**[KR]**
```
[타입 B 프리앰블 먼저]
화면 "책 미리보기"(자녀), 타입 B. 앨범 넘기듯 스크롤. 구매 버튼 없음.
- 샘플 라벨 칩: "미리보기 — 지금까지 담긴 이야기로 미리 엮어봤어요".
- 표지 목업: 살구/앰버 톤의 부드러운 천 질감 따뜻한 양장, 명조 제호 "김순자 이야기",
  부제 "딸 이지혜가 묻고, 김순자가 답하다", "2026". 둥글고 아늑한 소장품.
- 목차를 둥근 카드 안에, 7장(어린 시절 / 고향과 가족 / 배우자를 만나다 / 일과 살림 /
  아이들 / 지금의 나날 / 전하고 싶은 말).
- 책 펼침면 카드: 장 표제, 이야기 — 날짜·질문(명조)·문단·"🔗 목소리로 듣기":
  "처음 서울에 올라오던 날 — 열아홉에 완행열차를…".
- 마무리: "지금까지 23개의 이야기가 담겼어요 — 이야기가 쌓일수록 책이 두꺼워져요".
따뜻하고 포근한 저녁의 보물.
```

---

## 4. Type C — 맑은 아침 (밝고 생기)

**컨셉 한 줄:** *창을 연 맑은 아침.* 밝고 통풍감 있는, 산뜻하고 현대적인 기록.
**무드:** 산뜻·생기·개방. 밝은 오프화이트에 세이지 그린이 청량하게 숨 쉰다.

**팔레트**

| 역할 | 라이트 | 다크 |
|---|---|---|
| 배경(오프화이트) | `#FBFAF6` | `#161A17` |
| 본문(잉크 그레이) | `#262A28` (약 15:1 ✅) | `#E6EAE4` (약 14:1 ✅) |
| 강조(세이지 그린) | `#3E6B54` (버튼 채움+흰 글자 약 5.8:1 ✅ 큰 글자) | `#7FB394` |
| 경계·선 | `#E7EAE3` | `#2A302B` |

**타이포:** 산스 우세 + 세리프 악센트 — UI·라벨은 산스, **질문·이야기만 명조 악센트**로
또렷이. 가볍고 또렷한 산스.
**UI 구조:** **개방형.** 카드보다 **얇은 선·큰 여백·통풍감.** 중간 둥근 모서리(12px),
그림자 거의 없음, 요소 사이 공기.
**현행 대비:** 현행 미색을 **더 밝은 오프화이트**로 올리고, 주황 대신 **세이지 그린 +
개방형 레이아웃**으로 무겁지 않고 산뜻하게. 세리프는 악센트로만 남긴다.

### 4-0. 프리앰블 (EN 기본)
```
Brand: Harudam (working name) — an app that asks an elderly parent one life
question each morning, records the answer, and binds a year into a book for their
adult child. DESIGN TYPE C — "Clear Morning": bright, airy, fresh and modern.

Visual style (Type C):
- Background: bright off-white #FBFAF6 (dark #161A17). OPEN and airy — few cards,
  separate regions with thin lines #E7EAE3 and generous whitespace, almost no
  shadow. Medium rounded corners (12px). Air between elements.
- Body text: ink grey #262A28 (dark #E6EAE4).
- Single accent: sage green #3E6B54 (primary button fill, white text). Calm,
  fresh, never neon. One place per screen.
- Type: SANS-dominant (Noto Sans KR) for UI and labels; use Korean SERIF (Gowun
  Batang) as an ACCENT only for the question and the story body. Light, crisp.

MANDATORY GUARDRAILS (all screens):
- Senior legibility on PARENT screens: question 28pt+, body 20pt+, button label
  22pt, contrast 7:1, tap 64pt+ (record button 96pt+), ONE primary action, tap
  only (no tab bar/hamburger/hidden gestures), status by text+icon (not color).
- NEVER: points/coins/badges/levels/rankings/streaks/spin-wheels, neon, animated
  counters, hospital look, sepia/chrysanthemum/candle, childish characters,
  AI/dashboard aesthetics.
- All in-screen text in KOREAN, warm and honorific; never nagging or guilt-based.
```
### 4-0. 프리앰블 (KR)
```
브랜드: 하루담(가칭) — 매일 한 인생 질문을 여쭙고 답을 담아 1년 뒤 책으로 엮는 앱.
디자인 타입 C "맑은 아침": 밝고 통풍감 있는, 산뜻하고 현대적인 기록.
비주얼(C): 배경 밝은 오프화이트 #FBFAF6(다크 #161A17). 개방·통풍 — 카드 최소, 영역은
얇은 선 #E7EAE3과 큰 여백으로 구분, 그림자 거의 없음. 중간 둥근 모서리(12px), 요소
사이 공기. 본문 잉크 그레이 #262A28(다크 #E6EAE4). 강조는 세이지 그린 #3E6B54(주
버튼 채움+흰 글자), 차분·청량, 네온 아님, 화면당 한 곳. 서체: 산스 우세(UI·라벨),
질문·이야기 본문만 명조 악센트로 또렷이. 가볍고 또렷한 산스.
[필수 가드레일 — §1 공통: 부모화면 질문28pt+/본문20pt+/버튼22pt/대비7:1/탭64pt+/
녹음96pt+/주행동1개/탭만/색의존금지 · 반앱테크 금지 · 병원/추모/유치/AI 금지 ·
전 텍스트 존대 한국어, 재촉·죄책감 금지.]
```

### 4-C 아이콘
**[EN]**
```
[PASTE TYPE C PREAMBLE FIRST]
App icon, Type C. A rounded-square tile on bright off-white #FBFAF6. Centered
line-art motif in sage green #3E6B54: a light open bowl/vessel with a rising sun
above and one thin stacked line inside (a day settling in). Airy, minimal,
line-based, fresh. No fill-heavy shapes, no text, no gradient.
```
**[KR]**
```
[타입 C 프리앰블 먼저]
앱 아이콘, 타입 C. 밝은 오프화이트 #FBFAF6 바탕의 둥근 사각 타일. 중앙에 세이지 그린
#3E6B54 라인아트 모티프: 가벼운 열린 그릇 위로 떠오르는 해, 안에 얇은 켜 한 줄(담긴
하루). 통풍·미니멀·선 위주·산뜻. 꽉 찬 면·글자·그라디언트 없음.
```

### 4-C 스플래시
**[EN]**
```
[PASTE TYPE C PREAMBLE FIRST]
Splash, Type C. Full bright off-white #FBFAF6, lots of air. Centered wordmark
"하루담" — sans-dominant but the mark can carry a subtle serif accent — in ink
#262A28, with the sage green line bowl-and-sun motif above. Optional light sans
tagline "하루 한 이야기가 담깁니다". Clean, open, morning-fresh.
```
**[KR]**
```
[타입 C 프리앰블 먼저]
스플래시, 타입 C. 밝은 오프화이트 #FBFAF6 전면, 넉넉한 공기. 중앙 워드마크 "하루담"
(산스 우세, 살짝 세리프 악센트 가능), 잉크 #262A28, 위에 세이지 그린 라인 그릇·해
모티프. (선택) 가벼운 산스 태그라인 "하루 한 이야기가 담깁니다". 깨끗·개방·아침처럼 상쾌.
```

### 4-C · P1 오늘 (부모 홈)
**[EN]**
```
[PASTE TYPE C PREAMBLE FIRST]
Screen "오늘의 질문" (parent home), Type C open/airy.
- Top small sans label: "8월 26일 화요일 · 스물세 번째 질문".
- Center: the question in Korean SERIF accent, ink #262A28, ~30pt, 2–3 lines,
  floating in open whitespace with a thin sage divider line, NO card:
  "처음 서울에 올라오던 날, 기억나세요?".
- Primary: a large round sage green #3E6B54 button, 96pt, white mic dot + sans
  label "눌러서 이야기해 주세요".
- Two low-emphasis sans links: "이 이야기는 넘어갈게요" · "지난 이야기 보기 →".
Bright, breezy, lots of air. No tab bar. Feels like an open window in the morning.
```
**[KR]**
```
[타입 C 프리앰블 먼저]
화면 "오늘의 질문"(부모 홈), 타입 C 개방·통풍.
- 상단 작은 산스 라벨: "8월 26일 화요일 · 스물세 번째 질문".
- 중앙: 질문을 명조 악센트, 잉크 #262A28, 약 30pt, 2~3줄, 얇은 세이지 구분선과 넓은
  여백에 띄우기(카드 없음): "처음 서울에 올라오던 날, 기억나세요?".
- 주 버튼: 큰 원형 세이지 그린 #3E6B54, 96pt, 흰 녹음 점 + 산스 "눌러서 이야기해 주세요".
- 낮은 강조 산스 링크 2개: "이 이야기는 넘어갈게요" · "지난 이야기 보기 →".
밝고 산뜻·넉넉한 공기. 탭바 없음. 아침에 창을 연 느낌.
```

### 4-C · C4 이야기 읽기·응원 (자녀)
**[EN]**
```
[PASTE TYPE C PREAMBLE FIRST]
Screen "이야기 읽기·응원" (child), Type C. Standard sizing, open airy layout.
- Date + question: sans labels with the question in serif accent, ink #262A28.
- Story as serif-accent body paragraph, ink #262A28, line-height 1.6, separated
  by a thin sage line (no card): "열아홉에 완행열차를 타고 올라왔어요. 서울역에 내리니 사람이 어찌나 많던지…".
- Audio row: a light inline ▶ "엄마 목소리로 듣기" with a slim sage progress bar.
- Cheer: an outline heart ❤️, input "한마디 남기기", light sans quick chips
  "엄마, 이 얘기 처음 들었어" · "오늘도 고마워요". Send in sage green #3E6B54.
Fresh, uncluttered, plenty of breathing room. No dashboard.
```
**[KR]**
```
[타입 C 프리앰블 먼저]
화면 "이야기 읽기·응원"(자녀), 타입 C. 일반 크기, 개방·통풍 레이아웃.
- 날짜+질문: 산스 라벨 + 질문은 명조 악센트, 잉크 #262A28.
- 이야기는 명조 악센트 본문 문단, 잉크 #262A28, 행간 1.6, 얇은 세이지 선으로 구분
  (카드 없음): "열아홉에 완행열차를 타고 올라왔어요. 서울역에 내리니 사람이 어찌나 많던지…".
- 원음 줄: 가벼운 인라인 ▶ "엄마 목소리로 듣기" + 슬림 세이지 진행 바.
- 응원: 외곽선 하트 ❤️, 입력 "한마디 남기기", 가벼운 산스 칩 "엄마, 이 얘기 처음
  들었어" · "오늘도 고마워요". 보내기 세이지 그린 #3E6B54.
산뜻·정돈·넉넉한 여백. 대시보드 없음.
```

### 4-C · C6 책 미리보기 (자녀)
**[EN]**
```
[PASTE TYPE C PREAMBLE FIRST]
Screen "책 미리보기" (child), Type C. Scroll top-to-bottom, open and light.
NO buy button.
- Sample label: "미리보기 — 지금까지 담긴 이야기로 미리 엮어봤어요".
- Book cover mockup: a clean, modern hardcover in off-white with a sage green
  spine/accent, serif title "김순자 이야기", subtitle "딸 이지혜가 묻고, 김순자가
  답하다", "2026". Minimal, bright, contemporary — not ornate.
- Table of contents as an airy list with thin lines, 7 chapters (어린 시절 / 고향과
  가족 / 배우자를 만나다 / 일과 살림 / 아이들 / 지금의 나날 / 전하고 싶은 말).
- A book spread: chapter title, story — date, question (serif accent), paragraph,
  "🔗 목소리로 듣기": "처음 서울에 올라오던 날 — 열아홉에 완행열차를…".
- Closing: "지금까지 23개의 이야기가 담겼어요 — 이야기가 쌓일수록 책이 두꺼워져요".
Bright, modern, breathable — a fresh keepsake.
```
**[KR]**
```
[타입 C 프리앰블 먼저]
화면 "책 미리보기"(자녀), 타입 C. 위→아래 스크롤, 개방·가벼움. 구매 버튼 없음.
- 샘플 라벨: "미리보기 — 지금까지 담긴 이야기로 미리 엮어봤어요".
- 표지 목업: 오프화이트에 세이지 그린 책등/악센트의 깔끔·현대적 양장, 명조 제호
  "김순자 이야기", 부제 "딸 이지혜가 묻고, 김순자가 답하다", "2026". 미니멀·밝음·
  현대적(장식과다 아님).
- 목차: 얇은 선의 통풍감 있는 리스트, 7장(어린 시절 / 고향과 가족 / 배우자를 만나다 /
  일과 살림 / 아이들 / 지금의 나날 / 전하고 싶은 말).
- 책 펼침면: 장 표제, 이야기 — 날짜·질문(명조 악센트)·문단·"🔗 목소리로 듣기":
  "처음 서울에 올라오던 날 — 열아홉에 완행열차를…".
- 마무리: "지금까지 23개의 이야기가 담겼어요 — 이야기가 쌓일수록 책이 두꺼워져요".
밝고 현대적·숨 쉬는 여백 — 산뜻한 소장품.
```

---

## 5. Stitch 사용 팁

1. **타입별 프리앰블을 매번 붙인다.** 한 타입을 고르면 그 타입의 프리앰블(영어)을
   새 화면마다 **맨 위에 그대로** 붙이고 화면 프롬프트를 이어 붙인다. 타입을 섞지 않는다.
2. **영어 기본, 한국어는 뉘앙스 확인용.** 단 화면 안 텍스트는 한국어로 나오도록
   프롬프트에 고정돼 있다.
3. **색은 hex로 고정.** 결과가 다른 색을 쓰면 "use exactly [배경 hex] background,
   [본문 hex] text, and [강조 hex] ONLY for the primary button"으로 다시 좁힌다.
4. **강조색 1점 규칙.** 타입 불문 강조색은 화면당 한 곳(주 버튼). 여러 색이 나오면
   "everything else is [본문 hex] on [배경 hex]"로 재지시.
5. **시니어 강조를 반복.** 부모 화면(P1)이 작게 나오면 "very large: question 28pt+,
   record button 96pt+ diameter, elderly-friendly but NOT clinical"을 다시 붙인다.
6. **비교는 같은 화면으로.** 세 타입을 고를 땐 **P1(또는 C6) 한 화면을 세 타입으로**
   각각 생성해 나란히 놓고 고르면 팔레트·구조 차이가 가장 선명하다.
7. **선택 후:** 고른 타입의 팔레트·타이포를 `BRAND.md §4`에 확정 반영하고 PD가
   디자인 토큰으로 파생한다. Stitch 시안은 컨셉이며 대외 유통은 PO 승인 사안.

---

*팔레트 대비비는 상대 휘도 근사 계산치 — PD 토큰화 시 재검증. 접근성 수치의 정본은
`PRD.md §9-5`, 브랜드 톤·용어의 정본은 `BRAND.md`. 충돌 시 원본이 이긴다.*
