#!/usr/bin/env bash
# komjirak 프로덕트팀을 개인 전역(~/.claude)으로 설치/갱신한다.
# 플러그인 소스(agents/, commands/komjirak.md, TEAM.md, docs/PLAYBOOKS, templates)를
# ~/.claude/skills/komjirak + ~/.claude/agents 로 복사하며, ${CLAUDE_PLUGIN_ROOT}
# 참조를 절대경로로 바꾼다. casting/council 과 같은 개인 전역 방식.
#
# 사용:  bash scripts/sync-personal.sh
# 갱신:  git pull 후 다시 이 스크립트를 돌리면 된다.
set -euo pipefail

SRC="$(cd "$(dirname "$0")/.." && pwd)"        # 저장소 루트
CLAUDE_HOME="${CLAUDE_HOME:-$HOME/.claude}"
SKILL="$CLAUDE_HOME/skills/komjirak"           # 진입 스킬 + 번들 교리
AGENTS="$CLAUDE_HOME/agents"                    # 개별 역할 에이전트(활성)

echo "SRC    = $SRC"
echo "SKILL  = $SKILL"
echo "AGENTS = $AGENTS"

# 1) 스킬 폴더 + 번들 교리 -------------------------------------------------
mkdir -p "$SKILL/docs" "$SKILL/templates" "$SKILL/agent-prompts"
cp "$SRC/TEAM.md" "$SKILL/TEAM.md"
rm -rf "$SKILL/docs/PLAYBOOKS"; cp -R "$SRC/docs/PLAYBOOKS" "$SKILL/docs/PLAYBOOKS"
cp "$SRC/agent-prompts/lead-orchestrator.md" "$SKILL/agent-prompts/lead-orchestrator.md"
cp "$SRC/templates/"*.md "$SKILL/templates/"

# 2) SKILL.md = 스킬 프론트매터 + (commands/komjirak.md 본문, 토큰 치환) -------
#    ${CLAUDE_PLUGIN_ROOT} -> 스킬 폴더 절대경로
CMD_BODY="$(awk 'NR==1&&/^---$/{f=1;next} f&&/^---$/{f=0;next} !f' "$SRC/commands/komjirak.md")"  # 프론트매터 제거
{
  printf -- '---\n'
  printf 'name: komjirak\n'
  printf 'description: 프로덕트/서비스 아이디어를 실제로 만들어야 할 때 쓴다. 팀장(오케스트레이터)이 목표 한 줄을 받아 프로덕트 빌드팀(PO·BD·PM·브랜드·디자인·앱/웹/백엔드/AI 엔지니어·QA·릴리즈·그로스)에서 필요한 역할만 골라 실제 서브에이전트로 이어 돌리고 검토(9.5)를 통과한 결과를 낸다. "이거 만들어줘", "앱/서비스 기획부터", "프로덕트 팀 꾸려줘", /komjirak 에서 발동. 개별 역할은 komjirak-pm 등으로 직접 부른다. 단순 한 줄 답·검색·계산에는 쓰지 않는다.\n'
  printf -- '---\n'
  printf '%s\n' "$CMD_BODY"
} | sed "s#\${CLAUDE_PLUGIN_ROOT}#$SKILL#g" > "$SKILL/SKILL.md"

# 3) 개별 역할 에이전트 14종 -> ~/.claude/agents (토큰 치환) ----------------
#    ${CLAUDE_PLUGIN_ROOT}/agents/ -> 활성 에이전트 폴더
#    ${CLAUDE_PLUGIN_ROOT}         -> 스킬 폴더(번들 교리)
mkdir -p "$AGENTS"
n=0
for f in "$SRC/agents/"komjirak-*.md; do
  base="$(basename "$f")"
  sed -e "s#\${CLAUDE_PLUGIN_ROOT}/agents/#$AGENTS/#g" \
      -e "s#\${CLAUDE_PLUGIN_ROOT}#$SKILL#g" \
      "$f" > "$AGENTS/$base"
  n=$((n+1))
done

# 4) 슬래시 명령 — /komjirak(진입) + /komjirak-handoff + /komjirak-release-check ---
#    commands/ 에 두면 이 앱에서 /komjirak 을 직접 타이핑해 호출할 수 있다.
#    (스킬 komjirak 은 "만들어줘" 등 자연어 자동 발동용으로 병행 유지)
mkdir -p "$CLAUDE_HOME/commands"
for c in komjirak komjirak-handoff komjirak-release-check; do
  sed "s#\${CLAUDE_PLUGIN_ROOT}#$SKILL#g" "$SRC/commands/$c.md" > "$CLAUDE_HOME/commands/$c.md"
done

echo "완료: 스킬 1(komjirak) + 슬래시 명령 3(/komjirak·handoff·release-check) + 역할 에이전트 ${n}종 설치됨."
echo "남은 \${CLAUDE_PLUGIN_ROOT} 잔여 검사:"
if grep -rl 'CLAUDE_PLUGIN_ROOT' "$SKILL" "$AGENTS/komjirak-"*.md "$CLAUDE_HOME/commands/komjirak-"*.md 2>/dev/null; then
  echo "  ⚠️ 위 파일에 토큰이 남아 있음"; else echo "  ✅ 없음"; fi
echo "Claude Code를 재시작하면 /komjirak 과 komjirak-* 역할이 모든 프로젝트에서 뜬다."
