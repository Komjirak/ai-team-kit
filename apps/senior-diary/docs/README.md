# 하루담 (가칭 · ハルダム) — MVP 산출물 인덱스

> 시니어 하루 한 질문 자서전 서비스. **제품명 "하루담"은 가칭**이다 — 상표
> (KIPRIS·J-PlatPat)·도메인 정밀 확인(GROWTH) 통과 전까지 대외 노출물에는 가칭
> 표기를 유지한다 (DECISIONS #6, BD 리스크 경고).
>
> 이 폴더는 하루담을 **실구현으로 넘기기 위한 컨셉·기준 문서 세트**다. 코드는
> `apps/senior-diary/app/`(RN/Expo, 체험 가능한 local-first MVP)에 있다.

## 산출물 8종 (PO 요청 대응)

| # | 요청 산출물 | 문서 | 소유(DRI) | 상태 |
|---|---|---|---|---|
| 1 | 경쟁 상황·차별화 | [`BUSINESS_CASE.md`](./BUSINESS_CASE.md) (§0.5 요약·§5-0 매트릭스·§5-5 포지셔닝) | BD | ✅ |
| 2 | PRD (차별화·핵심경쟁력·기능 피처·역할 IA) | [`PRD.md`](./PRD.md) (§0-1·§3-7 구현현황·§3-8 체계) + [`IA.md`](./IA.md) | PM·PD | ✅ |
| 3 | 브랜드 (네이밍·슬로건·UX Writing·마케팅) | [`BRAND.md`](./BRAND.md) (§1 네이밍·§3-A 슬로건·§3-B 워딩·§5-A 마케팅) | BRAND | ✅ |
| 4 | 디자인 (컨셉·아이콘·스플래시·시스템·컴포넌트) | [`DESIGN_GUIDE.md`](./DESIGN_GUIDE.md) + [`DESIGN_CONCEPT.md`](./DESIGN_CONCEPT.md) + [`../design/DESIGN_SYSTEM.md`](../design/DESIGN_SYSTEM.md) | PD | ✅ |
| 5 | 개발 Backlog 보드 | [`BACKLOG.md`](./BACKLOG.md) (에픽 E0~E8·스토리 40여) | PM | ✅ |
| 6 | APP 개발 프로세스 (역할 플로우·일별 Push) | [`APP_PROCESS.md`](./APP_PROCESS.md) | APP | ✅ |
| 7 | 백엔드 (음성 이중백업·STT·AI 정리) | [`BE_ARCHITECTURE.md`](./BE_ARCHITECTURE.md) + [`../app/docs/BE_CONTRACT.md`](../app/docs/BE_CONTRACT.md) | BE | ✅ |
| 8 | QA Checklist | [`QA_CHECKLIST.md`](./QA_CHECKLIST.md) | QA | ✅ |

보조 근거 문서: [`SPIKE_MVP_TECH.md`](./SPIKE_MVP_TECH.md) (STT·응답경로 실현성).

## 읽는 순서 (실구현 착수자용)

1. **BUSINESS_CASE §0.5** — 왜 만드는가·차별화 한 눈에.
2. **PRD §0-1·§3-7·§3-8** — 무엇을·기능 현황·역할 체계.
3. **BACKLOG** — 무엇부터(실구현 첫 슬라이스 순서·블로커).
4. 구현 상세: **BE_ARCHITECTURE**(서버)·**APP_PROCESS**(앱/푸시)·**DESIGN_GUIDE**(UI).
5. **QA_CHECKLIST** — 무엇으로 통과를 판정하나.

## 지금 상태 한 줄

체험 가능한 **local-first MVP 동작**(녹음→모의STT→밤사이 정리→자녀 응원→부모 반영).
실구현은 위 문서를 컨셉으로 **실서버(Firebase)·실 STT·실 푸시**로 확장한다.

## 전체를 관통하는 미결 (실구현 전 정리 대상)

| 항목 | 내용 | 넘길 곳 |
|---|---|---|
| 이름 정식 승격 | 하루담(가칭) → 상표·도메인 정밀 확인 | GROWTH → PO |
| PO 결정 대기 | D2(G1 스모크 집행)·D5(가격)·D8(놓친 하루)·D3(응답경로 단서) | PO |
| Firebase 프로비저닝 | 프로젝트·키·콘솔·과금 (실구현 최상단 블로커, BACKLOG S1.2) | PO |
| 폰트 28MB | 고운바탕+Noto 번들 — 시니어 셀룰러 부담. 서브셋팅 필요 | RM/PO → APP |
| 종이색 토큰 불일치 | `#fff8f3`(구현) vs `#FBF7EF`(BRAND/컨셉) 통일 (DESIGN_GUIDE G-4) | BRAND → PD |
| 헤드리스 테스트 미커밋 | 파이프라인 22/22 러너를 저장소에 커밋해 게이트 승격 + `npm run verify` | APP/BE |
| 컴포넌트 shim 정리 | `parent/today·record`가 `DiaryContext` shim 경유(동작 정상) → `StoreProvider` 직접 참조로 정리 | APP |
| 실기기 육안 미검증 | 고운바탕 한글 글리프·실마이크·영속화·다크·키보드 회피 | QA(실기기) |

*모든 문서는 단일 진실 공급원 원칙을 따른다 — 값이 어긋나면 각 항목의 원본 문서가
이긴다(예: 화면 문구 정본은 PRD §9, 브랜드 톤은 BRAND, 토큰은 DESIGN_SYSTEM/코드).*
