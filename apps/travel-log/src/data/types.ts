// ─── Domain model (PRD §6) ───────────────────────────────────

export type PlaceCategory = '카페' | '맛집' | '자연' | '문화' | '데이트' | '기타'
export const PLACE_CATEGORIES: PlaceCategory[] = ['카페', '맛집', '자연', '문화', '데이트', '기타']

export type PlaceStatus = 'wishlist' | 'visited'

export interface AppUser {
  id: string
  nickname: string
  email: string
  photoURL?: string
  coupleId?: string
}

export interface Couple {
  id: string
  inviteCode: string
  startDate?: string // ISO yyyy-mm-dd
  memberIds: string[] // ≤ 2
  coverPhoto?: string // 우리의 기록 대표 사진 URL
}

export interface Place {
  id: string
  coupleId: string
  name: string
  address: string
  lat?: number
  lng?: number
  category: PlaceCategory
  thumbnail?: string
  status: PlaceStatus
  createdBy: string // userId — preserved for "누가 등록했나" (C2)
  createdAt: number
  visitedAt?: number
  memo?: string
}

export interface Course {
  id: string
  coupleId: string
  title: string
  memo?: string
  placeIds: string[] // ordered — the map route
  createdBy: string
  createdAt: number
}

export interface Memory {
  id: string
  coupleId: string
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
  coupleId: string
  type: 'partner_joined' | 'place_added' | 'memory_added' | 'course_added'
  message: string
  createdAt: number
  readAt?: number
}

// ─── Derived metrics (computed, not stored) ─────────────────

export interface Stats {
  daysTogether: number | null // today − startDate
  visitedCount: number
  wishlistCount: number
  memoryCount: number
  photoCount: number
  firstVisit: Place | null
  topMemoryPlace: { name: string; count: number } | null
  perMemberPlaceCount: { userId: string; nickname: string; count: number }[]
}
