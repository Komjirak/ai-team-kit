# 하루담 저장소 분리 — 셋업 안내

`ai-team-kit`의 `apps/senior-diary/`를 **`harudam`이라는 별도 git 저장소**로 분리하는
절차다. (오케스트레이터의 GitHub 연동은 **새 저장소 생성 권한이 없어**(403) PO가 빈
저장소만 만들어 주면 나머지는 스크립트가 처리한다.)

## 방법 A — 스크립트로 직접 (권장)

1. **GitHub에서 빈 저장소 생성**: `Komjirak/harudam` (Private, README/gitignore/license
   **없이** 완전 빈 저장소로).
2. ai-team-kit을 받은 상태에서 저장소 루트에서:
   ```bash
   bash harudam-migration/build-harudam.sh ../harudam
   ```
   → `../harudam`에 단일 제품 저장소가 조립되고 첫 커밋이 생성된다(node_modules 제외).
3. 푸시:
   ```bash
   cd ../harudam
   git remote add origin https://github.com/Komjirak/harudam.git
   git branch -M main
   git push -u origin main
   ```
4. 확인:
   ```bash
   cd app && npm install && npm run web
   ```

## 방법 B — 번들로 (스크립트 없이)

전달된 `harudam.bundle` 파일을 쓰면 스크립트 없이 바로 저장소가 된다:
```bash
git clone harudam.bundle harudam
cd harudam
git remote add origin https://github.com/Komjirak/harudam.git
git branch -M main && git push -u origin main
```

## 방법 C — 오케스트레이터가 대신 푸시

PO가 위 1번(빈 `Komjirak/harudam` 생성)만 해주면, 다음 세션에서 오케스트레이터가
`add_repo`로 접근 권한을 받아 조립·푸시까지 대신 할 수 있다. "harudam 저장소 만들어
뒀어, 푸시해줘"라고 말하면 된다.

## 분리 후 구조

```
harudam/
├── README.md · AGENTS.md · CLAUDE.md · TEAM.md
├── .claude/agents/         역할 하네스 9종
├── docs/                   기획·설계·리서치 + HARNESS·DECISIONS·PLAYBOOKS
├── design/ · prototype/ · app/(RN·Expo)
```

## 분리 후 첫 세션에서 할 일

`docs/HARNESS.md` → `docs/DECISIONS.md`(#1~#10) → `docs/BACKLOG.md` 순으로 읽고,
**하이브리드 재설계 + 확정 4건 반영(BRAND→PM→PD→BE/APP)** 부터 착수한다.

> 분리 이전 상세 히스토리는 `Komjirak/ai-team-kit`에 남는다. ai-team-kit의
> `apps/senior-diary/`는 그대로 두거나(아카이브) 이후 정리한다 — PO 판단.
