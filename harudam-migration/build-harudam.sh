#!/usr/bin/env bash
# build-harudam.sh — ai-team-kit(senior-diary)에서 하루담 단일 제품 저장소를 조립한다.
# 사용: ai-team-kit 저장소 루트에서  bash harudam-migration/build-harudam.sh <대상디렉토리>
# 예:   bash harudam-migration/build-harudam.sh ../harudam
set -euo pipefail

DEST="${1:-../harudam}"
SRC="$(pwd)"
MIG="$SRC/harudam-migration/files"

if [ ! -d "$SRC/apps/senior-diary" ]; then
  echo "ERROR: ai-team-kit 저장소 루트에서 실행하세요 (apps/senior-diary 없음)." >&2
  exit 1
fi

echo "▶ 대상: $DEST"
rm -rf "$DEST"
mkdir -p "$DEST/docs" "$DEST/.claude"

# 1) 팀 프레임워크
cp "$SRC/TEAM.md" "$DEST/TEAM.md"
cp "$SRC/CLAUDE.md" "$DEST/CLAUDE.md"          # @AGENTS.md
cp -r "$SRC/.claude/agents"   "$DEST/.claude/agents"
[ -d "$SRC/.claude/commands" ] && cp -r "$SRC/.claude/commands" "$DEST/.claude/commands" || true
cp "$SRC/docs/DECISIONS.md" "$DEST/docs/DECISIONS.md"
[ -d "$SRC/docs/PLAYBOOKS" ] && cp -r "$SRC/docs/PLAYBOOKS" "$DEST/docs/PLAYBOOKS" || true

# 2) 제품 문서 (apps/senior-diary/docs/* → docs/)
cp "$SRC"/apps/senior-diary/docs/*.md "$DEST/docs/"

# 3) 제품 소스 (design / prototype / app)
cp -r "$SRC/apps/senior-diary/design"    "$DEST/design"
cp -r "$SRC/apps/senior-diary/prototype" "$DEST/prototype"
cp -r "$SRC/apps/senior-diary/app"       "$DEST/app"
# 앱에서 빌드 산출물·의존성 제거 (재설치는 npm install)
rm -rf "$DEST/app/node_modules" "$DEST/app/dist" "$DEST/app/.expo" "$DEST/app/.git"

# 4) 하루담 전용 오버라이드 (README·AGENTS·HARNESS)
cp "$MIG/README.md"      "$DEST/README.md"
cp "$MIG/AGENTS.md"      "$DEST/AGENTS.md"
cp "$MIG/docs/HARNESS.md" "$DEST/docs/HARNESS.md"

# 5) git 초기화 + 첫 커밋
cd "$DEST"
git init -q
cat > .gitignore <<'GI'
app/node_modules/
app/dist/
app/.expo/
**/.DS_Store
GI
git add -A
git -c user.name="Komjirak" -c user.email="komjirak.studio@gmail.com" \
    commit -qm "하루담 초기 구성 — ai-team-kit senior-diary에서 분리

- 팀 프레임워크(TEAM/AGENTS/.claude/agents) + 제품 문서/디자인/프로토타입/앱
- 플랫폼 확정: 비대칭 하이브리드 + 카카오 알림톡(결정 #8·#10)
- 체험 가능한 local-first MVP 동작. 실구현 착수는 docs/BACKLOG.md 순서

분리 이전 히스토리: Komjirak/ai-team-kit (apps/senior-diary/)"

echo "✅ 완료: $DEST (첫 커밋 생성됨)"
echo "다음: git remote add origin https://github.com/Komjirak/harudam.git && git branch -M main && git push -u origin main"
