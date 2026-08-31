export interface Tab {
  to: string
  label: string
  icon: string
}

// The canonical 5 tabs (PRD §4). Same labels/order across all breakpoints.
export const TABS: Tab[] = [
  { to: '/', label: '전체', icon: 'grid_view' },
  { to: '/wishlist', label: '가고싶은 곳', icon: 'location_on' },
  { to: '/courses', label: '데이트코스', icon: 'map' },
  { to: '/memories', label: '추억', icon: 'auto_awesome' },
  { to: '/dashboard', label: '우리의 기록', icon: 'menu_book' },
]

export const BRAND = 'Datel.log'
export const SLOGAN = '우리가 함께 걸은 곳'
