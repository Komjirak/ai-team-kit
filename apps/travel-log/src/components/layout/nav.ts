export interface Tab {
  to: string
  label: string
  icon: string
}

// The canonical tabs (PRD §10-1). 가계부=주연(M3)이라 하단탭에 노출.
// '여행'(트립 전환·기록·설정)은 헤더 사용자칩 메뉴로 옮겼다.
export const TABS: Tab[] = [
  { to: '/', label: '전체', icon: 'grid_view' },
  { to: '/schedule', label: '일정', icon: 'event' },
  { to: '/wishlist', label: '장소', icon: 'location_on' },
  { to: '/expenses', label: '가계부', icon: 'wallet' },
  { to: '/memories', label: '추억', icon: 'photo_library' },
]

// 확정 이름(BRAND.md · PO 확정 2026-08-31): 간직.log
export const BRAND = '간직.log'
export const SLOGAN = '친구와 함께 남기는 여행'

// 공유용 정식 도메인 — 미리보기/로컬에서 공유해도 친구는 항상 배포 사이트로 온다.
export const SITE_URL = 'https://ganjik-log.komjirak.studio'
/** 초대 딥링크: 열면 코드가 자동 입력된 합류 창이 뜬다(?join=CODE). */
export const joinUrl = (code: string) => `${SITE_URL}/?join=${encodeURIComponent(code)}`
