# 프로덕트팀 에이전트 프롬프트 (Product Team Agent Prompts)

꼼지락 스튜디오 프로덕트팀 **14인 + 팀장(오케스트레이터)**의 실행용 시스템 프롬프트입니다.
각 파일은 단일 역할의 전체 프롬프트로, 그대로 서브에이전트 시스템 프롬프트로 붙여 쓸 수 있습니다.

- 구조(공통): `핵심 역할 · 도구 · 워크플로우(받음/전달/결손 처리) · 출력 형식 · 예시 · 품질 기준(9.5 게이트) · 원칙`
- 팀장: [`lead-orchestrator.md`](./lead-orchestrator.md) — 목표를 받아 목표별(시장 조사 / 프로덕트 개발 / 상품 마케팅)로 팀을 편성·위임·통합·검토.
- 조직·일하는 방식·헌장: 저장소 루트의 [`TEAM.md`](../TEAM.md) 참고.

| id | 직책 | Role (EN) | 하는 일 | 프롬프트 |
|---|---|---|---|---|
| 51 | 프로덕트 오너 | Product Owner | 비전·우선순위·비가역 결정으로 팀을 이끕니다 | [`51-product-owner.md`](./51-product-owner.md) |
| 52 | 프로덕트 사업개발 | Business Developer | 시장·사업성·비즈니스 모델로 착수를 판정합니다 | [`52-business-developer.md`](./52-business-developer.md) |
| 53 | 프로덕트 매니저 | Product Manager | PRD로 범위·일정·품질 기준을 확정합니다 | [`53-product-manager.md`](./53-product-manager.md) |
| 54 | 브랜드 디자이너 | Brand Designer | 브랜드 아이덴티티와 컨셉을 정합니다 | [`54-brand-designer.md`](./54-brand-designer.md) |
| 55 | 프로덕트 디자이너 | Product Designer | 화면·UX·디자인 시스템·라이팅을 확정합니다 | [`55-product-designer.md`](./55-product-designer.md) |
| 56 | 앱 엔지니어 | App Engineer | RN·웹·익스텐션으로 화면을 구현합니다 | [`56-app-engineer.md`](./56-app-engineer.md) |
| 57 | 백엔드 엔지니어 | Backend Engineer | 서버·데이터·결제를 구현합니다 | [`57-backend-engineer.md`](./57-backend-engineer.md) |
| 58 | AI 엔지니어 | AI Engineer | 모델·AI 기능을 프로덕트에 녹입니다 | [`58-ai-engineer.md`](./58-ai-engineer.md) |
| 59 | QA 엔지니어 | QA Engineer | 완료 주장을 검증으로 사실로 바꿉니다 | [`59-qa-engineer.md`](./59-qa-engineer.md) |
| 60 | 릴리즈 매니저 | Release Manager | 릴리즈·스토어 심사·빌드/OTA를 판단합니다 | [`60-release-manager.md`](./60-release-manager.md) |
| 61 | 그로스 마케터 | Growth Marketer | 스토어 문구·홍보로 사용자에게 닿습니다 | [`61-growth-marketer.md`](./61-growth-marketer.md) |
| 62 | 데이터 사이언티스트 | Data Scientist | 데이터로 모델링하고 실험을 설계합니다 | [`62-data-scientist.md`](./62-data-scientist.md) |
| 63 | 테크 리더 | Tech Lead | 인프라·아키텍처를 설계하고 기술 표준을 세웁니다 | [`63-tech-lead.md`](./63-tech-lead.md) |
| 64 | 프론트엔드 엔지니어 | Frontend Engineer | 사용자가 만나는 화면을 구현합니다 | [`64-frontend-engineer.md`](./64-frontend-engineer.md) |

> 이 프롬프트들은 에이전트 팀 빌더( [50agents.airoasting.com](https://50agents.airoasting.com) · [github.com/airoasting/casting](https://github.com/airoasting/casting) )의 하우스 스타일을 따릅니다.
