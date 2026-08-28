# DESIGN_CONCEPT — 하루담 (ハルダム) · 컨셉 시안 + Google Stitch 프롬프트

- 작성: BRAND · 2026-08-28 (결정 #6 "하루담 확정 + Stitch 프롬프트")
- 용도: **PO가 이 문서의 프롬프트를 Google Stitch에 붙여 컨셉 시안을 생성**한다.
- 원본: `BRAND.md`(§2 에센스·§3 톤·§4 컬러/타이포/심볼) · `PRD.md §9`(화면 명세·
  §9-5 접근성 수치) · `prototype/index.html`(잠정 토큰·실제 구현 레퍼런스).
- 이 문서는 **원본이 아니라 파생**이다. 값이 어긋나면 `BRAND.md`·`PRD.md`가 이긴다.
- ⚠️ Stitch 산출물은 **컨셉 시안**이다 — 확정 디자인 시스템(토큰·컴포넌트)은 PD가
  `BRAND.md §4`에서 파생한다. 대외 유통은 PO 승인 사안.

---

## 1. 디자인 컨셉 한 장

### 무드 — "앱이 아니라 편지, 화면이 아니라 지면"

하루담은 **따뜻한 종이 위에 먹으로 쓴 손편지**의 정서다. 부모(60~75세)가 매일 아침
여는 화면은 앱테크의 대시보드가 아니라, 하루치 이야기를 담는 **조용한 그릇**이어야
한다. 이름 그대로 — 하루가 담기고(담다=그릇·켜), 날들이 쌓여 한 권이 되고(→책),
ハル(봄·맑음)의 밝고 따뜻한 온기가 흐른다.

### 원칙 요약 (BRAND.md §4 파생)

| 축 | 원칙 | 값 |
|---|---|---|
| **컬러** | 종이 미색 바탕 + 먹색 본문 + 저녁놀 주황 **강조 1점**. 앱테크식 다색·네온 금지 | 종이 `#FBF7EF` · 먹 `#2A241C` · 놀 `#B4542C` (다크: 종이 `#211C16` · 먹 `#EFE8DC` · 놀 `#E08A5C`) |
| **타이포** | **이야기는 명조(고운바탕), 손잡이(UI)는 산스(Noto Sans KR).** 명조는 읽는 것에만, 산스는 누르는 것에만 | 질문·이야기·로고 = Gowun Batang / 버튼·안내 = Noto Sans KR. 얇은 웨이트(300↓) 금지 |
| **모션** | 의미 전달용만(녹음 중 숨쉬는 원 등). 장식 모션·숫자 카운터 애니메이션 금지. `reduced-motion` 존중 | — |
| **접근성(부모)** | 큰 글씨·고대비·큰 탭이 **기본값**. 단, "시니어용"임을 광고하지 않는다 | 본문 20pt+ / 질문·이야기 28pt+ / 대비 7:1 / 탭 64pt+ / 녹음 버튼 96pt+ / 화면당 주 행동 1개 / 탭 제스처만 |
| **레이아웃** | 부모 화면은 **보이는 버튼이 전부** — 탭바·햄버거·숨은 제스처 없음. 여백을 넉넉히 | — |

### 이 앱이 절대 아닌 것 (안티 무드 — 프롬프트에 매번 넣는다)

- **앱테크 아님:** 네온색, 포인트·코인·캐시, 배지·레벨·랭킹, 룰렛, 숫자 카운터
  애니메이션, 출석 도장, "미션/도전" 라벨. → **하나도 넣지 않는다.**
- **실버케어 아님:** 병원 하늘색+흰색, 휠체어·돋보기·약봉지 아이콘, "어르신 케어"
  라벨, 응급/모니터링 UI.
- **추모 아님:** 세피아·흑백, 국화, 촛불, 검은 리본. 우리는 **생전의 목소리**를 다룬다.
- **아동용 아님:** 유치한 일러스트, 과장된 이모지 떼, 파스텔 캐릭터, 반말 응원.
- **테크 제품 아님:** "AI가 생성", 그래프 대시보드, 다크 네이비 SaaS 룩.

---

## 2. Google Stitch 프롬프트 세트

**구조:** 아래 **공통 스타일 프리앰블**을 먼저 정의하고, 화면별 프롬프트가 그것을
참조한다. Stitch는 화면 단위로 독립 생성하므로, **각 화면 프롬프트에도 핵심 3색·
폰트·접근성 요약을 압축해 다시 넣었다**(Stitch가 매번 같은 스타일을 재현하도록).
한국어·영어 프롬프트를 **둘 다** 제공한다 — Stitch는 영어가 더 안정적이니 **영어를
기본으로, 한국어는 뉘앙스 확인용**으로 쓴다.

---

### 2-0. 공통 스타일 프리앰블 (모든 화면 상단에 붙일 블록)

**[한국어 · STYLE PREAMBLE]**

```
브랜드: 하루담 — 부모님께 매일 한 가지 인생 질문을 여쭙고, 음성으로 답을 담아
1년 뒤 한 권의 책으로 엮어 자녀에게 전하는 모바일 앱. 정서는 "앱이 아니라 손편지,
화면이 아니라 종이 지면".

비주얼 스타일:
- 배경: 따뜻한 종이 미색 #FBF7EF (다크 모드 #211C16). 카드는 흰색 #FFFFFF, 얇은
  경계선 #E8DFD0.
- 본문 글자: 먹색 #2A241C (다크 #EFE8DC).
- 강조색: 저녁놀 주황 #B4542C 딱 한 곳에만 (주 버튼 등). 다색·네온·그라디언트 금지.
- 서체: 질문·이야기 본문·로고는 명조체(세리프, Gowun Batang 느낌), 버튼·안내·라벨은
  고딕 산세리프(Noto Sans KR 느낌). 얇은 폰트 금지, 넉넉한 자간·행간(1.6).
- 넉넉한 여백, 둥근 모서리(12~20px), 부드러운 그림자 최소.

접근성(부모용 화면일 때):
- 아주 큰 글씨: 본문 20pt+, 질문·이야기 28pt+, 버튼 라벨 22pt.
- 고대비(본문 대비 7:1), 큰 탭 영역(최소 64pt, 녹음 버튼 지름 96pt+).
- 화면당 주 버튼은 1개. 탭바·햄버거 메뉴·숨은 제스처 없음. 보이는 버튼이 전부.

절대 넣지 말 것: 포인트/코인/캐시/배지/레벨/랭킹/출석도장/룰렛, 네온색, 숫자
카운터 애니메이션, 병원 느낌(하늘색+흰색)·돋보기·휠체어 아이콘, 세피아·흑백·국화·
촛불(추모 느낌), 유치한 캐릭터, AI/대시보드/차트 느낌.
언어: 모든 텍스트는 한국어. 따뜻하고 존대하는 말투, 재촉·죄책감 표현 금지.
```

**[ENGLISH · STYLE PREAMBLE — 기본으로 사용]**

```
Brand: Harudam — a mobile app that asks an elderly parent (age 60–75) one life
question each morning, records their spoken answer, and after a year binds the
answers into a book for their adult child. Emotional tone: "a handwritten letter,
not an app; a paper page, not a screen."

Visual style:
- Background: warm paper cream #FBF7EF (dark mode #211C16). Cards white #FFFFFF
  with thin border #E8DFD0.
- Body text: ink #2A241C (dark mode #EFE8DC).
- Single accent: sunset orange #B4542C used in exactly ONE place per screen (the
  primary button). No multi-color, no neon, no gradients.
- Type: questions, story body text, and the logo use a Korean SERIF (like Gowun
  Batang); buttons, labels, and helper text use a Korean SANS-SERIF (like Noto
  Sans KR). No thin weights. Generous letter/line spacing (line-height 1.6).
- Ample whitespace, rounded corners (12–20px), minimal soft shadow.

Accessibility (for parent-facing screens):
- Very large type: body 20pt+, question/story 28pt+, button label 22pt.
- High contrast (body 7:1), large tap targets (min 64pt; record button 96pt+
  diameter). One primary button per screen. No tab bar, no hamburger, no hidden
  gestures — every action is a visible button.

Never include: points/coins/cash/badges/levels/rankings/attendance-stamps/
spin-wheels, neon colors, animated number counters, hospital look (sky-blue +
white), magnifier/wheelchair icons, sepia/black-white/chrysanthemum/candle
(funeral mood), childish characters, AI/dashboard/chart aesthetics.
Language: all copy in KOREAN, warm and respectful (honorific), never nagging or
guilt-inducing.
```

---

### 2-1. 부모 · P1 — 오늘의 질문 (홈, 가장 반복되는 화면)

- **목적:** 아침에 앱을 열면 **질문 하나만 크게** 보이고, 큰 버튼 하나로 녹음에
  들어간다. 제품의 실체가 되는 화면.
- **레이아웃:** 세로 1열. 상단 날짜·순번 → 중앙 큰 질문(명조) → 아래 큰 녹음 버튼
  → 보조 링크 2개(넘어가기·지난 이야기). 하단 탭바 없음.
- **핵심 요소:** 날짜/순번 라벨, 큰 질문 카드, 원형 녹음 버튼(지름 96pt+, 놀색),
  "이 이야기는 넘어갈게요"(작은 보조), "지난 이야기 보기 →".
- **더미:** "8월 26일 화요일 · 스물세 번째 질문" / 질문 "처음 서울에 올라오던 날,
  기억나세요?" / (응원 배너) "💛 지혜님이 응원을 보냈어요".
- **분위기:** 고요, 아침, 종이, 한 가지에 집중.

**[EN]**
```
[PASTE THE ENGLISH STYLE PREAMBLE ABOVE FIRST]

Screen: "Today's Question" — the parent's home screen (most-used screen).
A single mobile screen, vertical, warm paper background #FBF7EF.

Layout top to bottom:
1. Small top label in sans-serif, muted brown: date and count — "8월 26일 화요일 · 스물세 번째 질문".
2. (Optional) a soft cheer banner just below: a small heart with text "💛 지혜님이 응원을 보냈어요" on a very light warm tint — gentle, not a notification badge.
3. CENTER, dominant: one big question in KOREAN SERIF, ink #2A241C, ~30pt, 2–3 lines, generous line spacing:
   "처음 서울에 올라오던 날, 기억나세요?"
   This question is the hero of the screen — lots of space around it.
4. A large round primary button, sunset orange #B4542C, ~96pt diameter, with a small record/mic dot and white sans-serif label under or inside it: "눌러서 이야기해 주세요".
5. Two small secondary text links below, low emphasis, sans-serif: "이 이야기는 넘어갈게요" and "지난 이야기 보기 →".

No tab bar, no bottom navigation, no icons row. Only these visible actions.
Mood: quiet morning, paper, one thing at a time, warm and calm.
Very large text, high contrast, generous whitespace. Elderly-friendly but NOT clinical.
```

**[KR]**
```
[위 한국어 스타일 프리앰블을 먼저 붙이세요]

화면: "오늘의 질문" — 부모의 홈 화면(가장 자주 여는 화면). 세로 모바일 한 화면,
따뜻한 종이 배경 #FBF7EF.

위에서 아래로:
1. 상단 작은 라벨(산세리프, 흐린 갈색): 날짜와 순번 — "8월 26일 화요일 · 스물세 번째 질문".
2. (선택) 바로 아래 부드러운 응원 배너: 작은 하트 + "💛 지혜님이 응원을 보냈어요",
   아주 옅은 따뜻한 톤 배경. 알림 배지처럼 요란하지 않게.
3. 화면 중앙, 가장 크게: 질문 하나를 명조체(세리프), 먹색 #2A241C, 약 30pt, 2~3줄,
   넉넉한 행간 — "처음 서울에 올라오던 날, 기억나세요?". 질문이 화면의 주인공, 주위 여백 충분히.
4. 큰 원형 주 버튼, 저녁놀 주황 #B4542C, 지름 약 96pt, 작은 녹음 점 + 흰색 산세리프
   라벨 "눌러서 이야기해 주세요".
5. 아래 작은 보조 링크 2개(낮은 강조, 산세리프): "이 이야기는 넘어갈게요", "지난 이야기 보기 →".

탭바·하단 내비·아이콘 줄 없음. 보이는 행동은 이것뿐.
분위기: 고요한 아침, 종이, 한 번에 하나. 큰 글씨·고대비·넉넉한 여백. 노인 친화적이되 병원 느낌 아님.
```

---

### 2-2. 부모 · P2 — 녹음 (전체 화면 오버레이)

- **목적:** 말하는 동안 질문이 계속 보이고, "멈칫해도 괜찮다"를 화면이 보증한다.
- **레이아웃:** 전체 화면. 상단 질문(작게 유지) → 중앙 경과 시간 + 숨쉬는 원
  애니메이션 → 안내 문장 → 하단 큰 버튼 하나 "다 했어요".
- **핵심 요소:** 지속 표시(숨쉬는 원), 경과 시간 "0:42"(남은 시간·제한 없음),
  안심 문장, 단일 종료 버튼.
- **더미:** 질문 "처음 서울에 올라오던 날…" / "0:42" / "천천히, 편하게 말씀하세요"
  / "쉬어가도 녹음은 이어져요" / 버튼 "다 했어요".
- **분위기:** 안심, 넉넉함, 압박 없음.

**[EN]**
```
[PASTE THE ENGLISH STYLE PREAMBLE FIRST]

Screen: "Recording" — a full-screen overlay while the parent speaks their answer.
Warm paper background #FBF7EF, calm and reassuring.

Top to bottom:
1. The question stays visible at top, serif, ink, ~22pt, softened: "처음 서울에 올라오던 날…".
2. CENTER: a gentle "breathing" circle animation in sunset orange #B4542C (a soft pulsing ring), with elapsed time beside/below it in sans-serif: "0:42". Show ONLY elapsed time — no countdown, no time limit, no waveform bars.
3. Two lines of reassuring helper text, sans-serif, muted: "천천히, 편하게 말씀하세요" and "쉬어가도 녹음은 이어져요".
4. Bottom: ONE large button, ~64pt tall, "다 했어요".

No pause/stop/delete clutter. Only the single "다 했어요" button.
Mood: safe, unhurried, no pressure. Large text, lots of breathing room.
```

**[KR]**
```
[위 한국어 스타일 프리앰블을 먼저 붙이세요]

화면: "녹음 중" — 부모가 답을 말하는 동안의 전체 화면 오버레이. 따뜻한 종이 배경
#FBF7EF, 차분하고 안심되는 느낌.

위에서 아래로:
1. 질문이 상단에 계속 보임(세리프, 먹색, 약 22pt, 부드럽게): "처음 서울에 올라오던 날…".
2. 중앙: 부드럽게 맥동하는 "숨쉬는 원" 애니메이션(저녁놀 주황 #B4542C), 옆/아래에
   경과 시간 산세리프 "0:42". 경과 시간만 — 카운트다운·제한 시간·파형 막대 없음.
3. 안심 문장 두 줄(산세리프, 흐리게): "천천히, 편하게 말씀하세요", "쉬어가도 녹음은 이어져요".
4. 하단: 큰 버튼 하나(높이 약 64pt) "다 했어요".

일시정지·정지·삭제 버튼 없음. "다 했어요" 하나뿐.
분위기: 안심, 서두르지 않음, 압박 없음. 큰 글씨, 넉넉한 여백.
```

---

### 2-3. 부모 · P3 — 지난 이야기 (모아보기)

- **목적:** 쌓인 이야기가 눈에 보인다 — "차곡차곡 쌓임"의 부모 쪽 표면.
- **레이아웃:** 상단 제목 → 날짜 내림차순 리스트. 각 항목 = 날짜 · 질문(명조 발췌)
  · 상태 배지(정리된 글 / 🌙 밤사이 정리 중 / 원음만).
- **핵심 요소:** 리스트 카드(넉넉한 높이·큰 글씨), 상태를 색만이 아니라 문구+아이콘으로.
- **더미:** "8월 25일 · 어머니가 좋아하시던 노래는?" (정리된 글) / "8월 24일 ·
  형제 중 몇째로 자라셨어요?" (🌙 밤사이 정리 중) / "8월 23일 · 처음 서울에 올라오던 날…" (정리된 글).
- **분위기:** 앨범을 넘기듯, 따뜻한 축적.

**[EN]**
```
[PASTE THE ENGLISH STYLE PREAMBLE FIRST]

Screen: "Past Stories" — the parent's archive of accumulated answers.
Warm paper background, like flipping through an album.

Layout:
1. Top title, serif, ink, ~24pt: "지난 이야기".
2. A vertical list, newest first. Each row is a large, tall card (comfortable spacing) with:
   - date in small sans-serif: "8월 25일"
   - the question excerpt in serif, ink, ~20pt: "어머니가 좋아하시던 노래는?"
   - a status chip using BOTH text and a small icon (not color alone): "정리된 글" (done), or "🌙 밤사이 정리 중" (being written overnight), or "원음만" (voice only).
   Example rows:
   • 8월 25일 · "어머니가 좋아하시던 노래는?" · 정리된 글
   • 8월 24일 · "형제 중 몇째로 자라셨어요?" · 🌙 밤사이 정리 중
   • 8월 23일 · "처음 서울에 올라오던 날…" · 정리된 글

Large text, high contrast, generous row height and spacing. No tab bar.
Mood: warm accumulation, a growing collection you can feel.
```

**[KR]**
```
[위 한국어 스타일 프리앰블을 먼저 붙이세요]

화면: "지난 이야기" — 부모의 쌓인 답변 모아보기. 앨범을 넘기듯 따뜻한 종이 배경.

구성:
1. 상단 제목(세리프, 먹색, 약 24pt): "지난 이야기".
2. 세로 리스트, 최신순. 각 행은 크고 높은 카드(넉넉한 간격):
   - 날짜(작은 산세리프): "8월 25일"
   - 질문 발췌(세리프, 먹색, 약 20pt): "어머니가 좋아하시던 노래는?"
   - 상태 칩은 색만이 아니라 문구+작은 아이콘 함께: "정리된 글" / "🌙 밤사이 정리 중" / "원음만".
   예시 행:
   • 8월 25일 · "어머니가 좋아하시던 노래는?" · 정리된 글
   • 8월 24일 · "형제 중 몇째로 자라셨어요?" · 🌙 밤사이 정리 중
   • 8월 23일 · "처음 서울에 올라오던 날…" · 정리된 글

큰 글씨·고대비·넉넉한 행 높이. 탭바 없음.
분위기: 따뜻한 축적, 자라나는 수집.
```

---

### 2-4. 자녀 · C1 — 신청·프로필 (2단계)

- **목적:** 자녀가 부모 정보를 입력해 질문을 맞춤화한다. 자녀용이라 일반 모바일
  관례를 따르되 하루담의 종이 정서는 유지.
- **레이아웃:** 2단계. C1a(필수 3항목: 부모 호칭·성함·내 이름) → C1b(선택 프로필
  5문항 + 민감 주제 스위치). 진행 표시(1/2, 2/2).
- **핵심 요소:** 입력 필드, 선택 칩(고향·결혼상태 등), "여쭙지 않을 이야기" 토글 3개,
  분기 미리보기 안내 카드, 하단 다음/완료 버튼.
- **더미:** 호칭 "어머니" / 성함 "김순자" / 내 이름 "이지혜" / 고향 "서울" /
  분기 예시 카드 "서울을 고르셨어요 → '처음 서울에 올라오던 날' 질문이 '어릴 적
  살던 동네' 질문으로 바뀌어요." / 민감 주제 "배우자 이야기 · 투병·건강 · 돈·재산".
- **분위기:** 정성껏 채우는 선물 준비, 따뜻함.

**[EN]**
```
[PASTE THE ENGLISH STYLE PREAMBLE FIRST — but this is a CHILD-facing screen:
use standard mobile sizing (body ~16pt, tap ~44pt), keep the paper/serif brand
mood, accent #B4542C for the primary button only.]

Screen: "Sign-up & Profile" (adult child), step 2 of 2. Warm paper background,
serif for headings, sans-serif for form fields.

Layout:
1. Small step indicator "2 / 2" and heading in serif: "어머니를 더 알려주세요".
2. Helper line, muted: "알려주실수록 질문이 어머니의 인생에 더 잘 맞아져요."
3. Optional profile fields as friendly chips/inputs: 고향, 결혼/사별/이혼, 형제 구성, 자녀 구성, 주로 하신 일. Example filled: 고향 = "서울".
4. A soft preview card (light warm tint) showing the branching in action:
   "서울을 고르셨어요 → '처음 서울에 올라오던 날' 질문이 '어릴 적 살던 동네' 질문으로 바뀌어요."
5. A section "여쭙지 않을 이야기" with three gentle toggles, all ON by default:
   배우자 이야기 · 투병·건강 · 돈·재산. Helper: "가족마다 꺼내기 어려운 이야기가 있어요. 여기서 빼두면 여쭙지 않아요."
6. Bottom primary button, sunset orange #B4542C: "다음으로".

Mood: lovingly preparing a gift, warm and unhurried. Not a cold form.
```

**[KR]**
```
[위 한국어 스타일 프리앰블을 먼저 붙이세요 — 단 이 화면은 자녀용: 일반 모바일
크기(본문 약 16pt, 탭 약 44pt) 사용, 종이·명조 브랜드 무드는 유지, 강조색
#B4542C는 주 버튼에만.]

화면: "신청·프로필"(자녀), 2단계 중 2단계. 따뜻한 종이 배경, 제목은 명조, 입력은 산세리프.

구성:
1. 작은 단계 표시 "2 / 2" + 명조 제목: "어머니를 더 알려주세요".
2. 안내 한 줄(흐리게): "알려주실수록 질문이 어머니의 인생에 더 잘 맞아져요."
3. 선택 프로필 입력을 친근한 칩/필드로: 고향, 결혼/사별/이혼, 형제 구성, 자녀 구성,
   주로 하신 일. 예시 입력: 고향 = "서울".
4. 분기를 보여주는 부드러운 미리보기 카드(옅은 따뜻한 톤):
   "서울을 고르셨어요 → '처음 서울에 올라오던 날' 질문이 '어릴 적 살던 동네' 질문으로 바뀌어요."
5. "여쭙지 않을 이야기" 섹션에 부드러운 토글 3개(기본 전부 켜짐):
   배우자 이야기 · 투병·건강 · 돈·재산. 안내: "가족마다 꺼내기 어려운 이야기가 있어요. 여기서 빼두면 여쭙지 않아요."
6. 하단 주 버튼(저녁놀 주황 #B4542C): "다음으로".

분위기: 정성껏 선물을 준비하는 느낌, 따뜻하고 서두르지 않음. 차가운 폼 아님.
```

---

### 2-5. 자녀 · C4 — 이야기 읽기 + 응원 (가장 반복)

- **목적:** 부모의 정리된 글을 읽고, 원음을 듣고, 30초 안에 응원을 보낸다.
  이 30초가 부모 지속(G2)의 반대편 절반.
- **레이아웃:** 상단 날짜·질문 → 정리된 글(명조 본문) → ▶ 원음 플레이어("엄마
  목소리") → 하단 응원 영역(하트 + 한마디 입력 + 빠른 문구 칩).
- **핵심 요소:** 읽기 좋은 본문, 원음 플레이어(정서 자산이라 눈에 띄게), 하트 버튼,
  빠른 문구 칩 2~3개.
- **더미:** 날짜 "8월 23일" / 질문 "처음 서울에 올라오던 날, 기억나세요?" / 본문
  발췌 "열아홉에 완행열차를 타고… 서울역에 내리니 사람이 어찌나 많던지…" / 빠른
  문구 칩 "엄마, 이 얘기 처음 들었어" · "오늘도 고마워요" · "❤️".
- **분위기:** 몰랐던 이야기를 발견하는 뭉클함, 따뜻한 편지.

**[EN]**
```
[PASTE THE ENGLISH STYLE PREAMBLE FIRST — child-facing: standard mobile sizing,
paper/serif brand mood, accent #B4542C for the primary cheer action only.]

Screen: "Read & Cheer" (adult child) — reads the parent's story and sends a
30-second cheer. Warm paper background.

Layout top to bottom:
1. Date + question, serif, ink: "8월 23일" / "처음 서울에 올라오던 날, 기억나세요?".
2. The transcribed story as a comfortable SERIF body paragraph, ink #2A241C, ~17pt, line-height 1.6:
   "열아홉에 완행열차를 타고 올라왔어요. 서울역에 내리니 사람이 어찌나 많던지, 손에 쥔 주소 쪽지만 보고 걸었지요…"
3. A prominent audio player row: ▶ play control + label "엄마 목소리로 듣기" and a simple progress bar. This is an emotional centerpiece — make it inviting, warm, not techy.
4. Bottom cheer area: a heart button ❤️, a one-line text input "한마디 남기기", and 2–3 quick reply chips:
   "엄마, 이 얘기 처음 들었어" · "오늘도 고마워요" · "❤️".
   Primary send emphasis uses accent #B4542C.

Mood: discovering a story you never knew, tender, like a warm letter.
No dashboard, no stats, no read-receipt clutter.
```

**[KR]**
```
[위 한국어 스타일 프리앰블을 먼저 붙이세요 — 자녀용: 일반 모바일 크기, 종이·명조
무드 유지, 강조색 #B4542C는 주 응원 버튼에만.]

화면: "이야기 읽기·응원"(자녀) — 부모의 정리된 글을 읽고 30초 안에 응원 보내기.
따뜻한 종이 배경.

위에서 아래로:
1. 날짜 + 질문(세리프, 먹색): "8월 23일" / "처음 서울에 올라오던 날, 기억나세요?".
2. 정리된 글을 읽기 좋은 세리프 본문 문단으로, 먹색 #2A241C, 약 17pt, 행간 1.6:
   "열아홉에 완행열차를 타고 올라왔어요. 서울역에 내리니 사람이 어찌나 많던지, 손에 쥔 주소 쪽지만 보고 걸었지요…"
3. 눈에 띄는 원음 플레이어 줄: ▶ 재생 + 라벨 "엄마 목소리로 듣기" + 단순 진행 바.
   이 제품의 정서 자산이므로 따뜻하고 다정하게, 기술적으로 보이지 않게.
4. 하단 응원 영역: 하트 버튼 ❤️, 한 줄 입력 "한마디 남기기", 빠른 문구 칩 2~3개:
   "엄마, 이 얘기 처음 들었어" · "오늘도 고마워요" · "❤️". 보내기 강조는 강조색 #B4542C.

분위기: 몰랐던 이야기를 발견하는 뭉클함, 따뜻한 편지. 대시보드·통계·읽음표시 잡동사니 없음.
```

---

### 2-6. 자녀 · C5 — 모아보기 (진행감)

- **목적:** "책이 되어가는 중"을 진행 카드로 보여준다 — 1년 뒤 책의 선행 신호.
- **레이아웃:** 상단 진행 카드("23번째 이야기 / 365" + 진행 바 + [책으로 미리보기])
  → 아래 날짜순 리스트(질문 요약 + 첫 문장), 월 단위 구분선.
- **핵심 요소:** 진행 카드(숫자 강조하되 게임 점수 느낌 금지), 책 미리보기 진입 버튼,
  이야기 리스트.
- **더미:** 진행 "23 / 365" / 리스트 "8월 23일 · 처음 서울에 올라오던 날 — 열아홉에
  완행열차를…" 등 · 월 구분선 "8월".
- **분위기:** 자라나는 책, 뿌듯한 축적. 리워드 대시보드 아님.

**[EN]**
```
[PASTE THE ENGLISH STYLE PREAMBLE FIRST — child-facing: standard mobile sizing,
paper/serif brand mood, accent #B4542C used sparingly.]

Screen: "Collection" (adult child) — shows progress toward the 1-year book.
Warm paper background.

Layout:
1. Top progress card on a soft warm tint: large serif line "23번째 이야기 / 365"
   with a slim progress bar, and a caption "책이 되어가는 중". Include a button
   "책으로 미리보기" (outline or accent-tinted, calm — NOT a flashy CTA).
   The number should feel like pages of a book filling up, NOT a game score or
   points balance.
2. Below, a date-ordered list grouped by month (a thin "8월" divider). Each row:
   date + question summary + first sentence, serif:
   • 8월 23일 · 처음 서울에 올라오던 날 — "열아홉에 완행열차를 타고 올라왔어요…"
   • 8월 22일 · 어머니가 좋아하시던 노래 — "라디오에서 이미자 노래가 나오면…"
Mood: a book growing thicker, quiet pride. Absolutely no reward-dashboard feel.
```

**[KR]**
```
[위 한국어 스타일 프리앰블을 먼저 붙이세요 — 자녀용: 일반 모바일 크기, 종이·명조
무드 유지, 강조색 #B4542C는 절제해서.]

화면: "모아보기"(자녀) — 1년 뒤 책을 향한 진행감. 따뜻한 종이 배경.

구성:
1. 상단 진행 카드(옅은 따뜻한 톤): 큰 세리프 "23번째 이야기 / 365" + 얇은 진행 바 +
   설명 "책이 되어가는 중". 버튼 "책으로 미리보기"(외곽선 또는 강조 옅게, 차분하게 —
   요란한 CTA 아님). 숫자는 게임 점수·포인트 잔액이 아니라 **책장이 차오르는 느낌**.
2. 아래 날짜순 리스트, 월 단위 구분(얇은 "8월" 구분선). 각 행: 날짜 + 질문 요약 +
   첫 문장(세리프):
   • 8월 23일 · 처음 서울에 올라오던 날 — "열아홉에 완행열차를 타고 올라왔어요…"
   • 8월 22일 · 어머니가 좋아하시던 노래 — "라디오에서 이미자 노래가 나오면…"
분위기: 두꺼워지는 책, 조용한 뿌듯함. 리워드 대시보드 느낌 절대 금지.
```

---

### 2-7. 자녀 · C6 — 책 미리보기

- **목적:** "1년 뒤 책"을 문장이 아니라 **물건의 형태**로 보여준다. 설득의 착지점.
- **레이아웃:** 세로 스크롤로 책을 넘기는 한 흐름 — 상단 샘플 라벨 → 표지 → 목차 →
  본문 펼침면 → 진행 꼬리. **주문·결제 버튼 없음**(MVP 무결제).
- **핵심 요소:** 양장본 표지 목업(제호=부모 성함), 목차(챕터), 본문 펼침면(질문+
  정리본+QR 원음 마크), 샘플임을 밝히는 라벨.
- **더미:** 샘플 라벨 "미리보기 — 지금까지 담긴 이야기로 미리 엮어봤어요" / 표지
  "김순자 이야기" · 부제 "딸 이지혜가 묻고, 김순자가 답하다 · 2026" / 목차 "어린
  시절 / 고향과 가족 / 배우자를 만나다 / 일과 살림 / 아이들 / 지금의 나날 / 전하고
  싶은 말" / 본문 "처음 서울에 올라오던 날 — 열아홉에 완행열차를…" + "🔗 목소리로 듣기".
- **분위기:** 손에 잡히는 유산, 진짜 책을 여는 설렘. 따뜻한 양장본.

**[EN]**
```
[PASTE THE ENGLISH STYLE PREAMBLE FIRST — child-facing, but this screen is the
most emotional: lean into the "real book" feeling. Paper + serif throughout.]

Screen: "Book Preview" (adult child) — shows the future book as a physical
OBJECT, scrolled top to bottom like flipping through it. Warm paper background.

Sections top to bottom:
1. A fixed sample label at top, gentle: "미리보기 — 지금까지 담긴 이야기로 미리 엮어봤어요". NO order/buy/checkout button anywhere (this is a free preview).
2. A hardcover BOOK COVER mockup: warm cloth/paper cover, serif title "김순자 이야기", subtitle "딸 이지혜가 묻고, 김순자가 답하다", year "2026". Elegant, like a keepsake memoir — not a product mockup, not glossy.
3. A table of contents in serif, 7 chapters: 어린 시절 / 고향과 가족 / 배우자를 만나다 / 일과 살림 / 아이들 / 지금의 나날 / 전하고 싶은 말, each with a small count of stories.
4. A two-page book spread: chapter title, then one story — date, question (serif), transcribed paragraph, and a small "🔗 목소리로 듣기" mark (a QR-like voice tag):
   "처음 서울에 올라오던 날 — 열아홉에 완행열차를 타고 올라왔어요…"
5. A closing line: "지금까지 23개의 이야기가 담겼어요 — 이야기가 쌓일수록 책이 두꺼워져요."

Mood: a keepsake you can almost hold, the excitement of opening a real book. Warm hardcover, timeless.
```

**[KR]**
```
[위 한국어 스타일 프리앰블을 먼저 붙이세요 — 자녀용이지만 가장 감성적인 화면:
"진짜 책"의 느낌을 살린다. 전체 종이+명조.]

화면: "책 미리보기"(자녀) — 1년 뒤 책을 **물건의 형태**로, 위에서 아래로 넘기며 보는
한 흐름. 따뜻한 종이 배경.

위에서 아래로:
1. 상단 고정 샘플 라벨(부드럽게): "미리보기 — 지금까지 담긴 이야기로 미리 엮어봤어요".
   주문·구매·결제 버튼 어디에도 없음(무료 미리보기).
2. 양장본 표지 목업: 따뜻한 천/종이 표지, 세리프 제호 "김순자 이야기", 부제 "딸
   이지혜가 묻고, 김순자가 답하다", 연도 "2026". 소장용 회고록처럼 우아하게 — 제품
   목업·번쩍이는 느낌 아님.
3. 세리프 목차, 7장: 어린 시절 / 고향과 가족 / 배우자를 만나다 / 일과 살림 / 아이들 /
   지금의 나날 / 전하고 싶은 말. 각 장 옆 작은 이야기 수.
4. 책 펼침면: 장 표제 → 이야기 하나 — 날짜, 질문(세리프), 정리본 문단, 작은
   "🔗 목소리로 듣기" 마크(QR 같은 음성 태그):
   "처음 서울에 올라오던 날 — 열아홉에 완행열차를 타고 올라왔어요…"
5. 마무리 문장: "지금까지 23개의 이야기가 담겼어요 — 이야기가 쌓일수록 책이 두꺼워져요."

분위기: 손에 잡힐 듯한 소장품, 진짜 책을 여는 설렘. 따뜻한 양장본, 시간을 타지 않는.
```

---

### 2-8. G1 랜딩 (사전예약 · 자녀 대상)

- **목적:** "더 늦기 전에 물어보세요"로 멈칫하게 하고 사전예약(연락처 1칸)을 받는다.
  지불 의사 검증 장치(G1). **가격·출시일 없음**, 실물 책 과장 목업 없음.
- **레이아웃:** 모바일 1장 세로. L1 헤드 → L2 질문 카드 → L3 작동 3단계 → L4 정서
  블록 → L5 사전예약 폼(연락처 1칸) → L6 신뢰 꼬리.
- **핵심 요소:** 활자 히어로(이미지 없이 헤드라인), 하루담 로고(명조), 실제 예시
  질문 카드, 3단계 설명, 연락처 입력 1칸 + 버튼.
- **더미:** 헤드라인 "더 늦기 전에 물어보세요" / 서브 "부모님이 살아 계신 동안,
  부모님의 목소리로." / 질문 카드 "처음 서울에 올라오던 날, 기억나세요?" / 3단계
  "매일 아침 질문 하나 → 부모님은 말로 답 → 1년 뒤 한 권의 책" / 정서 "선물한
  사람은 당신인데, 선물을 받는 쪽도 당신일 거예요." / 폼 "연락처를 남겨주세요" ·
  버튼 "오픈 소식 받기" / 꼬리 "가격은 정식 오픈 때 알려드려요 · 연락처는 안내
  외에 쓰지 않아요".
- **분위기:** 활자 중심의 담백한 감성, 편지 같은 랜딩. 광고 배너 아님.

**[EN]**
```
[PASTE THE ENGLISH STYLE PREAMBLE FIRST — this is a marketing landing page for
adult children. Keep it typographic and emotional, NOT a salesy ad.]

Screen: a single-page mobile LANDING PAGE for a pre-registration (waitlist).
Warm paper background, serif headline as the hero (NO hero photo).

Sections top to bottom:
1. Small eyebrow "사전예약" + the Harudam wordmark in Korean serif ("하루담").
   Big serif headline, ink #2A241C: "더 늦기 전에 물어보세요". One-line subhead,
   muted: "부모님이 살아 계신 동안, 부모님의 목소리로."
2. A sample question card, serif, large: "처음 서울에 올라오던 날, 기억나세요?".
3. A 3-step "how it works", numbered, sans-serif: 1) 매일 아침 질문 하나 → 2) 부모님은 말로 답하세요 → 3) 1년 뒤 한 권의 책. Keep step 3 as TEXT only — do NOT draw a fake finished-book image.
4. An emotional block, 2 lines, serif: "선물한 사람은 당신인데, 선물을 받는 쪽도 당신일 거예요."
5. A pre-registration form: ONE contact field "연락처를 남겨주세요" + primary button in accent #B4542C "오픈 소식 받기". NO price, NO launch date.
6. A trust footer line, small muted: "가격은 정식 오픈 때 알려드려요 · 연락처는 안내 외에 쓰지 않아요".

Mood: quiet, typographic, letter-like. Warm and sincere. Not an ad banner, no stock smiling-family photo, no price tags, no app-store badges.
```

**[KR]**
```
[위 한국어 스타일 프리앰블을 먼저 붙이세요 — 자녀 대상 마케팅 랜딩. 활자 중심의
감성으로, 판매용 광고 느낌 금지.]

화면: 사전예약(대기자 명단)용 모바일 랜딩 1장. 따뜻한 종이 배경, 명조 헤드라인이
히어로(히어로 사진 없음).

위에서 아래로:
1. 작은 아이브로 "사전예약" + 하루담 워드마크(명조 "하루담"). 큰 명조 헤드라인,
   먹색 #2A241C: "더 늦기 전에 물어보세요". 한 줄 서브(흐리게): "부모님이 살아 계신 동안, 부모님의 목소리로."
2. 예시 질문 카드(세리프, 크게): "처음 서울에 올라오던 날, 기억나세요?".
3. 작동 방식 3단계(번호, 산세리프): 1) 매일 아침 질문 하나 → 2) 부모님은 말로 답하세요
   → 3) 1년 뒤 한 권의 책. 3단계는 문장으로만 — 완성된 책 가짜 이미지 그리지 말 것.
4. 정서 블록 2줄(세리프): "선물한 사람은 당신인데, 선물을 받는 쪽도 당신일 거예요."
5. 사전예약 폼: 연락처 입력 1칸 "연락처를 남겨주세요" + 강조색 #B4542C 주 버튼
   "오픈 소식 받기". 가격·출시일 없음.
6. 신뢰 꼬리 한 줄(작고 흐리게): "가격은 정식 오픈 때 알려드려요 · 연락처는 안내 외에 쓰지 않아요".

분위기: 고요하고 활자 중심, 편지 같은 랜딩. 광고 배너·웃는 가족 스톡사진·가격표·
스토어 배지 없음.
```

---

## 3. Stitch 사용 팁 — 일관성 유지

1. **프리앰블을 매번 붙인다.** Stitch는 화면마다 독립 생성하므로, 새 화면을 만들
   때마다 §2-0 스타일 프리앰블(영어)을 **맨 위에 그대로** 붙이고 그 아래 화면
   프롬프트를 이어 붙인다. 프리앰블을 생략하면 색·폰트가 화면마다 달라진다.
2. **영어를 기본으로.** Stitch는 영어 프롬프트가 레이아웃·스타일을 더 안정적으로
   반영한다. 한국어 프롬프트는 더미 문구의 뉘앙스 확인·수정용으로 쓴다. 단 **화면
   안의 텍스트는 한국어로** 나오게 프롬프트에 못 박혀 있다.
3. **색은 hex로 고정.** "따뜻한 주황" 대신 항상 `#B4542C`처럼 hex로 지정한다.
   생성물이 다른 색을 쓰면 "use exactly #B4542C for the button, nothing else
   colored"로 다시 지시한다.
4. **강조색 1점 규칙을 반복한다.** 결과가 여러 색을 쓰면 "only the primary button
   is colored (#B4542C); everything else is ink #2A241C on paper #FBF7EF"로 좁힌다.
5. **부모 화면은 "elderly-friendly, NOT clinical"을 명시.** Stitch가 병원/실버케어
   룩(하늘색·돋보기)으로 흐르면 §1의 안티 무드 목록을 프롬프트에 다시 붙인다.
6. **폰트는 성격으로 지정.** Stitch가 특정 한글 웹폰트를 못 쓸 수 있으니 "Korean
   serif like Gowun Batang / Korean sans like Noto Sans KR"처럼 **성격 + 예시**로
   준다. 결과 확인 후 실제 구현은 PD가 `BRAND.md §4-2` 서체로 확정한다.
7. **다크 모드가 필요하면** 프리앰블의 다크 값(`#211C16`/`#EFE8DC`/`#E08A5C`)으로
   "dark mode variant"를 따로 생성한다 — 라이트/다크는 한 쌍이다(§4-1).
8. **생성물은 컨셉이다.** 화면 흐름·상태(로딩/빈/오류/오프라인)의 정본은 `PRD.md §9`,
   디자인 토큰의 정본은 `BRAND.md §4`. Stitch 시안이 이들과 어긋나면 문서가 이긴다.

---

*이 문서의 값(색 hex·폰트·접근성 수치)은 `BRAND.md §4`·`PRD.md §9-5`에서 파생했다.
원본이 바뀌면 이 문서도 같은 세션에서 갱신한다 (단일 진실 공급원, TEAM.md 규칙 8).*
