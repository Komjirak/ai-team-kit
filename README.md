# AI Team Starter Kit

신규 애플리케이션을 PRD부터 출시·운영까지 한 팀으로 만들며 쌓인 경험을,
**다음 서비스를 만들 때 그대로 꺼내 쓰는 팀 구성**으로 증류한 킷입니다.

한 사람(PO) + Claude 멀티에이전트가 하나의 프로덕션 팀으로 움직이기 위한
조직도 · 일하는 방식 · 규칙 · 역할별 하네스가 들어 있습니다.

## 구성

```
ai-team-kit/
├── README.md                  ← 이 문서 (킷 사용법)
├── TEAM.md                    ← 조직도 · 일하는 방식 · 팀 규칙 (헌법)
├── AGENTS.md                  ← 세션 부트스트랩 (Claude가 자동으로 읽는 지시)
├── CLAUDE.md                  ← AGENTS.md 참조 링크
├── docs/
│   ├── HARNESS.md             ← 프로젝트 상태 하네스 템플릿 (세션 간 인수인계의 축)
│   ├── DECISIONS.md           ← PO 결정 로그 템플릿
│   └── PLAYBOOKS/
│       ├── APP_STORE_REVIEW.md    ← 심사 대응 (채록: 4제출 3반려 8일의 교훈)
│       ├── OTA_AND_BUILDS.md      ← OTA·빌드 예산 운용
│       ├── PAYMENTS_IAP.md        ← 인앱결제·구독 정체성 모델
│       └── DEBUGGING_PRINCIPLES.md← 사고에서 뽑은 디버깅 원칙
└── .claude/
    ├── agents/                ← 역할별 서브에이전트 정의 + 하네스
    │   ├── bd.md              ← Business Development (시장·사업성·BM·착수 판정)
    │   ├── pm.md              ← Product Management (PRD·범위·일정·품질 기준)
    │   ├── brand.md           ← Brand Design (브랜드 아이덴티티·컨셉 디자인)
    │   ├── pd.md              ← Product Design (화면·UX·디자인 시스템·라이팅)
    │   ├── app-dev.md         ← App Developer (RN/Expo — iOS/AOS/Web/Extension)
    │   ├── be-dev.md          ← Backend Developer (서버·데이터·결제·admin)
    │   ├── qa.md              ← QA (검증·회귀·커밋 게이트)
    │   ├── release-manager.md ← Release Manager (스토어·빌드·OTA)
    │   └── growth.md          ← Growth (스토어 문구·홍보·블로그)
    └── commands/              ← 슬래시 커맨드 (팀 운영 절차의 실행 버튼)
        ├── kickoff.md         ← /kickoff — 새 기능 시작 절차
        ├── handoff.md         ← /handoff — 세션 마감·인수인계
        └── release-check.md   ← /release-check — 릴리즈 게이트
```

## 새 서비스를 시작할 때

1. **이 킷 전체를 새 저장소 루트에 복사한다.** (`.claude/`, `docs/`, 루트 md 전부)
2. `docs/HARNESS.md`의 `<서비스명>`·플레이스홀더를 채운다 — "지금 상태"는 비어 있는 게 정상이다.
3. 첫 세션을 열고 PO가 서비스 아이디어를 말한다 → 오케스트레이터가 `/kickoff`로 시작한다.
   새 제품의 첫 사이클은 **BD(착수 판정) → PM(PRD) → BRAND(브랜드) → PD(화면·카피)** 순이다.
   기존 제품의 기능 추가라면 BD·BRAND를 건너뛴다 — **역할이 9개라고 매번 9번 위임하지 않는다.**
4. 검증 스크립트(`npm run verify` 상당)가 생기기 전까지는 QA 게이트가 typecheck만으로
   시작해도 된다 — 단, **게이트 없이 커밋하는 습관을 처음부터 만들지 않는다.**

## 이 킷의 철학 (Lessons learned)

- **문서가 코드보다 앞서 있으면 거짓말이다.** HARNESS의 "지금 상태"는 작업이 끝날 때마다 갱신한다.
- **세션 = 작업 단위.** 새 기능은 새 세션에서 시작하고, 인수인계는 대화가 아니라 HARNESS가 한다.
- **추측 금지, 측정 먼저.** 채록은 제목 버그로 세 번, 결제로 한 번 헛짚었다 — 원인은 재서 확정한다.
- **비가역 결정은 PO만 내린다.** 에이전트는 실행하고, 사람은 결정한다.
