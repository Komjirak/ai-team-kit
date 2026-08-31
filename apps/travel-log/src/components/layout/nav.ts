export interface Tab {
  to: string
  label: string
  icon: string
}

// The canonical tabs (PRD §10-1, M1). 데이트코스는 여행 PRD 범위 밖이라 제거,
// 일정·가계부는 M2~M3라 아직 없다. Same labels/order across all breakpoints.
export const TABS: Tab[] = [
  { to: '/', label: '전체', icon: 'grid_view' },
  { to: '/wishlist', label: '장소', icon: 'location_on' },
  { to: '/memories', label: '추억', icon: 'photo_library' },
  { to: '/dashboard', label: '여행', icon: 'luggage' },
]

// 확정 이름(BRAND.md · PO 확정 2026-08-31): 간직.log
export const BRAND = '간직.log'
export const SLOGAN = '친구와 함께 남기는 여행'
