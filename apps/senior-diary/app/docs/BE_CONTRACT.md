# BE 계약 — 하루담 데이터·파이프라인 (local-first)

> 소유: BE. 소비자: APP(화면 배선)·QA(검증). 원본 근거: `../../docs/PRD.md`·`../../docs/IA.md`.
> 이 문서는 **성공 예시만 쓰지 않는다** — 실패 모드(무엇이 언제 실패하고 그때 클라이언트가
> 무엇을 받는가)를 표로 함께 쓴다(BE 하네스 규칙). 화면은 이 계약에만 의존하고 저장 방식을 모른다.

## 1. 아키텍처 한 장

```
화면(APP)  ──셀렉터 훅──▶  StoreProvider(권위 상태·React)  ──DiaryRepository──▶  저장소 구현
  P0~P3 · C1~C6              부모·자녀 두 세계 공유           (인터페이스 = seam)     ├─ LocalRepository (AsyncStorage) ← 지금
                                    │                                              └─ FirestoreRepository (스텁·미배선) ← 이관 지점
                                    ▼
                         파이프라인(services/pipeline)
                          ├─ branching  질문 분기 엔진(I2, 룰 기반·AI 아님)
                          ├─ stt        모의 STT(질문별 정리본, 원음 메타 보존 R7)
                          ├─ nightly    밤사이 정리(상태 전이, 멱등+순서 가드)
                          └─ book       책 조립(답변→챕터→C6)
```

- **교체 지점은 한 곳**: `src/services/index.ts`. `LocalRepository` → `FirestoreRepository`만 바꾸면
  화면·스토어는 그대로다. 인터페이스 계약(`src/services/repository.ts`)이 유일한 경계.
- 저장소 선택: **AsyncStorage**. 근거 — Expo Go 기본 번들(네이티브 dev-build 불요) · 웹 export에서
  localStorage 폴백 · 데이터 규모가 작아 문서(JSON) 저장으로 충분 · 교체 용이. (`src/services/local/storage.ts`)

## 2. 개체 (IA §4) → 저장소 메서드

| 개체 | 타입 | 저장소 메서드 | Firestore 매핑(이관 시) |
|---|---|---|---|
| 가족 | `Family` | get/saveFamily | `families/{id}` |
| 부모 프로필 | `ParentProfile` | get/saveProfile | `families/{id}/profile/main` |
| 질문 뱅크·챕터 | `BankQuestion`·`Chapter` | listQuestions·listChapters (읽기 전용 시드) | `questions/*`·`chapters/*` |
| 오늘의 질문 | `DailyQuestion` | get/saveDaily | `families/{id}/daily/{date}` |
| 답변 | `Answer` | listAnswers·getAnswer·**putAnswer(멱등)** | `families/{id}/answers/{id}` |
| 응원 | `Cheer` | putCheer·get/setParentCheer | `.../answers/{id}.cheer` · `families/{id}.parentCheer` |
| 책 | (파생) | — (assembleBook로 답변에서 조립) | 서버도 파생 — 저장 안 함 |

## 3. 답변 상태 기계 (IA §5-1)

```
recorded ──(업로드 완료)──▶ organizing ──(밤사이 정리)──▶ done ──(응원)──▶ done+cheer
  녹음됨                     밤사이 정리 중                정리 완료
```

- 로컬은 업로드 단계가 즉시라 **답변 생성 시 `organizing`으로 진입**하고, `nightly`가 `done`으로 옮긴다.
- `done`은 **종단 상태** — 정리를 다시 돌려도 바뀌지 않는다(멱등).
- 각 답변은 `stateUpdatedAt`(이벤트 시각)을 들고 다닌다 → 순서 가드의 입력값.

## 4. 멱등 보장 방식 (쓰기 경로별)

BE 규칙: **쓰기 경로는 두 번 실행돼도 결과가 같다.** 재시도·중복 이벤트·사용자 더블탭을 전제한다.

| 쓰기 경로 | 위험 | 멱등·가드 방식 | 근거 코드 |
|---|---|---|---|
| **답변 저장** (부모 "다 했어요") | 더블탭 → 답변 2건 | 같은 날 `daily.status==='answered'`면 **no-op** | `StoreProvider.markAnswered` |
| **밤사이 정리** (자동 5s + 수동 트리거) | 자동·수동 중복 실행 | `state==='done'`이면 **no-op**, 아니면 STT→done. 정리본은 질문 결정적 | `nightly.organizeAnswer` |
| **답변 upsert** (저장소) | 같은 id 재수신 | id로 교체(있으면)/추가(없으면) — set(merge) 상당 | `LocalRepository.putAnswer` |
| **상태 전이 병합** | 낡은 비동기 결과가 새 상태 덮음 | `writeAnswerIfNewer` — `stateUpdatedAt` 역전이면 **skip** | `StoreProvider.writeAnswerIfNewer` |
| **응원 → P1 배너** | 여러 응원 순서 역전 | `parentCheer`는 **newest-wins**(createdAt 비교) | `StoreProvider.sendCheer` |

로그 한 줄로 검증 가능(BE DoD): 정리를 두 번 돌리면 두 번째는
`{"type":"nightly.run","outcome":"noop","organized":0}`.

## 5. 실패 모드 표 (무엇이 언제 실패하고, 클라이언트가 무엇을 받는가)

로컬-first라 아래 대부분은 **지금은 발생하지 않는다**(디스크 쓰기 성공 가정). 그러나 화면(§9-4)이
이미 이 오류 코드로 표면을 그려두었고, **실서버 이관 시 이 표가 그대로 계약이 된다.** 원인 코드를
사용자 배너·로그에 붙인다(팀 규칙 6). 코드 없는 "실패했어요"는 금지.

| 순간 | 실패 | 클라이언트가 받는 것 | 화면 처리(§9-4) |
|---|---|---|---|
| 저장소 읽기/쓰기 | 비공개 창·저장소 차단 | `storage.read/write (fail)` 로그, 빈 값으로 안전 렌더 | try/catch, 앱은 안 죽음 |
| 답변 업로드 | 오프라인 | `answer.upload_failed (offline)` | 폰에 보관 → 연결 시 자동 전송(IA §5-1 QUEUE) |
| 밤사이 정리 | STT 지연/타임아웃 | `stt.failed (timeout)` | C4 원음 폴백("원음은 들으실 수 있어요") |
| 응원 전송 | 오프라인 | `cheer.send_failed (offline)` | 로컬 큐 후 자동 전송 |
| 지난 이야기 로드 | 서버 오류 | `archive.fetch_failed` | [다시 시도] + 캐시 표시 |
| 자녀 피드 로드 | 서버 오류 | `feed.fetch_failed` | [다시 시도] |
| 책 미리보기 | 조립 실패 | `book.preview_failed` | [다시 시도], 표지는 로컬로 유지 |
| 신청 제출 | 오프라인/서버 | `signup.submit_failed (offline)` | 입력값 보존, 재시도 |
| 초대 링크 | 만료 | `invite.link_expired` | **자녀 쪽 재발급**으로 해결(부모에게 문제 안 넘김) |
| 저장소 미배선 | Firestore 스텁 호출 | `repo.not_wired` throw | (개발 중에만) — PO가 Firebase 프로비저닝 전 |

## 6. 실서버(Firebase) 이관 시 지킬 BE 규칙 (하네스 채록)

`FirestoreRepository`(스텁)의 헤더에도 박아둔 것 — 구현 시 이 규칙이 계약이다.

1. **웹훅/트리거는 순서를 보장하지 않는다.** 상태 전이는 이벤트 시각 가드(`writeAnswerIfNewer`
   상당)로 낡은 이벤트를 거른다. "마지막 도착이 이긴다" 금지.
2. **putAnswer는 멱등** — `set(merge)`. 중복 웹훅·재시도에 답변이 두 번 생기지 않게.
3. **밤사이 정리는 Cloud Function**(스케줄/트리거). 중복 실행 전제로 `done`이면 no-op.
4. **Firestore 문서 ID 내림차순 orderBy 금지** — 오름차순 후 코드에서 뒤집는다.
5. **맵 키의 점(.)은 밑줄로 치환**(`update()`가 필드 경로로 오독).
6. **부모 익명 인증 + 콘솔 스위치는 세트** — 익명 로그인 활성화 + **30일 자동 삭제 옵션 확인**
   (구독자 uid 소실 = 유령 구독자 사고). IA §1-2 관찰과 동일.
7. 실 Firebase 프로젝트·키·콘솔·과금은 **PO 영역**(에스컬레이션) — BE는 어댑터 골격까지.
