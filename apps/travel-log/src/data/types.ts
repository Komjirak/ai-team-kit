// ─── Domain model (PRD §5) ───────────────────────────────────
// 간직.log — 친구 여행 기억장. Datel.log(커플 1:1)에서 피벗:
//   Couple(≤2) → Trip(N인) · coupleId → tripId · 권한 owner/member 2단계.
// M1 범위: Trip / 초대합류 / 백엔드 인터페이스 확장. 일정·정산·푸시는 M2~M4.

export type PlaceCategory = '카페' | '맛집' | '자연' | '문화' | '숙소' | '기타'
export const PLACE_CATEGORIES: PlaceCategory[] = ['카페', '맛집', '자연', '문화', '숙소', '기타']

export type PlaceStatus = 'wishlist' | 'visited'

export interface AppUser {
  id: string
  nickname: string
  email: string
  photoURL?: string
  fcmTokens?: string[] // M4 — 웹푸시 기기 토큰(옵트인 시 등록). 본인 uid만 쓰기(규칙).
  // NOTE: 단일 coupleId 소속을 제거했다. 유저는 여러 여행에 속한다(Trip.memberIds).
}

// 신규 — Couple(≤2)을 N인 + owner/member 권한으로 확장 (PRD §5-1).
// M1은 별도 Membership 컬렉션 없이 Trip 필드(ownerId/memberIds)로 권한 2단계를 표현한다.
export interface Trip {
  id: string
  inviteCode: string    // 6자리 초대코드 (Datel 승계). 링크(inviteToken)는 M2+.
  title: string         // "제주 3박4일"
  destination?: string  // 목적지 라벨
  startDate?: string    // ISO yyyy-mm-dd
  endDate?: string      // ISO yyyy-mm-dd
  coverPhoto?: string   // 대표 사진 URL
  ownerId: string       // 생성자 = owner
  memberIds: string[]   // N인 (제약 없음)
  createdAt: number
}

export interface Place {
  id: string
  tripId: string
  name: string
  address: string
  lat?: number
  lng?: number
  category: PlaceCategory
  thumbnail?: string
  status: PlaceStatus
  createdBy: string // userId — "누가 등록했나"
  createdAt: number
  visitedAt?: number
  memo?: string
}

export interface Memory {
  id: string
  tripId: string
  placeId: string
  placeName: string
  text: string
  photoUrls: string[]
  visitedAt: string // ISO yyyy-mm-dd
  createdBy: string
  createdAt: number
}

// 신규(M3) — 비용. v1은 1/N 균등 분담만(오픈이슈 A 확정). 개별지정/비율은 Should.
// 실제 송금·PG는 Won't — 계산·요약·"정산됨" 체크까지만.
export interface Expense {
  id: string
  tripId: string
  title: string
  amount: number         // 정수 KRW (v1 통화 고정)
  paidBy: string         // 결제자 userId
  participants: string[] // 분담 대상 userId[]
  // 분할 방식: 'equal' = 참여자 1/N 균등(기본), 'custom' = 인당 금액 직접 지정.
  splitMode?: 'equal' | 'custom'
  // custom일 때만: 참여자별 분담액(원). 합계 = amount 여야 한다.
  shares?: Record<string, number>
  category?: string      // Could(통계)는 범위 밖. 라벨만 저장
  date?: string          // ISO yyyy-mm-dd (선택)
  createdBy: string
  createdAt: number
}

// 신규(M3) — 정산 완료 체크의 영속 상태. tripId당 문서 하나.
// settledKeys: "정산됨"으로 표시된 이체의 키(`${from}>${to}`) 목록. 되돌리기 가능.
export interface SettlementState {
  tripId: string
  settledKeys: string[]
}

// 신규(M2) — 일자별 일정 항목. 인앱이 source of truth (PRD §5, §6-3).
// 구글캘린더 미러링(googleEventId)·그리드 뷰는 M5 이후. 여기선 리스트만.
export interface ScheduleItem {
  id: string
  tripId: string
  date: string       // ISO yyyy-mm-dd (어느 Day인지)
  order: number      // 같은 날 안에서의 순서
  time?: string      // "14:30" (선택)
  title: string
  placeId?: string   // 장소 연결 (③ 모듈)
  memo?: string
  googleEventId?: string // 구글 캘린더 미러링 시 이벤트 id (중복 방지, M5 Should)
  createdBy: string
  createdAt: number
}

export interface AppNotification {
  id: string
  tripId: string
  // v1 여행용 알림. FCM 3종 = member_joined · schedule_changed · settlement_requested (M4).
  type:
    | 'member_joined'
    | 'place_added'
    | 'memory_added'
    | 'schedule_changed'
    | 'settlement_requested'
  message: string
  createdAt: number
  readAt?: number
}

// ─── Derived metrics (computed, not stored) ─────────────────

export interface Stats {
  tripDays: number | null // 여행 기간(일) — startDate~endDate에서 파생
  visitedCount: number
  wishlistCount: number
  memoryCount: number
  photoCount: number
  firstVisit: Place | null
  topMemoryPlace: { name: string; count: number } | null
  perMemberPlaceCount: { userId: string; nickname: string; count: number }[]
}
