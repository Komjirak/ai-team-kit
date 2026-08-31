# Datel.log — 커플 다이어리 (반응형 웹)

> **우리가 함께 걸은 곳.** 함께 갈 곳을 담고(위시리스트), 다녀온 곳으로 넘기고,
> 그 궤적을 지도·숫자로 되돌아보는 2인용 장소 기록 서비스.
> [PRD](../../0e98319d-PRD_3.md) 기반으로 재구성한 반응형 웹 리빌드.

## 스택

| 영역 | 선택 |
|---|---|
| 프론트 | **React 18 + TypeScript + Vite** SPA (모바일 우선 반응형) |
| 인증 | **Google Login** (Firebase Auth) |
| 데이터 | **Cloud Firestore** (실시간 구독) |
| 사진 | **Firebase Storage** |
| 지도·검색 | **Kakao Maps JS SDK** (services 라이브러리) |
| 스타일 | Tailwind CSS + "Dakku" 스크랩북 디자인 시스템 (washi tape·pin·polaroid) |

## 데모 모드 (키 없이 바로 실행)

Firebase 환경변수가 **없으면** 앱은 자동으로 **로컬 데모 모드**로 뜬다 —
`localStorage` 저장 + 가짜 Google 로그인 + 시드 데이터(커플 "은애", 초대코드
`5WG97J`). 전체 흐름(담기 → 다녀오기 → 코스 → 추억 → 대시보드)을 키 없이 체험할 수
있다. 지도가 필요한 화면은 Kakao 키가 없으면 데모용 장소 셋으로 검색을 대체하고,
지도 자리에는 `map.load_failed` 폴백을 보여준다.

## 실행

```bash
cd apps/datel-log
npm install
npm run dev        # http://localhost:5173  (데모 모드)
```

실제 백엔드로 붙이려면 `.env.example`을 `.env.local`로 복사해 값을 채운다:

```bash
cp .env.example .env.local
# VITE_FIREBASE_* : Firebase 콘솔 → 프로젝트 설정 → 웹 앱
# VITE_KAKAO_MAP_KEY : developers.kakao.com → JavaScript 키
```

값이 하나라도 채워져 유효하면 데모 대신 Firebase에 연결된다.

## 빌드·검증·배포

```bash
npm run verify     # 타입체크 (커밋 게이트)
npm run build      # dist/ 정적 산출물
npm run preview    # 빌드 미리보기

# Firebase Hosting + 보안 규칙 (firebase-tools 필요)
firebase deploy --only hosting,firestore:rules,storage
```

`firestore.rules` / `storage.rules`는 **커플 멤버만** 자기 커플 데이터에 접근하도록
스코프한다 (PRD §8 보안·C1·C2). 배포 전 규칙을 함께 올린다.

## 서비스 구조

```
src/
├─ lib/            env(데모 판별) · firebase 초기화
├─ data/           도메인 모델 · 백엔드 인터페이스 · 로컬/Firebase 구현 · 파생지표
├─ auth/           AuthContext (Google 로그인 / 데모)
├─ couple/         CoupleContext (페어링 + 실시간 데이터 + 통계 구독)
├─ kakao/          SDK 로더 · RouteMap(동선) · 장소 검색
├─ components/     ui(버튼·칩·뱃지·시트·토스트·데코) · layout(헤더·탭바) · PlaceCard
└─ features/       onboarding · home(전체) · wishlist · courses · memories
                   · dashboard(우리의 기록) · settings · place(추가 시트)
```

**핵심 설계 — 백엔드 추상화.** 데이터 계층 위의 모든 코드는 `data/backend.ts`의
`Backend` 인터페이스만 본다. 데모(`localBackend`) ↔ 운영(`firebaseBackend`) 전환은
`src/data/index.ts`의 한 줄, 즉 설정 변경이지 재작성이 아니다.

## 화면 (PRD §5 · 디자인 zip 9종)

| 탭 | 경로 | 내용 |
|---|---|---|
| 온보딩 | (로그인 전) | 랜딩·Google 로그인 → 초대코드 만들기/합류 |
| 전체 | `/` | 인사 배너 · 통계 4종 · 최근 로그 |
| 가고싶은 곳 | `/wishlist` | 위시리스트 카드 · "다녀왔어요" 전환(되돌리기 토스트) · 추가/수정/삭제 |
| 데이트코스 | `/courses`, `/course/:id` | 코스 목록 · 지도 동선 · 순서·구간거리·도보시간·길찾기 |
| 추억 | `/memories` | 폴라로이드 그리드 · 사진·후기 남기기 |
| 우리의 기록 | `/dashboard` | 함께한 날수(D-day) · 통계 · 첫 기록 · 최다 추억 장소 · 러너 레이스 |
| 설정 | `/settings` | 초대코드 복사·공유 · 관계 시작일 · 내/파트너 계정 |

각 화면은 로딩(스켈레톤)·빈·오류·오프라인/지도실패 상태를 PRD §5 명세대로 갖춘다.

## 알아둘 것 (V1 범위)

- 커플은 **1:1** 페어링(초대코드 1회 결합). 3인+·소셜 피드·네이티브 앱은 범위 밖(PRD §3-2).
- 게이미피케이션(등록 수 러너 레이스)은 **경쟁이 아니라 회고** 톤으로 카피 조정(PRD §9).
- 다크모드·다국어·PWA 오프라인은 V1.x 이후 (토큰 구조로 확장 여지만 남김).
