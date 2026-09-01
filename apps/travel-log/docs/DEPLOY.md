# 간직.log 배포 가이드 (Firebase 프로젝트: `date-log-b1e52`)

> 간직.log는 **기존 date.log 프로젝트(`date-log-b1e52`)를 전용**한다.
> ⚠️ 이 프로젝트에 배포하면 그 자리에 있던 **커플 앱(Datel.log)의 호스팅·규칙이
> 교체**된다(의도된 대체). 옛 커플 데이터(coupleId 문서)는 새 규칙에서 접근이
> 막혀 그대로 잠들 뿐, 간직.log 동작에는 무해하다(간직.log는 tripId로만 질의).

## 0. 사전 준비 (완료됨 ✅ / 확인)
- Google Cloud(`date-log-b1e52`)에서 API 사용 설정: **Maps JavaScript API**, **Places API (New)**,
  (캘린더 내보내기용) **Google Calendar API**.
- API 키 발급(billing 계정 연결). **HTTP 리퍼러 제한**에 `https://date-log-b1e52.web.app/*`,
  `http://localhost:5173/*` 추가.
- OAuth 동의화면에 `.../auth/calendar.events` 스코프 등록(캘린더 내보내기 쓸 때).

## 1. 환경변수 `.env.local`
`apps/travel-log/`에서:
```bash
cp .env.example .env.local
```
- `VITE_FIREBASE_*` 6개 → **date-log-b1e52** 프로젝트의 웹앱 구성값(Firebase 콘솔 → 프로젝트 설정 → 내 앱).
- `VITE_GOOGLE_MAPS_KEY` → 위에서 발급한 Google Maps 키.
- `VITE_FIREBASE_VAPID_KEY` → (푸시 쓸 때) Firebase 콘솔 → 클라우드 메시징 → 웹 푸시 인증서 키.

## 2. 보안 규칙 게시 (여행 멤버 스코프)
```bash
npx firebase-tools deploy --only firestore:rules,storage
```
> `.firebaserc`에 default=date-log-b1e52가 잡혀 있어 `--project` 없이 된다.
> 규칙 게시 전에는 실 Firebase 모드에서 읽기/쓰기가 막힌다.

## 3. 빌드 & 호스팅 배포
```bash
npm install
npm run build
npx firebase-tools deploy --only hosting
```
→ `https://date-log-b1e52.web.app` 에서 간직.log가 뜬다.

## 4. (선택) 푸시 Functions 배포
```bash
# Blaze(종량제) 요금제 필요
npx firebase-tools deploy --only functions
```
미배포 시 실기기 푸시만 빠지고 **인앱 알림은 정상**.

## 5. 배포 후 확인
- **Firebase 콘솔 → Authentication → 승인된 도메인**에 `date-log-b1e52.web.app` 포함(같은 프로젝트라 보통 이미 있음).
- 사이트에서 Google 로그인 → 여행 만들기 → 초대코드 공유 → 일정/장소(구글 지도 검색)/가계부/회고 확인.
- 카카오톡에 링크 붙여 OG 카드(간직.log) 뜨는지 확인(캐시 초기화: 카카오 공유 디버거).

## 한 방 배포 (규칙+호스팅+함수)
```bash
npm run build && npx firebase-tools deploy
```
