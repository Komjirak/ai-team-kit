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

export interface AppNotification {
  id: string
  tripId: string
  // v1 여행용 알림. FCM 3종(member_joined/schedule_changed/settlement_requested)은 M4.
  type: 'member_joined' | 'place_added' | 'memory_added'
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
