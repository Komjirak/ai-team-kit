#!/usr/bin/env bash
# agent-prompts/ (단일 진실 공급원) → agents/ (플러그인 배포본) 생성
# 수정은 agent-prompts/에서만 하고, 이 스크립트로 배포본을 다시 만듭니다.
set -euo pipefail
cd "$(dirname "$0")/.."

declare -A MAP=(
  [51-product-owner]=komjirak-product-owner
  [52-business-developer]=komjirak-bd
  [53-product-manager]=komjirak-pm
  [54-brand-designer]=komjirak-brand
  [55-product-designer]=komjirak-pd
  [56-app-engineer]=komjirak-app
  [57-backend-engineer]=komjirak-backend
  [58-ai-engineer]=komjirak-ai
  [59-qa-engineer]=komjirak-qa
  [60-release-manager]=komjirak-release
  [61-growth-marketer]=komjirak-growth
  [62-data-scientist]=komjirak-data
  [63-tech-lead]=komjirak-tech-lead
  [64-frontend-engineer]=komjirak-frontend
)

WRAPPER='## 운영 맥락 (플러그인)

너는 꼼지락 프로덕트 빌드팀의 한 역할이다. 팀 전체는 `/komjirak`(팀장·오케스트레이터)이 편성·위임하고, 너는 위임받은 한 역할을 수행한다.
- **공통 규약(교리)**: `${CLAUDE_PLUGIN_ROOT}/TEAM.md` (§0 PO 철학·조직도·위임 규칙·팀 규칙·에스컬레이션). 판단이 갈리면 §0 철학이 규칙보다 위다.
- **참고 플레이북**: `${CLAUDE_PLUGIN_ROOT}/docs/PLAYBOOKS/` — 해당될 때만 읽는다.
- **진행 상태**: 작업 중인 프로젝트의 `docs/HARNESS.md`(있으면 먼저 읽기).
- **보고**: 표준 보고 형식 5줄(한 일 · 근거 · PO 결정 대기 · 다음 담당 · 리스크 한 줄).
- 비가역 행동(배포·제출·삭제·과금·대외 발행)은 **사람 PO 승인 전에 실행하지 않는다.**

---

> ⚠️ 이 파일은 자동 생성물입니다. 수정은 `agent-prompts/`에서 하고 `bash scripts/build-agents.sh`로 재생성하세요.

'

for src in "${!MAP[@]}"; do
  dst="${MAP[$src]}"
  desc=$(head -5 "agent-prompts/${src}.md" | grep -v '^#' | head -1 | cut -c1-120)
  {
    printf -- "---\nname: %s\ndescription: %s\ntools: Read, Write, Edit, Grep, Glob, Bash, WebSearch, WebFetch\n---\n\n" "$dst" "$desc"
    printf '%s\n' "$WRAPPER"
    cat "agent-prompts/${src}.md"
  } > "agents/${dst}.md"
  echo "generated agents/${dst}.md"
done
echo "done. .claude/agents/ 는 플러그인용 9종 부분집합 — TEAM.md 로스터 기준으로 필요하면 같은 방식으로 복사하세요."
