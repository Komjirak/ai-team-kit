# 하루담 (가칭 · ハルダム)

> 시니어 하루 한 질문 자서전 서비스. **부모가 매일 한 질문에 답(녹음/타자)하면,
> 밤사이 이야기로 정리되고, 자녀가 읽고 응원하며, 쌓여서 한 권의 책이 된다.**
>
> 이 저장소는 `Komjirak/ai-team-kit`의 `apps/senior-diary/`에서 분리됐다.
> 분리 이전의 상세 히스토리는 ai-team-kit에 남아 있다.
> **제품명 "하루담"은 가칭** — 상표(KIPRIS·J-PlatPat)·도메인 정밀 확인 전까지
> 대외 노출물에는 가칭 표기를 유지한다 (docs/DECISIONS.md #6).

## 지금 상태 (한 줄)

**체험 가능한 local-first MVP 동작** + 실구현 컨셉 문서 세트 완비. 플랫폼은
**비대칭 하이브리드 + 카카오 알림톡** 확정(결정 #10). 다음은 하이브리드 재설계
(자녀 웹 분리) + 확정 기능 4건(#9) 반영.

## 저장소 구조

```
harudam/
├── README.md              ← 지금 이 파일
├── AGENTS.md · CLAUDE.md · TEAM.md   팀 프레임워크(오케스트레이터+9역할 하네스)
├── .claude/agents/        역할별 서브에이전트 하네스 9종
├── docs/                  기획·설계·리서치 문서 + 팀 기록(HARNESS·DECISIONS)
│   └── README.md          ← 문서 인덱스(여기부터 읽어라)
├── design/                디자인 시스템(Stitch 산출물)·시안
├── prototype/             클릭 프로토타입(단일 HTML)
└── app/                   RN/Expo 앱 (체험 MVP — local-first)
```

## 앱 돌려보기 (체험 MVP)

```bash
cd app
npm install
npm run web          # 브라우저에서 (가장 빠름) — 또는 npx expo start (폰 Expo Go)
```
첫 화면은 "둘러보기(점검) 인덱스". 체험 순서는 `app/README.md` 참조
(부모 녹음 → 데모 도구 🌙 지금 정리하기 → 자녀 C4 응원 → 부모 P1 응원 배너).

## 다음 세션에서 이어서 개발하기 (차근차근)

1. **`docs/HARNESS.md`를 먼저 읽는다** — 지금 상태·다음 할 일·검증 게이트.
2. **`docs/DECISIONS.md`** — PO 결정 #1~#10 (특히 #8·#10 하이브리드 플랫폼).
3. **`docs/BACKLOG.md`** — 실구현 착수 순서(에픽 E0~E8·스토리). "무엇부터"의 정본.
4. `TEAM.md` — 조직·위임 규칙. 역할 작업은 `.claude/agents/<역할>.md`를 읽고 시작.

## 핵심 문서 (docs/)

| 축 | 문서 |
|---|---|
| 사업·경쟁·차별화 | `BUSINESS_CASE.md` |
| 제품 정의·기능 | `PRD.md` · `IA.md` · `PRD_PROPOSALS.md` |
| 브랜드·네이밍·워딩 | `BRAND.md` |
| 디자인 | `DESIGN_GUIDE.md` · `DESIGN_CONCEPT.md` · `DESIGN_VARIANTS.md` |
| 백엔드·기술 | `BE_ARCHITECTURE.md` · `SPIKE_MVP_TECH.md` · `SPIKE_REALTIME_STT_WEB.md` |
| 플랫폼·결제 정책 | `PLATFORM_BM_ANALYSIS.md` · `RESEARCH_STORE_STEERING.md` |
| 개발 프로세스·QA | `APP_PROCESS.md` · `QA_CHECKLIST.md` · `BACKLOG.md` |
| 결정 요약 | `DECISION_BRIEF_v2.md` |

전체 인덱스: [`docs/README.md`](./docs/README.md).
