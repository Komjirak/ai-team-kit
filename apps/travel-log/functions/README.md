# 간직.log — Cloud Functions (FCM 웹푸시)

여행 알림 3종을 Firestore 트리거로 감지해 대상 멤버의 기기(`users/{uid}.fcmTokens`)로
FCM 푸시를 보낸다. **루트 웹앱(`apps/travel-log`)과 분리된 배포 단위**라 웹앱 빌드에는
영향을 주지 않는다(웹앱은 이 폴더를 번들하지 않는다).

| 함수 | 트리거 | 받는 사람 | 알림 |
|---|---|---|---|
| `onTripMemberJoined` | `trips/{id}` 업데이트 시 `memberIds` 증가 | 기존 멤버 | "새 친구가 합류했어요" |
| `onScheduleChanged` | `schedules/{id}` 생성·수정·삭제 | 본인 제외 멤버 | "일정이 바뀌었어요" |
| `onSettlementRequested` | `notifications/{id}` 생성 · `type == settlement_requested` | 여행 멤버 | "정산 요청" |

> 인앱 알림(`notifications` 컬렉션 + 🔔 벨)은 **클라이언트가 이미 만든다.**
> 이 함수들은 그 위에 **푸시 전송**만 얹는다. 푸시 미설정·권한 거부여도 인앱 알림은 동작.
> 금액 등 민감정보는 알림 본문에 넣지 않는다(PRD §7).

## 사전 준비 (1회)

1. **Blaze(종량제) 요금제** — Cloud Functions는 Blaze에서만 배포된다.
2. **VAPID 키 발급** — Firebase 콘솔 → 프로젝트 설정 → 클라우드 메시징 →
   "웹 푸시 인증서" → 키 쌍 생성. 이 **공개키**를 웹앱 환경변수
   `VITE_FIREBASE_VAPID_KEY` 로 넣는다(없으면 웹앱의 알림 옵트인은 "설정 필요"로 비활성).
3. **Service Worker** — 웹앱 `public/firebase-messaging-sw.js` 가 백그라운드 수신을
   담당한다(공개 config를 등록 쿼리스트링으로 받는다 — 비밀 아님).

## 배포

```bash
# functions 디렉터리에서
npm install
npm run build          # tsc → lib/  (배포 전 컴파일)

# 프로젝트 루트(firebase.json 위치)에서
firebase deploy --only functions
```

`firebase.json` 에 아래처럼 functions 소스를 가리키면 된다(ORCH 통합 시 확인):

```json
{ "functions": { "source": "functions", "runtime": "nodejs20" } }
```

## 보안 규칙 의존성 (ORCH/BE)

- 이 함수들은 **Admin SDK**로 동작하므로 Firestore 규칙의 제약을 받지 않는다(서버 신뢰).
- 단, 웹앱이 토큰을 저장하려면 규칙에 **`users/{uid}.fcmTokens` 는 본인만 쓰기** 가 필요하다
  (아래 "fcmTokens 규칙 요구사항" 참고 — 규칙 파일은 ORCH가 통합).

## 로컬 개발(선택)

```bash
npm run build && firebase emulators:start --only functions,firestore
```
