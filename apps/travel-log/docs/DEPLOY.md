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

---

# 대안: Vercel로 프론트 배포 (백엔드는 Firebase 유지)

프론트(정적)는 Vercel, **Firestore 규칙·Storage·Functions는 그대로 Firebase(date-log-b1e52)**
에 배포하는 하이브리드. 앱은 브라우저에서 Firebase에 붙으므로 정상 동작한다.

### A. 먼저 백엔드(Firebase)만 배포
```bash
cd apps/travel-log
npx firebase-tools deploy --only firestore:rules,storage    # (푸시 쓰면 ,functions)
```

### B. Vercel로 프론트 배포 — 방법 1: Git 연동(권장)
1. https://vercel.com → **Add New… → Project** → GitHub의 `Komjirak/ai-team-kit` import.
2. **Root Directory** = `apps/travel-log` 로 지정 (모노레포라 필수).
   Framework: Vite 자동 감지 · Build `npm run build` · Output `dist` (vercel.json에 명시됨).
3. **Environment Variables** 에 추가(빌드시 주입 — 전부 `VITE_` 접두):
   `VITE_FIREBASE_API_KEY` · `VITE_FIREBASE_AUTH_DOMAIN` · `VITE_FIREBASE_PROJECT_ID` ·
   `VITE_FIREBASE_STORAGE_BUCKET` · `VITE_FIREBASE_MESSAGING_SENDER_ID` · `VITE_FIREBASE_APP_ID` ·
   `VITE_GOOGLE_MAPS_KEY` · (푸시) `VITE_FIREBASE_VAPID_KEY`.
4. **Deploy** → `https://<프로젝트>.vercel.app` 발급.

### B. 방법 2: CLI
```bash
npm i -g vercel
cd apps/travel-log
vercel                     # 최초 로그인 + 프로젝트 연결(Root=현재 폴더)
vercel env add VITE_FIREBASE_API_KEY     # ... 위 8개 각각 (또는 대시보드에서 일괄)
vercel --prod
```

### B-2. (선택) 항공편 조회 — Amadeus + Vercel 서버리스
날짜+편명으로 출발/도착/경로를 불러오는 기능. **키는 서버(Vercel 함수)에만** 둔다.
1. https://developers.amadeus.com → 앱 생성 → **API Key / Secret** 발급(무료 Test 티어).
2. Vercel → Project → **Settings → Environment Variables** 에 추가(‼️ `VITE_` 접두 없이):
   `AMADEUS_CLIENT_ID` · `AMADEUS_CLIENT_SECRET` (운영 데이터 전환 시에만 `AMADEUS_HOSTNAME=api.amadeus.com`).
3. `api/flight.ts` 서버리스 함수가 자동 배포된다(Root Directory=apps/travel-log 기준 `api/`).
- 키가 없으면 항공편 조회는 **데모 데이터로 폴백**(앱은 정상 동작, "데모" 배지 표시).
- Test 티어는 커버리지가 제한적이라 일부 편명은 안 나올 수 있다(운영 티어로 전환 시 해소).

### C. 배포 후 필수 허용목록 (안 하면 로그인·지도 막힘)
- **Firebase 콘솔 → Authentication → 설정 → 승인된 도메인** 에 `*.vercel.app` 도메인
  (예: `ganjik-log.vercel.app`) 추가 → 없으면 Google 로그인 팝업 차단.
- **Google Cloud → Maps API 키 → HTTP 리퍼러 제한** 에 `https://<프로젝트>.vercel.app/*` 추가
  → 없으면 지도·장소검색이 `search.failed`.
- (푸시) FCM은 그대로 Firebase Functions에서 전송되므로 Vercel과 무관.

> 커스텀 도메인(예: ganjik.log)을 Vercel에 붙이면, 그 도메인도 위 두 허용목록에 추가하고
> `index.html`·`sitemap`·`robots`의 URL을 그 도메인으로 바꾼다.
